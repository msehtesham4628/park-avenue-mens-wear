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
 * Parses an uploaded Excel or CSV file into Product items
 */
export async function parseProductsExcel(file: File): Promise<{
  products: Omit<Product, 'id' | 'totalStock'>[];
  errors: string[];
}> {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) throw new Error('Spreadsheet has no sheets.');

  const worksheet = workbook.Sheets[firstSheetName];
  const rows = XLSX.utils.sheet_to_json<any>(worksheet, { defval: '' });
  if (rows.length === 0) throw new Error('Uploaded spreadsheet contains no data rows.');

  const products: Omit<Product, 'id' | 'totalStock'>[] = [];
  const errors: string[] = [];

  rows.forEach((row, index) => {
    const rowNum = index + 2;
    const sku = String(row['SKU'] || row['sku'] || `PA-IMP-${Date.now()}-${index}`).trim();
    const name = String(row['Garment Name'] || row['Name'] || row['name'] || '').trim();
    const rawCategory = String(row['Category'] || row['category'] || 'Suits').trim();
    const subcategory = String(row['Subcategory'] || row['subcategory'] || '').trim();
    const priceNum = parseFloat(String(row['Price ($)'] || row['Price'] || row['price'] || '0').replace(/[^0-9.]/g, ''));
    const color = String(row['Color'] || row['color'] || 'Default').trim() || 'Default';
    const colorHex = String(row['Color Hex'] || row['ColorHex'] || row['colorHex'] || '#111827').trim();
    const fabric = String(row['Fabric'] || row['fabric'] || '').trim();
    const fit = String(row['Fit'] || row['fit'] || '').trim();
    const description = String(row['Description'] || row['description'] || '').trim();
    const size = String(row['Size'] || row['size'] || '').trim();
    const stock = Math.max(0, parseInt(String(row['Stock'] || row['stock'] || '0'), 10) || 0);
    const imageUrl = String(row['Image URL'] || row['Image'] || row['image'] || '').trim();

    if (!name) {
      errors.push(`Row ${rowNum}: Missing Garment Name. Skipped.`);
      return;
    }
    if (!imageUrl) {
      errors.push(`Row ${rowNum} (${name} / ${color}): Missing Image URL. The color will use the product's fallback image.`);
    }
    if (isNaN(priceNum) || priceNum <= 0) {
      errors.push(`Row ${rowNum} (${name}): Invalid Price. Defaulted to $450.`);
    }

    let category: ProductCategory = 'Suits';
    const foundCat = OFFICIAL_CATEGORIES.find(c =>
      c.name.toLowerCase() === rawCategory.toLowerCase() ||
      c.queryValue.toLowerCase() === rawCategory.toLowerCase()
    );
    if (foundCat) {
      category = foundCat.queryValue;
    } else {
      const parent = OFFICIAL_CATEGORIES.find(c =>
        c.subcategories.some(s => s.toLowerCase() === rawCategory.toLowerCase())
      );
      if (parent) category = parent.queryValue;
      else errors.push(`Row ${rowNum}: Category "${rawCategory}" normalized to "Suits".`);
    }

    // A row is one color. Example: 38R:3, 40R:5 creates size variants
    // under that color, allowing same-name rows to be grouped in the storefront.
    const variants: ProductVariant[] = [];
    if (size) {
      variants.push({
        id: `${sku}-var`,
        size,
        stock,
        color,
        colorHex,
        sku
      });
    } else {
      errors.push(`Row ${rowNum} (${name} / ${color}): Missing Size.`);
    }

    products.push({
      sku,
      name,
      subtitle: subcategory || 'Sartorial Collection',
      category,
      price: priceNum > 0 ? priceNum : 450,
      collection: 'Park Avenue Sartorial',
      description: description || 'Bespoke sartorial garment handcrafted with traditional craftsmanship.',
      details: ['Hand-finished tailoring', 'Classic drape', 'Bespoke fit'],
      care: ['Professional Dry Clean Only'],
      fabric: fabric || 'Pure Wool / Silk Blend',
      fit: fit || 'Contemporary Tailored',
      images: imageUrl ? [imageUrl] : [],
      colorImages: imageUrl ? { [color]: [imageUrl] } : {},
      variants,
      totalStock: variants.reduce((sum, v) => sum + v.stock, 0)
    });
  });

  return { products, errors };
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
    const rawDate = order.date.replace(/-/g, ''); // YYYYMMDD
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
