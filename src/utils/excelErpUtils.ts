import * as XLSX from 'xlsx';
import { Product, Order, Customer, ProductCategory } from '../types';

/**
 * PARK AVENUE MENSWEAR — Enterprise Excel & ERP Integration Utility
 * Supports Microsoft Excel (.xlsx), CSV, Tally Prime / Tally.ERP 9 XML, and Financial Reporting.
 */

// Helper: Trigger browser download for Blob or data string
function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

const getFormattedDate = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// ==========================================
// 1. PRODUCTS EXCEL EXPORT & TEMPLATE
// ==========================================

export function exportProductsToExcel(products: Product[]) {
  const data = products.map(p => {
    const sizeStockStr = (p.variants || [])
      .map(v => `${v.size}:${v.stock}`)
      .join(', ');

    return {
      'SKU': p.sku || '',
      'Product Name': p.name || '',
      'Category': p.category || '',
      'Price ($)': p.price || 0,
      'Original Price ($)': p.originalPrice || '',
      'Total Stock': p.totalStock ?? (p.variants?.reduce((sum, v) => sum + (v.stock || 0), 0) ?? 0),
      'Sizes & Stock (Size:Qty)': sizeStockStr,
      'Collection': p.collection || 'Heritage Sartorial',
      'Fabric': p.fabric || '',
      'Fit': p.fit || 'Tailored Fit',
      'Bespoke Alteration Eligible': p.alterationEligible ? 'Yes' : 'No',
      'Description': p.description || '',
      'Image URL': p.images?.[0] || ''
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(data);

  // Set column widths for readability in Excel
  worksheet['!cols'] = [
    { wch: 14 }, // SKU
    { wch: 32 }, // Product Name
    { wch: 16 }, // Category
    { wch: 12 }, // Price
    { wch: 16 }, // Original Price
    { wch: 12 }, // Total Stock
    { wch: 28 }, // Sizes & Stock
    { wch: 22 }, // Collection
    { wch: 24 }, // Fabric
    { wch: 16 }, // Fit
    { wch: 26 }, // Alteration Eligible
    { wch: 40 }, // Description
    { wch: 35 }  // Image URL
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Atelier Inventory');

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  triggerDownload(blob, `Park_Avenue_Products_${getFormattedDate()}.xlsx`);
}

export function downloadProductExcelTemplate() {
  const sampleData = [
    {
      'SKU': 'PA-SUIT-101',
      'Product Name': 'Double-Breasted Peak Lapel Suit',
      'Category': 'Suits',
      'Price ($)': 2850,
      'Original Price ($)': 3200,
      'Total Stock': 15,
      'Sizes & Stock (Size:Qty)': '38R:4, 40R:6, 42R:5',
      'Collection': 'Presidential Sartorial',
      'Fabric': 'Super 160s Vitale Barberis Canonico Wool',
      'Fit': 'Tailored Structured Fit',
      'Bespoke Alteration Eligible': 'Yes',
      'Description': 'Hand-canvassed double-breasted suit tailored with horn buttons and pick-stitched lapels.',
      'Image URL': 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80'
    },
    {
      'SKU': 'PA-SHIRT-202',
      'Product Name': 'Egyptian Cotton Royal Oxford Shirt',
      'Category': 'Dress shirts',
      'Price ($)': 480,
      'Original Price ($)': '',
      'Total Stock': 20,
      'Sizes & Stock (Size:Qty)': '15.5:5, 16.0:10, 16.5:5',
      'Collection': 'Milanese Business',
      'Fabric': '140/2 Egyptian Giza Cotton',
      'Fit': 'Slim Fit',
      'Bespoke Alteration Eligible': 'No',
      'Description': 'French cuff luxury dress shirt cut from luminous Sea Island cotton yarn.',
      'Image URL': 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80'
    },
    {
      'SKU': 'PA-SHOE-303',
      'Product Name': 'Cap-Toe Goodyear Oxford Shoes',
      'Category': 'Shoe',
      'Price ($)': 920,
      'Original Price ($)': '',
      'Total Stock': 12,
      'Sizes & Stock (Size:Qty)': '9:3, 10:5, 11:4',
      'Collection': 'St. James Footwear',
      'Fabric': 'French Box Calf Leather with Oak Bark Sole',
      'Fit': 'Standard Width E',
      'Bespoke Alteration Eligible': 'No',
      'Description': 'Hand-lasted Goodyear welted cap-toe dress shoes with beveled fiddleback waist.',
      'Image URL': 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=800&q=80'
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  worksheet['!cols'] = [
    { wch: 14 },
    { wch: 34 },
    { wch: 16 },
    { wch: 12 },
    { wch: 16 },
    { wch: 12 },
    { wch: 28 },
    { wch: 24 },
    { wch: 32 },
    { wch: 20 },
    { wch: 26 },
    { wch: 45 },
    { wch: 40 }
  ];

  const instructions = [
    { 'Column': 'SKU', 'Requirement': 'Required', 'Format / Example': 'Unique product identifier, e.g. PA-SUIT-101' },
    { 'Column': 'Product Name', 'Requirement': 'Required', 'Format / Example': 'Full garment name' },
    { 'Column': 'Category', 'Requirement': 'Required', 'Format / Example': 'Suits, Dress shirts, Ties, Shoe, Boots, Loofers, Pants, Jeans, Leather jackets, Sweaters, Coats, Polo shirts, Shorts' },
    { 'Column': 'Price ($)', 'Requirement': 'Required', 'Format / Example': 'Numeric price without dollar sign, e.g. 1850' },
    { 'Column': 'Original Price ($)', 'Requirement': 'Optional', 'Format / Example': 'Numeric strikethrough price, e.g. 2100' },
    { 'Column': 'Total Stock', 'Requirement': 'Optional', 'Format / Example': 'Integer stock quantity' },
    { 'Column': 'Sizes & Stock (Size:Qty)', 'Requirement': 'Recommended', 'Format / Example': 'Comma-separated pairs, e.g. "38R:4, 40R:6, 42R:2"' },
    { 'Column': 'Collection', 'Requirement': 'Optional', 'Format / Example': 'e.g. "Heritage Sartorial", "Monaco Evening"' },
    { 'Column': 'Fabric', 'Requirement': 'Optional', 'Format / Example': 'e.g. "Super 150s Pure Wool"' },
    { 'Column': 'Fit', 'Requirement': 'Optional', 'Format / Example': 'e.g. "Tailored Fit", "Classic Fit"' },
    { 'Column': 'Bespoke Alteration Eligible', 'Requirement': 'Optional', 'Format / Example': '"Yes" or "No"' },
    { 'Column': 'Description', 'Requirement': 'Optional', 'Format / Example': 'Detailed garment description and craftsmanship notes' },
    { 'Column': 'Image URL', 'Requirement': 'Optional', 'Format / Example': 'Direct web URL to product photography' }
  ];

  const instrWorksheet = XLSX.utils.json_to_sheet(instructions);
  instrWorksheet['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 60 }];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Products Template');
  XLSX.utils.book_append_sheet(workbook, instrWorksheet, 'Instructions & Schema');

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  triggerDownload(blob, `Park_Avenue_Product_Import_Template.xlsx`);
}

// ==========================================
// 2. PARSE PRODUCTS FROM EXCEL UPLOAD
// ==========================================

export async function parseProductsFromExcel(file: File): Promise<{
  success: boolean;
  products: Product[];
  errors: string[];
  totalRows: number;
}> {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const buffer = e.target?.result;
        if (!buffer) {
          resolve({ success: false, products: [], errors: ['File could not be read.'], totalRows: 0 });
          return;
        }

        const workbook = XLSX.read(buffer, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        if (!worksheet) {
          resolve({ success: false, products: [], errors: ['No valid sheet found in uploaded spreadsheet.'], totalRows: 0 });
          return;
        }

        const rawRows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
        if (rawRows.length === 0) {
          resolve({ success: false, products: [], errors: ['Uploaded spreadsheet contains no data rows.'], totalRows: 0 });
          return;
        }

        const products: Product[] = [];
        const errors: string[] = [];

        rawRows.forEach((row, index) => {
          const rowNum = index + 2; // Accounting for 1-based index and header row

          // Helper to get field case-insensitively
          const getField = (...keys: string[]): string => {
            for (const key of keys) {
              const foundKey = Object.keys(row).find(k => k.trim().toLowerCase() === key.toLowerCase());
              if (foundKey && row[foundKey] !== undefined && row[foundKey] !== null) {
                return String(row[foundKey]).trim();
              }
            }
            return '';
          };

          const name = getField('Product Name', 'Name', 'Title', 'Garment Name');
          const sku = getField('SKU', 'Product Code', 'Code', 'Item Code') || `PA-${Math.floor(10000 + Math.random() * 90000)}`;
          const categoryRaw = getField('Category', 'Department', 'Type');
          const priceRaw = getField('Price ($)', 'Price', 'Unit Price', 'Retail Price');
          const origPriceRaw = getField('Original Price ($)', 'Original Price', 'MSRP', 'Strikethrough Price');
          const collection = getField('Collection', 'Line', 'Season') || 'Park Avenue Heritage';
          const fabric = getField('Fabric', 'Material', 'Composition') || 'Sartorial Grade Natural Fiber';
          const fit = getField('Fit', 'Silhouette') || 'Tailored Fit';
          const description = getField('Description', 'Details', 'Notes') || `${name} — Crafted to Park Avenue standards.`;
          const alterationEligibleRaw = getField('Bespoke Alteration Eligible', 'Alteration Eligible', 'Alteration');
          const imageUrl = getField('Image URL', 'Image', 'Photo');
          const sizeStockStr = getField('Sizes & Stock (Size:Qty)', 'Sizes & Stock', 'Sizes', 'Stock');
          const totalStockRaw = getField('Total Stock', 'Stock Qty', 'Quantity');

          if (!name) {
            errors.push(`Row ${rowNum}: Skipped — Missing Product Name.`);
            return;
          }

          const price = parseFloat(priceRaw.replace(/[^0-9.]/g, ''));
          if (isNaN(price) || price <= 0) {
            errors.push(`Row ${rowNum} (${name}): Skipped — Invalid price "${priceRaw}".`);
            return;
          }

          const origPrice = origPriceRaw ? parseFloat(origPriceRaw.replace(/[^0-9.]/g, '')) : undefined;

          // Normalize category to official categories
          let category: ProductCategory = 'Suits';
          const catNorm = categoryRaw.toLowerCase();
          if (catNorm.includes('shirt')) {
            category = catNorm.includes('polo') ? 'Polo shirts' : 'Dress shirts';
          } else if (catNorm.includes('tie')) {
            category = 'Ties';
          } else if (catNorm.includes('boot')) {
            category = 'Boots';
          } else if (catNorm.includes('loof') || catNorm.includes('loafer')) {
            category = 'Loofers';
          } else if (catNorm.includes('pant') || catNorm.includes('trouser')) {
            category = 'Pants';
          } else if (catNorm.includes('jean') || catNorm.includes('denim')) {
            category = 'Jeans';
          } else if (catNorm.includes('leather')) {
            category = 'Leather jackets';
          } else if (catNorm.includes('sweater') || catNorm.includes('knit')) {
            category = 'Sweaters';
          } else if (catNorm.includes('coat') || catNorm.includes('overcoat')) {
            category = 'Coats';
          } else if (catNorm.includes('short')) {
            category = 'Shorts';
          } else if (catNorm.includes('shoe') || catNorm.includes('oxford')) {
            category = 'Shoe';
          }

          // Parse variants from "38R:4, 40R:6" or generate sensible defaults
          const variants = [];
          if (sizeStockStr && sizeStockStr.includes(':')) {
            const pairs = sizeStockStr.split(',');
            for (const pair of pairs) {
              const [sz, qty] = pair.split(':');
              if (sz && qty) {
                const stockNum = parseInt(qty.trim(), 10) || 0;
                variants.push({
                  id: `var-${Math.random().toString(36).substring(2, 7)}`,
                  size: sz.trim(),
                  color: 'Classic Atelier',
                  colorHex: '#1F2937',
                  stock: stockNum,
                  sku: `${sku}-${sz.trim()}`
                });
              }
            }
          }

          // Fallback variants if none parsed
          if (variants.length === 0) {
            const fallbackQty = parseInt(totalStockRaw, 10) || 10;
            const defaultSizes = category === 'Suits' 
              ? ['38R', '40R', '42R', '44R'] 
              : category === 'Shoe' || category === 'Boots' || category === 'Loofers'
              ? ['9', '10', '11']
              : ['S', 'M', 'L', 'XL'];

            const perSize = Math.max(1, Math.floor(fallbackQty / defaultSizes.length));
            defaultSizes.forEach(s => {
              variants.push({
                id: `var-${Math.random().toString(36).substring(2, 7)}`,
                size: s,
                color: 'Classic Navy / Charcoal',
                colorHex: '#1F2937',
                stock: perSize,
                sku: `${sku}-${s}`
              });
            });
          }

          const calculatedStock = variants.reduce((sum, v) => sum + v.stock, 0);

          const product: Product = {
            id: `prod-excel-${Date.now()}-${index}`,
            name,
            subtitle: `${fabric} · ${fit}`,
            category,
            price,
            originalPrice: origPrice && !isNaN(origPrice) ? origPrice : undefined,
            sku,
            collection,
            description,
            details: [
              `Crafted from ${fabric}`,
              `Tailoring silhouette: ${fit}`,
              'Hand-inspected before commission dispatch'
            ],
            fabric,
            fit,
            care: ['Specialist dry clean only', 'Store on contoured cedar hanger'],
            images: imageUrl ? [imageUrl] : ['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80'],
            variants,
            totalStock: calculatedStock,
            alterationEligible: alterationEligibleRaw.toLowerCase() === 'yes' || alterationEligibleRaw.toLowerCase() === 'true' || category === 'Suits' || category === 'Pants'
          };

          products.push(product);
        });

        resolve({
          success: products.length > 0,
          products,
          errors,
          totalRows: rawRows.length
        });
      } catch (err) {
        resolve({
          success: false,
          products: [],
          errors: [`Failed to parse spreadsheet file: ${(err as Error).message}`],
          totalRows: 0
        });
      }
    };

    reader.onerror = () => {
      resolve({ success: false, products: [], errors: ['Error occurred reading file binary.'], totalRows: 0 });
    };

    reader.readAsArrayBuffer(file);
  });
}

// ==========================================
// 3. CUSTOMER DATA EXCEL EXPORT
// ==========================================

export function exportCustomersToExcel(customers: Customer[], orders: Order[]) {
  const customerRows = customers.map(c => {
    // Calculate customer metrics from orders list
    const clientOrders = orders.filter(o => 
      (o.customerEmail && o.customerEmail.toLowerCase() === c.email.toLowerCase()) ||
      (c.phone && o.customerPhone && o.customerPhone.replace(/\D/g, '') === c.phone.replace(/\D/g, ''))
    );

    const totalSpent = clientOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    const lastOrder = clientOrders.sort((a, b) => new Date(b.date || '').getTime() - new Date(a.date || '').getTime())[0];

    return {
      'Client ID': c.id || '',
      'Client Name': c.name || '',
      'Email Address': c.email || '',
      'Phone Number': c.phone || 'On File',
      'Atelier Role': (c.role || 'customer').toUpperCase(),
      'Total Orders': clientOrders.length,
      'Lifetime Spend ($)': totalSpent,
      'Last Commission Date': lastOrder ? lastOrder.date : 'None',
      'Atelier Status': c.role === 'admin' ? 'Executive Staff' : totalSpent > 5000 ? 'VIP Patron' : 'Active Patron'
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(customerRows);
  worksheet['!cols'] = [
    { wch: 18 }, // ID
    { wch: 26 }, // Name
    { wch: 32 }, // Email
    { wch: 18 }, // Phone
    { wch: 16 }, // Role
    { wch: 14 }, // Total Orders
    { wch: 18 }, // Lifetime Spend
    { wch: 22 }, // Last Order
    { wch: 20 }  // Status
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Patron Ledger');

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  triggerDownload(blob, `Park_Avenue_Customers_Ledger_${getFormattedDate()}.xlsx`);
}

// ==========================================
// 4. ORDERS DATA EXCEL EXPORT
// ==========================================

export function exportOrdersToExcel(orders: Order[]) {
  // Sheet 1: Orders Summary
  const summaryRows = orders.map(o => ({
    'Order ID': o.id,
    'Date': o.date || (o.createdAt ? new Date(o.createdAt).toLocaleDateString() : ''),
    'Customer Name': o.customerName || '',
    'Email Address': o.customerEmail || '',
    'Phone': o.customerPhone || '',
    'Order Status': o.orderStatus || o.status || 'Order Confirmed',
    'Payment Status': o.paymentStatus || 'Paid',
    'Payment Method': o.paymentMethod || 'Online / Card',
    'Garment Subtotal ($)': o.subtotal || 0,
    'Tax ($)': o.tax || 0,
    'Shipping Fee ($)': o.shippingFee || 0,
    'Grand Total ($)': o.total || 0,
    'Items Count': o.items?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0,
    'Tracking Number': o.trackingNumber || 'Pending Dispatch',
    'Bespoke Alteration': o.alterationRequested ? 'Requested' : 'Standard Delivery'
  }));

  // Sheet 2: Items Detail
  const itemRows: Record<string, unknown>[] = [];
  orders.forEach(o => {
    (o.items || []).forEach(item => {
      itemRows.push({
        'Order ID': o.id,
        'Date': o.date,
        'SKU': item.sku || 'PA-GARMENT',
        'Product Name': item.productName || 'Park Avenue Garment',
        'Category': item.category || 'Suits',
        'Size': item.size || 'Custom',
        'Color': item.color || 'Standard',
        'Quantity': item.quantity || 1,
        'Unit Price ($)': item.price || 0,
        'Line Total ($)': (item.price || 0) * (item.quantity || 1),
        'Customer Name': o.customerName
      });
    });
  });

  const summarySheet = XLSX.utils.json_to_sheet(summaryRows);
  summarySheet['!cols'] = [
    { wch: 14 },
    { wch: 14 },
    { wch: 24 },
    { wch: 30 },
    { wch: 18 },
    { wch: 18 },
    { wch: 16 },
    { wch: 18 },
    { wch: 18 },
    { wch: 12 },
    { wch: 14 },
    { wch: 16 },
    { wch: 14 },
    { wch: 22 },
    { wch: 20 }
  ];

  const itemsSheet = XLSX.utils.json_to_sheet(itemRows);
  itemsSheet['!cols'] = [
    { wch: 14 },
    { wch: 14 },
    { wch: 16 },
    { wch: 32 },
    { wch: 16 },
    { wch: 12 },
    { wch: 16 },
    { wch: 10 },
    { wch: 14 },
    { wch: 16 },
    { wch: 24 }
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Orders Ledger');
  XLSX.utils.book_append_sheet(workbook, itemsSheet, 'Order Line Items');

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  triggerDownload(blob, `Park_Avenue_Orders_Ledger_${getFormattedDate()}.xlsx`);
}

// ==========================================
// 5. TALLY ERP (XML & EXCEL DAYBOOK)
// ==========================================

/**
 * Generates official Tally ERP 9 / Tally Prime XML import format.
 * Can be directly imported via: Gateway of Tally -> Import -> Vouchers
 */
export function exportTallyXml(orders: Order[]) {
  const sanitizeXml = (str: string) => {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  };

  const voucherXmlList = orders.map(o => {
    const rawDate = o.date ? new Date(o.date) : new Date();
    const tallyDate = !isNaN(rawDate.getTime())
      ? `${rawDate.getFullYear()}${String(rawDate.getMonth() + 1).padStart(2, '0')}${String(rawDate.getDate()).padStart(2, '0')}`
      : getFormattedDate().replace(/-/g, '');

    const customerName = sanitizeXml(o.customerName || 'Cash Sales Customer');
    const orderId = sanitizeXml(o.id);
    const totalAmount = Number(o.total || 0).toFixed(2);
    const subtotal = Number(o.subtotal || 0).toFixed(2);
    const tax = Number(o.tax || 0).toFixed(2);
    const shipping = Number(o.shippingFee || 0).toFixed(2);

    return `
      <TALLYMESSAGE xmlns:UDF="TallyUDF">
        <VOUCHER VCHTYPE="Sales" ACTION="Create" OBJVIEW="Accounting Voucher View">
          <DATE>${tallyDate}</DATE>
          <GUID>${orderId}-${Date.now()}</GUID>
          <NARRATION>Park Avenue Menswear Consignment ${orderId} for ${customerName}. Courier: ${sanitizeXml(o.carrier || 'DHL')}</NARRATION>
          <VOUCHERTYPENAME>Sales</VOUCHERTYPENAME>
          <VOUCHERNUMBER>${orderId}</VOUCHERNUMBER>
          <REFERENCE>${orderId}</REFERENCE>
          <PARTYLEDGERNAME>${customerName}</PARTYLEDGERNAME>
          <CSTFORMISSUETYPE/>
          <CSTFORMRECVTYPE/>
          <FBTPAYMENTTYPE>Default</FBTPAYMENTTYPE>
          <PERSISTEDVIEW>Accounting Voucher View</PERSISTEDVIEW>
          <BASICBUYERNAME>${customerName}</BASICBUYERNAME>
          <BASICDATETIMEOFINVOICE>${tallyDate}</BASICDATETIMEOFINVOICE>
          
          <!-- Debiting Customer / Sundry Debtors -->
          <ALLLEDGERENTRIES.LIST>
            <LEDGERNAME>${customerName}</LEDGERNAME>
            <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
            <LEDGERFROMITEM>No</LEDGERFROMITEM>
            <REMOVEZEROENTRIES>No</REMOVEZEROENTRIES>
            <ISPARTYLEDGER>Yes</ISPARTYLEDGER>
            <AMOUNT>-${totalAmount}</AMOUNT>
          </ALLLEDGERENTRIES.LIST>

          <!-- Crediting Sales Account -->
          <ALLLEDGERENTRIES.LIST>
            <LEDGERNAME>Sales Account - Luxury Menswear</LEDGERNAME>
            <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
            <LEDGERFROMITEM>No</LEDGERFROMITEM>
            <REMOVEZEROENTRIES>No</REMOVEZEROENTRIES>
            <ISPARTYLEDGER>No</ISPARTYLEDGER>
            <AMOUNT>${subtotal}</AMOUNT>
          </ALLLEDGERENTRIES.LIST>

          ${Number(tax) > 0 ? `
          <!-- Crediting Output GST / Sales Tax -->
          <ALLLEDGERENTRIES.LIST>
            <LEDGERNAME>Output Luxury Sales Tax</LEDGERNAME>
            <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
            <LEDGERFROMITEM>No</LEDGERFROMITEM>
            <REMOVEZEROENTRIES>No</REMOVEZEROENTRIES>
            <ISPARTYLEDGER>No</ISPARTYLEDGER>
            <AMOUNT>${tax}</AMOUNT>
          </ALLLEDGERENTRIES.LIST>
          ` : ''}

          ${Number(shipping) > 0 ? `
          <!-- Crediting Courier Freight Recoveries -->
          <ALLLEDGERENTRIES.LIST>
            <LEDGERNAME>Express Courier Freight Recovery</LEDGERNAME>
            <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
            <LEDGERFROMITEM>No</LEDGERFROMITEM>
            <REMOVEZEROENTRIES>No</REMOVEZEROENTRIES>
            <ISPARTYLEDGER>No</ISPARTYLEDGER>
            <AMOUNT>${shipping}</AMOUNT>
          </ALLLEDGERENTRIES.LIST>
          ` : ''}

        </VOUCHER>
      </TALLYMESSAGE>`;
  }).join('\n');

  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<ENVELOPE>
  <HEADER>
    <TALLYREQUEST>Import Data</TALLYREQUEST>
  </HEADER>
  <BODY>
    <IMPORTDATA>
      <REQUESTDESC>
        <REPORTNAME>Vouchers</REPORTNAME>
        <STATICVARIABLES>
          <SVCURRENTCOMPANY>Park Avenue Menswear</SVCURRENTCOMPANY>
        </STATICVARIABLES>
      </REQUESTDESC>
      <REQUESTDATA>
        ${voucherXmlList}
      </REQUESTDATA>
    </IMPORTDATA>
  </BODY>
</ENVELOPE>`;

  const blob = new Blob([xmlContent], { type: 'application/xml;charset=utf-8;' });
  triggerDownload(blob, `Park_Avenue_Tally_Sales_Vouchers_${getFormattedDate()}.xml`);
}

/**
 * Tally ERP Compatible Excel Daybook / Sales Voucher format
 */
export function exportTallyExcel(orders: Order[]) {
  const tallyRows = orders.map((o, idx) => ({
    'Sl. No': idx + 1,
    'Date (DD-MM-YYYY)': o.date || getFormattedDate(),
    'Voucher Type': 'Sales',
    'Voucher No': o.id,
    'Party Ledger (Debtor)': o.customerName || 'Cash Customer',
    'Sales Ledger (Credit)': 'Sales Account - Luxury Menswear',
    'Tax Ledger (Credit)': o.tax > 0 ? 'Output Luxury Sales Tax' : 'N/A',
    'Net Sales ($)': o.subtotal || 0,
    'Tax Amount ($)': o.tax || 0,
    'Shipping Amount ($)': o.shippingFee || 0,
    'Gross Voucher Amount ($)': o.total || 0,
    'Cost Centre': 'Park Avenue Atelier Storefront',
    'Narration': `Invoice ${o.id} paid via ${o.paymentMethod || 'Online Payment'}`
  }));

  const worksheet = XLSX.utils.json_to_sheet(tallyRows);
  worksheet['!cols'] = [
    { wch: 8 },
    { wch: 18 },
    { wch: 14 },
    { wch: 14 },
    { wch: 28 },
    { wch: 32 },
    { wch: 24 },
    { wch: 14 },
    { wch: 14 },
    { wch: 18 },
    { wch: 22 },
    { wch: 28 },
    { wch: 40 }
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Tally Sales Daybook');

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  triggerDownload(blob, `Park_Avenue_Tally_Daybook_${getFormattedDate()}.xlsx`);
}

// ==========================================
// 6. SALES REPORT & ERP FINANCIAL ANALYTICS
// ==========================================

export function exportSalesReportToExcel(orders: Order[], products: Product[]) {
  const totalGross = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const totalNet = orders.reduce((sum, o) => sum + (o.subtotal || 0), 0);
  const totalTax = orders.reduce((sum, o) => sum + (o.tax || 0), 0);
  const totalShipping = orders.reduce((sum, o) => sum + (o.shippingFee || 0), 0);
  const totalUnitsSold = orders.reduce((sum, o) => 
    sum + (o.items?.reduce((iSum, item) => iSum + (item.quantity || 1), 0) || 0), 0
  );
  const aov = orders.length > 0 ? totalGross / orders.length : 0;

  // Sheet 1: Executive KPI Summary
  const kpiData = [
    { 'Metric': 'Gross Revenue ($)', 'Value': `$${totalGross.toLocaleString(undefined, { minimumFractionDigits: 2 })}` },
    { 'Metric': 'Net Garment Sales ($)', 'Value': `$${totalNet.toLocaleString(undefined, { minimumFractionDigits: 2 })}` },
    { 'Metric': 'Total Luxury Tax Collected ($)', 'Value': `$${totalTax.toLocaleString(undefined, { minimumFractionDigits: 2 })}` },
    { 'Metric': 'Express Shipping Recovered ($)', 'Value': `$${totalShipping.toLocaleString(undefined, { minimumFractionDigits: 2 })}` },
    { 'Metric': 'Total Orders / Invoices Count', 'Value': orders.length },
    { 'Metric': 'Total Garment Units Dispatched', 'Value': totalUnitsSold },
    { 'Metric': 'Average Order Value (AOV)', 'Value': `$${aov.toLocaleString(undefined, { minimumFractionDigits: 2 })}` },
    { 'Metric': 'Total Inventory SKUs Active', 'Value': products.length },
    { 'Metric': 'Report Generated On', 'Value': new Date().toLocaleString() }
  ];

  // Sheet 2: Category Breakdown
  const categoryStats: Record<string, { units: number; revenue: number }> = {};
  orders.forEach(o => {
    (o.items || []).forEach(item => {
      const cat = item.category || 'Suits';
      if (!categoryStats[cat]) {
        categoryStats[cat] = { units: 0, revenue: 0 };
      }
      categoryStats[cat].units += (item.quantity || 1);
      categoryStats[cat].revenue += (item.price || 0) * (item.quantity || 1);
    });
  });

  const categoryRows = Object.entries(categoryStats).map(([cat, stat]) => ({
    'Atelier Department': cat,
    'Units Sold': stat.units,
    'Gross Revenue ($)': stat.revenue,
    'Revenue Share (%)': totalNet > 0 ? `${((stat.revenue / totalNet) * 100).toFixed(1)}%` : '0%'
  }));

  // Sheet 3: Product Performance Breakdown
  const productStats: Record<string, { name: string; category: string; units: number; revenue: number }> = {};
  orders.forEach(o => {
    (o.items || []).forEach(item => {
      const id = item.productId || item.productName;
      if (!productStats[id]) {
        productStats[id] = {
          name: item.productName || 'Garment',
          category: item.category || 'Suits',
          units: 0,
          revenue: 0
        };
      }
      productStats[id].units += (item.quantity || 1);
      productStats[id].revenue += (item.price || 0) * (item.quantity || 1);
    });
  });

  const productRows = Object.values(productStats)
    .sort((a, b) => b.revenue - a.revenue)
    .map(p => ({
      'Product Name': p.name,
      'Department': p.category,
      'Units Sold': p.units,
      'Gross Sales ($)': p.revenue
    }));

  const kpiSheet = XLSX.utils.json_to_sheet(kpiData);
  kpiSheet['!cols'] = [{ wch: 32 }, { wch: 30 }];

  const catSheet = XLSX.utils.json_to_sheet(categoryRows);
  catSheet['!cols'] = [{ wch: 24 }, { wch: 14 }, { wch: 20 }, { wch: 18 }];

  const prodSheet = XLSX.utils.json_to_sheet(productRows);
  prodSheet['!cols'] = [{ wch: 36 }, { wch: 20 }, { wch: 14 }, { wch: 20 }];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, kpiSheet, 'Executive Financial KPI');
  XLSX.utils.book_append_sheet(workbook, catSheet, 'Category Performance');
  XLSX.utils.book_append_sheet(workbook, prodSheet, 'Product Sales Velocity');

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  triggerDownload(blob, `Park_Avenue_Sales_Report_ERP_${getFormattedDate()}.xlsx`);
}
