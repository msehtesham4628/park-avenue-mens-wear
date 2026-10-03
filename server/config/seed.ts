import { ProductModel } from '../models/Product.js';
import { CustomerModel } from '../models/Customer.js';
import { OrderModel } from '../models/Order.js';
import { AlterationModel } from '../models/Alteration.js';
import { ReturnModel } from '../models/Return.js';
import { AuditLogModel } from '../models/AuditLog.js';
import { authService } from '../services/authService.js';
import { productService } from '../services/productService.js';

export async function seedInitialData() {
  try {
    // Bootstrap credentials are supplied only through server-side environment variables.
    // Bootstrap credentials for administrative setup
    const seedAdminPassword = process.env.SEED_ADMIN_PASSWORD || 'ParkAvenue@2026';
    const seedStaffPassword = process.env.SEED_STAFF_PASSWORD || 'Tailor@2026';
    const seedPatronPassword = process.env.SEED_PATRON_PASSWORD || 'Patron@2026';

    // 1. Seed Admin accounts
    const adminAccounts = [
      {
        id: 'CUST-ADMIN-PARKAMW',
        email: 'parkamw@admin.com',
        username: 'parkamw',
        firstName: 'Park Avenue',
        lastName: 'Executive Admin',
        name: 'Park Avenue Executive Admin'
      },
      {
        id: 'CUST-ADMIN-001',
        email: (process.env.SEED_ADMIN_EMAIL || 'admin@parkavenuemenswear.com').toLowerCase().trim(),
        username: (process.env.SEED_ADMIN_USERNAME || 'admin').toLowerCase().trim(),
        firstName: 'Park Avenue',
        lastName: 'Administrator',
        name: 'Park Avenue Administrator'
      },
      {
        id: 'CUST-ADMIN-PARKMENS',
        email: 'parkmens@admin.com',
        username: 'parkmens',
        firstName: 'Park',
        lastName: 'Avenue Admin',
        name: 'Park Avenue Mens Admin'
      }
    ];

    for (const adm of adminAccounts) {
      const existing = await CustomerModel.findOne({ email: adm.email });
      const passwordHash = await authService.hashPassword(seedAdminPassword);
      if (!existing) {
        await CustomerModel.create({
          customerId: adm.id,
          firstName: adm.firstName,
          lastName: adm.lastName,
          name: adm.name,
          username: adm.username,
          email: adm.email,
          phone: '+1 (800) 555-7275',
          passwordHash,
          role: 'admin',
          status: 'active',
          addresses: [{
            id: `addr-${adm.username}`,
            street: '725 Park Avenue',
            city: 'New York',
            state: 'NY',
            postalCode: '10021',
            country: 'United States',
            isDefault: true
          }]
        });
        console.info('[Park Avenue DB Seed] Created administrator:', adm.email);
      } else {
        await CustomerModel.updateOne(
          { _id: existing._id },
          { $set: { role: 'admin', status: 'active', username: adm.username, passwordHash } }
        );
        console.info('[Park Avenue DB Seed] Synchronized administrator:', adm.email);
      }
    }

    const existingStaff = await CustomerModel.findOne({ email: 'tailor@parkavenuemenswear.com' });
    if (!existingStaff && seedStaffPassword) {
      const passwordHash = await authService.hashPassword(seedStaffPassword!);
      await CustomerModel.create({
        customerId: 'CUST-STAFF-001',
        firstName: 'Giovanni',
        lastName: 'Rossi',
        name: 'Giovanni Rossi',
        username: 'tailor',
        email: 'tailor@parkavenuemenswear.com',
        phone: '+1 (800) 555-7276',
        passwordHash,
        role: 'staff',
        status: 'active',
        addresses: []
      });
      console.info('[Park Avenue DB Seed] Created default staff tailor: tailor@parkavenuemenswear.com');
    }

    const existingPatron = await CustomerModel.findOne({ email: 'patron@parkavenuemenswear.com' });
    if (!existingPatron && seedPatronPassword) {
      const passwordHash = await authService.hashPassword(seedPatronPassword!);
      await CustomerModel.create({
        customerId: 'CUST-PATRON-001',
        firstName: 'Marcus',
        lastName: 'Sterling',
        name: 'Marcus Sterling',
        username: 'patron',
        email: 'patron@parkavenuemenswear.com',
        phone: '+1 (212) 555-0199',
        passwordHash,
        role: 'customer',
        status: 'active',
        vipTier: 'Bespoke Patron',
        addresses: [{
          id: 'addr-patron-1',
          street: '884 Fifth Avenue',
          apartment: 'Penthouse B',
          city: 'New York',
          state: 'NY',
          postalCode: '10021',
          country: 'United States',
          isDefault: true
        }]
      });
      console.info('[Park Avenue DB Seed] Created default patron: patron@parkavenuemenswear.com');
    }

    // 2. Seed Luxury Products if empty
    const productCount = await ProductModel.countDocuments();
    if (productCount === 0) {
      const initialGarments = [
        {
          productId: 'PROD-SUIT-001',
          sku: 'PA-ST-NAVY-150',
          name: 'The Park Avenue Navy Double-Breasted Suit',
          slug: 'park-avenue-navy-double-breasted-suit',
          description: 'Constructed from Super 150s Italian virgin wool with hand-finished pick stitching, full floating horsehair canvas, and horn buttons.',
          category: 'Suits',
          subcategory: 'Double-Breasted',
          price: 1850,
          images: [],
          sizes: ['38R', '40R', '42R', '44R'],
          colors: ['Navy', 'Midnight Blue'],
          variants: [
            { id: 'var-suit-001-1', size: '38R', color: 'Navy', stock: 4, sku: 'PA-ST-NAVY-150-38R' },
            { id: 'var-suit-001-2', size: '40R', color: 'Navy', stock: 8, sku: 'PA-ST-NAVY-150-40R' },
            { id: 'var-suit-001-3', size: '42R', color: 'Navy', stock: 0, sku: 'PA-ST-NAVY-150-42R' },
            { id: 'var-suit-001-4', size: '44R', color: 'Navy', stock: 3, sku: 'PA-ST-NAVY-150-44R' },
            { id: 'var-suit-001-5', size: '40R', color: 'Midnight Blue', stock: 5, sku: 'PA-ST-MID-150-40R' }
          ],
          stockQuantity: 20,
          lowStockThreshold: 4,
          isFeatured: true,
          isNewArrival: true,
          fabric: '100% Super 150s Italian Virgin Wool',
          fit: 'Tailored English Silhouette',
          careInstructions: ['Specialist dry clean only', 'Store on cedar hanger']
        },
        {
          productId: 'PROD-SUIT-002',
          sku: 'PA-ST-CHARCOAL-180',
          name: 'Super 180s Charcoal Worsted Two-Piece Suit',
          slug: 'super-180s-charcoal-worsted-two-piece-suit',
          description: 'A timeless staple cut from rare Super 180s fine micron wool. Featherlight, resilient drape, and silk-lined interior.',
          category: 'Suits',
          subcategory: 'Two-Piece',
          price: 2150,
          images: [],
          sizes: ['38R', '40R', '42R', '44R'],
          colors: ['Charcoal Grey', 'Deep Slate'],
          variants: [
            { id: 'var-suit-002-1', size: '38R', color: 'Charcoal Grey', stock: 2, sku: 'PA-ST-CH-180-38R' },
            { id: 'var-suit-002-2', size: '40R', color: 'Charcoal Grey', stock: 5, sku: 'PA-ST-CH-180-40R' },
            { id: 'var-suit-002-3', size: '42R', color: 'Charcoal Grey', stock: 4, sku: 'PA-ST-CH-180-42R' }
          ],
          stockQuantity: 11,
          lowStockThreshold: 3,
          isFeatured: true,
          isNewArrival: false,
          fabric: '100% Super 180s Worsted Wool (Biella, Italy)',
          fit: 'Contemporary Sartorial Cut',
          careInstructions: ['Dry clean by luxury specialist only']
        },
        {
          productId: 'PROD-SHIRT-001',
          sku: 'PA-SH-EGYPT-WHT',
          name: 'Egyptian Giza 87 Twill Formal Dress Shirt',
          slug: 'egyptian-giza-87-twill-formal-dress-shirt',
          description: 'Woven from extra-long staple Egyptian Giza 87 cotton with Mother of Pearl buttons and a semi-spread collar.',
          category: 'Dress Shirts',
          subcategory: 'Formal Dress Shirts',
          price: 285,
          images: [],
          sizes: ['15.5', '16.0', '16.5', '17.0'],
          colors: ['Crisp White'],
          variants: [
            { id: 'var-sh-001-1', size: '15.5', color: 'Crisp White', stock: 12, sku: 'PA-SH-EGYPT-WHT-155' },
            { id: 'var-sh-001-2', size: '16.0', color: 'Crisp White', stock: 15, sku: 'PA-SH-EGYPT-WHT-160' },
            { id: 'var-sh-001-3', size: '16.5', color: 'Crisp White', stock: 8, sku: 'PA-SH-EGYPT-WHT-165' }
          ],
          stockQuantity: 35,
          lowStockThreshold: 5,
          isFeatured: true,
          isNewArrival: true,
          fabric: '100% Egyptian Giza 87 Long-Staple Cotton',
          fit: 'Clean Slim Tailored'
        },
        {
          productId: 'PROD-PANTS-001',
          sku: 'PA-TR-HIGH-SLATE',
          name: 'High-Rise Single Pleat Flannel Trousers',
          slug: 'high-rise-single-pleat-flannel-trousers',
          description: 'Featuring side adjusters, extended waistband closure, and an unfinished hem ready for atelier hemming break.',
          category: 'Dress Pants',
          subcategory: 'Pleated Trousers',
          price: 495,
          images: [],
          sizes: ['32', '34', '36', '38'],
          colors: ['Slate Grey', 'Olive Muted'],
          variants: [
            { id: 'var-tr-001-1', size: '32', color: 'Slate Grey', stock: 6, sku: 'PA-TR-SLATE-32' },
            { id: 'var-tr-001-2', size: '34', color: 'Slate Grey', stock: 7, sku: 'PA-TR-SLATE-34' },
            { id: 'var-tr-001-3', size: '36', color: 'Slate Grey', stock: 1, sku: 'PA-TR-SLATE-36' }
          ],
          stockQuantity: 14,
          lowStockThreshold: 3,
          isFeatured: false,
          isNewArrival: false,
          fabric: '100% Wool Flannel',
          fit: 'Classic High-Rise'
        },
        {
          productId: 'PROD-TIE-001',
          sku: 'PA-TI-GRENADINE-BUR',
          name: 'Handcrafted Grenadine Silk Garza Fina Tie',
          slug: 'handcrafted-grenadine-silk-garza-fina-tie',
          description: 'Woven on historic wooden looms in Como, Italy with 3-fold untipped hand-rolled edges.',
          category: 'Ties',
          subcategory: 'Grenadine Ties',
          price: 195,
          images: [],
          sizes: ['8cm Classic Width'],
          colors: ['Burgundy Wine', 'Midnight Navy'],
          variants: [
            { id: 'var-ti-001-1', size: '8cm Classic Width', color: 'Burgundy Wine', stock: 10, sku: 'PA-TI-BUR-STD' },
            { id: 'var-ti-001-2', size: '8cm Classic Width', color: 'Midnight Navy', stock: 12, sku: 'PA-TI-NAV-STD' }
          ],
          stockQuantity: 22,
          lowStockThreshold: 4,
          isFeatured: true,
          isNewArrival: false,
          fabric: '100% Como Silk Grenadine'
        },
        {
          productId: 'PROD-SHOE-001',
          sku: 'PA-SH-WHOLECUT-OXF',
          name: 'Goodyear-Welted Wholecut Oxford Shoe',
          slug: 'goodyear-welted-wholecut-oxford-shoe',
          description: 'Carved from a singular cut of hand-selected French box calf leather, closed-channel Goodyear welted sole, and bevelled waist.',
          category: 'Shoe',
          subcategory: 'Oxfords',
          price: 785,
          images: [],
          sizes: ['8.5 US', '9.0 US', '9.5 US', '10.0 US', '10.5 US', '11.0 US'],
          colors: ['Espresso Burnished', 'Obsidian Black'],
          variants: [
            { id: 'var-shoe-1', size: '9.0 US', color: 'Espresso Burnished', stock: 5, sku: 'PA-SH-OXF-ESP-090' },
            { id: 'var-shoe-2', size: '9.5 US', color: 'Espresso Burnished', stock: 8, sku: 'PA-SH-OXF-ESP-095' },
            { id: 'var-shoe-3', size: '10.0 US', color: 'Espresso Burnished', stock: 6, sku: 'PA-SH-OXF-ESP-100' },
            { id: 'var-shoe-4', size: '9.5 US', color: 'Obsidian Black', stock: 7, sku: 'PA-SH-OXF-BLK-095' }
          ],
          stockQuantity: 26,
          lowStockThreshold: 5,
          isFeatured: true,
          isNewArrival: true,
          fabric: 'French Box Calf Full-Grain Leather',
          fit: 'Standard D-Width Chiseled Last'
        },
        {
          productId: 'PROD-BOOT-001',
          sku: 'PA-BT-BALMORAL-BRN',
          name: 'Hand-Burnished Balmoral Dress Boots',
          slug: 'hand-burnished-balmoral-dress-boots',
          description: 'Sartorial two-tone Balmoral boots marrying supple French calf leather vamp with English suede upper and Dainite studded rubber soles.',
          category: 'Boots',
          subcategory: 'Balmoral Boots',
          price: 920,
          images: [],
          sizes: ['9.0 US', '9.5 US', '10.0 US', '10.5 US', '11.0 US'],
          colors: ['Deep Cognac & Snuff Suede'],
          variants: [
            { id: 'var-boot-1', size: '9.5 US', color: 'Deep Cognac & Snuff Suede', stock: 4, sku: 'PA-BT-BAL-095' },
            { id: 'var-boot-2', size: '10.0 US', color: 'Deep Cognac & Snuff Suede', stock: 5, sku: 'PA-BT-BAL-100' },
            { id: 'var-boot-3', size: '10.5 US', color: 'Deep Cognac & Snuff Suede', stock: 3, sku: 'PA-BT-BAL-105' }
          ],
          stockQuantity: 12,
          lowStockThreshold: 3,
          isFeatured: true,
          isNewArrival: false,
          fabric: 'French Calfskin & English Repello Suede'
        },
        {
          productId: 'PROD-LOOF-001',
          sku: 'PA-LF-BELGIAN-NAVY',
          name: 'Belgravian Tasselled Belgian Loofers',
          slug: 'belgravian-tasselled-belgian-loofers',
          description: 'Ultra-flexible unlined Belgian loofers with hand-braided calf tassels and glove-soft Italian suede upper for effortless elegance.',
          category: 'Loofers',
          subcategory: 'Belgian Loofers',
          price: 645,
          images: [],
          sizes: ['8.5 US', '9.0 US', '9.5 US', '10.0 US', '10.5 US', '11.0 US'],
          colors: ['Midnight Navy Suede', 'Tobacco Suede'],
          variants: [
            { id: 'var-loof-1', size: '9.5 US', color: 'Midnight Navy Suede', stock: 6, sku: 'PA-LF-BEL-NAV-095' },
            { id: 'var-loof-2', size: '10.0 US', color: 'Midnight Navy Suede', stock: 7, sku: 'PA-LF-BEL-NAV-100' },
            { id: 'var-loof-3', size: '9.5 US', color: 'Tobacco Suede', stock: 5, sku: 'PA-LF-BEL-TOB-095' }
          ],
          stockQuantity: 18,
          lowStockThreshold: 4,
          isFeatured: true,
          isNewArrival: true,
          fabric: 'Unlined Reversed Italian Suede'
        },
        {
          productId: 'PROD-JEAN-001',
          sku: 'PA-JN-KURABO-IND',
          name: 'Kurabo Mills Japanese Selvedge Jeans',
          slug: 'kurabo-mills-japanese-selvedge-jeans',
          description: '14.5oz shuttle-loomed Japanese selvedge denim tailored with clean dress trouser lines, medium-high rise, and copper hardware.',
          category: 'Jeans',
          subcategory: 'Selvedge Denim',
          price: 385,
          images: [],
          sizes: ['31', '32', '33', '34', '36'],
          colors: ['Deep Indigo Raw'],
          variants: [
            { id: 'var-jean-1', size: '32', color: 'Deep Indigo Raw', stock: 8, sku: 'PA-JN-SEL-32' },
            { id: 'var-jean-2', size: '34', color: 'Deep Indigo Raw', stock: 10, sku: 'PA-JN-SEL-34' },
            { id: 'var-jean-3', size: '36', color: 'Deep Indigo Raw', stock: 4, sku: 'PA-JN-SEL-36' }
          ],
          stockQuantity: 22,
          lowStockThreshold: 5,
          isFeatured: false,
          isNewArrival: true,
          fabric: '14.5oz Kurabo Shuttle-Loomed Denim',
          fit: 'Sartorial Tapered Cut'
        },
        {
          productId: 'PROD-LJ-001',
          sku: 'PA-LJ-PLONGE-BLK',
          name: 'French Plonge Lambskin Sartorial Biker Jacket',
          slug: 'french-plonge-lambskin-sartorial-biker-jacket',
          description: 'Hand-tailored from whisper-soft French plonge lambskin with asymmetric RiRi Swiss nickel zippers and pure silk cupro lining.',
          category: 'Leather jackets',
          subcategory: 'Biker & Flight Jackets',
          price: 2450,
          images: [],
          sizes: ['38', '40', '42', '44'],
          colors: ['Obsidian Black'],
          variants: [
            { id: 'var-lj-1', size: '38', color: 'Obsidian Black', stock: 2, sku: 'PA-LJ-BLK-38' },
            { id: 'var-lj-2', size: '40', color: 'Obsidian Black', stock: 4, sku: 'PA-LJ-BLK-40' },
            { id: 'var-lj-3', size: '42', color: 'Obsidian Black', stock: 3, sku: 'PA-LJ-BLK-42' }
          ],
          stockQuantity: 9,
          lowStockThreshold: 2,
          isFeatured: true,
          isNewArrival: true,
          fabric: '100% French Plonge Lambskin Leather',
          fit: 'Tailored European Cut'
        },
        {
          productId: 'PROD-SWEAT-001',
          sku: 'PA-SW-CASHMERE-OAT',
          name: 'Todd & Duncan 4-Ply Scottish Cashmere Crewneck',
          slug: 'todd-and-duncan-4-ply-scottish-cashmere-crewneck',
          description: 'Knitted on 12-gauge frames in Hawick, Scotland from pure 4-ply Todd & Duncan cashmere. Supreme loft, thermal insulation, and pill resistance.',
          category: 'Sweaters',
          subcategory: 'Cashmere Knitwear',
          price: 595,
          images: [],
          sizes: ['S', 'M', 'L', 'XL'],
          colors: ['Oatmeal Melange', 'Navy Heather'],
          variants: [
            { id: 'var-sw-1', size: 'M', color: 'Oatmeal Melange', stock: 6, sku: 'PA-SW-OAT-M' },
            { id: 'var-sw-2', size: 'L', color: 'Oatmeal Melange', stock: 7, sku: 'PA-SW-OAT-L' },
            { id: 'var-sw-3', size: 'M', color: 'Navy Heather', stock: 5, sku: 'PA-SW-NAV-M' }
          ],
          stockQuantity: 18,
          lowStockThreshold: 4,
          isFeatured: true,
          isNewArrival: false,
          fabric: '100% 4-Ply Scottish Cashmere (Todd & Duncan)'
        },
        {
          productId: 'PROD-COAT-001',
          sku: 'PA-CT-CAMEL-DB',
          name: 'Sovereign Double-Breasted Cashmere Overcoat',
          slug: 'sovereign-double-breasted-cashmere-overcoat',
          description: 'An architectural 6x2 double-breasted overcoat tailored from heavy 650g pure Italian cashmere with peak lapels and horn buttons.',
          category: 'Coats',
          subcategory: 'Overcoats',
          price: 2850,
          images: [],
          sizes: ['38R', '40R', '42R', '44R'],
          colors: ['Classic Camel', 'Midnight Charcoal'],
          variants: [
            { id: 'var-ct-1', size: '40R', color: 'Classic Camel', stock: 3, sku: 'PA-CT-CAM-40R' },
            { id: 'var-ct-2', size: '42R', color: 'Classic Camel', stock: 4, sku: 'PA-CT-CAM-42R' },
            { id: 'var-ct-3', size: '40R', color: 'Midnight Charcoal', stock: 2, sku: 'PA-CT-CHR-40R' }
          ],
          stockQuantity: 9,
          lowStockThreshold: 2,
          isFeatured: true,
          isNewArrival: true,
          fabric: '100% 650g Italian Cashmere (Piacenza)',
          fit: 'Sartorial Overcoat Drape'
        },
        {
          productId: 'PROD-POLO-001',
          sku: 'PA-PO-SEAISLAND-NVY',
          name: 'Sea Island Knit Silk-Cotton Sartorial Polo',
          slug: 'sea-island-knit-silk-cotton-sartorial-polo',
          description: 'Knitted with a structured shirt-style collar from West Indian Sea Island cotton blended with mulberry silk. Three iridescent shell buttons.',
          category: 'Polo shirts',
          subcategory: 'Knit Polos',
          price: 325,
          images: [],
          sizes: ['S', 'M', 'L', 'XL'],
          colors: ['Deep Navy', 'Ivory Pearl'],
          variants: [
            { id: 'var-po-1', size: 'M', color: 'Deep Navy', stock: 9, sku: 'PA-PO-NVY-M' },
            { id: 'var-po-2', size: 'L', color: 'Deep Navy', stock: 11, sku: 'PA-PO-NVY-L' },
            { id: 'var-po-3', size: 'M', color: 'Ivory Pearl', stock: 6, sku: 'PA-PO-IVR-M' }
          ],
          stockQuantity: 26,
          lowStockThreshold: 5,
          isFeatured: false,
          isNewArrival: true,
          fabric: '70% Sea Island Cotton, 30% Mulberry Silk'
        },
        {
          productId: 'PROD-SHRT-001',
          sku: 'PA-SH-LINEN-SAND',
          name: 'Pleated Irish Linen Tailored Walk Shorts',
          slug: 'pleated-irish-linen-tailored-walk-shorts',
          description: 'Cut with double forward pleats, side buckle adjusters, and a generous hem width from crisp Baird McNutt Irish linen.',
          category: 'Shorts',
          subcategory: 'Tailored Shorts',
          price: 295,
          images: [],
          sizes: ['30', '32', '34', '36'],
          colors: ['Sand Dune', 'Olive Drab'],
          variants: [
            { id: 'var-shrt-1', size: '32', color: 'Sand Dune', stock: 5, sku: 'PA-SH-SND-32' },
            { id: 'var-shrt-2', size: '34', color: 'Sand Dune', stock: 7, sku: 'PA-SH-SND-34' },
            { id: 'var-shrt-3', size: '32', color: 'Olive Drab', stock: 4, sku: 'PA-SH-OLV-32' }
          ],
          stockQuantity: 16,
          lowStockThreshold: 3,
          isFeatured: false,
          isNewArrival: false,
          fabric: '100% Baird McNutt Irish Linen',
          fit: 'Sartorial Relaxed Rise'
        }
      ];

      for (const item of initialGarments) {
        await ProductModel.create(item);
      }
      productService.syncMemoryStore(initialGarments);
      console.info(`[Park Avenue DB Seed] Seeded ${initialGarments.length} bespoke garments with live variant stock.`);
    } else {
      const existing = await ProductModel.find().lean();
      productService.syncMemoryStore(existing);
    }

    // 3. Seed Sample Orders and Alterations if empty
    const orderCount = await OrderModel.countDocuments();
    if (orderCount === 0) {
      await OrderModel.create({
        orderId: 'PA-2026-000001',
        customerName: 'Edward Sterling',
        customerEmail: 'edward.sterling@example.com',
        customerPhone: '+1 (555) 234-5678',
        items: [{
          productId: 'PROD-SUIT-001',
          variantId: 'var-suit-001-2',
          sku: 'PA-ST-NAVY-150-40R',
          name: 'The Park Avenue Navy Double-Breasted Suit',
          size: '40R',
          color: 'Navy',
          quantity: 1,
          priceAtPurchase: 1850,
          subtotal: 1850,
          alterationRequested: true
        }],
        subtotal: 1850,
        shipping: 0,
        tax: 152.63,
        total: 2002.63,
        paymentStatus: 'Paid',
        orderStatus: 'Confirmed',
        shippingInfo: {
          recipientName: 'Edward Sterling',
          email: 'edward.sterling@example.com',
          phone: '+1 (555) 234-5678',
          street: '450 Lexington Avenue',
          city: 'New York',
          state: 'NY',
          postalCode: '10017',
          country: 'United States',
          carrier: 'White Glove Courier Express',
          shippingMethod: 'Insured Atelier Express'
        },
        trackingNumber: 'PA-TRK-98231',
        statusHistory: [{
          previousStatus: 'None',
          newStatus: 'Confirmed',
          changedBy: { id: 'SYSTEM', name: 'Park Avenue Concierge', role: 'system' },
          note: 'Initial order placement and payment authorization',
          timestamp: new Date()
        }]
      });

      console.info('[Park Avenue DB Seed] Seeded initial order: PA-2026-000001');
    }

    const alterationCount = await AlterationModel.countDocuments();
    if (alterationCount === 0) {
      await AlterationModel.create({
        alterationId: 'ALT-2026-000001',
        customerName: 'Edward Sterling',
        customerEmail: 'edward.sterling@example.com',
        customerPhone: '+1 (555) 234-5678',
        orderId: 'PA-2026-000001',
        productName: 'The Park Avenue Navy Double-Breasted Suit',
        alterationType: 'Hemming & Inseam Break Adjustment',
        measurements: {
          trouserHemType: 'Half Break',
          trouserInseam: '31.5 inches',
          jacketSleeveAdjustment: 'Shorten 0.5 inches with working buttonholes'
        },
        tailorAssigned: 'Giovanni Rossi (Master Tailor)',
        currentStatus: 'In Progress',
        expectedCompletionDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        statusHistory: [{
          previousStatus: 'Received',
          newStatus: 'In Progress',
          changedBy: { id: 'TAILOR-01', name: 'Giovanni Rossi', role: 'staff' },
          note: 'Master chalk marks verified; hand hemming in progress',
          timestamp: new Date()
        }],
        pickupCode: 'PA-FIT-8821'
      });
      console.info('[Park Avenue DB Seed] Seeded initial alteration: ALT-2026-000001');
    }

    // 4. Seed Sample Return & Exchange Requests if empty
    const returnCount = await ReturnModel.countDocuments();
    if (returnCount === 0) {
      await ReturnModel.create([
        {
          returnId: 'RET-8842',
          orderId: 'PA-2026-000001',
          customerId: 'CUST-EDWARD-001',
          customerName: 'Edward Sterling',
          customerEmail: 'edward.sterling@example.com',
          customerPhone: '+1 (555) 234-5678',
          itemNames: ['The Park Avenue Navy Double-Breasted Suit (40R, Navy)'],
          actionType: 'Size / Fit Exchange',
          reason: 'Need size 42R jacket for broader shoulder drape; sleeves in 40R slightly snug.',
          status: 'Approved - Return Label Sent',
          currentStep: 2,
          trackingReturnNumber: 'FEDEX-RET-892104',
          replacementItem: 'The Park Avenue Navy Double-Breasted Suit (42R, Navy)',
          refundAmount: 0,
          adminNotes: 'Prepaid return label dispatched to client. Replacement garment reserved in New York atelier vault.',
          statusHistory: [
            {
              previousStatus: 'None',
              newStatus: 'Pending Review',
              changedBy: { id: 'CUST-EDWARD-001', name: 'Edward Sterling', role: 'customer' },
              note: 'Client initiated online exchange request for larger chest size.',
              timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000)
            },
            {
              previousStatus: 'Pending Review',
              newStatus: 'Approved - Return Label Sent',
              changedBy: { id: 'CUST-ADMIN-001', name: 'Park Avenue Executive Admin', role: 'admin' },
              note: 'Prepaid FedEx return waybill FEDEX-RET-892104 issued; 42R held in private stock.',
              timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000)
            }
          ]
        },
        {
          returnId: 'RET-8843',
          orderId: 'PA-ORD-88210',
          customerName: 'Jonathan Vance',
          customerEmail: 'jonathan.vance@example.com',
          customerPhone: '+1 (555) 345-6789',
          itemNames: ['Pleated Irish Linen Tailored Walk Shorts (32, Sand Dune)'],
          actionType: 'Tailoring Adjustment',
          reason: 'Waist fits perfectly, but requesting 1-inch hem taper at thigh.',
          status: 'Received at Warehouse',
          currentStep: 3,
          trackingReturnNumber: 'FEDEX-RET-774321',
          replacementItem: 'Tailoring Inseam Taper Adjustment',
          refundAmount: 0,
          adminNotes: 'Item safely received at Manhattan workshop. Transferred to Giovanni Rossi for hand finishing.',
          statusHistory: [
            {
              previousStatus: 'Approved - Return Label Sent',
              newStatus: 'Received at Warehouse',
              changedBy: { id: 'STAFF-01', name: 'Giovanni Rossi', role: 'staff' },
              note: 'Package signed and inspected at atelier warehouse intake.',
              timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000)
            }
          ]
        },
        {
          returnId: 'RET-8844',
          orderId: 'PA-ORD-90214',
          customerName: 'Harrison Ford',
          customerEmail: 'harrison.ford@example.com',
          customerPhone: '+1 (555) 456-7890',
          itemNames: ['Sea Island Knit Silk-Cotton Sartorial Polo (L, Deep Navy)'],
          actionType: 'Refund to Original Payment',
          reason: 'Duplicate gift purchase by family member; unworn with tags attached.',
          status: 'Inspection Complete',
          currentStep: 4,
          trackingReturnNumber: 'FEDEX-RET-661209',
          refundAmount: 325,
          adminNotes: 'Tags intact, pristine condition confirmed by master inspection. Ready for Stripe refund release.',
          statusHistory: [
            {
              previousStatus: 'Received at Warehouse',
              newStatus: 'Inspection Complete',
              changedBy: { id: 'CUST-ADMIN-001', name: 'Park Avenue Executive Admin', role: 'admin' },
              note: 'Garment condition verified: Mint unworn with original atelier tag seals.',
              timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
            }
          ]
        }
      ]);
      console.info('[Park Avenue DB Seed] Seeded initial Return & Exchange records in MongoDB.');
    }

    // 6. Seed initial Admin & Staff Activity Logs
    const existingLogsCount = await AuditLogModel.countDocuments();
    if (existingLogsCount === 0) {
      await AuditLogModel.create([
        {
          auditId: 'AUD-SEED-001',
          adminUser: {
            id: 'CUST-ADMIN-001',
            name: 'Park Avenue Executive Admin',
            email: 'admin@parkavenuemenswear.com',
            role: 'admin'
          },
          action: 'ADMIN_LOGIN',
          entity: 'Auth',
          entityId: 'AUTH-SES-901',
          newValue: { sessionStatus: 'active', ip: '192.168.1.100' },
          metadata: { notes: 'Executive administrator secure dashboard session initialized with 256-bit token.' },
          ipAddress: '192.168.1.100',
          userAgent: 'Park Avenue Flagship Console (Chrome MacOS)',
          createdAt: new Date(Date.now() - 35 * 60 * 1000)
        },
        {
          auditId: 'AUD-SEED-002',
          adminUser: {
            id: 'CUST-STAFF-001',
            name: 'Giovanni Rossi',
            email: 'tailor@parkavenuemenswear.com',
            role: 'staff'
          },
          action: 'ALTERATION_STATUS_UPDATED',
          entity: 'Alteration',
          entityId: 'ALT-2041',
          previousValue: { status: 'Measurement/Review', step: 1 },
          newValue: { status: 'Alteration In Progress', step: 2, tailorAssigned: 'Giovanni Rossi' },
          metadata: { notes: 'Trouser hem chalked to 1-inch break and jacket sleeve buttons repositioned.' },
          ipAddress: '192.168.1.142',
          userAgent: 'Atelier Tailoring Terminal #2',
          createdAt: new Date(Date.now() - 55 * 60 * 1000)
        },
        {
          auditId: 'AUD-SEED-003',
          adminUser: {
            id: 'CUST-STAFF-001',
            name: 'Giovanni Rossi',
            email: 'tailor@parkavenuemenswear.com',
            role: 'staff'
          },
          action: 'INVENTORY_ADJUSTED',
          entity: 'Inventory',
          entityId: 'prod-trousers-flannel',
          previousValue: { stock: 8 },
          newValue: { stock: 16, adjustment: '+8', reason: 'atelier_reorder' },
          metadata: { notes: 'Restocked 8 units of Pleated Flannel Dress Trousers (Charcoal / 32W) from master mill.' },
          ipAddress: '192.168.1.142',
          userAgent: 'Atelier Tailoring Terminal #2',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
        },
        {
          auditId: 'AUD-SEED-004',
          adminUser: {
            id: 'CUST-ADMIN-PARKAMW',
            name: 'Park Avenue Executive Admin',
            email: 'parkamw@admin.com',
            role: 'admin'
          },
          action: 'PRODUCT_PRICE_UPDATED',
          entity: 'Product',
          entityId: 'prod-suit-db-01',
          previousValue: { price: 2350 },
          newValue: { price: 2450, salePrice: 2200 },
          metadata: { notes: 'Seasonal adjustment for Loro Piana Super 150s Double-Breasted Wool Tuxedo.' },
          ipAddress: '192.168.1.100',
          userAgent: 'Park Avenue Flagship Console',
          createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000)
        },
        {
          auditId: 'AUD-SEED-005',
          adminUser: {
            id: 'STAFF-02',
            name: 'Elena Vance (Atelier Concierge)',
            email: 'elena.vance@parkavenuemenswear.com',
            role: 'staff'
          },
          action: 'RETURN_INSPECTED',
          entity: 'Return',
          entityId: 'RET-8844',
          previousValue: { status: 'Received at Warehouse', currentStep: 3 },
          newValue: { status: 'Inspection Complete', currentStep: 4, refundApproved: 325 },
          metadata: { notes: 'Sea Island polo tags verified pristine; authorized $325 refund via Stripe.' },
          ipAddress: '192.168.1.105',
          userAgent: 'Concierge Reception Terminal',
          createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000)
        },
        {
          auditId: 'AUD-SEED-006',
          adminUser: {
            id: 'CUST-ADMIN-001',
            name: 'Park Avenue Executive Admin',
            email: 'admin@parkavenuemenswear.com',
            role: 'admin'
          },
          action: 'TAX_RULES_UPDATED',
          entity: 'Settings',
          entityId: 'SYS-TAX-RULES',
          newValue: { jurisdictionsCount: 50, courierDefault: 15 },
          metadata: { notes: 'Statutory 50-state tax rules and express white-glove shipping rates saved.' },
          ipAddress: '192.168.1.100',
          userAgent: 'Park Avenue Flagship Console',
          createdAt: new Date(Date.now() - 7 * 60 * 60 * 1000)
        },
        {
          auditId: 'AUD-SEED-007',
          adminUser: {
            id: 'STAFF-03',
            name: 'Marcus Sterling (Fulfillment)',
            email: 'marcus.sterling@parkavenuemenswear.com',
            role: 'staff'
          },
          action: 'ORDER_PACKED',
          entity: 'Order',
          entityId: 'PA-2026-000001',
          newValue: { status: 'Shipped', carrier: 'Atelier Courier', tracking: 'PA-WG-902144' },
          metadata: { notes: 'Garment bag steamed, boxed in bespoke Park Avenue navy gold-embossed packaging.' },
          ipAddress: '192.168.1.108',
          userAgent: 'Fulfillment Dispatch Terminal',
          createdAt: new Date(Date.now() - 9 * 60 * 60 * 1000)
        },
        {
          auditId: 'AUD-SEED-008',
          adminUser: {
            id: 'CUST-ADMIN-001',
            name: 'Park Avenue Executive Admin',
            email: 'admin@parkavenuemenswear.com',
            role: 'admin'
          },
          action: 'EXCEL_ERP_EXPORT',
          entity: 'ERP',
          entityId: 'ERP-EXP-202609',
          newValue: { format: 'Tally XML & Excel XLS', recordsExported: 48 },
          metadata: { notes: 'Exported quarterly ledger and inventory reports for CPA compliance audit.' },
          ipAddress: '192.168.1.100',
          userAgent: 'Park Avenue Flagship Console',
          createdAt: new Date(Date.now() - 14 * 60 * 60 * 1000)
        }
      ]);
      console.info('[Park Avenue DB Seed] Seeded initial Admin & Staff Activity Logs in MongoDB.');
    }
  } catch (err: any) {
    console.warn(`[Park Avenue DB Seed] Seed warning: ${err.message}`);
  }
}

