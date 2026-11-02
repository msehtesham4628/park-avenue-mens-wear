import * as XLSX from 'xlsx';
import { Product, Order, Customer, ProductCategory, OFFICIAL_CATEGORIES, ProductVariant } from '../types';

/**
 * Downloads a standardized Excel template for bulk product upload
 */
export function downloadProductExcelTemplate() {
  // One row represents one COLOR + SIZE variant.
  // Keep the same Product Group / Garment Name for all colors and sizes.
  const templateRows = [
    {
      'Product Group': 'PA-SUIT-001',
      'SKU': 'PA-SUIT-001-NAVY-38R',
      'Garment Name': 'Park Avenue Modern Tailored Suit',
      'Category': 'Suits',
      'Subcategory': 'Suits',
      'Price ($)': 2850,
      'Color': 'Navy',
      'Color Hex': '#1E2A44',
      'Size': '38R',
      'Stock': 3,
      'Image URL': 'https://example.com/images/park-avenue-suit-navy.jpg',
      'Fabric': 'Super 150s Tasmanian Wool',
      'Fit': 'Modern Tailored',
      'Description': 'Handcrafted Park Avenue tailored suit.'
    },
    {
      'Product Group': 'PA-SUIT-001',
      'SKU': 'PA-SUIT-001-NAVY-40R',
      'Garment Name': 'Park Avenue Modern Tailored Suit',
      'Category': 'Suits',
      'Subcategory': 'Suits',
      'Price ($)': 2850,
      'Color': 'Navy',
      'Color Hex': '#1E2A44',
      'Size': '40R',
      'Stock': 5,
      'Image URL': 'https://example.com/images/park-avenue-suit-navy.jpg',
      'Fabric': 'Super 150s Tasmanian Wool',
      'Fit': 'Modern Tailored',
      'Description': 'Handcrafted Park Avenue tailored suit.'
    },
    {
      'Product Group': 'PA-SUIT-001',
      'SKU': 'PA-SUIT-001-BLACK-38R',
      'Garment Name': 'Park Avenue Modern Tailored Suit',
      'Category': 'Suits',
      'Subcategory': 'Suits',
      'Price ($)': 2850,
      'Color': 'Black',
      'Color Hex': '#111111',
      'Size': '38R',
      'Stock': 2,
      'Image URL': 'https://example.com/images/park-avenue-suit-black.jpg',
      'Fabric': 'Super 150s Tasmanian Wool',
      'Fit': 'Modern Tailored',
      'Description': 'Handcrafted Park Avenue tailored suit.'
    }
  ];

  const ws = XLSX.utils.json_to_sheet(templateRows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Product_Template');

  ws['!cols'] = [
    { wch: 18 }, { wch: 28 }, { wch: 38 }, { wch: 22 }, { wch: 24 },
    { wch: 12 }, { wch: 16 }, { wch: 14 }, { wch: 12 }, { wch: 10 },
    { wch: 55 }, { wch: 30 }, { wch: 20 }, { wch: 55 }
  ];

  XLSX.writeFile(wb, 'park_avenue_products_upload_template.xlsx');
}

/**
 * Excel Parsing Result Interface
 */
export interface ExcelParseResult {
  products: Omit<Product, 'id' | 'totalStock'>[];
  errors: string[];
  warnings: string[];
}

/**
 * Flexible column value accessor that matches against multiple possible header aliases,
 * ignoring casing, whitespace, and punctuation.
 */
function getRowValue(row: Record<string, any>, aliases: string[]): string {
  const normalizedKeys = Object.keys(row).map(k => ({
    original: k,
    normalized: k.toLowerCase().replace(/[^a-z0-9]/g, '')
  }));

  for (const alias of aliases) {
    const normAlias = alias.toLowerCase().replace(/[^a-z0-9]/g, '');
    const found = normalizedKeys.find(k => k.normalized === normAlias);
    if (found && row[found.original] !== undefined && row[found.original] !== null) {
      const val = String(row[found.original]).trim();
      if (val) return val;
    }
  }
  return '';
}

/**
 * Parses an uploaded Excel or CSV file into Product items with robust header matching and validation
 */
export async function parseProductsExcel(file: File): Promise<ExcelParseResult> {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) throw new Error('Spreadsheet has no sheets.');

  const worksheet = workbook.Sheets[firstSheetName];
  const rows = XLSX.utils.sheet_to_json<any>(worksheet, { defval: '' });
  if (rows.length === 0) throw new Error('Uploaded spreadsheet contains no data rows.');

  const products: Omit<Product, 'id' | 'totalStock'>[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];

  rows.forEach((row, index) => {
    const rowNum = index + 2;

    // Flexible column extraction
    const rawGroup = getRowValue(row, ['Product Group', 'Group', 'Style Group', 'Group ID', 'Style Code', 'Parent SKU']);
    const rawSku = getRowValue(row, ['SKU', 'Product Code', 'Item Code', 'Item SKU', 'Product ID', 'Style No', 'Style', 'Code', 'Barcode']);
    const name = getRowValue(row, ['Garment Name', 'Product Name', 'Name', 'Title', 'Product', 'Item Name', 'Item', 'Garment']);
    const rawCategory = getRowValue(row, ['Category', 'Department', 'Dept', 'Collection', 'Group', 'Type', 'Product Type']);
    const subcategory = getRowValue(row, ['Subcategory', 'Sub Category', 'Sub-Category', 'Style Type']);
    const rawPrice = getRowValue(row, ['Price ($)', 'Price', 'Unit Price', 'Cost', 'Rate', 'MRP', 'Selling Price', 'Amount']);
    const color = getRowValue(row, ['Color', 'Colour', 'Shade']) || 'Classic';
    const colorHex = getRowValue(row, ['Color Hex', 'Hex', 'ColorHex', 'Hex Code']) || '#111827';
    const fabric = getRowValue(row, ['Fabric', 'Material', 'Textile', 'Cloth', 'Composition']);
    const fit = getRowValue(row, ['Fit', 'Cut', 'Tailoring Fit', 'Style Fit']);
    const description = getRowValue(row, ['Description', 'Desc', 'Details', 'About', 'Product Details']);
    const size = getRowValue(row, ['Size', 'Sizes', 'Measurement', 'Dimensions']) || 'Standard';
    const rawStock = getRowValue(row, ['Stock', 'Qty', 'Quantity', 'Inventory', 'Count', 'Available', 'Units']);
    const imageUrl = getRowValue(row, ['Image URL', 'Image', 'Images', 'Photo', 'Picture', 'Img', 'Photo URL', 'Image Link']);

    if (!name && !rawSku) {
      errors.push(`Row ${rowNum}: Missing both Garment Name and SKU. Row was skipped.`);
      return;
    }

    const effectiveName = name || (rawSku ? `Garment ${rawSku}` : 'Bespoke Garment');
    const effectiveSku = rawSku || (rawGroup ? `${rawGroup}-${color.toUpperCase().replace(/\s+/g, '')}-${size}` : `PA-${Date.now().toString(36).toUpperCase()}-${index + 1}`);

    const priceNum = parseFloat(rawPrice.replace(/[^0-9.]/g, ''));
    const finalPrice = (!isNaN(priceNum) && priceNum > 0) ? priceNum : 450;
    if (isNaN(priceNum) || priceNum <= 0) {
      warnings.push(`Row ${rowNum} ("${effectiveName}"): Missing or zero price, defaulted to $450.`);
    }

    const stock = Math.max(0, parseInt(rawStock.replace(/[^0-9]/g, '') || '0', 10) || 0);

    if (!imageUrl) {
      warnings.push(`Row ${rowNum} ("${effectiveName}" / ${color}): No image link provided; using category atelier lookbook.`);
    }

    let category: ProductCategory = 'Suits';
    const rawLower = (rawCategory || '').trim().toLowerCase();
    
    // Direct or subcategory lookup
    const foundCat = OFFICIAL_CATEGORIES.find(c =>
      c.name.toLowerCase() === rawLower ||
      c.queryValue.toLowerCase() === rawLower
    );
    if (foundCat && foundCat.queryValue !== 'All' && foundCat.queryValue !== 'New Arrivals') {
      category = foundCat.queryValue;
    } else {
      const parent = OFFICIAL_CATEGORIES.find(c =>
        c.subcategories.some(s => s.toLowerCase() === rawLower || rawLower.includes(s.toLowerCase()) || s.toLowerCase().includes(rawLower))
      );
      if (parent && parent.queryValue !== 'All' && parent.queryValue !== 'New Arrivals') {
        category = parent.queryValue;
      } else if (rawLower.includes('suit') || rawLower.includes('tuxedo')) {
        category = 'Suits';
      } else if (rawLower.includes('shirt') || rawLower.includes('polo')) {
        category = 'Shirts';
      } else if (rawLower.includes('sweater') || rawLower.includes('knit') || rawLower.includes('cardigan') || rawLower.includes('crewneck') || rawLower.includes('rollneck')) {
        category = 'Sweaters & Knitwear';
      } else if (rawLower.includes('boot') || rawLower.includes('shoe') || rawLower.includes('loaf') || rawLower.includes('loof') || rawLower.includes('footwear') || rawLower.includes('oxford') || rawLower.includes('derby') || rawLower.includes('chelsea')) {
        category = 'Footwear';
      } else if (rawLower.includes('pant') || rawLower.includes('trouser') || rawLower.includes('jean') || rawLower.includes('denim') || rawLower.includes('chino')) {
        category = 'Pants';
      } else if (rawLower.includes('blazer') || rawLower.includes('jacket') || rawLower.includes('sport coat')) {
        category = 'Blazers & Jackets';
      } else if (rawLower.includes('coat') || rawLower.includes('outerwear') || rawLower.includes('overcoat') || rawLower.includes('parka')) {
        category = 'Outerwear';
      } else if (rawLower.includes('tie') || rawLower.includes('accessor') || rawLower.includes('cufflink') || rawLower.includes('pocket square') || rawLower.includes('belt')) {
        category = 'Accessories';
      } else if (rawLower.includes('short') || rawLower.includes('bermuda')) {
        category = 'Shorts';
      } else {
        category = 'Suits';
        if (rawCategory) {
          warnings.push(`Row ${rowNum}: Category "${rawCategory}" normalized to "Suits".`);
        }
      }
    }

    const variants: ProductVariant[] = [{
      id: `${effectiveSku}-var-${size}-${color}`.replace(/\s+/g, '-'),
      size: size || 'Standard',
      stock: stock > 0 ? stock : 3,
      color,
      colorHex,
      sku: effectiveSku
    }];

    products.push({
      sku: rawGroup || effectiveSku,
      name: effectiveName,
      subtitle: subcategory || 'Sartorial Collection',
      category,
      price: finalPrice,
      collection: 'Park Avenue Sartorial',
      description: description || 'Bespoke sartorial garment handcrafted with traditional craftsmanship.',
      details: ['Hand-finished tailoring', 'Classic drape', 'Bespoke fit'],
      care: ['Professional Dry Clean Only'],
      fabric: fabric || 'Pure Wool / Silk Blend',
      fit: fit || 'Contemporary Tailored',
      images: imageUrl ? [imageUrl] : [],
      colorImages: imageUrl ? { [color]: [imageUrl] } : {},
      variants
    });
  });

  // Group multiple rows into single product items by Group, Name, or SKU
  const grouped = new Map<string, Omit<Product, 'id' | 'totalStock'>>();
  for (const product of products) {
    const groupKey = product.name.trim().toLowerCase();
    const existing = grouped.get(groupKey);
    if (!existing) {
      grouped.set(groupKey, {
        ...product,
        variants: [...(product.variants || [])],
        images: [...new Set(product.images || [])],
        colorImages: { ...(product.colorImages || {}) },
        colors: Array.from(new Set((product.variants || []).map(v => v.color)))
      });
      continue;
    }

    // Merge variants by size and color
    const mergedVariants = [...(existing.variants || [])];
    for (const incomingVar of product.variants || []) {
      const matchIdx = mergedVariants.findIndex(
        v => v.size.toLowerCase() === incomingVar.size.toLowerCase() &&
             v.color.toLowerCase() === incomingVar.color.toLowerCase()
      );
      if (matchIdx >= 0) {
        mergedVariants[matchIdx].stock += incomingVar.stock;
      } else {
        mergedVariants.push(incomingVar);
      }
    }
    existing.variants = mergedVariants;

    existing.images = [...new Set([...(existing.images || []), ...(product.images || [])])];

    const existingColorImages = existing.colorImages || {};
    const incomingColorImages = product.colorImages || {};
    existing.colorImages = { ...existingColorImages, ...incomingColorImages };

    existing.colors = Array.from(new Set(mergedVariants.map(v => v.color)));
  }

  const groupedProducts = Array.from(grouped.values());
  return { products: groupedProducts, errors, warnings };
}

