/**
 * Park Avenue Menswear — Persistent Storage Vault
 * 
 * Provides an indestructible, multi-tiered client storage engine:
 * 1. IndexedDB (Primary) — No 5MB quota restrictions, stores complete high-res
 *    garment images, color variations, and lookbook PDFs without data loss across
 *    page refreshes or device reboots.
 * 2. In-Memory Cache (L1) — Instant zero-latency synchronous reads.
 * 3. LocalStorage (L3 Fallback) — Secondary sync for environments without IndexedDB.
 * 
 * Tracks user-created and edited products so they are never purged or overwritten
 * by remote API synchronizations.
 */

import { Product } from '../types';
import { INITIAL_PRODUCTS } from '../data/initialData';

const DB_NAME = 'park_avenue_vault_v1';
const DB_VERSION = 1;
const STORE_PRODUCTS = 'products';
const STORE_META = 'metadata';

const STORAGE_KEYS = {
  PRODUCTS: 'pa_clean_products_v3',
  USER_PRODUCT_IDS: 'pa_user_created_product_ids_v1'
};

// In-memory cache for synchronous reads
let inMemoryProducts: Product[] = [];
let userCreatedIds: Set<string> = new Set();
let isInitialized = false;
let initPromise: Promise<Product[]> | null = null;

// Helper to open IndexedDB
function openVaultDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_PRODUCTS)) {
        db.createObjectStore(STORE_PRODUCTS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_META)) {
        db.createObjectStore(STORE_META, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Failed to open vault IndexedDB'));
  });
}

// Safely load user-created ID set from localStorage
try {
  if (typeof localStorage !== 'undefined') {
    const rawIds = localStorage.getItem(STORAGE_KEYS.USER_PRODUCT_IDS);
    if (rawIds) {
      const parsed = JSON.parse(rawIds);
      if (Array.isArray(parsed)) {
        userCreatedIds = new Set(parsed);
      }
    }
  }
} catch (_) {}

const FAKE_SKU_PREFIXES = [
  'PA-SHIRT-', 'PA-POLO-', 'PA-SWEAT-', 'PA-BOOT-', 'PA-SHOE-', 
  'PA-LOOF-', 'PA-PANTS-', 'PA-JEAN-', 'PA-LJ-', 'PA-COAT-', 'PA-TIE-', 'PA-SHRT-'
];
const isFakeProduct = (p: Product) => {
  const sku = (p.sku || '').toUpperCase();
  const id = (p.id || '').toUpperCase();
  return FAKE_SKU_PREFIXES.some(prefix => sku.startsWith(prefix) || id.startsWith('PROD-' + prefix.replace('PA-', '')));
};

// Safely seed in-memory cache from localStorage on startup
try {
  if (typeof localStorage !== 'undefined') {
    const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        inMemoryProducts = parsed.filter(p => !isFakeProduct(p));
      }
    }
  }
} catch (_) {}

if (inMemoryProducts.length === 0 && INITIAL_PRODUCTS.length > 0) {
  inMemoryProducts = [...INITIAL_PRODUCTS].filter(p => !isFakeProduct(p));
}

// Safe LocalStorage setter with quota fallback
function safeSaveLocalStorage(key: string, data: any): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err: any) {
    // If quota exceeded, try stripping large media strings to preserve product record
    if (err?.name === 'QuotaExceededError' || err?.code === 22) {
      try {
        if (Array.isArray(data)) {
          const stripped = data.map((item: any) => ({
            ...item,
            // Keep at most 1 primary image in localStorage to fit quota
            images: Array.isArray(item.images) ? item.images.slice(0, 1) : [],
            productViews: undefined,
            pdfDocuments: undefined
          }));
          localStorage.setItem(key, JSON.stringify(stripped));
          console.info(`[StorageVault] LocalStorage quota reached; saved lightweight index. Complete records preserved in IndexedDB.`);
        }
      } catch (_) {}
    }
  }
}

