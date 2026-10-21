# Implementation Plan: Purge Fake Products, Remove Auto-Generators & SKU Display, and Implement Exact Color Resolution

## Overview
This plan addresses the removal of synthetically generated products from the catalog, eliminates automated SKU/title/description generators in the admin dashboard, completely removes SKU displays from the product details page (`/product/:id`) and all other UI surfaces, updates routing to use the product ID, and implements an exact color picker with bidirectional name-to-hex mapping.

---

## Confirmed User Requirements
1. **Retained Catalog**: Keep only genuine user-created products (the 5 authentic suits); completely purge the 13 synthetic items.
2. **Remove Auto-Generators**: Remove auto SKU, auto title, and auto description generation buttons, overrides, and AI synthesis prompts.
3. **SKU Removal & Routing**:
   - Completely remove the SKU section and SKU labels from `/product/:id` and all customer-facing and admin views.
   - Route product pages via `/product/:productId` instead of `/product/:sku`.
4. **Exact Color Resolution**: Provide a color picker with exact hex code input and bidirectional color name mapping so any color displays its true exact shade.

---

## Proposed Changes

### 1. Catalog & Database Cleanup (Purge Fake Garments)
- **`server/data/products_ledger.json`**:
  - Remove the 13 fake items (PA-SHIRT-001, PA-POLO-001, PA-SWEAT-001, PA-SWEAT-002, PA-BOOT-001, PA-SHOE-001, PA-LOOF-001, PA-PANTS-001, PA-JEAN-001, PA-LJ-001, PA-COAT-001, PA-TIE-001, PA-SHRT-001).
  - Retain strictly the 5 authentic suits (PROD-MUSMBU24-926, PROD-MUSMHYWN-232, PROD-MUSMKNMP-872, PROD-MUSMMUDJ-961, PROD-MUVP6U0S-155).
- **`src/data/initialData.ts`**:
  - Remove the 13 fake products and their variants from `INITIAL_PRODUCTS`.
- **`server/data/sitemap_ledger.json`**:
  - Remove sitemap indexed URLs corresponding to the purged items.
- **`server/config/seed.ts`**:
  - Clean up seed data to seed strictly the authentic products.
- **`src/services/api.ts` & `src/utils/storageVault.ts`**:
  - Ensure client-side IndexedDB vault and caches evict purged products so stale items do not persist on the storefront.

---

### 2. Remove Auto SKU, Auto Title, and Auto Description
- **`src/components/admin/AdminDashboard.tsx`**:
  - Remove the **"Batch Auto-SKU"** button, state, and batch invocation.
  - Remove the **"Auto-Generate Title From Any Text"** panel, text area, and title synthesis actions.
  - Remove the **"Auto Description"** button, tone selection dropdown, and automated description intelligence cards.
  - Remove the automated SKU assignment trigger when the category dropdown changes.
  - Provide clean, responsive standard form controls for product title, category, price, and description with manual user control.
- **`server/controllers/productController.ts` & `server/routes/productRoutes.ts`**:
  - Remove or deprecate the `/api/products/batch-auto-sku` handler.

---

### 3. Completely Remove SKU Section Across All Views & Fix Routing
- **Routing & Navigation**:
  - Update `navigateToProduct` across the application (`ProductCard.tsx`, `ProductDetailModal.tsx`, `CartPage.tsx`, `CartDrawer.tsx`, `SearchModal.tsx`, `WishlistSection.tsx`, `CheckoutPage.tsx`, etc.) to navigate to `/product/${product.id}` (or `product.productId`) instead of `/product/${product.sku}`.
  - In `ProductDetailPage.tsx`:
    - Lookup products by `id` or `productId` (`products.find(p => p.id === id || p.productId === id)`).
    - Remove the top SKU badge (`SKU: {product.sku}`) and the bottom technical specifications SKU row.
- **Admin Dashboard**:
  - Remove the SKU column from the Products table and Variants table.
  - Remove the SKU input field and duplicate SKU validation banner from the product creation and edit modals.
  - If the database schema requires an internal SKU, generate an internal quiet identifier without displaying or requiring it in the UI.
  - Remove SKU mentions from quick view modals and batch preview lists.
- **Customer Views**:
  - Remove SKU text and labels from `ProductCard.tsx`, `ProductDetailModal.tsx`, `CartDrawer.tsx`, `CartPage.tsx`, `OrderHistorySection.tsx`, `OrderTrackingPage.tsx`, `WishlistSection.tsx`, and `CheckoutPage.tsx`.

---

### 4. Accurate Color Resolution with Color Picker & Exact Hex Mapping
- **`src/utils/colorUtils.ts`**:
  - Expand color dictionary to cover comprehensive CSS colors and sartorial shades (Navy, Powder Blue, Sky Blue, Royal Blue, Indigo, Charcoal, Slate, Heather Grey, Silver, Black, Ivory, Off-White, Cream, Beige, Camel, Tan, Cognac, Espresso, Chocolate, Burgundy, Wine, Maroon, Crimson, Scarlet, Forest Green, Emerald, Olive, Sage, Khaki, Mustard, Gold, Amber, Rust, Terracotta, Coral, Pink, Lavender, Plum, Teal, Cyan).
  - Implement dynamic CSS color resolution via an in-memory canvas context or standard RGB parser to guarantee exact hex matching for any valid color name.
  - Implement bidirectional mapping: given a color name, output exact hex; given a hex, identify the closest named color or preset.
- **Interactive Color Picker in Admin Form**:
  - In `AdminDashboard.tsx`, replace the basic comma-separated colors input with an interactive Color Variant Manager:
    - Color name text input
    - Native HTML `<input type="color">` swatch picker synced with the hex code
    - Hex code input (`#RRGGBB`)
    - Live circular swatch with contrast boundary detection
    - Clickable luxury color palette presets for quick selection
- **Storefront Swatches**:
  - Update `ProductDetailPage.tsx`, `ProductCard.tsx`, `CartPage.tsx`, and `CartDrawer.tsx` to render swatches using `variant.colorHex` or dynamically resolved exact hex, ensuring the swatch matches the color name accurately.

---

## Verification Plan
1. **Catalog Verification**: Verify that only the 5 authentic suits are returned by `/api/products` and displayed on the storefront.
2. **SKU Elimination**: Confirm zero occurrences of SKU sections on `/product/:id`, cart, checkout, wishlist, order history, and admin tables.
3. **Product Routing**: Verify that clicking a product correctly navigates to `/product/<id>` and renders the full product details.
4. **Manual Form Control**: Confirm that creating a product in the Admin dashboard has no auto-SKU, auto-title, or auto-description popups or buttons.
5. **Color Accuracy**: Test custom color names (e.g. "Powder Blue", "Burgundy", "Emerald Green", "Gold", "Ivory") and custom hex picks to verify that swatches display the exact color.
6. **Compile & Lint**: Run `compile_applet` and `lint_applet` to confirm a clean build with zero errors.
