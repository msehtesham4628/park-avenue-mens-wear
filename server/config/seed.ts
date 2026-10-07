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
    const productCount = await ProductModel.countDocuments();
    if (productCount === 0) {
      const ledgerPath = path.resolve(process.cwd(), 'server/data/products_ledger.json');
      if (fs.existsSync(ledgerPath)) {
        const raw = fs.readFileSync(ledgerPath, 'utf-8');
        const realGarments = JSON.parse(raw);
        if (Array.isArray(realGarments) && realGarments.length > 0) {
          for (const item of realGarments) {
            await ProductModel.create(item);
          }
          productService.syncMemoryStore(realGarments);
          console.info(`[Park Avenue DB Seed] Seeded ${realGarments.length} real garments from ledger.`);
        }
      }
    } else {
      const existing = await ProductModel.find().lean();
      productService.syncMemoryStore(existing);
      console.info(`[Park Avenue DB Seed] Synchronized ${existing.length} products with memory store.`);
    }
  } catch (err: any) {
    console.warn(`[Park Avenue DB Seed] Seed warning: ${err.message}`);
  }
}
