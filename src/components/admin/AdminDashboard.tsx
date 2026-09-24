import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Send, 
  Sliders, 
  RefreshCw, 
  Scissors, 
  X,
  Settings as SettingsIcon,
  Eye,
  EyeOff,
  Lock,
  ShieldCheck,
  ArrowLeft,
  FileSpreadsheet,
  Download,
  Upload,
  FileUp,
  FileText,
  Calculator,
  TrendingUp,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { 
  ProductService, 
  OrderService, 
  AlterationService, 
  CustomerService, 
  NotificationService,
  API_CONFIG
} from '../../services/api';
import { Product, Order, AlterationRecord, Customer, ProductCategory } from '../../types';
import { ParkAvenueLogo } from '../brand/ParkAvenueLogo';
import { navigateTo } from '../../utils/router';
import {
  exportProductsToExcel,
  downloadProductExcelTemplate,
  parseProductsFromExcel,
  exportCustomersToExcel,
  exportOrdersToExcel,
  exportTallyXml,
  exportTallyExcel,
  exportSalesReportToExcel
} from '../../utils/excelErpUtils';

type AdminTab = 
  | 'dashboard' 
  | 'products' 
  | 'inventory' 
  | 'orders' 
  | 'customers' 
  | 'alterations' 
  | 'erp-reports'
  | 'notifications' 
  | 'settings';

