import fs from 'fs';
import path from 'path';
import { ProductModel } from '../models/Product.js';
import { productService } from '../services/productService.js';

export async function seedInitialData() {
  try {
    // 1. Account auto-seeding is permanently disabled.
    // Accounts are created cleanly by users through registration, strictly starting with 'customer' role.
    // Administrator access is granted only by setting role: "admin" directly in the database.
    console.info('[Park Avenue DB Seed] Account auto-seeding disabled: accounts must be registered cleanly.');

    // 2. Synchronize products with database and disk ledger
    const ledgerPath = path.resolve(process.cwd(), 'server/data/products_ledger.json');
    let realGarments: any[] = [];
    if (fs.existsSync(ledgerPath)) {
      try {
        const raw = fs.readFileSync(ledgerPath, 'utf-8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          realGarments = parsed;
        }
      } catch (readErr) {
        console.warn('[Park Avenue DB Seed] Error reading ledger:', readErr);
      }
    }

    if (realGarments.length > 0) {
      if (Number(mongoose.connection.readyState) === 1) {
        let insertedCount = 0;
        for (const item of realGarments) {
          try {
            const exists = await ProductModel.findOne({
              $or: [
                { productId: item.productId },
                { sku: item.sku }
              ]
            });
            if (!exists) {
              await ProductModel.create(item);
              insertedCount++;
            }
          } catch (createErr: any) {
            console.warn(`[Park Avenue DB Seed] Product insert notice for ${item.sku}:`, createErr?.message);
          }
        }
        if (insertedCount > 0) {
          console.info(`[Park Avenue DB Seed] Seeded ${insertedCount} missing garments into database.`);
        }

        const allDbProducts = await ProductModel.find().lean();
        productService.syncMemoryStore(allDbProducts.length > 0 ? allDbProducts : realGarments);
        console.info(`[Park Avenue DB Seed] Synchronized ${allDbProducts.length || realGarments.length} products with memory store.`);
      } else {
        productService.syncMemoryStore(realGarments);
        console.info(`[Park Avenue DB Seed] Synchronized ${realGarments.length} products with memory store (offline/serverless fallback).`);
      }
    } else if (Number(mongoose.connection.readyState) === 1) {
      const existing = await ProductModel.find().lean();
      productService.syncMemoryStore(existing);
      console.info(`[Park Avenue DB Seed] Synchronized ${existing.length} products with memory store.`);
    }
  } catch (err: any) {
    console.warn(`[Park Avenue DB Seed] Seed warning: ${err.message}`);
  }
}