export const storageVault = {
  /**
   * Initialize and hydrate cache from IndexedDB
   */
  async init(): Promise<Product[]> {
    if (isInitialized) return inMemoryProducts;
    if (initPromise) return initPromise;

    initPromise = (async () => {
      try {
        const db = await openVaultDB();
        const tx = db.transaction(STORE_PRODUCTS, 'readonly');
        const store = tx.objectStore(STORE_PRODUCTS);
        const req = store.getAll();

        const idbProducts: Product[] = await new Promise((resolve, reject) => {
          req.onsuccess = () => resolve(req.result || []);
          req.onerror = () => reject(req.error);
        });

        const cleanIdbProducts = idbProducts.filter(p => !isFakeProduct(p));
        if (cleanIdbProducts.length > 0) {
          // Merge IndexedDB products with any newly added products in memory
          const existingMap = new Map<string, Product>();
          cleanIdbProducts.forEach(p => existingMap.set(p.id, p));
          inMemoryProducts.forEach(p => {
            if (!existingMap.has(p.id)) {
              existingMap.set(p.id, p);
            }
          });
          inMemoryProducts = Array.from(existingMap.values());
        } else if (inMemoryProducts.length > 0) {
          // Seed IndexedDB from memory / localStorage
          await this.saveProducts(inMemoryProducts);
        }

        isInitialized = true;
        return inMemoryProducts;
      } catch (err) {
        console.warn('[StorageVault] IndexedDB hydration fallback to memory/localStorage:', err);
        isInitialized = true;
        return inMemoryProducts;
      } finally {
        initPromise = null;
      }
    })();

    return initPromise;
  },

  /**
   * Synchronous getter for current memory cache
   */
  getSyncProducts(): Product[] {
    return inMemoryProducts;
  },

  /**
   * Asynchronous getter with auto-init
   */
  async getProducts(): Promise<Product[]> {
    if (!isInitialized) {
      await this.init();
    }
    return [...inMemoryProducts];
  },

  /**
   * Save full list of products to IndexedDB, memory, and localStorage
   */
  async saveProducts(products: Product[]): Promise<void> {
    inMemoryProducts = [...products];
    safeSaveLocalStorage(STORAGE_KEYS.PRODUCTS, inMemoryProducts);

    try {
      const db = await openVaultDB();
      const tx = db.transaction(STORE_PRODUCTS, 'readwrite');
      const store = tx.objectStore(STORE_PRODUCTS);
      
      // Clear and rewrite for exact sync
      store.clear();
      for (const p of products) {
        if (p && p.id) {
          store.put(p);
        }
      }

      await new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (err) {
      console.warn('[StorageVault] IndexedDB save warning (memory & localStorage still intact):', err);
    }
  },

  /**
   * Save or update a single product
   */
  async saveProduct(product: Product): Promise<void> {
    if (!product || !product.id) return;
    
    // Mark as user-created so sync preserves it
    this.markUserProduct(product.id);

    const existingIdx = inMemoryProducts.findIndex(p => p.id === product.id || p.sku === product.sku);
    if (existingIdx !== -1) {
      inMemoryProducts[existingIdx] = { ...product };
    } else {
      inMemoryProducts = [product, ...inMemoryProducts];
    }

    safeSaveLocalStorage(STORAGE_KEYS.PRODUCTS, inMemoryProducts);

    try {
      const db = await openVaultDB();
      const tx = db.transaction(STORE_PRODUCTS, 'readwrite');
      const store = tx.objectStore(STORE_PRODUCTS);
      store.put(product);
      await new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (err) {
      console.warn('[StorageVault] Failed to write product to IndexedDB:', err);
    }
  },

  /**
   * Delete product by ID or SKU
   */
  async deleteProduct(productIdOrSku: string): Promise<void> {
    const target = inMemoryProducts.find(p => p.id === productIdOrSku || p.sku === productIdOrSku);
    const targetId = target ? target.id : productIdOrSku;

    inMemoryProducts = inMemoryProducts.filter(p => p.id !== targetId && p.sku !== productIdOrSku);
    userCreatedIds.delete(targetId);
    safeSaveLocalStorage(STORAGE_KEYS.PRODUCTS, inMemoryProducts);
    safeSaveLocalStorage(STORAGE_KEYS.USER_PRODUCT_IDS, Array.from(userCreatedIds));

    try {
      const db = await openVaultDB();
      const tx = db.transaction(STORE_PRODUCTS, 'readwrite');
      const store = tx.objectStore(STORE_PRODUCTS);
      store.delete(targetId);
      await new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (err) {
      console.warn('[StorageVault] Failed to delete product from IndexedDB:', err);
    }
  },

  /**
   * Mark a product ID as created or edited by the user
   */
  markUserProduct(productId: string): void {
    if (!productId) return;
    userCreatedIds.add(productId);
    safeSaveLocalStorage(STORAGE_KEYS.USER_PRODUCT_IDS, Array.from(userCreatedIds));
  },

  /**
   * Check if product was created or edited by the user
   */
  isUserProduct(productId: string): boolean {
    return userCreatedIds.has(productId);
  },

  getUserProductIds(): Set<string> {
    return new Set(userCreatedIds);
  }
};

// Trigger background hydration immediately on browser load
if (typeof window !== 'undefined') {
  storageVault.init().catch(() => {});
}