export const AdminDashboard: React.FC = () => {
  const { 
    refreshProducts, 
    showToast, 
    setActiveView, 
    isAdminLoggedIn, 
    login, 
    logout 
  } = useShop();

  // Admin Authentication State for restricted access (/admin)
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [ordersList, setOrdersList] = useState<Order[]>([]);
  const [alterationsList, setAlterationsList] = useState<AlterationRecord[]>([]);
  const [customersList, setCustomersList] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [adjustingInventory, setAdjustingInventory] = useState<{ productId: string; variantId: string; size: string; currentStock: number } | null>(null);
  const [isCreateAlterationOpen, setIsCreateAlterationOpen] = useState(false);
  const [isSendNotificationOpen, setIsSendNotificationOpen] = useState(false);

  // Excel Product Upload & Import State
  const [isExcelUploadOpen, setIsExcelUploadOpen] = useState(false);
  const [parsedExcelProducts, setParsedExcelProducts] = useState<Product[]>([]);
  const [excelImportErrors, setExcelImportErrors] = useState<string[]>([]);
  const [excelFileName, setExcelFileName] = useState('');
  const [isImportingExcel, setIsImportingExcel] = useState(false);

  // Manual Order Commissioning State
  const [isManualOrderOpen, setIsManualOrderOpen] = useState(false);
  const [manualOrderForm, setManualOrderForm] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    orderStatus: 'Order Confirmed',
    paymentStatus: 'Paid',
    paymentMethod: 'In-Salon POS / Cash',
    alterationRequested: false,
    alterationNotes: '',
    shippingFee: 0,
    items: [] as Array<{
      productId: string;
      productName: string;
      category: ProductCategory;
      size: string;
      color: string;
      quantity: number;
      price: number;
      sku: string;
      image: string;
    }>
  });

  const [itemBuilder, setItemBuilder] = useState({
    productId: '',
    size: '',
    color: 'Classic Atelier',
    quantity: 1,
    price: 0
  });

  // Form states
  const [productForm, setProductForm] = useState({
    name: '',
    category: 'Suits' as ProductCategory,
    price: '',
    sku: '',
    description: '',
    fabric: '',
    fit: '',
    sizeStock: '38R:4, 40R:6, 42R:2'
  });

  const [alterationForm, setAlterationForm] = useState({
    customerName: '',
    phone: '',
    productName: '',
    alterationType: 'Hemming & Inseam Break',
    notes: '',
    tailorAssigned: 'Giovanni Rossi (Master Tailor)'
  });

  const [notificationForm, setNotificationForm] = useState({
    channel: 'EMAIL',
    recipient: '',
    subject: 'Park Avenue Menswear — Atelier Consignment Update',
    message: 'Your bespoke garment has completed master hand inspection and is scheduled for priority dispatch.'
  });

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [prods, ords, alts, custs] = await Promise.all([
        ProductService.getAll(),
        OrderService.getAll(),
        AlterationService.getAll(),
        CustomerService.getAll()
      ]);
      setProductsList(prods);
      setOrdersList(ords);
      setAlterationsList(alts);
      setCustomersList(custs);
    } catch {
      showToast('Could not sync with archive ledger', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name || !productForm.price || !productForm.sku) {
      showToast('Please provide name, price and SKU', 'error');
      return;
    }

    try {
      const parsedVariants = productForm.sizeStock.split(',').map((item, idx) => {
        const [sz, st] = item.trim().split(':');
        const stockNum = parseInt(st || '5', 10);
        return {
          id: `var-${Date.now()}-${idx}`,
          size: sz || 'Standard',
          color: 'Black / Navy',
          colorHex: '#1B263B',
          stock: isNaN(stockNum) ? 5 : stockNum,
          sku: `${productForm.sku}-${sz || idx}`
        };
      });

      const totalStock = parsedVariants.reduce((sum, v) => sum + v.stock, 0);

      if (editingProduct) {
        // Edit flow
        const updated: Product = {
          ...editingProduct,
          name: productForm.name,
          category: productForm.category,
          price: parseFloat(productForm.price),
          sku: productForm.sku,
          description: productForm.description,
          fabric: productForm.fabric,
          fit: productForm.fit,
          variants: parsedVariants,
          totalStock
        };
        await ProductService.update(editingProduct.id, updated);
        showToast(`Product ${updated.name} updated successfully`, 'success');
      } else {
        // Create flow
        await ProductService.create({
          name: productForm.name,
          subtitle: `${productForm.fabric || 'Super 150s Wool'} · Bespoke Cut`,
          category: productForm.category,
          price: parseFloat(productForm.price),
          sku: productForm.sku,
          collection: 'Park Avenue Heritage',
          description: productForm.description || 'Precision crafted bespoke garment cut in our private atelier.',
          details: ['Full floating canvas construction', 'Hand-finished pick stitching', 'Bespoke silk lining'],
          fabric: productForm.fabric || '100% Super 150s Italian Virgin Wool',
          fit: productForm.fit || 'Contemporary Tailored Fit',
          care: ['Dry clean by specialist', 'Steam lightly between wears'],
          images: [],
          variants: parsedVariants,
          isFeatured: true,
          isNewArrival: true,
          alterationEligible: true
        });
        showToast(`Product ${productForm.name} created successfully`, 'success');
      }

      setIsAddProductOpen(false);
      setEditingProduct(null);
      setProductForm({
        name: '',
        category: 'Suits',
        price: '',
        sku: '',
        description: '',
        fabric: '',
        fit: '',
        sizeStock: '38R:4, 40R:6, 42R:2'
      });
      await loadAllData();
      await refreshProducts();
    } catch {
      showToast('Failed to save product to vault', 'error');
    }
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    const sizeStockStr = p.variants?.map(v => `${v.size}:${v.stock}`).join(', ') || '';
    setProductForm({
      name: p.name,
      category: p.category,
      price: p.price.toString(),
      sku: p.sku,
      description: p.description,
      fabric: p.fabric,
      fit: p.fit,
      sizeStock: sizeStockStr
    });
    setIsAddProductOpen(true);
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Are you sure you wish to archive this product?')) {
      await ProductService.delete(id);
      showToast('Product archived', 'success');
      await loadAllData();
      await refreshProducts();
    }
  };

  // Excel Product Import Handlers
  const handleExcelFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setExcelFileName(file.name);
    try {
      const result = await parseProductsFromExcel(file);
      setParsedExcelProducts(result.products);
      setExcelImportErrors(result.errors);
      if (result.products.length > 0) {
        showToast(`Parsed ${result.products.length} garments from ${file.name}`, 'success');
      } else {
        showToast('No valid garments found in spreadsheet', 'error');
      }
    } catch {
      showToast('Error reading spreadsheet file', 'error');
    }
  };

  const handleConfirmExcelImport = async () => {
    if (parsedExcelProducts.length === 0) return;
    setIsImportingExcel(true);
    try {
      await ProductService.batchCreate(parsedExcelProducts);
      showToast(`Successfully imported ${parsedExcelProducts.length} garments into inventory!`, 'success');
      setIsExcelUploadOpen(false);
      setParsedExcelProducts([]);
      setExcelImportErrors([]);
      setExcelFileName('');
      await loadAllData();
      await refreshProducts();
    } catch {
      showToast('Failed to save imported garments', 'error');
    } finally {
      setIsImportingExcel(false);
    }
  };

  // Manual Order Handlers
  const handleAddItemToManualOrder = () => {
    if (!itemBuilder.productId) {
      showToast('Please select a garment from the catalogue', 'error');
      return;
    }
    const prod = productsList.find(p => p.id === itemBuilder.productId);
    if (!prod) return;

    const size = itemBuilder.size || (prod.variants?.[0]?.size || 'Regular');
    const color = itemBuilder.color || (prod.variants?.[0]?.color || 'Classic');
    const price = itemBuilder.price > 0 ? itemBuilder.price : prod.price;

    setManualOrderForm(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          productId: prod.id,
          productName: prod.name,
          category: prod.category,
          size,
          color,
          quantity: Math.max(1, itemBuilder.quantity),
          price,
          sku: prod.sku,
          image: prod.images?.[0] || ''
        }
      ]
    }));

    // Reset item builder
    setItemBuilder({
      productId: '',
      size: '',
      color: 'Classic Atelier',
      quantity: 1,
      price: 0
    });
    showToast('Garment item added to consignment', 'success');
  };

  const handleRemoveManualItem = (index: number) => {
    setManualOrderForm(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleSaveManualOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (manualOrderForm.items.length === 0) {
      showToast('Please add at least one garment to the order', 'error');
      return;
    }
    if (!manualOrderForm.customerName.trim()) {
      showToast('Customer name is required', 'error');
      return;
    }

    try {
      const subtotal = manualOrderForm.items.reduce((sum, it) => sum + (it.price * it.quantity), 0);
      const tax = subtotal * 0.08875;
      const total = subtotal + tax + Number(manualOrderForm.shippingFee || 0);

      const created = await OrderService.createManualOrder({
        customerName: manualOrderForm.customerName,
        customerEmail: manualOrderForm.customerEmail || 'patron@parkavenuemenswear.com',
        customerPhone: manualOrderForm.customerPhone || 'On File',
        orderStatus: manualOrderForm.orderStatus as any,
        paymentStatus: manualOrderForm.paymentStatus as any,
        paymentMethod: manualOrderForm.paymentMethod,
        alterationRequested: manualOrderForm.alterationRequested,
        alterationNotes: manualOrderForm.alterationNotes,
        items: manualOrderForm.items,
        subtotal,
        tax,
        shippingFee: Number(manualOrderForm.shippingFee || 0),
        total
      });

      showToast(`Consignment ${created.id} recorded successfully!`, 'success');
      setIsManualOrderOpen(false);
      setManualOrderForm({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        orderStatus: 'Order Confirmed',
        paymentStatus: 'Paid',
        paymentMethod: 'In-Salon POS / Cash',
        alterationRequested: false,
        alterationNotes: '',
        shippingFee: 0,
        items: []
      });
      await loadAllData();
    } catch {
      showToast('Failed to record consignment order', 'error');
    }
  };

  const handleSaveStock = async (newStock: number) => {
    if (!adjustingInventory) return;
    try {
      const prod = productsList.find(p => p.id === adjustingInventory.productId);
      if (!prod) return;

      const updatedVariants = (prod.variants || []).map(v => {
        if (v.id === adjustingInventory.variantId) {
          return { ...v, stock: newStock };
        }
        return v;
      });

      const totalStock = updatedVariants.reduce((sum, v) => sum + v.stock, 0);

      await ProductService.update(prod.id, {
        ...prod,
        variants: updatedVariants,
        totalStock
      });

      showToast(`Stock updated for ${prod.name} (${adjustingInventory.size})`, 'success');
      setAdjustingInventory(null);
      await loadAllData();
      await refreshProducts();
    } catch {
      showToast('Failed to adjust stock', 'error');
    }
  };

  const handleCreateAlteration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alterationForm.customerName || !alterationForm.phone || !alterationForm.productName) {
      showToast('Please fill all required fields', 'error');
      return;
    }

    try {
      await AlterationService.create({
        customerName: alterationForm.customerName,
        customerPhone: alterationForm.phone,
        productName: alterationForm.productName,
        alterationDetails: alterationForm.alterationType,
        tailorNotes: alterationForm.notes,
        tailorAssigned: alterationForm.tailorAssigned,
        status: 'received',
        estimatedCompletion: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
      });

      showToast('Bespoke alteration commission registered', 'success');
      setIsCreateAlterationOpen(false);
      setAlterationForm({
        customerName: '',
        phone: '',
        productName: '',
        alterationType: 'Hemming & Inseam Break',
        notes: '',
        tailorAssigned: 'Giovanni Rossi (Master Tailor)'
      });
      await loadAllData();
    } catch {
      showToast('Failed to register alteration', 'error');
    }
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notificationForm.recipient || !notificationForm.message) {
      showToast('Recipient and message are required', 'error');
      return;
    }

    try {
      await NotificationService.send({
        channel: notificationForm.channel as any,
        recipientName: notificationForm.recipient,
        recipientContact: { email: notificationForm.recipient },
        subject: notificationForm.subject,
        message: notificationForm.message,
        entityId: 'PARK-AVENUE-DISPATCH',
        type: 'order'
      });
      showToast(`Notification dispatched via ${notificationForm.channel}`, 'success');
      setIsSendNotificationOpen(false);
    } catch {
      showToast('Failed to dispatch notification', 'error');
    }
  };

  // Calculations for cards (Strictly no fake numbers! If list is empty, show '--')
  const totalSalesDisplay = ordersList.length > 0 
    ? `$${ordersList.reduce((acc, o) => acc + (o.total || 0), 0).toLocaleString()}` 
    : '--';

  const totalOrdersDisplay = ordersList.length > 0 
    ? ordersList.length.toString() 
    : '--';

  const totalCustomersDisplay = customersList.length > 0 
    ? customersList.length.toString() 
    : '--';

  const activeAlterationsDisplay = alterationsList.length > 0 
    ? alterationsList.filter(a => a.status !== 'completed').length.toString() 
    : '--';

  if (!isAdminLoggedIn) {
    const handleAdminSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      const cleanUsername = adminUsername.trim().toLowerCase();
      if (!cleanUsername || !adminPassword) {
        showToast('Please provide executive username and password', 'error');
        return;
      }
      if (cleanUsername !== 'parkamw@admin.com') {
        showToast('Access restricted: Only parkamw@admin.com is authorized for administrator access.', 'error');
        return;
      }
      setIsAuthenticating(true);
      try {
        const res = await login(adminUsername.trim(), adminPassword);
        if (res.success && res.role === 'admin') {
          showToast('Atelier Executive clearance confirmed', 'success');
          await loadAllData();
        } else {
          showToast('Access restricted: Invalid credentials for administrator account.', 'error');
        }
      } catch {
        showToast('Authentication protocol failed', 'error');
      } finally {
        setIsAuthenticating(false);
      }
    };

    return (
      <div className="min-h-[85vh] bg-[#F9F9F8] flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md bg-white border border-gray-200 shadow-2xl p-8 sm:p-10 relative">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <ParkAvenueLogo variant="stacked" size="sm" />
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#111827] text-[#936B34] text-[10px] font-mono uppercase tracking-[0.25em] mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>EXECUTIVE ACCESS GATE</span>
            </div>
            <h1 className="font-serif text-2xl text-[#111827] uppercase tracking-wide">
              ATELIER ADMINISTRATION
            </h1>
            <p className="text-xs text-gray-500 font-mono mt-2 leading-relaxed">
              Restricted portal path (<code className="text-[#936B34]">/admin</code>). Only authorized administrator account (<strong className="text-[#111827]">parkamw@admin.com</strong>) has access.
            </p>
          </div>

          <form onSubmit={handleAdminSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-widest text-gray-700 mb-1.5">
                Executive Administrator Email
              </label>
              <input
                type="text"
                value={adminUsername}
                onChange={(e) => setAdminUsername(e.target.value)}
                placeholder="parkamw@admin.com"
                className="w-full bg-[#F9F9F8] border border-gray-300 px-3.5 py-2.5 text-xs text-[#111827] focus:border-[#936B34] focus:bg-white focus:outline-none transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-widest text-gray-700 mb-1.5">
                Master Security Key
              </label>
              <div className="relative">
                <input
                  type={showAdminPassword ? 'text' : 'password'}
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#F9F9F8] border border-gray-300 px-3.5 py-2.5 pr-10 text-xs text-[#111827] focus:border-[#936B34] focus:bg-white focus:outline-none transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowAdminPassword(!showAdminPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black cursor-pointer"
                  aria-label={showAdminPassword ? 'Hide password' : 'Show password'}
                >
                  {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isAuthenticating}
              className="w-full py-3.5 bg-[#111827] hover:bg-[#936B34] text-white text-xs font-semibold uppercase tracking-[0.2em] transition-colors cursor-pointer shadow-md disabled:opacity-50"
            >
              {isAuthenticating ? 'VERIFYING CREDENTIALS...' : 'AUTHENTICATE ATELIER ACCESS'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-between text-xs font-mono">
            <button
              type="button"
              onClick={() => {
                setActiveView('home');
                navigateTo('/');
              }}
              className="text-gray-500 hover:text-black flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>RETURN TO STOREFRONT</span>
            </button>
            <span className="text-[10px] text-gray-400 uppercase tracking-widest">
              PARK AVENUE ATELIER
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-[#111827] pt-8 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header: Exact Required Spec: PARK AVENUE MENSWEAR ADMIN */}
        <div className="py-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs bg-[#111827] text-white px-2 py-0.5 font-bold">
              PA
            </span>
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl text-[#111827] uppercase tracking-wide font-light">
                PARK AVENUE MENSWEAR ADMIN
              </h1>
              <p className="text-xs text-gray-500 font-mono mt-0.5">
                Backend Operations &amp; Inventory Management Portal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadAllData}
              className="px-3.5 py-2 bg-[#F9F9F8] border border-gray-200 text-xs font-mono text-[#111827] hover:border-[#936B34] flex items-center gap-2 cursor-pointer transition-colors shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#936B34]' : 'text-gray-500'}`} />
              <span>REFRESH DATA</span>
            </button>

            <button
              onClick={() => setActiveView('home')}
              className="px-4 py-2 bg-[#111827] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#936B34] transition-colors cursor-pointer shadow-sm"
            >
              VIEW STOREFRONT
            </button>

            <button
              onClick={async () => {
                await logout();
                setActiveView('home');
                navigateTo('/');
              }}
              className="px-3.5 py-2 border border-gray-300 text-gray-600 hover:text-red-600 hover:border-red-300 text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer"
            >
              SIGN OUT
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-6 border-b border-gray-200 overflow-x-auto scrollbar-none">
          <nav className="flex space-x-8 text-xs font-mono tracking-widest uppercase">
            {[
              { id: 'dashboard', label: 'DASHBOARD' },
              { id: 'products', label: 'PRODUCTS' },
              { id: 'inventory', label: 'INVENTORY' },
              { id: 'orders', label: 'ORDERS' },
              { id: 'customers', label: 'CUSTOMERS' },
              { id: 'alterations', label: 'ALTERATIONS' },
              { id: 'erp-reports', label: 'TALLY & ERP REPORTS' },
              { id: 'notifications', label: 'NOTIFICATIONS' },
              { id: 'settings', label: 'SETTINGS' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as AdminTab)}
                className={`py-3 relative cursor-pointer transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-[#936B34] font-semibold border-b-2 border-[#936B34]'
                    : 'text-gray-500 hover:text-[#111827]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* TAB: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="mt-8 space-y-10">
            {/* Dashboard Cards: Placeholders '--' if empty */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              <div className="border border-gray-200 bg-[#F9F9F8] p-6 space-y-2 shadow-xs">
                <span className="text-[10px] font-mono uppercase tracking-widest text-gray-500 block font-medium">
                  TOTAL SALES
                </span>
                <div className="font-serif text-3xl sm:text-4xl text-[#111827] tracking-tight font-light">
                  {totalSalesDisplay}
                </div>
                <span className="text-[10px] font-mono text-[#936B34] block">
                  {ordersList.length > 0 ? 'Live ledger' : 'Awaiting backend orders'}
                </span>
              </div>

              <div className="border border-gray-200 bg-[#F9F9F8] p-6 space-y-2 shadow-xs">
                <span className="text-[10px] font-mono uppercase tracking-widest text-gray-500 block font-medium">
                  TOTAL ORDERS
                </span>
                <div className="font-serif text-3xl sm:text-4xl text-[#111827] tracking-tight font-light">
                  {totalOrdersDisplay}
                </div>
                <span className="text-[10px] font-mono text-[#936B34] block">
                  {ordersList.length > 0 ? 'Registered in database' : 'No orders recorded'}
                </span>
              </div>

              <div className="border border-gray-200 bg-[#F9F9F8] p-6 space-y-2 shadow-xs">
                <span className="text-[10px] font-mono uppercase tracking-widest text-gray-500 block font-medium">
                  TOTAL CUSTOMERS
                </span>
                <div className="font-serif text-3xl sm:text-4xl text-[#111827] tracking-tight font-light">
                  {totalCustomersDisplay}
                </div>
                <span className="text-[10px] font-mono text-[#936B34] block">
                  {customersList.length > 0 ? 'Active accounts' : 'No customer records'}
                </span>
              </div>

              <div className="border border-gray-200 bg-[#F9F9F8] p-6 space-y-2 shadow-xs">
                <span className="text-[10px] font-mono uppercase tracking-widest text-gray-500 block font-medium">
                  ACTIVE ALTERATIONS
                </span>
                <div className="font-serif text-3xl sm:text-4xl text-[#111827] tracking-tight font-light">
                  {activeAlterationsDisplay}
                </div>
                <span className="text-[10px] font-mono text-[#936B34] block">
                  {alterationsList.length > 0 ? 'In atelier work' : 'No active tailor queue'}
                </span>
              </div>

            </div>

            {/* Quick Actions Panel */}
            <div className="border border-gray-200 bg-[#F9F9F8] p-6 sm:p-8 shadow-xs">
              <h2 className="font-serif text-xl text-[#111827] uppercase tracking-wide mb-6 font-light">
                QUICK ATELIER OPERATIONS
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  onClick={() => {
                    setEditingProduct(null);
                    setProductForm({
                      name: '',
                      category: 'Suits',
                      price: '',
                      sku: '',
                      description: '',
                      fabric: '',
                      fit: '',
                      sizeStock: '38R:4, 40R:6, 42R:2'
                    });
                    setIsAddProductOpen(true);
                  }}
                  className="p-4 border border-gray-200 bg-[#F9F9F8] hover:border-[#936B34] text-left transition-colors cursor-pointer group shadow-xs"
                >
                  <Plus className="w-4 h-4 text-[#936B34] mb-2 group-hover:scale-110 transition-transform" />
                  <div className="font-mono text-xs uppercase text-[#111827] font-medium">ADD PRODUCT</div>
                  <p className="text-[10px] font-mono text-gray-500 mt-1">Publish garment to catalog</p>
                </button>

                <button
                  onClick={() => setIsCreateAlterationOpen(true)}
                  className="p-4 border border-gray-200 bg-[#F9F9F8] hover:border-[#936B34] text-left transition-colors cursor-pointer group shadow-xs"
                >
                  <Scissors className="w-4 h-4 text-[#936B34] mb-2 group-hover:scale-110 transition-transform" />
                  <div className="font-mono text-xs uppercase text-[#111827] font-medium">CREATE ALTERATION</div>
                  <p className="text-[10px] font-mono text-gray-500 mt-1">Book tailor workbench task</p>
                </button>

                <button
                  onClick={() => setIsSendNotificationOpen(true)}
                  className="p-4 border border-gray-200 bg-[#F9F9F8] hover:border-[#936B34] text-left transition-colors cursor-pointer group shadow-xs"
                >
                  <Send className="w-4 h-4 text-[#936B34] mb-2 group-hover:scale-110 transition-transform" />
                  <div className="font-mono text-xs uppercase text-[#111827] font-medium">SEND NOTIFICATION</div>
                  <p className="text-[10px] font-mono text-gray-500 mt-1">Email, SMS or WhatsApp</p>
                </button>

                <button
                  onClick={() => setActiveTab('inventory')}
                  className="p-4 border border-gray-200 bg-[#F9F9F8] hover:border-[#936B34] text-left transition-colors cursor-pointer group shadow-xs"
                >
                  <Sliders className="w-4 h-4 text-[#936B34] mb-2 group-hover:scale-110 transition-transform" />
                  <div className="font-mono text-xs uppercase text-[#111827] font-medium">ADJUST INVENTORY</div>
                  <p className="text-[10px] font-mono text-gray-500 mt-1">Update variant stock counts</p>
                </button>
              </div>
            </div>

            {/* Backend Integration Contract Information */}
            <div className="border border-gray-200 bg-[#F9F9F8] p-6 space-y-3 font-mono text-xs text-gray-500 shadow-xs">
              <div className="flex items-center gap-2 text-[#936B34] uppercase tracking-wider font-medium">
                <SettingsIcon className="w-4 h-4" />
                <span>BACKEND INTEGRATION READINESS</span>
              </div>
              <p>
                API Endpoint: <strong className="text-[#111827]">{API_CONFIG.baseUrl || 'Configurable via NEXT_PUBLIC_API_URL'}</strong>
              </p>
              <p>
                Mode: <strong className="text-[#936B34]">{API_CONFIG.isLiveBackend ? 'LIVE BACKEND ACTIVE' : 'IN-MEMORY PERSISTED SERVICE ENGINE'}</strong>
              </p>
            </div>
          </div>
        )}

        {/* TAB: PRODUCTS */}
        {activeTab === 'products' && (
          <div className="mt-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-xl sm:text-2xl text-[#111827] uppercase tracking-wide font-light">
                  PRODUCTS REPOSITORY
                </h2>
                <p className="text-xs text-gray-500 font-mono">
                  Catalog and garment configuration
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => downloadProductExcelTemplate()}
                  className="px-3 py-2 bg-white border border-gray-200 text-gray-700 text-xs font-mono uppercase tracking-wider hover:border-[#936B34] hover:text-[#936B34] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                  title="Download sample Excel template with format instructions"
                >
                  <FileText className="w-3.5 h-3.5 text-gray-500" />
                  <span>TEMPLATE</span>
                </button>

                <button
                  onClick={() => {
                    setParsedExcelProducts([]);
                    setExcelImportErrors([]);
                    setExcelFileName('');
                    setIsExcelUploadOpen(true);
                  }}
                  className="px-3 py-2 bg-white border border-gray-200 text-gray-700 text-xs font-mono uppercase tracking-wider hover:border-[#936B34] hover:text-[#936B34] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                  title="Upload Excel spreadsheet to bulk create products"
                >
                  <Upload className="w-3.5 h-3.5 text-[#936B34]" />
                  <span>IMPORT EXCEL</span>
                </button>

                <button
                  onClick={() => exportProductsToExcel(productsList)}
                  className="px-3 py-2 bg-[#F9F9F8] border border-gray-200 text-gray-700 text-xs font-mono uppercase tracking-wider hover:border-[#936B34] hover:text-[#936B34] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                  title="Export current product catalog to Excel (.xlsx)"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-600" />
                  <span>EXPORT EXCEL</span>
                </button>

                <button
                  onClick={() => {
                    setEditingProduct(null);
                    setProductForm({
                      name: '',
                      category: 'Suits',
                      price: '',
                      sku: '',
                      description: '',
                      fabric: '',
                      fit: '',
                      sizeStock: '38R:4, 40R:6, 42R:2'
                    });
                    setIsAddProductOpen(true);
                  }}
                  className="px-4 py-2 bg-[#111827] text-white font-semibold text-xs uppercase tracking-wider hover:bg-[#936B34] transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>ADD PRODUCT</span>
                </button>
              </div>
            </div>

            {productsList.length > 0 ? (
              <div className="border border-gray-200 bg-[#F9F9F8] overflow-x-auto shadow-xs">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#F9F9F8] text-gray-500 border-b border-gray-200">
                    <tr>
                      <th className="p-4">SKU</th>
                      <th className="p-4">GARMENT NAME</th>
                      <th className="p-4">CATEGORY</th>
                      <th className="p-4">PRICE</th>
                      <th className="p-4">VARIANTS / STOCK</th>
                      <th className="p-4 text-right">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {productsList.map(prod => (
                      <tr key={prod.id} className="hover:bg-black/[0.02]">
                        <td className="p-4 text-[#936B34] font-medium">{prod.sku}</td>
                        <td className="p-4 text-[#111827] font-serif text-sm font-light">{prod.name}</td>
                        <td className="p-4 uppercase text-gray-500">{prod.category}</td>
                        <td className="p-4 tabular-nums font-semibold">${prod.price.toLocaleString()}</td>
                        <td className="p-4 text-gray-500">
                          {prod.variants?.map(v => `${v.size} (${v.stock})`).join(', ') || 'None'}
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => handleOpenEdit(prod)}
                            className="p-1.5 text-gray-500 hover:text-[#936B34] transition-colors cursor-pointer"
                            title="Edit Product"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(prod.id)}
                            className="p-1.5 text-gray-500 hover:text-red-500 transition-colors cursor-pointer"
                            title="Archive Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="border border-gray-200 bg-[#F9F9F8] py-20 px-6 text-center flex flex-col items-center justify-center shadow-xs">
                <div className="w-12 h-12 mb-6 border border-[#936B34]/40 flex items-center justify-center font-serif text-base text-[#936B34] tracking-widest bg-[#F9F9F8] shadow-xs">
                  PA
                </div>
                <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#936B34] mb-2 block font-medium">
                  PARK AVENUE MENSWEAR
                </span>
                <h3 className="font-serif text-2xl text-[#111827] uppercase tracking-wider mb-4 font-light">
                  NO PRODUCTS FOUND
                </h3>
                <p className="text-xs text-gray-500 max-w-md uppercase tracking-widest font-mono leading-relaxed mb-6">
                  No inventory has been published. Use the Add Product button above to create a garment or sync from the backend API.
                </p>
                <button
                  onClick={() => setIsAddProductOpen(true)}
                  className="px-6 py-3 bg-[#111827] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#936B34] transition-colors cursor-pointer shadow-sm"
                >
                  ADD FIRST PRODUCT
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB: INVENTORY */}
        {activeTab === 'inventory' && (
          <div className="mt-8 space-y-6">
            <div>
              <h2 className="font-serif text-xl sm:text-2xl text-[#111827] uppercase tracking-wide font-light">
                INVENTORY VAULT
              </h2>
              <p className="text-xs text-gray-500 font-mono">
                Stock counts per size and atelier variant
              </p>
            </div>

            {productsList.length > 0 ? (
              <div className="border border-gray-200 bg-[#F9F9F8] overflow-x-auto shadow-xs">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#F9F9F8] text-gray-500 border-b border-gray-200">
                    <tr>
                      <th className="p-4">GARMENT</th>
                      <th className="p-4">SKU</th>
                      <th className="p-4">SIZE</th>
                      <th className="p-4">CURRENT STOCK</th>
                      <th className="p-4">STATUS</th>
                      <th className="p-4 text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {productsList.flatMap(p => 
                      (p.variants || []).map(v => (
                        <tr key={v.id} className="hover:bg-black/[0.02]">
                          <td className="p-4 text-[#111827] font-serif">{p.name}</td>
                          <td className="p-4 text-[#936B34] font-medium">{v.sku}</td>
                          <td className="p-4 text-gray-500">{v.size}</td>
                          <td className="p-4 font-bold text-[#111827]">{v.stock} units</td>
                          <td className="p-4">
                            {v.stock <= 0 ? (
                              <span className="text-red-600 font-medium">Out of Stock</span>
                            ) : v.stock <= 3 ? (
                              <span className="text-amber-600 font-medium">Low Stock</span>
                            ) : (
                              <span className="text-emerald-600 font-medium">Optimal</span>
                            )}
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => setAdjustingInventory({
                                productId: p.id,
                                variantId: v.id,
                                size: v.size,
                                currentStock: v.stock
                              })}
                              className="px-3 py-1 border border-gray-300 text-[#111827] hover:border-[#936B34] hover:text-[#936B34] text-[10px] uppercase cursor-pointer bg-[#F9F9F8] transition-colors"
                            >
                              ADJUST
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="border border-gray-200 bg-[#F9F9F8] py-20 px-6 text-center flex flex-col items-center justify-center shadow-xs">
                <div className="w-12 h-12 mb-6 border border-[#936B34]/40 flex items-center justify-center font-serif text-base text-[#936B34] tracking-widest bg-[#F9F9F8] shadow-xs">
                  PA
                </div>
                <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#936B34] mb-2 block font-medium">
                  PARK AVENUE MENSWEAR
                </span>
                <h3 className="font-serif text-2xl text-[#111827] uppercase tracking-wider mb-4 font-light">
                  NO PRODUCTS FOUND
                </h3>
                <p className="text-xs text-gray-500 max-w-md uppercase tracking-widest font-mono leading-relaxed">
                  Inventory vault is empty until products are created.
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB: ORDERS */}
        {activeTab === 'orders' && (
          <div className="mt-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-xl sm:text-2xl text-[#111827] uppercase tracking-wide font-light">
                  CUSTOMER ORDERS &amp; CONSIGNMENTS
                </h2>
                <p className="text-xs text-gray-500 font-mono">
                  Order fulfillment and luxury courier statuses
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => exportTallyXml(ordersList)}
                  className="px-3 py-2 bg-white border border-gray-200 text-gray-700 text-xs font-mono uppercase tracking-wider hover:border-[#936B34] hover:text-[#936B34] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                  title="Export orders as official Tally XML for direct import into Tally Prime / ERP 9"
                >
                  <Calculator className="w-3.5 h-3.5 text-[#936B34]" />
                  <span>TALLY XML</span>
                </button>

                <button
                  onClick={() => exportTallyExcel(ordersList)}
                  className="px-3 py-2 bg-white border border-gray-200 text-gray-700 text-xs font-mono uppercase tracking-wider hover:border-[#936B34] hover:text-[#936B34] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                  title="Export Tally-formatted Daybook spreadsheet"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-amber-600" />
                  <span>TALLY EXCEL</span>
                </button>

                <button
                  onClick={() => exportOrdersToExcel(ordersList)}
                  className="px-3 py-2 bg-[#F9F9F8] border border-gray-200 text-gray-700 text-xs font-mono uppercase tracking-wider hover:border-[#936B34] hover:text-[#936B34] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                  title="Export detailed orders and item breakdown to Excel"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-600" />
                  <span>EXPORT EXCEL</span>
                </button>

                <button
                  onClick={() => {
                    setItemBuilder({
                      productId: productsList[0]?.id || '',
                      size: productsList[0]?.variants?.[0]?.size || '38R',
                      color: productsList[0]?.variants?.[0]?.color || 'Classic Atelier',
                      quantity: 1,
                      price: productsList[0]?.price || 0
                    });
                    setIsManualOrderOpen(true);
                  }}
                  className="px-4 py-2 bg-[#111827] text-white font-semibold text-xs uppercase tracking-wider hover:bg-[#936B34] transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>ADD ORDER MANUALLY</span>
                </button>
              </div>
            </div>

            {ordersList.length > 0 ? (
              <div className="border border-gray-200 bg-[#F9F9F8] overflow-x-auto shadow-xs">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#F9F9F8] text-gray-500 border-b border-gray-200">
                    <tr>
                      <th className="p-4">ORDER ID</th>
                      <th className="p-4">CUSTOMER</th>
                      <th className="p-4">ITEMS</th>
                      <th className="p-4">TOTAL</th>
                      <th className="p-4">STATUS</th>
                      <th className="p-4 text-right">UPDATE STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {ordersList.map(ord => (
                      <tr key={ord.id} className="hover:bg-black/[0.02]">
                        <td className="p-4 text-[#936B34] font-medium">{ord.id}</td>
                        <td className="p-4 text-[#111827]">
                          {(ord.shippingAddress as any)?.fullName || ord.customerEmail || 'Client'}
                        </td>
                        <td className="p-4 text-gray-500">
                          {ord.items?.map(it => `${it.productName} (${it.quantity})`).join(', ') || 'N/A'}
                        </td>
                        <td className="p-4 tabular-nums font-semibold text-[#111827]">${ord.total.toLocaleString()}</td>
                        <td className="p-4 uppercase text-[#936B34] font-medium">
                          {ord.status || (ord as any).orderStatus}
                        </td>
                        <td className="p-4 text-right space-x-2">
                          {['pending', 'processing', 'shipped', 'delivered'].map(st => (
                            <button
                              key={st}
                              onClick={async () => {
                                await OrderService.updateStatus(ord.id, st);
                                showToast(`Order ${ord.id} status changed to ${st}`, 'success');
                                await loadAllData();
                              }}
                              className="px-2 py-1 text-[9px] border border-gray-200 hover:border-[#936B34] text-gray-500 hover:text-[#111827] uppercase cursor-pointer bg-[#F9F9F8] transition-colors"
                            >
                              {st}
                            </button>
                          ))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="border border-gray-200 bg-[#F9F9F8] py-20 px-6 text-center flex flex-col items-center justify-center shadow-xs">
                <div className="w-12 h-12 mb-6 border border-[#936B34]/40 flex items-center justify-center font-serif text-base text-[#936B34] tracking-widest bg-[#F9F9F8] shadow-xs">
                  PA
                </div>
                <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#936B34] mb-2 block font-medium">
                  PARK AVENUE MENSWEAR
                </span>
                <h3 className="font-serif text-2xl text-[#111827] uppercase tracking-wider mb-4 font-light">
                  NO ORDERS FOUND
                </h3>
                <p className="text-xs text-gray-500 max-w-md uppercase tracking-widest font-mono leading-relaxed">
                  No orders have been recorded in the system yet.
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB: CUSTOMERS */}
        {activeTab === 'customers' && (
          <div className="mt-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-xl sm:text-2xl text-[#111827] uppercase tracking-wide font-light">
                  CUSTOMER DIRECTORY
                </h2>
                <p className="text-xs text-gray-500 font-mono">
                  Atelier client accounts and bespoke profiles
                </p>
              </div>

              <button
                onClick={() => exportCustomersToExcel(customersList, ordersList)}
                className="px-3.5 py-2 bg-[#F9F9F8] border border-gray-200 text-gray-700 text-xs font-mono uppercase tracking-wider hover:border-[#936B34] hover:text-[#936B34] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs self-start sm:self-auto"
                title="Export complete patron database with order counts and spend to Excel"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                <span>EXPORT PATRONS EXCEL</span>
              </button>
            </div>

            {customersList.length > 0 ? (
              <div className="border border-gray-200 bg-[#F9F9F8] overflow-x-auto shadow-xs">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#F9F9F8] text-gray-500 border-b border-gray-200">
                    <tr>
                      <th className="p-4">NAME</th>
                      <th className="p-4">EMAIL</th>
                      <th className="p-4">PHONE</th>
                      <th className="p-4">ORDERS</th>
                      <th className="p-4">TIER</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {customersList.map(cust => (
                      <tr key={cust.id} className="hover:bg-black/[0.02]">
                        <td className="p-4 text-[#111827] font-medium">{cust.name}</td>
                        <td className="p-4 text-gray-500">{cust.email}</td>
                        <td className="p-4 text-gray-500">{cust.phone}</td>
                        <td className="p-4 font-semibold">{cust.ordersCount || 0}</td>
                        <td className="p-4 uppercase text-[#936B34] font-medium">{cust.tier || 'Standard'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="border border-gray-200 bg-[#F9F9F8] py-20 px-6 text-center flex flex-col items-center justify-center shadow-xs">
                <div className="w-12 h-12 mb-6 border border-[#936B34]/40 flex items-center justify-center font-serif text-base text-[#936B34] tracking-widest bg-[#F9F9F8] shadow-xs">
                  PA
                </div>
                <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#936B34] mb-2 block font-medium">
                  PARK AVENUE MENSWEAR
                </span>
                <h3 className="font-serif text-2xl text-[#111827] uppercase tracking-wider mb-4 font-light">
                  NO CUSTOMERS FOUND
                </h3>
                <p className="text-xs text-gray-500 max-w-md uppercase tracking-widest font-mono leading-relaxed">
                  No client records have been registered in the database.
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB: ALTERATIONS */}
        {activeTab === 'alterations' && (
          <div className="mt-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-xl sm:text-2xl text-[#111827] uppercase tracking-wide font-light">
                  BESPOKE ALTERATIONS QUEUE
                </h2>
                <p className="text-xs text-gray-500 font-mono">
                  Master tailor workbench and milestone tracking
                </p>
              </div>

              <button
                onClick={() => setIsCreateAlterationOpen(true)}
                className="px-4 py-2.5 bg-[#111827] text-white font-semibold text-xs uppercase tracking-wider hover:bg-[#936B34] transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <Scissors className="w-4 h-4" />
                <span>CREATE ALTERATION</span>
              </button>
            </div>

            {alterationsList.length > 0 ? (
              <div className="border border-gray-200 bg-[#F9F9F8] overflow-x-auto shadow-xs">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#F9F9F8] text-gray-500 border-b border-gray-200">
                    <tr>
                      <th className="p-4">ALT ID</th>
                      <th className="p-4">CLIENT</th>
                      <th className="p-4">GARMENT</th>
                      <th className="p-4">SCOPE</th>
                      <th className="p-4">STATUS</th>
                      <th className="p-4 text-right">UPDATE MILESTONE</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {alterationsList.map(alt => (
                      <tr key={alt.id} className="hover:bg-black/[0.02]">
                        <td className="p-4 text-[#936B34] font-medium">{alt.id}</td>
                        <td className="p-4 text-[#111827] font-medium">{alt.customerName}</td>
                        <td className="p-4 text-gray-500">{alt.productName || alt.items?.[0]?.name || 'Garment'}</td>
                        <td className="p-4 text-gray-500">{alt.alterationDetails || alt.items?.[0]?.type || 'Tailoring'}</td>
                        <td className="p-4 uppercase text-[#936B34] font-medium">
                          {alt.status.replace(/_/g, ' ')}
                        </td>
                        <td className="p-4 text-right space-x-1.5">
                          {['received', 'chalking_and_pinning', 'cutting_and_stitching', 'ready_for_pickup', 'completed'].map(st => (
                            <button
                              key={st}
                              onClick={async () => {
                                await AlterationService.updateStatus(alt.id, st as any);
                                showToast(`Alteration ${alt.id} status updated`, 'success');
                                await loadAllData();
                              }}
                              className="px-2 py-1 text-[9px] border border-gray-200 hover:border-[#936B34] text-gray-500 hover:text-[#111827] uppercase cursor-pointer bg-[#F9F9F8] transition-colors"
                            >
                              {st.split('_')[0]}
                            </button>
                          ))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="border border-gray-200 bg-[#F9F9F8] py-20 px-6 text-center flex flex-col items-center justify-center shadow-xs">
                <div className="w-12 h-12 mb-6 border border-[#936B34]/40 flex items-center justify-center font-serif text-base text-[#936B34] tracking-widest bg-[#F9F9F8] shadow-xs">
                  PA
                </div>
                <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#936B34] mb-2 block font-medium">
                  PARK AVENUE MENSWEAR
                </span>
                <h3 className="font-serif text-2xl text-[#111827] uppercase tracking-wider mb-4 font-light">
                  NO ALTERATIONS FOUND
                </h3>
                <p className="text-xs text-gray-500 max-w-md uppercase tracking-widest font-mono leading-relaxed mb-6">
                  No tailor commissions are currently active. Click Create Alteration to record client fitting specs.
                </p>
                <button
                  onClick={() => setIsCreateAlterationOpen(true)}
                  className="px-6 py-3 bg-[#111827] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#936B34] transition-colors cursor-pointer shadow-sm"
                >
                  CREATE FIRST ALTERATION
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB: TALLY & ERP REPORTS */}
        {activeTab === 'erp-reports' && (
          <div className="mt-8 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-xl sm:text-2xl text-[#111827] uppercase tracking-wide font-light">
                  ATELIER FINANCIAL LEDGER &amp; ERP INTEGRATION
                </h2>
                <p className="text-xs text-gray-500 font-mono">
                  Export sales ledgers to Tally Prime / Tally.ERP 9, generate executive sales analytics, and audit revenue.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => exportTallyXml(ordersList)}
                  className="px-3.5 py-2 bg-[#111827] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#936B34] transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <Calculator className="w-3.5 h-3.5 text-[#936B34]" />
                  <span>EXPORT TALLY XML</span>
                </button>

                <button
                  onClick={() => exportSalesReportToExcel(ordersList, productsList)}
                  className="px-3.5 py-2 bg-[#936B34] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#7D5A2B] transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>EXECUTIVE SALES REPORT (.xlsx)</span>
                </button>
              </div>
            </div>

            {/* Financial Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#F9F9F8] border border-gray-200 p-5 space-y-1 shadow-xs">
                <span className="text-[10px] font-mono uppercase tracking-widest text-gray-500 block font-medium">
                  GROSS COMMISSIONS REVENUE
                </span>
                <p className="font-serif text-2xl font-light text-[#111827]">
                  ${ordersList.reduce((sum, o) => sum + (o.total || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
                <span className="text-[11px] font-mono text-[#936B34] block">
                  {ordersList.length} orders recorded
                </span>
              </div>

              <div className="bg-[#F9F9F8] border border-gray-200 p-5 space-y-1 shadow-xs">
                <span className="text-[10px] font-mono uppercase tracking-widest text-gray-500 block font-medium">
                  NET GARMENT SALES
                </span>
                <p className="font-serif text-2xl font-light text-[#111827]">
                  ${ordersList.reduce((sum, o) => sum + (o.subtotal || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
                <span className="text-[11px] font-mono text-gray-500 block">
                  Excluding tax &amp; courier freight
                </span>
              </div>

              <div className="bg-[#F9F9F8] border border-gray-200 p-5 space-y-1 shadow-xs">
                <span className="text-[10px] font-mono uppercase tracking-widest text-gray-500 block font-medium">
                  TOTAL LUXURY TAX COLLECTED
                </span>
                <p className="font-serif text-2xl font-light text-[#111827]">
                  ${ordersList.reduce((sum, o) => sum + (o.tax || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
                <span className="text-[11px] font-mono text-gray-500 block">
                  Tally output tax account
                </span>
              </div>

              <div className="bg-[#F9F9F8] border border-gray-200 p-5 space-y-1 shadow-xs">
                <span className="text-[10px] font-mono uppercase tracking-widest text-gray-500 block font-medium">
                  AVERAGE COMMISSION VALUE (AOV)
                </span>
                <p className="font-serif text-2xl font-light text-[#111827]">
                  ${(ordersList.length > 0 ? (ordersList.reduce((sum, o) => sum + (o.total || 0), 0) / ordersList.length) : 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
                <span className="text-[11px] font-mono text-emerald-700 block font-medium">
                  High-ticket luxury portfolio
                </span>
              </div>
            </div>

            {/* Integration Export Modules */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Card 1: Tally Prime & Tally.ERP 9 XML */}
              <div className="bg-white border border-gray-200 p-6 flex flex-col justify-between space-y-4 hover:border-[#936B34] transition-colors shadow-xs">
                <div className="space-y-2">
                  <div className="w-10 h-10 bg-[#F9F9F8] border border-gray-200 flex items-center justify-center text-[#936B34]">
                    <Calculator className="w-5 h-5" />
                  </div>
                  <h3 className="font-serif text-lg text-[#111827] uppercase font-light">
                    Tally Prime / ERP 9 (XML)
                  </h3>
                  <p className="text-xs text-gray-600 font-mono leading-relaxed">
                    Official Tally Voucher XML schema. Maps directly into Tally with Sundry Debtors, Sales Account (Cr), and Luxury Output Tax (Cr). Ready for import via <em>Gateway of Tally &rarr; Import Data &rarr; Vouchers</em>.
                  </p>
                </div>
                <button
                  onClick={() => exportTallyXml(ordersList)}
                  className="w-full py-2.5 bg-[#111827] text-white text-xs font-mono uppercase tracking-wider hover:bg-[#936B34] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>DOWNLOAD TALLY XML (.xml)</span>
                </button>
              </div>

              {/* Card 2: Tally Excel Daybook */}
              <div className="bg-white border border-gray-200 p-6 flex flex-col justify-between space-y-4 hover:border-[#936B34] transition-colors shadow-xs">
                <div className="space-y-2">
                  <div className="w-10 h-10 bg-[#F9F9F8] border border-gray-200 flex items-center justify-center text-amber-600">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <h3 className="font-serif text-lg text-[#111827] uppercase font-light">
                    Tally Daybook Excel
                  </h3>
                  <p className="text-xs text-gray-600 font-mono leading-relaxed">
                    Standard columnar spreadsheet formatted for accounting audits and Excel daybook imports with voucher numbers, ledger accounts, cost centres, and transaction narrations.
                  </p>
                </div>
                <button
                  onClick={() => exportTallyExcel(ordersList)}
                  className="w-full py-2.5 bg-white border border-gray-300 text-gray-800 text-xs font-mono uppercase tracking-wider hover:border-[#936B34] hover:text-[#936B34] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5 text-amber-600" />
                  <span>DOWNLOAD DAYBOOK (.xlsx)</span>
                </button>
              </div>

              {/* Card 3: Executive Sales Report */}
              <div className="bg-white border border-gray-200 p-6 flex flex-col justify-between space-y-4 hover:border-[#936B34] transition-colors shadow-xs">
                <div className="space-y-2">
                  <div className="w-10 h-10 bg-[#F9F9F8] border border-gray-200 flex items-center justify-center text-emerald-600">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <h3 className="font-serif text-lg text-[#111827] uppercase font-light">
                    Executive Sales &amp; Margin Report
                  </h3>
                  <p className="text-xs text-gray-600 font-mono leading-relaxed">
                    Comprehensive multi-sheet financial workbook with executive KPI metrics, department revenue share, item sales velocity, and gross margins.
                  </p>
                </div>
                <button
                  onClick={() => exportSalesReportToExcel(ordersList, productsList)}
                  className="w-full py-2.5 bg-emerald-800 text-white text-xs font-mono uppercase tracking-wider hover:bg-emerald-900 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>DOWNLOAD SALES REPORT (.xlsx)</span>
                </button>
              </div>

              {/* Card 4: Orders Ledger */}
              <div className="bg-white border border-gray-200 p-6 flex flex-col justify-between space-y-4 hover:border-[#936B34] transition-colors shadow-xs">
                <div className="space-y-2">
                  <div className="w-10 h-10 bg-[#F9F9F8] border border-gray-200 flex items-center justify-center text-indigo-600">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h3 className="font-serif text-lg text-[#111827] uppercase font-light">
                    Complete Orders &amp; Items Ledger
                  </h3>
                  <p className="text-xs text-gray-600 font-mono leading-relaxed">
                    Two-sheet detailed consignment report containing order headers, customer contacts, payment statuses, and line-item SKU breakdowns.
                  </p>
                </div>
                <button
                  onClick={() => exportOrdersToExcel(ordersList)}
                  className="w-full py-2.5 bg-white border border-gray-300 text-gray-800 text-xs font-mono uppercase tracking-wider hover:border-[#936B34] hover:text-[#936B34] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5 text-indigo-600" />
                  <span>EXPORT ORDERS EXCEL (.xlsx)</span>
                </button>
              </div>

              {/* Card 5: Patron Lifetime Database */}
              <div className="bg-white border border-gray-200 p-6 flex flex-col justify-between space-y-4 hover:border-[#936B34] transition-colors shadow-xs">
                <div className="space-y-2">
                  <div className="w-10 h-10 bg-[#F9F9F8] border border-gray-200 flex items-center justify-center text-sky-600">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h3 className="font-serif text-lg text-[#111827] uppercase font-light">
                    Patron CRM &amp; Spend Database
                  </h3>
                  <p className="text-xs text-gray-600 font-mono leading-relaxed">
                    Customer directory with lifetime spend, VIP classification tiers, order counts, and last commission timestamps.
                  </p>
                </div>
                <button
                  onClick={() => exportCustomersToExcel(customersList, ordersList)}
                  className="w-full py-2.5 bg-white border border-gray-300 text-gray-800 text-xs font-mono uppercase tracking-wider hover:border-[#936B34] hover:text-[#936B34] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5 text-sky-600" />
                  <span>EXPORT PATRONS EXCEL (.xlsx)</span>
                </button>
              </div>

              {/* Card 6: Inventory Valuation */}
              <div className="bg-white border border-gray-200 p-6 flex flex-col justify-between space-y-4 hover:border-[#936B34] transition-colors shadow-xs">
                <div className="space-y-2">
                  <div className="w-10 h-10 bg-[#F9F9F8] border border-gray-200 flex items-center justify-center text-[#936B34]">
                    <Sliders className="w-5 h-5" />
                  </div>
                  <h3 className="font-serif text-lg text-[#111827] uppercase font-light">
                    Inventory Stock &amp; Valuation
                  </h3>
                  <p className="text-xs text-gray-600 font-mono leading-relaxed">
                    Complete product inventory with SKU listings, variant sizes, stock numbers, fabrics, fits, and retail prices.
                  </p>
                </div>
                <button
                  onClick={() => exportProductsToExcel(productsList)}
                  className="w-full py-2.5 bg-white border border-gray-300 text-gray-800 text-xs font-mono uppercase tracking-wider hover:border-[#936B34] hover:text-[#936B34] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5 text-[#936B34]" />
                  <span>EXPORT PRODUCTS EXCEL (.xlsx)</span>
                </button>
              </div>

            </div>
          </div>
        )}

        {/* TAB: NOTIFICATIONS */}
        {activeTab === 'notifications' && (
          <div className="mt-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-xl sm:text-2xl text-[#111827] uppercase tracking-wide font-light">
                  COMMUNICATION &amp; DISPATCH
                </h2>
                <p className="text-xs text-gray-500 font-mono">
                  Client alerts via Email, SMS and WhatsApp
                </p>
              </div>

              <button
                onClick={() => setIsSendNotificationOpen(true)}
                className="px-4 py-2.5 bg-[#111827] text-white font-semibold text-xs uppercase tracking-wider hover:bg-[#936B34] transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <Send className="w-4 h-4" />
                <span>SEND NOTIFICATION</span>
              </button>
            </div>

            <div className="border border-gray-200 bg-[#F9F9F8] p-6 space-y-4 shadow-xs">
              <h3 className="font-mono text-xs uppercase text-[#936B34] tracking-widest font-medium">
                AUTOMATED DISPATCH CHANNELS
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 border border-gray-100 bg-[#F9F9F8] space-y-1 shadow-xs">
                  <div className="text-xs font-serif text-[#111827] uppercase font-medium">EMAIL NOTIFICATIONS</div>
                  <p className="text-[11px] font-mono text-gray-500">Templates for order confirmation, tailoring milestones &amp; tracking.</p>
                </div>
                <div className="p-4 border border-gray-100 bg-[#F9F9F8] space-y-1 shadow-xs">
                  <div className="text-xs font-serif text-[#111827] uppercase font-medium">SMS ALERTS</div>
                  <p className="text-[11px] font-mono text-gray-500">Urgent courier dispatch and ready-for-fitting alerts.</p>
                </div>
                <div className="p-4 border border-gray-100 bg-[#F9F9F8] space-y-1 shadow-xs">
                  <div className="text-xs font-serif text-[#111827] uppercase font-medium">WHATSAPP CONCIERGE</div>
                  <p className="text-[11px] font-mono text-gray-500">Direct master tailor photo updates and signature confirmations.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="mt-8 space-y-6">
            <div>
              <h2 className="font-serif text-xl sm:text-2xl text-[#111827] uppercase tracking-wide font-light">
                PORTAL CONFIGURATION &amp; ENVIRONMENT
              </h2>
              <p className="text-xs text-gray-500 font-mono">
                API connectivity and atelier configuration
              </p>
            </div>

            <div className="border border-gray-200 bg-[#F9F9F8] p-6 sm:p-8 space-y-6 shadow-xs">
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-2 font-medium">
                  BACKEND API URL (NEXT_PUBLIC_API_URL / VITE_API_URL)
                </label>
                <input
                  type="text"
                  readOnly
                  value={API_CONFIG.baseUrl || 'https://api.parkavenuemenswear.com/v1 (Not configured)'}
                  className="w-full bg-[#F9F9F8] border border-gray-200 px-4 py-3 text-xs font-mono text-[#111827] focus:outline-none"
                />
                <p className="text-[11px] font-mono text-gray-500 mt-1.5">
                  Set NEXT_PUBLIC_API_URL or VITE_API_URL in your hosting environment to proxy calls to your production backend.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase text-[#936B34] block font-medium">ATELIER SALON</span>
                  <p className="text-xs font-mono text-[#111827]">Park Avenue Mens Wear Atelier</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase text-[#936B34] block font-medium">COMMISSION CURRENCY</span>
                  <p className="text-xs font-mono text-[#111827]">USD ($) · Worldwide Express</p>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* MODAL: ADD / EDIT PRODUCT */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-xl bg-[#F9F9F8] border border-gray-200 p-6 sm:p-8 space-y-6 relative my-8 shadow-2xl">
            <button
              onClick={() => setIsAddProductOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-[#111827] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#936B34] block font-medium">
                ATELIER CATALOG
              </span>
              <h3 className="font-serif text-2xl text-[#111827] uppercase font-light">
                {editingProduct ? 'EDIT PRODUCT' : 'ADD NEW PRODUCT'}
              </h3>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono uppercase text-gray-500 mb-1 font-medium">
                  GARMENT NAME *
                </label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="e.g. The Park Avenue Midnight Navy Suit"
                  className="w-full bg-[#F9F9F8] border border-gray-200 px-3.5 py-2.5 text-xs text-[#111827] font-mono focus:outline-none focus:border-[#936B34]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-gray-500 mb-1 font-medium">
                    CATEGORY *
                  </label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value as ProductCategory })}
                    className="w-full bg-[#F9F9F8] border border-gray-200 px-3.5 py-2.5 text-xs text-[#111827] font-mono focus:outline-none focus:border-[#936B34] cursor-pointer"
                  >
                    <option value="Suits">Suits</option>
                    <option value="Dress shirts">Dress shirts</option>
                    <option value="Ties">Ties</option>
                    <option value="Shoe">Shoe</option>
                    <option value="Boots">Boots</option>
                    <option value="Loofers">Loofers</option>
                    <option value="Pants">Pants</option>
                    <option value="Jeans">Jeans</option>
                    <option value="Leather jackets">Leather jackets</option>
                    <option value="Sweaters">Sweaters</option>
                    <option value="Coats">Coats</option>
                    <option value="Polo shirts">Polo shirts</option>
                    <option value="Shorts">Shorts</option>
                    <option value="Dress Shirts">Dress Shirts (Alternative)</option>
                    <option value="Dress Pants">Dress Pants (Alternative)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase text-gray-500 mb-1 font-medium">
                    PRICE (USD) *
                  </label>
                  <input
                    type="number"
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    placeholder="1250"
                    className="w-full bg-[#F9F9F8] border border-gray-200 px-3.5 py-2.5 text-xs text-[#111827] font-mono focus:outline-none focus:border-[#936B34]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-gray-500 mb-1 font-medium">
                    SKU *
                  </label>
                  <input
                    type="text"
                    required
                    value={productForm.sku}
                    onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                    placeholder="PA-SUIT-001"
                    className="w-full bg-[#F9F9F8] border border-gray-200 px-3.5 py-2.5 text-xs text-[#111827] font-mono focus:outline-none focus:border-[#936B34]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase text-gray-500 mb-1 font-medium">
                    FABRIC
                  </label>
                  <input
                    type="text"
                    value={productForm.fabric}
                    onChange={(e) => setProductForm({ ...productForm, fabric: e.target.value })}
                    placeholder="Super 150s Italian Virgin Wool"
                    className="w-full bg-[#F9F9F8] border border-gray-200 px-3.5 py-2.5 text-xs text-[#111827] font-mono focus:outline-none focus:border-[#936B34]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-gray-500 mb-1 font-medium">
                  SIZES &amp; INITIAL STOCK (FORMAT: SIZE:STOCK, SIZE:STOCK)
                </label>
                <input
                  type="text"
                  value={productForm.sizeStock}
                  onChange={(e) => setProductForm({ ...productForm, sizeStock: e.target.value })}
                  placeholder="38R:4, 40R:6, 42R:2"
                  className="w-full bg-[#F9F9F8] border border-gray-200 px-3.5 py-2.5 text-xs text-[#111827] font-mono focus:outline-none focus:border-[#936B34]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-gray-500 mb-1 font-medium">
                  DESCRIPTION
                </label>
                <textarea
                  rows={3}
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  placeholder="Architectural silhouette tailored with peak lapels..."
                  className="w-full bg-[#F9F9F8] border border-gray-200 p-3 text-xs text-[#111827] font-mono focus:outline-none focus:border-[#936B34]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 bg-[#111827] text-white font-semibold text-xs uppercase tracking-widest hover:bg-[#936B34] transition-colors cursor-pointer shadow-sm"
                >
                  {editingProduct ? 'UPDATE PRODUCT' : 'CREATE PRODUCT'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADJUST INVENTORY */}
      {adjustingInventory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-[#F9F9F8] border border-gray-200 p-6 space-y-4 relative shadow-2xl">
            <button
              onClick={() => setAdjustingInventory(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-[#111827] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <span className="text-[10px] font-mono uppercase tracking-widest text-[#936B34] block font-medium">
              INVENTORY VAULT
            </span>
            <h4 className="font-serif text-lg text-[#111827] uppercase font-light">
              ADJUST STOCK ({adjustingInventory.size})
            </h4>

            <div>
              <label className="block text-[10px] font-mono uppercase text-gray-500 mb-2 font-medium">
                UNITS IN STOCK
              </label>
              <input
                type="number"
                min="0"
                defaultValue={adjustingInventory.currentStock}
                id="adjust-stock-input"
                className="w-full bg-[#F9F9F8] border border-gray-200 px-4 py-2.5 text-sm font-mono text-[#111827] focus:outline-none focus:border-[#936B34]"
              />
            </div>

            <button
              onClick={() => {
                const el = document.getElementById('adjust-stock-input') as HTMLInputElement;
                handleSaveStock(parseInt(el.value || '0', 10));
              }}
              className="w-full py-3 bg-[#111827] text-white font-semibold text-xs uppercase tracking-widest hover:bg-[#936B34] transition-colors cursor-pointer shadow-sm"
            >
              SAVE ADJUSTMENT
            </button>
          </div>
        </div>
      )}

      {/* MODAL: CREATE ALTERATION */}
      {isCreateAlterationOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-lg bg-[#F9F9F8] border border-gray-200 p-6 sm:p-8 space-y-6 relative my-8 shadow-2xl">
            <button
              onClick={() => setIsCreateAlterationOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-[#111827] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#936B34] block font-medium">
                MASTER TAILOR BENCH
              </span>
              <h3 className="font-serif text-2xl text-[#111827] uppercase font-light">
                CREATE BESPOKE ALTERATION
              </h3>
            </div>

            <form onSubmit={handleCreateAlteration} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-gray-500 mb-1 font-medium">
                    CLIENT NAME *
                  </label>
                  <input
                    type="text"
                    required
                    value={alterationForm.customerName}
                    onChange={(e) => setAlterationForm({ ...alterationForm, customerName: e.target.value })}
                    placeholder="Julian Vanderbilt"
                    className="w-full bg-[#F9F9F8] border border-gray-200 px-3.5 py-2.5 text-xs text-[#111827] font-mono focus:outline-none focus:border-[#936B34]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase text-gray-500 mb-1 font-medium">
                    PHONE NUMBER *
                  </label>
                  <input
                    type="text"
                    required
                    value={alterationForm.phone}
                    onChange={(e) => setAlterationForm({ ...alterationForm, phone: e.target.value })}
                    placeholder="+1 (212) 555-0199"
                    className="w-full bg-[#F9F9F8] border border-gray-200 px-3.5 py-2.5 text-xs text-[#111827] font-mono focus:outline-none focus:border-[#936B34]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-gray-500 mb-1 font-medium">
                  GARMENT NAME *
                </label>
                <input
                  type="text"
                  required
                  value={alterationForm.productName}
                  onChange={(e) => setAlterationForm({ ...alterationForm, productName: e.target.value })}
                  placeholder="The Park Avenue Bespoke Navy Suit"
                  className="w-full bg-[#F9F9F8] border border-gray-200 px-3.5 py-2.5 text-xs text-[#111827] font-mono focus:outline-none focus:border-[#936B34]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-gray-500 mb-1 font-medium">
                  ALTERATION SCOPE
                </label>
                <select
                  value={alterationForm.alterationType}
                  onChange={(e) => setAlterationForm({ ...alterationForm, alterationType: e.target.value })}
                  className="w-full bg-[#F9F9F8] border border-gray-200 px-3.5 py-2.5 text-xs text-[#111827] font-mono focus:outline-none focus:border-[#936B34] cursor-pointer"
                >
                  <option value="Hemming & Inseam Break">Hemming &amp; Inseam Break</option>
                  <option value="Waist & Seat Suppression">Waist &amp; Seat Suppression</option>
                  <option value="Sleeve Shortening From Shoulder">Sleeve Shortening From Shoulder</option>
                  <option value="Chest & Collar Recut">Chest &amp; Collar Recut</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-gray-500 mb-1 font-medium">
                  TAILOR SPECIFICATIONS &amp; NOTES
                </label>
                <textarea
                  rows={3}
                  value={alterationForm.notes}
                  onChange={(e) => setAlterationForm({ ...alterationForm, notes: e.target.value })}
                  placeholder="Medium break trouser hem, 1.5 inch turn-up cuff..."
                  className="w-full bg-[#F9F9F8] border border-gray-200 p-3 text-xs text-[#111827] font-mono focus:outline-none focus:border-[#936B34]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 bg-[#111827] text-white font-semibold text-xs uppercase tracking-widest hover:bg-[#936B34] transition-colors cursor-pointer shadow-sm"
                >
                  REGISTER ALTERATION
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SEND NOTIFICATION */}
      {isSendNotificationOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-[#F9F9F8] border border-gray-200 p-6 sm:p-8 space-y-6 relative shadow-2xl">
            <button
              onClick={() => setIsSendNotificationOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-[#111827] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#936B34] block font-medium">
                COMMUNICATION DISPATCH
              </span>
              <h3 className="font-serif text-2xl text-[#111827] uppercase font-light">
                SEND CLIENT NOTIFICATION
              </h3>
            </div>

            <form onSubmit={handleSendNotification} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-gray-500 mb-1 font-medium">
                    CHANNEL
                  </label>
                  <select
                    value={notificationForm.channel}
                    onChange={(e) => setNotificationForm({ ...notificationForm, channel: e.target.value })}
                    className="w-full bg-[#F9F9F8] border border-gray-200 px-3.5 py-2.5 text-xs text-[#111827] font-mono focus:outline-none focus:border-[#936B34] cursor-pointer"
                  >
                    <option value="EMAIL">Email</option>
                    <option value="SMS">SMS Message</option>
                    <option value="WHATSAPP">WhatsApp</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase text-gray-500 mb-1 font-medium">
                    RECIPIENT CONTACT *
                  </label>
                  <input
                    type="text"
                    required
                    value={notificationForm.recipient}
                    onChange={(e) => setNotificationForm({ ...notificationForm, recipient: e.target.value })}
                    placeholder="client@domain.com or +12125550199"
                    className="w-full bg-[#F9F9F8] border border-gray-200 px-3.5 py-2.5 text-xs text-[#111827] font-mono focus:outline-none focus:border-[#936B34]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-gray-500 mb-1 font-medium">
                  SUBJECT / TITLE
                </label>
                <input
                  type="text"
                  value={notificationForm.subject}
                  onChange={(e) => setNotificationForm({ ...notificationForm, subject: e.target.value })}
                  className="w-full bg-[#F9F9F8] border border-gray-200 px-3.5 py-2.5 text-xs text-[#111827] font-mono focus:outline-none focus:border-[#936B34]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-gray-500 mb-1 font-medium">
                  MESSAGE CONTENT *
                </label>
                <textarea
                  rows={4}
                  required
                  value={notificationForm.message}
                  onChange={(e) => setNotificationForm({ ...notificationForm, message: e.target.value })}
                  className="w-full bg-[#F9F9F8] border border-gray-200 p-3 text-xs text-[#111827] font-mono focus:outline-none focus:border-[#936B34]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 bg-[#111827] text-white font-semibold text-xs uppercase tracking-widest hover:bg-[#936B34] transition-colors cursor-pointer shadow-sm"
                >
                  DISPATCH NOTIFICATION
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EXCEL PRODUCT IMPORT */}
      {isExcelUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-[#F9F9F8] border border-gray-200 p-6 sm:p-8 space-y-6 relative shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setIsExcelUploadOpen(false);
                setParsedExcelProducts([]);
                setExcelImportErrors([]);
                setExcelFileName('');
              }}
              className="absolute top-5 right-5 text-gray-500 hover:text-[#111827] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2 text-[#936B34] text-[10px] font-mono uppercase tracking-[0.25em] mb-1">
                <FileSpreadsheet className="w-4 h-4" />
                <span>EXCEL CATALOGUE IMPORT</span>
              </div>
              <h3 className="font-serif text-2xl text-[#111827] uppercase tracking-wide font-light">
                UPLOAD PRODUCTS SPREADSHEET
              </h3>
              <p className="text-xs text-gray-500 font-mono mt-1">
                Import multiple garments simultaneously using Excel (.xlsx, .xls) or CSV.
              </p>
            </div>

            {/* Template Download Alert */}
            <div className="p-3.5 bg-white border border-gray-200 flex items-center justify-between text-xs font-mono">
              <span className="text-gray-600">Need the standardized column structure?</span>
              <button
                type="button"
                onClick={() => downloadProductExcelTemplate()}
                className="text-[#936B34] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>DOWNLOAD TEMPLATE</span>
              </button>
            </div>

            {/* Upload Zone */}
            <div className="border-2 border-dashed border-gray-300 bg-white p-8 text-center space-y-3 hover:border-[#936B34] transition-colors">
              <Upload className="w-8 h-8 text-[#936B34] mx-auto" />
              <div>
                <label className="text-xs font-mono uppercase tracking-wider text-[#111827] font-semibold cursor-pointer hover:text-[#936B34]">
                  <span>SELECT EXCEL OR CSV FILE</span>
                  <input
                    type="file"
                    accept=".xlsx, .xls, .csv"
                    onChange={handleExcelFileSelect}
                    className="sr-only"
                  />
                </label>
                <p className="text-[11px] text-gray-400 font-mono mt-1">
                  Supports .xlsx, .xls, and .csv formats
                </p>
              </div>
              {excelFileName && (
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F9F9F8] border border-gray-200 text-xs font-mono text-[#111827]">
                  <FileText className="w-3.5 h-3.5 text-[#936B34]" />
                  <span>{excelFileName}</span>
                </div>
              )}
            </div>

            {/* Parse Errors / Warnings */}
            {excelImportErrors.length > 0 && (
              <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 text-xs font-mono space-y-1">
                <div className="font-semibold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-700" />
                  <span>IMPORT VALIDATION WARNINGS ({excelImportErrors.length}):</span>
                </div>
                <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-800 max-h-28 overflow-y-auto">
                  {excelImportErrors.map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Parsed Garments Preview */}
            {parsedExcelProducts.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-semibold text-emerald-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>READY FOR IMPORT: {parsedExcelProducts.length} GARMENTS</span>
                  </span>
                </div>

                <div className="border border-gray-200 bg-white max-h-48 overflow-y-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-[#F9F9F8] text-gray-500 border-b border-gray-200 sticky top-0">
                      <tr>
                        <th className="p-2.5">SKU</th>
                        <th className="p-2.5">NAME</th>
                        <th className="p-2.5">CATEGORY</th>
                        <th className="p-2.5">PRICE</th>
                        <th className="p-2.5">VARIANTS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {parsedExcelProducts.map((p, idx) => (
                        <tr key={idx} className="hover:bg-black/[0.02]">
                          <td className="p-2.5 text-[#936B34] font-medium">{p.sku}</td>
                          <td className="p-2.5 text-[#111827]">{p.name}</td>
                          <td className="p-2.5 text-gray-500">{p.category}</td>
                          <td className="p-2.5 tabular-nums">${p.price.toLocaleString()}</td>
                          <td className="p-2.5 text-gray-500">{p.variants?.length || 0} sizes</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <button
                  type="button"
                  onClick={handleConfirmExcelImport}
                  disabled={isImportingExcel}
                  className="w-full py-3.5 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs uppercase tracking-widest transition-colors cursor-pointer shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <FileUp className="w-4 h-4" />
                  <span>
                    {isImportingExcel
                      ? 'IMPORTING TO VAULT...'
                      : `CONFIRM & IMPORT ${parsedExcelProducts.length} GARMENTS`}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: MANUAL ORDER COMMISSION */}
      {isManualOrderOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-3xl bg-[#F9F9F8] border border-gray-200 p-6 sm:p-8 space-y-6 relative shadow-2xl max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setIsManualOrderOpen(false)}
              className="absolute top-5 right-5 text-gray-500 hover:text-[#111827] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2 text-[#936B34] text-[10px] font-mono uppercase tracking-[0.25em] mb-1">
                <Plus className="w-4 h-4" />
                <span>SALON CONSIGNMENT PROTOCOL</span>
              </div>
              <h3 className="font-serif text-2xl text-[#111827] uppercase tracking-wide font-light">
                ADD ORDER MANUALLY
              </h3>
              <p className="text-xs text-gray-500 font-mono mt-1">
                Record an in-salon acquisition, bespoke phone order, or VIP private fitting commission.
              </p>
            </div>

            <form onSubmit={handleSaveManualOrder} className="space-y-6">
              
              {/* Customer Details */}
              <div className="bg-white border border-gray-200 p-5 space-y-4 shadow-xs">
                <h4 className="text-[11px] font-mono uppercase tracking-widest text-[#936B34] font-semibold border-b border-gray-100 pb-2">
                  1. CLIENT INFORMATION
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-gray-500 mb-1 font-medium">
                      PATRON NAME *
                    </label>
                    <input
                      type="text"
                      required
                      value={manualOrderForm.customerName}
                      onChange={(e) => setManualOrderForm({ ...manualOrderForm, customerName: e.target.value })}
                      placeholder="Lord Sterling"
                      className="w-full bg-[#F9F9F8] border border-gray-200 px-3 py-2 text-xs text-[#111827] font-mono focus:outline-none focus:border-[#936B34]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-gray-500 mb-1 font-medium">
                      EMAIL ADDRESS
                    </label>
                    <input
                      type="email"
                      value={manualOrderForm.customerEmail}
                      onChange={(e) => setManualOrderForm({ ...manualOrderForm, customerEmail: e.target.value })}
                      placeholder="client@private.com"
                      className="w-full bg-[#F9F9F8] border border-gray-200 px-3 py-2 text-xs text-[#111827] font-mono focus:outline-none focus:border-[#936B34]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-gray-500 mb-1 font-medium">
                      TELEPHONE
                    </label>
                    <input
                      type="tel"
                      value={manualOrderForm.customerPhone}
                      onChange={(e) => setManualOrderForm({ ...manualOrderForm, customerPhone: e.target.value })}
                      placeholder="+1 (212) 555-0199"
                      className="w-full bg-[#F9F9F8] border border-gray-200 px-3 py-2 text-xs text-[#111827] font-mono focus:outline-none focus:border-[#936B34]"
                    />
                  </div>
                </div>
              </div>

              {/* Garment Selection & Line Items */}
              <div className="bg-white border border-gray-200 p-5 space-y-4 shadow-xs">
                <h4 className="text-[11px] font-mono uppercase tracking-widest text-[#936B34] font-semibold border-b border-gray-100 pb-2">
                  2. GARMENT LINE ITEMS
                </h4>
                
                {/* Item Selector Form */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end bg-[#F9F9F8] p-3.5 border border-gray-200">
                  <div className="sm:col-span-4">
                    <label className="block text-[10px] font-mono uppercase text-gray-500 mb-1">
                      SELECT PRODUCT
                    </label>
                    <select
                      value={itemBuilder.productId}
                      onChange={(e) => {
                        const prod = productsList.find(p => p.id === e.target.value);
                        setItemBuilder({
                          ...itemBuilder,
                          productId: e.target.value,
                          size: prod?.variants?.[0]?.size || '38R',
                          price: prod?.price || 0
                        });
                      }}
                      className="w-full bg-white border border-gray-300 px-2.5 py-2 text-xs text-[#111827] font-mono focus:outline-none focus:border-[#936B34]"
                    >
                      <option value="">-- Choose Catalogue Garment --</option>
                      {productsList.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} (${p.price})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-mono uppercase text-gray-500 mb-1">
                      SIZE
                    </label>
                    <input
                      type="text"
                      value={itemBuilder.size}
                      onChange={(e) => setItemBuilder({ ...itemBuilder, size: e.target.value })}
                      placeholder="40R"
                      className="w-full bg-white border border-gray-300 px-2.5 py-2 text-xs text-[#111827] font-mono focus:outline-none focus:border-[#936B34]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-mono uppercase text-gray-500 mb-1">
                      QTY
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={itemBuilder.quantity}
                      onChange={(e) => setItemBuilder({ ...itemBuilder, quantity: parseInt(e.target.value) || 1 })}
                      className="w-full bg-white border border-gray-300 px-2.5 py-2 text-xs text-[#111827] font-mono focus:outline-none focus:border-[#936B34]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-mono uppercase text-gray-500 mb-1">
                      PRICE ($)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={itemBuilder.price}
                      onChange={(e) => setItemBuilder({ ...itemBuilder, price: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-white border border-gray-300 px-2.5 py-2 text-xs text-[#111827] font-mono focus:outline-none focus:border-[#936B34]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <button
                      type="button"
                      onClick={handleAddItemToManualOrder}
                      className="w-full py-2 bg-[#111827] hover:bg-[#936B34] text-white text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      + ADD ITEM
                    </button>
                  </div>
                </div>

                {/* Selected Items Table */}
                {manualOrderForm.items.length > 0 ? (
                  <div className="border border-gray-200 overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-[#F9F9F8] text-gray-500 border-b border-gray-200">
                        <tr>
                          <th className="p-3">PRODUCT</th>
                          <th className="p-3">SIZE</th>
                          <th className="p-3">QTY</th>
                          <th className="p-3">UNIT PRICE</th>
                          <th className="p-3">LINE TOTAL</th>
                          <th className="p-3 text-right">ACTION</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {manualOrderForm.items.map((it, idx) => (
                          <tr key={idx}>
                            <td className="p-3 text-[#111827] font-medium">{it.productName}</td>
                            <td className="p-3 text-gray-500">{it.size}</td>
                            <td className="p-3">{it.quantity}</td>
                            <td className="p-3 tabular-nums">${it.price.toLocaleString()}</td>
                            <td className="p-3 tabular-nums font-semibold text-[#111827]">
                              ${(it.price * it.quantity).toLocaleString()}
                            </td>
                            <td className="p-3 text-right">
                              <button
                                type="button"
                                onClick={() => handleRemoveManualItem(idx)}
                                className="text-red-500 hover:text-red-700 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5 inline" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-xs text-amber-700 bg-amber-50 p-3 border border-amber-200 font-mono">
                    No garments added yet. Use the garment selector above to add at least one line item.
                  </p>
                )}
              </div>

              {/* Accounting & Status */}
              <div className="bg-white border border-gray-200 p-5 space-y-4 shadow-xs">
                <h4 className="text-[11px] font-mono uppercase tracking-widest text-[#936B34] font-semibold border-b border-gray-100 pb-2">
                  3. STATUS &amp; SETTLEMENT DETAILS
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-gray-500 mb-1 font-medium">
                      ORDER STATUS
                    </label>
                    <select
                      value={manualOrderForm.orderStatus}
                      onChange={(e) => setManualOrderForm({ ...manualOrderForm, orderStatus: e.target.value })}
                      className="w-full bg-[#F9F9F8] border border-gray-200 px-3 py-2 text-xs text-[#111827] font-mono focus:outline-none focus:border-[#936B34]"
                    >
                      <option value="Order Confirmed">Order Confirmed</option>
                      <option value="Processing">Processing</option>
                      <option value="Packed">Packed</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase text-gray-500 mb-1 font-medium">
                      PAYMENT STATUS
                    </label>
                    <select
                      value={manualOrderForm.paymentStatus}
                      onChange={(e) => setManualOrderForm({ ...manualOrderForm, paymentStatus: e.target.value })}
                      className="w-full bg-[#F9F9F8] border border-gray-200 px-3 py-2 text-xs text-[#111827] font-mono focus:outline-none focus:border-[#936B34]"
                    >
                      <option value="Paid">Paid (Settled)</option>
                      <option value="Authorized">Authorized / Reserved</option>
                      <option value="Pending">Pending Payment</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase text-gray-500 mb-1 font-medium">
                      PAYMENT METHOD
                    </label>
                    <select
                      value={manualOrderForm.paymentMethod}
                      onChange={(e) => setManualOrderForm({ ...manualOrderForm, paymentMethod: e.target.value })}
                      className="w-full bg-[#F9F9F8] border border-gray-200 px-3 py-2 text-xs text-[#111827] font-mono focus:outline-none focus:border-[#936B34]"
                    >
                      <option value="In-Salon POS / Cash">In-Salon POS / Cash</option>
                      <option value="Amex Luxury Concierge">Amex Luxury Concierge</option>
                      <option value="Wire Transfer">Wire Transfer / Private Bank</option>
                      <option value="Direct Client Ledger">Direct Client Ledger</option>
                    </select>
                  </div>
                </div>

                {/* Alterations Toggle */}
                <div className="pt-2 border-t border-gray-100 space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={manualOrderForm.alterationRequested}
                      onChange={(e) => setManualOrderForm({ ...manualOrderForm, alterationRequested: e.target.checked })}
                      className="accent-[#936B34] w-4 h-4"
                    />
                    <span className="text-xs font-mono uppercase tracking-wider text-[#111827] font-semibold">
                      BESPOKE TAILORING / ALTERATION INCLUDED
                    </span>
                  </label>

                  {manualOrderForm.alterationRequested && (
                    <textarea
                      rows={2}
                      value={manualOrderForm.alterationNotes}
                      onChange={(e) => setManualOrderForm({ ...manualOrderForm, alterationNotes: e.target.value })}
                      placeholder="Fitting notes (e.g. Inseam 31.5in with 1.75in cuff, take in jacket waist 1in)..."
                      className="w-full bg-[#F9F9F8] border border-gray-200 p-2.5 text-xs text-[#111827] font-mono focus:outline-none focus:border-[#936B34]"
                    />
                  )}
                </div>
              </div>

              {/* Financial Calculation Breakdown */}
              {(() => {
                const subtotal = manualOrderForm.items.reduce((sum, it) => sum + (it.price * it.quantity), 0);
                const tax = subtotal * 0.08875;
                const shipping = Number(manualOrderForm.shippingFee || 0);
                const grandTotal = subtotal + tax + shipping;

                return (
                  <div className="bg-[#111827] text-white p-5 space-y-2 font-mono text-xs shadow-md">
                    <div className="flex justify-between text-gray-400">
                      <span>GARMENT SUBTOTAL</span>
                      <span>${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>LUXURY SALES TAX (8.875%)</span>
                      <span>${tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>EXPRESS FREIGHT / COURIER</span>
                      <span>${shipping.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-base font-serif text-[#936B34] pt-2 border-t border-gray-800">
                      <span>TOTAL CONSIGNMENT VALUE</span>
                      <span className="tabular-nums font-bold">${grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                );
              })()}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={manualOrderForm.items.length === 0}
                  className="w-full py-4 bg-[#936B34] hover:bg-[#7D5A2B] text-white font-semibold text-xs uppercase tracking-widest transition-colors cursor-pointer shadow-md disabled:opacity-50"
                >
                  RECORD CONSIGNMENT ORDER
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