/**
 * Exports products list to Excel (.xlsx)
 */
export function exportProductsToExcel(products: Product[]) {
  const exportRows = products.map(p => ({
    'SKU': p.sku,
    'Garment Name': p.name,
    'Category': p.category,
    'Price ($)': p.price,
    'Total Stock': p.totalStock ?? p.variants?.reduce((sum, v) => sum + v.stock, 0) ?? 0,
    'Fabric Composition': p.fabric || 'N/A',
    'Fit Profile': p.fit || 'N/A',
    'Variants Breakdown': p.variants?.map(v => `${v.size}: ${v.stock}`).join(' | ') || 'N/A',
    'Description': p.description || '',
    'Primary Image': p.images?.[0] || ''
  }));

  const ws = XLSX.utils.json_to_sheet(exportRows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Products_Catalogue');

  ws['!cols'] = [
    { wch: 18 }, // SKU
    { wch: 38 }, // Garment Name
    { wch: 16 }, // Category
    { wch: 12 }, // Price
    { wch: 14 }, // Total Stock
    { wch: 30 }, // Fabric
    { wch: 22 }, // Fit
    { wch: 35 }, // Variants
    { wch: 45 }, // Description
    { wch: 30 }  // Primary Image
  ];

  XLSX.writeFile(wb, `park_avenue_products_catalogue_${Date.now().toString().slice(-6)}.xlsx`);
}

/**
 * Exports Customers lifetime spend & records to Excel (.xlsx)
 */
export function exportCustomersToExcel(customers: Customer[], orders: Order[]) {
  const exportRows = customers.map(c => {
    const custOrders = orders.filter(o => 
      o.customerEmail?.toLowerCase() === c.email?.toLowerCase() ||
      o.customerPhone === c.phone ||
      o.customerName?.toLowerCase() === c.name?.toLowerCase()
    );
    const lifetimeSpend = custOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    const lastOrderDate = custOrders.length > 0 ? custOrders[0].date : 'None';

    return {
      'Client ID': c.id,
      'Patron Name': c.name,
      'Email': c.email,
      'Phone': c.phone || 'Private',
      'Clearance Role': (c.role || 'Patron').toUpperCase(),
      'Total Consignments': custOrders.length,
      'Lifetime Spend ($)': lifetimeSpend,
      'Last Commission Date': lastOrderDate,
      'VIP Classification': lifetimeSpend > 5000 ? 'Platinum Atelier' : lifetimeSpend > 2000 ? 'Gold Salon' : 'Privileged Patron'
    };
  });

  const ws = XLSX.utils.json_to_sheet(exportRows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Patron_Ledger');

  ws['!cols'] = [
    { wch: 16 }, // ID
    { wch: 28 }, // Name
    { wch: 30 }, // Email
    { wch: 18 }, // Phone
    { wch: 16 }, // Role
    { wch: 20 }, // Orders
    { wch: 18 }, // Spend
    { wch: 22 }, // Last Order
    { wch: 22 }  // VIP Class
  ];

  XLSX.writeFile(wb, `park_avenue_patrons_ledger_${Date.now().toString().slice(-6)}.xlsx`);
}

/**
 * Exports Orders to Excel (.xlsx) with Orders Overview + Line Items sheet
 */
export function exportOrdersToExcel(orders: Order[]) {
  // Sheet 1: Orders Header
  const orderHeaders = orders.map(o => ({
    'Consignment ID': o.id,
    'Order Date': o.date,
    'Patron Name': o.customerName,
    'Client Email': o.customerEmail,
    'Client Phone': o.customerPhone,
    'Garment Count': o.items?.reduce((sum, it) => sum + it.quantity, 0) || 0,
    'Subtotal ($)': o.subtotal,
    'Tax ($)': o.tax,
    'Shipping Fee ($)': o.shippingFee ?? 0,
    'Total Consignment ($)': o.total,
    'Fulfillment Status': o.orderStatus,
    'Payment Status': o.paymentStatus,
    'Payment Method': o.paymentMethod || 'Credit Card',
    'Courier / Dispatch': o.shippingMethod || 'Standard White-Glove',
    'Alterations Requested': o.alterationRequested ? 'YES' : 'NO',
    'Alteration Notes': o.alterationNotes || ''
  }));

  // Sheet 2: Line Items Detail
  const lineItems: any[] = [];
  orders.forEach(o => {
    (o.items || []).forEach(it => {
      lineItems.push({
        'Consignment ID': o.id,
        'Order Date': o.date,
        'Patron Name': o.customerName,
        'Garment Title': it.productName,
        'Size': it.size,
        'Quantity': it.quantity,
        'Unit Price ($)': it.price,
        'Line Total ($)': it.price * it.quantity
      });
    });
  });

  const wb = XLSX.utils.book_new();

  const wsOrders = XLSX.utils.json_to_sheet(orderHeaders);
  XLSX.utils.book_append_sheet(wb, wsOrders, 'Orders_Ledger');

  const wsItems = XLSX.utils.json_to_sheet(lineItems);
  XLSX.utils.book_append_sheet(wb, wsItems, 'Order_Line_Items');

  XLSX.writeFile(wb, `park_avenue_consignments_ledger_${Date.now().toString().slice(-6)}.xlsx`);
}

/**
 * Generates official Tally Prime / Tally.ERP 9 XML Voucher file
 */
export function exportTallyXml(orders: Order[]) {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<ENVELOPE>
  <HEADER>
    <TALLYREQUEST>Import Data</TALLYREQUEST>
  </HEADER>
  <BODY>
    <IMPORTDATA>
      <REQUESTDESC>
        <REPORTNAME>Vouchers</REPORTNAME>
        <STATICVARIABLES>
          <SVCURRENTCOMPANY>Park Avenue Menswear Atelier</SVCURRENTCOMPANY>
        </STATICVARIABLES>
      </REQUESTDESC>
      <REQUESTDATA>
`;

  orders.forEach(order => {
    const orderDateStr = order.date || (order.createdAt ? new Date(order.createdAt).toISOString().split('T')[0] : '2026-09-24');
    const rawDate = String(orderDateStr).replace(/-/g, ''); // YYYYMMDD
    const tallyDate = rawDate.length === 8 ? rawDate : '20260924';

    xml += `        <TALLYMESSAGE xmlns:UDF="TallyUDF">
          <VOUCHER VCHTYPE="Sales" ACTION="Create" OBJVIEW="Accounting Voucher View">
            <DATE>${tallyDate}</DATE>
            <VOUCHERTYPENAME>Sales</VOUCHERTYPENAME>
            <VOUCHERNUMBER>${order.id}</VOUCHERNUMBER>
            <REFERENCE>${order.id}</REFERENCE>
            <PARTYLEDGERNAME>${escapeXml(order.customerName || 'Park Avenue Patron')}</PARTYLEDGERNAME>
            <PERSISTEDVIEW>Accounting Voucher View</PERSISTEDVIEW>
            <BASICBUYERNAME>${escapeXml(order.customerName || 'Park Avenue Patron')}</BASICBUYERNAME>
            <NARRATION>Park Avenue Consignment Order ${order.id}. Payment: ${order.paymentStatus} (${order.paymentMethod || 'Private Ledger'}).</NARRATION>

            <!-- Debit Party (Customer Sundry Debtors) -->
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>${escapeXml(order.customerName || 'Park Avenue Patron')}</LEDGERNAME>
              <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
              <AMOUNT>-${order.total.toFixed(2)}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>

            <!-- Credit Sales Account (Net Garments) -->
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>Luxury Garments Sales Account</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <AMOUNT>${order.subtotal.toFixed(2)}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>

            <!-- Credit Luxury Sales Tax Account -->
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>Luxury Sales Tax Payable (8.875%)</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <AMOUNT>${order.tax.toFixed(2)}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
          </VOUCHER>
        </TALLYMESSAGE>
`;
  });

  xml += `      </REQUESTDATA>
    </IMPORTDATA>
  </BODY>
</ENVELOPE>`;

  const blob = new Blob([xml], { type: 'application/xml;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `tally_sales_vouchers_${Date.now().toString().slice(-6)}.xml`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exports Tally-compliant Daybook Excel sheet
 */
export function exportTallyExcel(orders: Order[]) {
  const tallyRows = orders.map(order => ({
    'Voucher Date': order.date,
    'Voucher Number': order.id,
    'Voucher Type': 'Sales',
    'Party Ledger Name (Dr)': order.customerName,
    'Sales Account (Cr)': 'Luxury Garments Sales Account',
    'Tax Account (Cr)': 'Luxury Sales Tax Payable',
    'Net Sales Amount ($)': order.subtotal,
    'Tax Amount ($)': order.tax,
    'Gross Voucher Amount ($)': order.total,
    'Payment Mode': order.paymentMethod || 'Direct Ledger',
    'Settlement Status': order.paymentStatus,
    'Narration': `Atelier sale consignment ${order.id} for ${order.customerName}`
  }));

  const ws = XLSX.utils.json_to_sheet(tallyRows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Tally_Daybook');

  ws['!cols'] = [
    { wch: 14 },
    { wch: 18 },
    { wch: 14 },
    { wch: 25 },
    { wch: 30 },
    { wch: 25 },
    { wch: 20 },
    { wch: 15 },
    { wch: 22 },
    { wch: 20 },
    { wch: 18 },
    { wch: 45 }
  ];

  XLSX.writeFile(wb, `tally_daybook_ledger_${Date.now().toString().slice(-6)}.xlsx`);
}

/**
 * Generates an Executive Sales & Margin Analysis Workbook (.xlsx)
 */
export function exportSalesReportToExcel(orders: Order[], products: Product[]) {
  // Sheet 1: Executive KPI Metrics
  const grossRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const netSales = orders.reduce((sum, o) => sum + (o.subtotal || 0), 0);
  const totalTax = orders.reduce((sum, o) => sum + (o.tax || 0), 0);
  const totalOrders = orders.length;
  const avgOrderValue = totalOrders > 0 ? grossRevenue / totalOrders : 0;
  const totalItemsSold = orders.reduce((sum, o) => sum + (o.items?.reduce((s, it) => s + it.quantity, 0) || 0), 0);

  const kpiRows = [
    { 'Financial Metric': 'Gross Commissions Revenue', 'Value': `$${grossRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}` },
    { 'Financial Metric': 'Net Garments Sales', 'Value': `$${netSales.toLocaleString(undefined, { minimumFractionDigits: 2 })}` },
    { 'Financial Metric': 'Luxury Output Tax Collected (8.875%)', 'Value': `$${totalTax.toLocaleString(undefined, { minimumFractionDigits: 2 })}` },
    { 'Financial Metric': 'Total Consignments Processed', 'Value': totalOrders },
    { 'Financial Metric': 'Average Commission Value (AOV)', 'Value': `$${avgOrderValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}` },
    { 'Financial Metric': 'Total Garments Handcrafted & Dispatched', 'Value': totalItemsSold },
    { 'Financial Metric': 'Report Generation Timestamp', 'Value': new Date().toISOString() }
  ];

  // Sheet 2: Category Breakdown
  const categoryMap: Record<string, { revenue: number; units: number }> = {};
  orders.forEach(o => {
    (o.items || []).forEach(it => {
      // Find matching product for category
      const prod = products.find(p => p.id === it.productId || p.name === it.productName);
      const cat = prod?.category || 'Suits';
      if (!categoryMap[cat]) {
        categoryMap[cat] = { revenue: 0, units: 0 };
      }
      categoryMap[cat].revenue += (it.price * it.quantity);
      categoryMap[cat].units += it.quantity;
    });
  });

  const categoryRows = Object.keys(categoryMap).map(cat => ({
    'Category Department': cat,
    'Units Sold': categoryMap[cat].units,
    'Revenue Generated ($)': categoryMap[cat].revenue,
    'Share of Total Sales (%)': netSales > 0 ? ((categoryMap[cat].revenue / netSales) * 100).toFixed(2) + '%' : '0.00%'
  }));

  // Sheet 3: Product Sales Velocity
  const productVelocityMap: Record<string, { name: string; units: number; revenue: number }> = {};
  orders.forEach(o => {
    (o.items || []).forEach(it => {
      const key = it.productName;
      if (!productVelocityMap[key]) {
        productVelocityMap[key] = { name: it.productName, units: 0, revenue: 0 };
      }
      productVelocityMap[key].units += it.quantity;
      productVelocityMap[key].revenue += (it.price * it.quantity);
    });
  });

  const velocityRows = Object.values(productVelocityMap).sort((a, b) => b.revenue - a.revenue).map(p => ({
    'Garment Title': p.name,
    'Units Sold': p.units,
    'Total Revenue ($)': p.revenue,
    'Average Realized Price ($)': p.units > 0 ? (p.revenue / p.units).toFixed(2) : '0.00'
  }));

  const wb = XLSX.utils.book_new();

  const wsKpi = XLSX.utils.json_to_sheet(kpiRows);
  XLSX.utils.book_append_sheet(wb, wsKpi, 'Executive_Financial_KPIs');

  const wsCat = XLSX.utils.json_to_sheet(categoryRows);
  XLSX.utils.book_append_sheet(wb, wsCat, 'Department_Revenue_Share');

  const wsVel = XLSX.utils.json_to_sheet(velocityRows);
  XLSX.utils.book_append_sheet(wb, wsVel, 'Garment_Sales_Velocity');

  XLSX.writeFile(wb, `park_avenue_executive_sales_report_${Date.now().toString().slice(-6)}.xlsx`);
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
