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
  Download,
  Upload,
  FileSpreadsheet,
  FileText,
  Calculator,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  FileUp,
  Package,
  Layers,
  UserCheck,
  DollarSign
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
  downloadProductExcelTemplate,
  parseProductsExcel,
  exportProductsToExcel,
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
    logout,
    products
  } = useShop();

  // Admin Authentication State for restricted access (/admin and /dashboard)
  const [adminUsername, setAdminUsername] = useState('parkamw@admin.com');
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

  // Excel & ERP Modals state
  const [isExcelUploadOpen, setIsExcelUploadOpen] = useState(false);
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [excelFileName, setExcelFileName] = useState('');
  const [parsedExcelProducts, setParsedExcelProducts] = useState<Omit<Product, 'id' | 'totalStock'>[]>([]);
  const [excelImportErrors, setExcelImportErrors] = useState<string[]>([]);
  const [isImportingExcel, setIsImportingExcel] = useState(false);

  // Manual Order Modal state
  const [isManualOrderOpen, setIsManualOrderOpen] = useState(false);
  const [manualOrderCustomer, setManualOrderCustomer] = useState('');
  const [manualOrderEmail, setManualOrderEmail] = useState('');
  const [manualOrderPhone, setManualOrderPhone] = useState('');
  const [manualOrderItems, setManualOrderItems] = useState<{
    productId: string;
    productName: string;
    size: string;
    quantity: number;
    price: number;
  }[]>([]);
  const [selectedProdForManual, setSelectedProdForManual] = useState('');
  const [selectedSizeForManual, setSelectedSizeForManual] = useState('');
  const [selectedQtyForManual, setSelectedQtyForManual] = useState(1);
  const [manualOrderShipping, setManualOrderShipping] = useState(0);
  const [manualPaymentStatus, setManualPaymentStatus] = useState<'Paid' | 'Pending' | 'Invoice'>('Paid');
  const [manualPaymentMethod, setManualPaymentMethod] = useState('In-Salon POS / Cash');
  const [manualOrderStatus, setManualOrderStatus] = useState<Order['orderStatus']>('Order Confirmed');
  const [manualAlterationReq, setManualAlterationReq] = useState(false);
  const [manualAlterationNotes, setManualAlterationNotes] = useState('');
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

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
      const cleanEmail = adminUsername.trim().toLowerCase();
      if (!cleanEmail || !adminPassword) {
        showToast('Please provide executive username and password', 'error');
        return;
      }
      if (cleanEmail !== 'parkamw@admin.com') {
        showToast('Access Denied: Only authorized administrator account (parkamw@admin.com) has access.', 'error');
        return;
      }
      setIsAuthenticating(true);
      try {
        const res = await login(cleanEmail, adminPassword);
        if (res.success && res.role === 'admin') {
          showToast('Atelier Executive clearance confirmed. Welcome Administrator.', 'success');
          await loadAllData();
        } else {
          showToast('Access restricted: Invalid executive password credentials.', 'error');
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
            <h1 className="font-serif text-2xl text-[#111827] uppercase tracking-wide font-light">
              ATELIER ADMINISTRATION
            </h1>
            <p className="text-xs text-gray-500 font-mono mt-2 leading-relaxed">
              Restricted portal path (<code className="text-[#936B34]">/admin</code> &amp; <code className="text-[#936B34]">/dashboard</code>). Enter administrator credentials to access products catalogue, Excel operations, manual orders, and Tally ERP.
            </p>
          </div>

          <form onSubmit={handleAdminSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-widest text-gray-700 mb-1.5 font-medium">
                Executive Administrator Email *
              </label>
              <input
                type="email"
                value={adminUsername}
                onChange={(e) => setAdminUsername(e.target.value)}
                placeholder="parkamw@admin.com"
                className="w-full bg-[#F9F9F8] border border-gray-300 px-3.5 py-2.5 text-xs text-[#111827] font-mono focus:border-[#936B34] focus:bg-white focus:outline-none transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-widest text-gray-700 mb-1.5 font-medium">
                Master Security Password *
              </label>
              <div className="relative">
                <input
                  type={showAdminPassword ? 'text' : 'password'}
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#F9F9F8] border border-gray-300 px-3.5 py-2.5 pr-10 text-xs text-[#111827] font-mono focus:border-[#936B34] focus:bg-white focus:outline-none transition-colors"
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

          <div className="mt-6 pt-6 border-t border-gray-100 flex flex-col gap-3 text-xs font-mono">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setActiveView('account');
                  navigateTo('/account');
                }}
                className="text-[#936B34] hover:underline flex items-center gap-1.5 cursor-pointer font-medium"
              >
                <span>Patron / Client Portal (/account) &rarr;</span>
              </button>
              <span className="text-[10px] text-gray-400 uppercase tracking-widest">
                ERP ENABLED
              </span>
            </div>
            
            <button
              type="button"
              onClick={() => {
                setActiveView('home');
                navigateTo('/');
              }}
              className="text-gray-500 hover:text-black flex items-center gap-1.5 cursor-pointer text-[11px]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>RETURN TO STOREFRONT</span>
            </button>
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
          <nav className="flex space-x-6 sm:space-x-8 text-xs font-mono tracking-widest uppercase">
            {[
              { id: 'dashboard', label: 'DASHBOARD' },
              { id: 'products', label: 'PRODUCTS' },
              { id: 'inventory', label: 'INVENTORY' },
              { id: 'orders', label: 'ORDERS' },
              { id: 'customers', label: 'CUSTOMERS' },
              { id: 'alterations', label: 'ALTERATIONS' },
              { id: 'erp-reports', label: 'TALLY & ERP' },
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b border-gray-200 gap-4">
                <div>
                  <h2 className="font-serif text-xl text-[#111827] uppercase tracking-wide font-light">
                    EXECUTIVE ATELIER &amp; ERP OPERATIONS
                  </h2>
                  <p className="text-xs text-gray-500 font-mono mt-1">
                    Spreadsheet tools, manual salon booking, Tally export, and financial ledger
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('erp-reports')}
                    className="px-3 py-1.5 bg-[#936B34] text-white text-xs font-mono hover:bg-[#111827] transition-colors flex items-center gap-1.5 cursor-pointer font-semibold"
                  >
                    <Calculator className="w-3.5 h-3.5" />
                    <span>OPEN TALLY / ERP SUITE</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  onClick={() => setIsExcelUploadOpen(true)}
                  className="p-4 border border-gray-200 bg-white hover:border-[#936B34] text-left transition-colors cursor-pointer group shadow-xs"
                >
                  <FileUp className="w-4 h-4 text-[#936B34] mb-2 group-hover:scale-110 transition-transform" />
                  <div className="font-mono text-xs uppercase text-[#111827] font-medium">PRODUCTS EXCEL UPLOAD</div>
                  <p className="text-[10px] font-mono text-gray-500 mt-1">Batch import catalogue from .xlsx / .csv</p>
                </button>

                <button
                  onClick={() => exportProductsToExcel(productsList)}
                  className="p-4 border border-gray-200 bg-white hover:border-[#936B34] text-left transition-colors cursor-pointer group shadow-xs"
                >
                  <FileSpreadsheet className="w-4 h-4 text-[#936B34] mb-2 group-hover:scale-110 transition-transform" />
                  <div className="font-mono text-xs uppercase text-[#111827] font-medium">PRODUCTS EXCEL DOWNLOAD</div>
                  <p className="text-[10px] font-mono text-gray-500 mt-1">Export full inventory spreadsheet</p>
                </button>

                <button
                  onClick={() => setIsManualOrderOpen(true)}
                  className="p-4 border border-gray-200 bg-white hover:border-[#936B34] text-left transition-colors cursor-pointer group shadow-xs"
                >
                  <Plus className="w-4 h-4 text-[#936B34] mb-2 group-hover:scale-110 transition-transform" />
                  <div className="font-mono text-xs uppercase text-[#111827] font-medium">ADD ORDER MANUALLY</div>
                  <p className="text-[10px] font-mono text-gray-500 mt-1">Record salon consignment booking</p>
                </button>

                <button
                  onClick={() => exportOrdersToExcel(ordersList)}
                  className="p-4 border border-gray-200 bg-white hover:border-[#936B34] text-left transition-colors cursor-pointer group shadow-xs"
                >
                  <Download className="w-4 h-4 text-[#936B34] mb-2 group-hover:scale-110 transition-transform" />
                  <div className="font-mono text-xs uppercase text-[#111827] font-medium">ORDERS EXCEL DOWNLOAD</div>
                  <p className="text-[10px] font-mono text-gray-500 mt-1">Export consignments &amp; line items</p>
                </button>

                <button
                  onClick={() => exportCustomersToExcel(customersList, ordersList)}
                  className="p-4 border border-gray-200 bg-white hover:border-[#936B34] text-left transition-colors cursor-pointer group shadow-xs"
                >
                  <UserCheck className="w-4 h-4 text-[#936B34] mb-2 group-hover:scale-110 transition-transform" />
                  <div className="font-mono text-xs uppercase text-[#111827] font-medium">CUSTOMER DATA EXCEL</div>
                  <p className="text-[10px] font-mono text-gray-500 mt-1">Download patron lifetime spend CRM</p>
                </button>

                <button
                  onClick={() => exportTallyXml(ordersList)}
                  className="p-4 border border-gray-200 bg-white hover:border-[#936B34] text-left transition-colors cursor-pointer group shadow-xs"
                >
                  <FileText className="w-4 h-4 text-[#936B34] mb-2 group-hover:scale-110 transition-transform" />
                  <div className="font-mono text-xs uppercase text-[#111827] font-medium">TALLY XML EXPORT</div>
                  <p className="text-[10px] font-mono text-gray-500 mt-1">Direct Tally Prime / ERP 9 Vouchers</p>
                </button>

                <button
                  onClick={() => exportTallyExcel(ordersList)}
                  className="p-4 border border-gray-200 bg-white hover:border-[#936B34] text-left transition-colors cursor-pointer group shadow-xs"
                >
                  <TrendingUp className="w-4 h-4 text-[#936B34] mb-2 group-hover:scale-110 transition-transform" />
                  <div className="font-mono text-xs uppercase text-[#111827] font-medium">TALLY DAYBOOK (.xlsx)</div>
                  <p className="text-[10px] font-mono text-gray-500 mt-1">Account-mapped sales daybook</p>
                </button>

                <button
                  onClick={() => exportSalesReportToExcel(ordersList, productsList)}
                  className="p-4 border border-gray-200 bg-white hover:border-[#936B34] text-left transition-colors cursor-pointer group shadow-xs"
                >
                  <Calculator className="w-4 h-4 text-[#936B34] mb-2 group-hover:scale-110 transition-transform" />
                  <div className="font-mono text-xs uppercase text-[#111827] font-medium">SALES &amp; MARGIN REPORT</div>
                  <p className="text-[10px] font-mono text-gray-500 mt-1">Executive 3-sheet revenue report</p>
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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-xl sm:text-2xl text-[#111827] uppercase tracking-wide font-light">
                  PRODUCTS REPOSITORY
                </h2>
                <p className="text-xs text-gray-500 font-mono">
                  Catalog configuration, Excel spreadsheet import/export, and stock variants
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setIsExcelUploadOpen(true)}
                  className="px-3.5 py-2 bg-[#936B34] text-white font-mono text-xs uppercase tracking-wider hover:bg-[#111827] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs font-semibold"
                  title="Upload products spreadsheet (.xlsx, .csv)"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>UPLOAD EXCEL</span>
                </button>

                <button
                  onClick={() => exportProductsToExcel(productsList)}
                  className="px-3.5 py-2 bg-white border border-gray-300 text-[#111827] font-mono text-xs uppercase tracking-wider hover:border-[#936B34] hover:text-[#936B34] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs font-medium"
                  title="Download full products catalogue to Excel (.xlsx)"
                >
                  <Download className="w-3.5 h-3.5 text-[#936B34]" />
                  <span>EXPORT EXCEL</span>
                </button>

                <button
                  onClick={downloadProductExcelTemplate}
                  className="px-3 py-2 bg-[#F9F9F8] border border-gray-200 text-gray-600 font-mono text-xs uppercase tracking-wider hover:border-gray-400 hover:text-black transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                  title="Download sample formatted Excel template for products import"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-gray-500" />
                  <span>TEMPLATE</span>
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
                  className="px-4 py-2 bg-[#111827] text-white font-semibold text-xs uppercase tracking-wider hover:bg-[#936B34] transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-xl sm:text-2xl text-[#111827] uppercase tracking-wide font-light">
                  CUSTOMER ORDERS &amp; CONSIGNMENTS
                </h2>
                <p className="text-xs text-gray-500 font-mono">
                  Order fulfillment, salon bookings, and spreadsheet export
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setIsManualOrderOpen(true)}
                  className="px-3.5 py-2 bg-[#936B34] text-white font-mono text-xs uppercase tracking-wider hover:bg-[#111827] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs font-semibold"
                  title="Create salon or private commission order manually"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>ADD ORDER MANUALLY</span>
                </button>

                <button
                  onClick={() => exportOrdersToExcel(ordersList)}
                  className="px-3.5 py-2 bg-white border border-gray-300 text-[#111827] font-mono text-xs uppercase tracking-wider hover:border-[#936B34] hover:text-[#936B34] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs font-medium"
                  title="Download orders ledger and line items to Excel (.xlsx)"
                >
                  <Download className="w-3.5 h-3.5 text-[#936B34]" />
                  <span>EXPORT ORDERS EXCEL</span>
                </button>

                <button
                  onClick={() => exportTallyXml(ordersList)}
                  className="px-3 py-2 bg-[#F9F9F8] border border-gray-200 text-gray-600 font-mono text-xs uppercase tracking-wider hover:border-gray-400 hover:text-black transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                  title="Generate Tally Prime / ERP 9 XML Sales Vouchers"
                >
                  <FileText className="w-3.5 h-3.5 text-[#936B34]" />
                  <span>TALLY XML</span>
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
                  CUSTOMER DIRECTORY &amp; PATRON CRM
                </h2>
                <p className="text-xs text-gray-500 font-mono">
                  Atelier client accounts, sartorial profiles, and Excel data export
                </p>
              </div>

              <button
                onClick={() => exportCustomersToExcel(customersList, ordersList)}
                className="px-3.5 py-2 bg-[#936B34] text-white font-mono text-xs uppercase tracking-wider hover:bg-[#111827] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs font-semibold self-start sm:self-auto"
                title="Download patrons CRM data to Excel (.xlsx)"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
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
                          {[
                            'Alteration Received',
                            'Measurement/Review',
                            'Alteration In Progress',
                            'Quality Check',
                            'Ready for Pickup',
                            'Completed'
                          ].map(st => (
                            <button
                              key={st}
                              onClick={async () => {
                                try {
                                  await AlterationService.updateStatus(alt.id, st as any);
                                  showToast(`Alteration ${alt.id} status updated`, 'success');
                                  await loadAllData();
                                } catch {
                                  showToast(`Could not update alteration ${alt.id}`, 'error');
                                }
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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 bg-[#936B34] text-white font-mono text-[9px] uppercase tracking-wider font-semibold">
                    ERP INTEGRATION ACTIVE
                  </span>
                  <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">
                    TALLY PRIME &amp; TALLY ERP 9 COMPLIANT
                  </span>
                </div>
                <h2 className="font-serif text-xl sm:text-2xl text-[#111827] uppercase tracking-wide font-light">
                  TALLY &amp; ERP FINANCIAL SUITE
                </h2>
                <p className="text-xs text-gray-500 font-mono">
                  Double-entry accounting vouchers, daybooks, sales velocity reports, and ledger analytics
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => exportTallyXml(ordersList)}
                  className="px-3.5 py-2 bg-[#936B34] text-white font-mono text-xs uppercase tracking-wider hover:bg-[#111827] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs font-semibold"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>EXPORT TALLY XML</span>
                </button>

                <button
                  onClick={() => exportTallyExcel(ordersList)}
                  className="px-3.5 py-2 bg-white border border-gray-300 text-[#111827] font-mono text-xs uppercase tracking-wider hover:border-[#936B34] hover:text-[#936B34] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs font-medium"
                >
                  <TrendingUp className="w-3.5 h-3.5 text-[#936B34]" />
                  <span>TALLY DAYBOOK (.xlsx)</span>
                </button>

                <button
                  onClick={() => exportSalesReportToExcel(ordersList, productsList)}
                  className="px-3.5 py-2 bg-[#111827] text-white font-mono text-xs uppercase tracking-wider hover:bg-[#936B34] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs font-semibold"
                >
                  <Calculator className="w-3.5 h-3.5" />
                  <span>SALES &amp; MARGIN REPORT (.xlsx)</span>
                </button>
              </div>
            </div>

            {/* Financial Ledger KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="border border-gray-200 bg-[#F9F9F8] p-5 space-y-1 shadow-xs">
                <span className="text-[10px] font-mono uppercase tracking-widest text-gray-500 block font-medium">
                  GROSS SALES COMMISSION
                </span>
                <div className="font-serif text-2xl sm:text-3xl text-[#111827] font-light">
                  {ordersList.length > 0
                    ? `$${ordersList.reduce((acc, o) => acc + (o.total || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                    : '$0.00'}
                </div>
                <span className="text-[10px] font-mono text-emerald-600 block">
                  {ordersList.length} total orders recorded
                </span>
              </div>

              <div className="border border-gray-200 bg-[#F9F9F8] p-5 space-y-1 shadow-xs">
                <span className="text-[10px] font-mono uppercase tracking-widest text-gray-500 block font-medium">
                  NET GARMENTS REVENUE (PRE-TAX)
                </span>
                <div className="font-serif text-2xl sm:text-3xl text-[#111827] font-light">
                  {ordersList.length > 0
                    ? `$${ordersList.reduce((acc, o) => acc + (o.subtotal || o.total * 0.9184), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                    : '$0.00'}
                </div>
                <span className="text-[10px] font-mono text-[#936B34] block">
                  Credit to Luxury Garments A/c
                </span>
              </div>

              <div className="border border-gray-200 bg-[#F9F9F8] p-5 space-y-1 shadow-xs">
                <span className="text-[10px] font-mono uppercase tracking-widest text-gray-500 block font-medium">
                  OUTPUT LUXURY TAX (8.875%)
                </span>
                <div className="font-serif text-2xl sm:text-3xl text-[#111827] font-light">
                  {ordersList.length > 0
                    ? `$${ordersList.reduce((acc, o) => acc + (o.tax || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                    : '$0.00'}
                </div>
                <span className="text-[10px] font-mono text-gray-500 block">
                  Credit to Tax Payable A/c
                </span>
              </div>

              <div className="border border-gray-200 bg-[#F9F9F8] p-5 space-y-1 shadow-xs">
                <span className="text-[10px] font-mono uppercase tracking-widest text-gray-500 block font-medium">
                  CATALOG INVENTORY VALUATION
                </span>
                <div className="font-serif text-2xl sm:text-3xl text-[#111827] font-light">
                  {productsList.length > 0
                    ? `$${productsList.reduce((acc, p) => acc + (p.price * p.totalStock), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                    : '$0.00'}
                </div>
                <span className="text-[10px] font-mono text-[#936B34] block">
                  {productsList.reduce((acc, p) => acc + p.totalStock, 0)} total stock units
                </span>
              </div>
            </div>

            {/* ERP Export Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Tally XML Card */}
              <div className="border border-gray-200 bg-white p-6 flex flex-col justify-between shadow-xs hover:border-[#936B34] transition-colors">
                <div>
                  <div className="w-10 h-10 rounded-none bg-[#936B34]/10 text-[#936B34] flex items-center justify-center mb-4">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h3 className="font-serif text-lg text-[#111827] uppercase tracking-wide mb-2">
                    TALLY PRIME / ERP 9 XML
                  </h3>
                  <p className="text-xs text-gray-600 font-mono leading-relaxed mb-4">
                    Generates native XML vouchers (<code className="text-[#936B34]">tally_sales_vouchers.xml</code>) with complete accounting ledger breakdowns for import into Tally.
                  </p>
                  <ul className="text-[11px] font-mono text-gray-500 space-y-1 mb-6">
                    <li>&bull; Voucher Type: Sales</li>
                    <li>&bull; Party Ledger: Sundry Debtors</li>
                    <li>&bull; Item Ledger: Luxury Garments</li>
                  </ul>
                </div>
                <button
                  onClick={() => exportTallyXml(ordersList)}
                  className="w-full py-2.5 bg-[#936B34] text-white text-xs font-mono uppercase tracking-wider hover:bg-[#111827] transition-colors flex items-center justify-center gap-1.5 cursor-pointer font-semibold"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>EXPORT XML VOUCHERS</span>
                </button>
              </div>

              {/* Tally Daybook Excel */}
              <div className="border border-gray-200 bg-white p-6 flex flex-col justify-between shadow-xs hover:border-[#936B34] transition-colors">
                <div>
                  <div className="w-10 h-10 rounded-none bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <h3 className="font-serif text-lg text-[#111827] uppercase tracking-wide mb-2">
                    TALLY DAYBOOK (.xlsx)
                  </h3>
                  <p className="text-xs text-gray-600 font-mono leading-relaxed mb-4">
                    Standard chronological sales register formatted for spreadsheet-based ERP audit, ledger reconciliation, and custom financial import tools.
                  </p>
                  <ul className="text-[11px] font-mono text-gray-500 space-y-1 mb-6">
                    <li>&bull; Formatted accounting headers</li>
                    <li>&bull; Net + Tax + Gross breakdowns</li>
                    <li>&bull; Payment status audit trails</li>
                  </ul>
                </div>
                <button
                  onClick={() => exportTallyExcel(ordersList)}
                  className="w-full py-2.5 bg-white border border-gray-300 text-[#111827] text-xs font-mono uppercase tracking-wider hover:border-[#936B34] hover:text-[#936B34] transition-colors flex items-center justify-center gap-1.5 cursor-pointer font-medium"
                >
                  <Download className="w-3.5 h-3.5 text-[#936B34]" />
                  <span>DOWNLOAD DAYBOOK</span>
                </button>
              </div>

              {/* Sales & Margin Report */}
              <div className="border border-gray-200 bg-white p-6 flex flex-col justify-between shadow-xs hover:border-[#936B34] transition-colors">
                <div>
                  <div className="w-10 h-10 rounded-none bg-[#111827]/10 text-[#111827] flex items-center justify-center mb-4">
                    <Calculator className="w-5 h-5" />
                  </div>
                  <h3 className="font-serif text-lg text-[#111827] uppercase tracking-wide mb-2">
                    SALES &amp; VELOCITY (.xlsx)
                  </h3>
                  <p className="text-xs text-gray-600 font-mono leading-relaxed mb-4">
                    Executive 3-sheet workbook: Executive Summary KPI dashboard, Product Inventory Turnover &amp; Velocity, and complete Transaction Ledger.
                  </p>
                  <ul className="text-[11px] font-mono text-gray-500 space-y-1 mb-6">
                    <li>&bull; Sheet 1: Executive KPI Summary</li>
                    <li>&bull; Sheet 2: Product Sales Velocity</li>
                    <li>&bull; Sheet 3: Transactional Ledger</li>
                  </ul>
                </div>
                <button
                  onClick={() => exportSalesReportToExcel(ordersList, productsList)}
                  className="w-full py-2.5 bg-[#111827] text-white text-xs font-mono uppercase tracking-wider hover:bg-[#936B34] transition-colors flex items-center justify-center gap-1.5 cursor-pointer font-semibold"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>DOWNLOAD REPORT</span>
                </button>
              </div>

              {/* Patrons CRM Excel */}
              <div className="border border-gray-200 bg-white p-6 flex flex-col justify-between shadow-xs hover:border-[#936B34] transition-colors">
                <div>
                  <div className="w-10 h-10 rounded-none bg-blue-50 text-blue-800 flex items-center justify-center mb-4">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <h3 className="font-serif text-lg text-[#111827] uppercase tracking-wide mb-2">
                    PATRON CRM LEDGER (.xlsx)
                  </h3>
                  <p className="text-xs text-gray-600 font-mono leading-relaxed mb-4">
                    Customer directory with lifetime order counts, total commission spend, bespoke tier classification, and salon contact info.
                  </p>
                  <ul className="text-[11px] font-mono text-gray-500 space-y-1 mb-6">
                    <li>&bull; Lifetime customer spend (LTV)</li>
                    <li>&bull; Bespoke Patron Tier rating</li>
                    <li>&bull; Cleaned phone &amp; email register</li>
                  </ul>
                </div>
                <button
                  onClick={() => exportCustomersToExcel(customersList, ordersList)}
                  className="w-full py-2.5 bg-white border border-gray-300 text-[#111827] text-xs font-mono uppercase tracking-wider hover:border-[#936B34] hover:text-[#936B34] transition-colors flex items-center justify-center gap-1.5 cursor-pointer font-medium"
                >
                  <Download className="w-3.5 h-3.5 text-[#936B34]" />
                  <span>DOWNLOAD PATRONS</span>
                </button>
              </div>

            </div>

            {/* Tally Ledger Account Structure & Audit Info */}
            <div className="border border-gray-200 bg-[#F9F9F8] p-6 space-y-4 shadow-xs">
              <div className="flex items-center gap-2 text-[#936B34] font-mono text-xs uppercase tracking-wider font-semibold">
                <SettingsIcon className="w-4 h-4" />
                <span>TALLY &amp; ERP ACCOUNTING LEDGER MAPPING SPECIFICATION</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
                <div className="p-4 bg-white border border-gray-200 space-y-1.5">
                  <div className="text-[#936B34] font-bold uppercase text-[11px]">DEBIT LEDGER (RECEIVABLES)</div>
                  <p className="text-gray-700 font-medium">Sundry Debtors / Patron Account</p>
                  <p className="text-[10px] text-gray-500">Debited with total invoice balance upon order confirmation.</p>
                </div>

                <div className="p-4 bg-white border border-gray-200 space-y-1.5">
                  <div className="text-emerald-700 font-bold uppercase text-[11px]">CREDIT LEDGER (REVENUE)</div>
                  <p className="text-gray-700 font-medium">Sales - Luxury Menswear (A/c 4000)</p>
                  <p className="text-[10px] text-gray-500">Credited with net garment value (exclusive of sales tax).</p>
                </div>

                <div className="p-4 bg-white border border-gray-200 space-y-1.5">
                  <div className="text-blue-700 font-bold uppercase text-[11px]">TAX LEDGER (DUTIES &amp; TAXES)</div>
                  <p className="text-gray-700 font-medium">Output Luxury Sales Tax (A/c 2200)</p>
                  <p className="text-[10px] text-gray-500">Credited with 8.875% statutory NYC luxury sales tax.</p>
                </div>
              </div>
            </div>

            {/* Recent Vouchers Preview Table */}
            <div className="border border-gray-200 bg-[#F9F9F8] overflow-x-auto shadow-xs">
              <div className="p-4 bg-white border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-base text-[#111827] uppercase tracking-wide">
                    RECENT TRANSACTION VOUCHERS REGISTER
                  </h3>
                  <p className="text-[11px] font-mono text-gray-500">
                    Live database transactions prepared for Tally synchronisation
                  </p>
                </div>
                <span className="text-xs font-mono font-medium text-[#936B34]">
                  {ordersList.length} Recorded Vouchers
                </span>
              </div>

              {ordersList.length > 0 ? (
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#F9F9F8] text-gray-500 border-b border-gray-200">
                    <tr>
                      <th className="p-3">VOUCHER NO</th>
                      <th className="p-3">DATE</th>
                      <th className="p-3">PATRON / DEBTOR</th>
                      <th className="p-3">NET (CR)</th>
                      <th className="p-3">TAX (CR)</th>
                      <th className="p-3">GROSS (DR)</th>
                      <th className="p-3">SETTLEMENT</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {ordersList.slice(0, 10).map(ord => {
                      const net = ord.subtotal || (ord.total / 1.08875);
                      const tax = ord.tax || (ord.total - net);
                      return (
                        <tr key={ord.id} className="hover:bg-black/[0.02]">
                          <td className="p-3 text-[#936B34] font-medium">{ord.id}</td>
                          <td className="p-3 text-gray-500">{ord.date}</td>
                          <td className="p-3 text-[#111827] font-medium">
                            {ord.customerName || ord.customerEmail || 'Private Patron'}
                          </td>
                          <td className="p-3 text-gray-700">${net.toFixed(2)}</td>
                          <td className="p-3 text-gray-500">${tax.toFixed(2)}</td>
                          <td className="p-3 font-semibold text-[#111827]">${ord.total.toFixed(2)}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] uppercase font-medium">
                              {ord.paymentStatus || 'Paid'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="py-12 text-center text-xs font-mono text-gray-500 uppercase tracking-wider">
                  No transaction vouchers recorded in system yet.
                </div>
              )}
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

      {/* MODAL: EXCEL PRODUCTS UPLOAD */}
      {isExcelUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-3xl bg-[#F9F9F8] border border-gray-200 p-6 sm:p-8 space-y-6 relative my-8 shadow-2xl">
            <button
              onClick={() => {
                setIsExcelUploadOpen(false);
                setExcelFile(null);
                setExcelFileName('');
                setParsedExcelProducts([]);
                setExcelImportErrors([]);
              }}
              className="absolute top-4 right-4 text-gray-500 hover:text-[#111827] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-gray-200 pb-4">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-[#936B34] text-white text-[10px] font-mono uppercase tracking-widest mb-2 font-semibold">
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>EXCEL INTEGRATION</span>
              </div>
              <h3 className="font-serif text-2xl text-[#111827] uppercase tracking-wide font-light">
                BATCH PRODUCTS EXCEL IMPORT
              </h3>
              <p className="text-xs text-gray-500 font-mono mt-1">
                Upload a formatted Excel workbook (<code className="text-[#936B34]">.xlsx</code>, <code className="text-[#936B34]">.xls</code>, <code className="text-[#936B34]">.csv</code>) to instantly populate the catalog vault.
              </p>
            </div>

            {/* Template Download Prompt */}
            <div className="p-4 bg-amber-50/70 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
              <div className="text-amber-900">
                <span className="font-semibold uppercase block text-[11px] mb-0.5">Recommended Column Format:</span>
                <span className="text-[11px] text-amber-800">SKU, Name, Category, Price, Size, Stock, Fabric, Fit, Description</span>
              </div>
              <button
                onClick={downloadProductExcelTemplate}
                className="px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white text-[11px] uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 font-medium"
              >
                <Download className="w-3.5 h-3.5" />
                <span>DOWNLOAD TEMPLATE</span>
              </button>
            </div>

            {/* File Upload Zone */}
            <div className="border-2 border-dashed border-gray-300 hover:border-[#936B34] bg-white p-8 text-center transition-colors">
              <input
                type="file"
                id="excel-file-input"
                accept=".xlsx, .xls, .csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setExcelFile(file);
                  setExcelFileName(file.name);
                  try {
                    const result = await parseProductsExcel(file);
                    setParsedExcelProducts(result.products);
                    setExcelImportErrors(result.errors);
                    if (result.products.length > 0) {
                      showToast(`Parsed ${result.products.length} products successfully`, 'success');
                    } else {
                      showToast('No products detected in file', 'error');
                    }
                  } catch (err: any) {
                    showToast(`Error parsing file: ${err.message}`, 'error');
                  }
                }}
                className="hidden"
              />
              <label htmlFor="excel-file-input" className="cursor-pointer block">
                <FileUp className="w-10 h-10 text-[#936B34] mx-auto mb-3" />
                <span className="font-mono text-xs uppercase text-[#111827] font-semibold block mb-1">
                  {excelFileName ? excelFileName : 'CLICK OR DRAG FILE HERE TO SELECT EXCEL'}
                </span>
                <span className="text-[11px] font-mono text-gray-500 block">
                  Accepts .xlsx, .xls, and .csv spreadsheet formats
                </span>
              </label>
            </div>

            {/* Validation Feedback & Warnings */}
            {excelImportErrors.length > 0 && (
              <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 text-xs font-mono space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-[11px] uppercase">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Validation Notices ({excelImportErrors.length}):</span>
                </div>
                <div className="max-h-24 overflow-y-auto space-y-0.5 text-[11px] pl-4 list-disc">
                  {excelImportErrors.map((err, i) => (
                    <div key={i}>&bull; {err}</div>
                  ))}
                </div>
              </div>
            )}

            {/* Parsed Preview Table */}
            {parsedExcelProducts.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#936B34] font-semibold uppercase">
                    STAGED FOR IMPORT ({parsedExcelProducts.length} GARMENTS)
                  </span>
                  <span className="text-gray-500">
                    Preview of parsed database records
                  </span>
                </div>

                <div className="border border-gray-200 bg-white max-h-56 overflow-y-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-[#F9F9F8] text-gray-500 border-b border-gray-200 sticky top-0">
                      <tr>
                        <th className="p-2.5">SKU</th>
                        <th className="p-2.5">NAME</th>
                        <th className="p-2.5">CATEGORY</th>
                        <th className="p-2.5">PRICE</th>
                        <th className="p-2.5">STOCK</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {parsedExcelProducts.map((p, idx) => (
                        <tr key={idx} className="hover:bg-black/[0.02]">
                          <td className="p-2.5 text-[#936B34] font-medium">{p.sku}</td>
                          <td className="p-2.5 text-[#111827] font-medium">{p.name}</td>
                          <td className="p-2.5 text-gray-500">{p.category}</td>
                          <td className="p-2.5 font-semibold text-[#111827]">${p.price}</td>
                          <td className="p-2.5 text-gray-600">{p.variants?.reduce((sum, v) => sum + v.stock, 0)} units</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-200">
              <button
                type="button"
                onClick={() => {
                  setIsExcelUploadOpen(false);
                  setParsedExcelProducts([]);
                  setExcelFile(null);
                  setExcelFileName('');
                }}
                className="px-4 py-2.5 border border-gray-300 text-gray-600 text-xs font-mono uppercase hover:text-black cursor-pointer"
              >
                CANCEL
              </button>

              <button
                type="button"
                disabled={parsedExcelProducts.length === 0 || isImportingExcel}
                onClick={async () => {
                  if (parsedExcelProducts.length === 0) return;
                  setIsImportingExcel(true);
                  try {
                    const created = await ProductService.batchCreate(parsedExcelProducts);
                    showToast(`Vault updated: ${created.length} luxury garments imported`, 'success');
                    await refreshProducts();
                    await loadAllData();
                    setIsExcelUploadOpen(false);
                    setParsedExcelProducts([]);
                    setExcelFile(null);
                    setExcelFileName('');
                  } catch (err: any) {
                    showToast(err.message || 'Import failed', 'error');
                  } finally {
                    setIsImportingExcel(false);
                  }
                }}
                className="px-6 py-2.5 bg-[#936B34] hover:bg-[#111827] text-white text-xs font-mono font-semibold uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer shadow-sm flex items-center gap-2"
              >
                {isImportingExcel ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>IMPORTING TO VAULT...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>CONFIRM &amp; IMPORT TO CATALOG ({parsedExcelProducts.length})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: MANUAL ORDER ENTRY */}
      {isManualOrderOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-3xl bg-[#F9F9F8] border border-gray-200 p-6 sm:p-8 space-y-6 relative my-8 shadow-2xl">
            <button
              onClick={() => setIsManualOrderOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-[#111827] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-gray-200 pb-4">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-[#111827] text-[#936B34] text-[10px] font-mono uppercase tracking-widest mb-2 font-semibold">
                <Plus className="w-3.5 h-3.5" />
                <span>SALON COMMISSION ENTRY</span>
              </div>
              <h3 className="font-serif text-2xl text-[#111827] uppercase tracking-wide font-light">
                MANUAL ORDER &amp; CONSIGNMENT BOOKING
              </h3>
              <p className="text-xs text-gray-500 font-mono mt-1">
                Record in-salon, phone consignment, or bespoke private commission orders directly into the atelier ledger.
              </p>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!manualOrderCustomer.trim()) {
                  showToast('Please provide patron name', 'error');
                  return;
                }
                if (manualOrderItems.length === 0) {
                  showToast('Please add at least one line item garment', 'error');
                  return;
                }

                setIsSubmittingOrder(true);
                try {
                  const subtotal = manualOrderItems.reduce((sum, it) => sum + (it.price * it.quantity), 0);
                  const tax = Number((subtotal * 0.08875).toFixed(2));
                  const total = Number((subtotal + tax + manualOrderShipping).toFixed(2));

                  await OrderService.createManualOrder({
                    customerName: manualOrderCustomer.trim(),
                    customerEmail: manualOrderEmail.trim() || undefined,
                    customerPhone: manualOrderPhone.trim() || undefined,
                    shippingMethod: 'White-Glove Private Courier',
                    orderStatus: manualOrderStatus,
                    paymentStatus: manualPaymentStatus,
                    paymentMethod: manualPaymentMethod,
                    subtotal,
                    tax,
                    shippingFee: manualOrderShipping,
                    total,
                    alterationRequested: manualAlterationReq,
                    alterationNotes: manualAlterationNotes,
                    items: manualOrderItems.map(it => ({
                      productId: it.productId,
                      productName: it.productName,
                      size: it.size,
                      quantity: it.quantity,
                      price: it.price
                    }))
                  });

                  showToast('Manual consignment order recorded successfully', 'success');
                  await loadAllData();
                  setIsManualOrderOpen(false);
                  setManualOrderCustomer('');
                  setManualOrderEmail('');
                  setManualOrderPhone('');
                  setManualOrderItems([]);
                  setManualAlterationReq(false);
                  setManualAlterationNotes('');
                } catch (err: any) {
                  showToast(err.message || 'Failed to create manual order', 'error');
                } finally {
                  setIsSubmittingOrder(false);
                }
              }}
              className="space-y-6"
            >
              {/* Patron Info Section */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-gray-500 mb-1 font-medium">
                    PATRON NAME *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Lord Sterling"
                    value={manualOrderCustomer}
                    onChange={(e) => setManualOrderCustomer(e.target.value)}
                    className="w-full bg-white border border-gray-300 p-2.5 text-xs text-[#111827] font-mono focus:outline-none focus:border-[#936B34]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase text-gray-500 mb-1 font-medium">
                    PATRON EMAIL
                  </label>
                  <input
                    type="email"
                    placeholder="patron@parkavenuemenswear.com"
                    value={manualOrderEmail}
                    onChange={(e) => setManualOrderEmail(e.target.value)}
                    className="w-full bg-white border border-gray-300 p-2.5 text-xs text-[#111827] font-mono focus:outline-none focus:border-[#936B34]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase text-gray-500 mb-1 font-medium">
                    PHONE / CONCIERGE
                  </label>
                  <input
                    type="text"
                    placeholder="+1 (212) 555-0199"
                    value={manualOrderPhone}
                    onChange={(e) => setManualOrderPhone(e.target.value)}
                    className="w-full bg-white border border-gray-300 p-2.5 text-xs text-[#111827] font-mono focus:outline-none focus:border-[#936B34]"
                  />
                </div>
              </div>

              {/* Line Item Builder */}
              <div className="p-4 bg-white border border-gray-200 space-y-4">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#936B34] block font-semibold">
                  SELECT GARMENT LINE ITEM
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                  <div className="sm:col-span-5">
                    <label className="block text-[9px] font-mono uppercase text-gray-500 mb-1">
                      CATALOG PRODUCT
                    </label>
                    <select
                      value={selectedProdForManual}
                      onChange={(e) => {
                        const pid = e.target.value;
                        setSelectedProdForManual(pid);
                        const prod = productsList.find(p => p.id === pid);
                        if (prod && prod.variants && prod.variants.length > 0) {
                          setSelectedSizeForManual(prod.variants[0].size);
                        }
                      }}
                      className="w-full bg-[#F9F9F8] border border-gray-300 p-2 text-xs text-[#111827] font-mono focus:outline-none focus:border-[#936B34]"
                    >
                      <option value="">-- Choose Garment --</option>
                      {productsList.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} (${p.price})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-[9px] font-mono uppercase text-gray-500 mb-1">
                      SIZE VARIANT
                    </label>
                    <select
                      value={selectedSizeForManual}
                      onChange={(e) => setSelectedSizeForManual(e.target.value)}
                      className="w-full bg-[#F9F9F8] border border-gray-300 p-2 text-xs text-[#111827] font-mono focus:outline-none focus:border-[#936B34]"
                    >
                      {selectedProdForManual ? (
                        productsList.find(p => p.id === selectedProdForManual)?.variants.map(v => (
                          <option key={v.id} value={v.size}>
                            {v.size} ({v.stock} in vault)
                          </option>
                        ))
                      ) : (
                        <option value="Standard">Standard</option>
                      )}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[9px] font-mono uppercase text-gray-500 mb-1">
                      QTY
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={selectedQtyForManual}
                      onChange={(e) => setSelectedQtyForManual(parseInt(e.target.value || '1', 10))}
                      className="w-full bg-[#F9F9F8] border border-gray-300 p-2 text-xs text-[#111827] font-mono focus:outline-none focus:border-[#936B34]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (!selectedProdForManual) {
                          showToast('Select a product first', 'error');
                          return;
                        }
                        const prod = productsList.find(p => p.id === selectedProdForManual);
                        if (!prod) return;
                        setManualOrderItems([
                          ...manualOrderItems,
                          {
                            productId: prod.id,
                            productName: prod.name,
                            size: selectedSizeForManual || '40R',
                            quantity: Math.max(1, selectedQtyForManual),
                            price: prod.price
                          }
                        ]);
                        setSelectedProdForManual('');
                        setSelectedSizeForManual('');
                        setSelectedQtyForManual(1);
                      }}
                      className="w-full py-2 bg-[#111827] hover:bg-[#936B34] text-white text-[11px] font-mono uppercase font-semibold transition-colors cursor-pointer"
                    >
                      ADD ITEM
                    </button>
                  </div>
                </div>

                {/* Current Items List */}
                {manualOrderItems.length > 0 ? (
                  <div className="border border-gray-200 mt-3 divide-y divide-gray-100">
                    {manualOrderItems.map((item, idx) => (
                      <div key={idx} className="p-2.5 flex items-center justify-between text-xs font-mono">
                        <div>
                          <span className="font-semibold text-[#111827]">{item.productName}</span>
                          <span className="text-gray-500 ml-2">Size: {item.size} &bull; Qty: {item.quantity}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-[#111827]">${(item.price * item.quantity).toFixed(2)}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setManualOrderItems(manualOrderItems.filter((_, i) => i !== idx));
                            }}
                            className="text-red-500 hover:text-red-700 cursor-pointer text-[10px] uppercase font-bold"
                          >
                            REMOVE
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-gray-50 border border-dashed border-gray-200 text-center text-xs font-mono text-gray-500">
                    No garments added yet. Select a product above to add to this consignment.
                  </div>
                )}
              </div>

              {/* Settlement & Status Settings */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-gray-500 mb-1 font-medium">
                    PAYMENT SETTLEMENT
                  </label>
                  <select
                    value={manualPaymentStatus}
                    onChange={(e) => setManualPaymentStatus(e.target.value as any)}
                    className="w-full bg-white border border-gray-300 p-2.5 text-xs text-[#111827] font-mono focus:outline-none focus:border-[#936B34]"
                  >
                    <option value="Paid">Paid / Settled</option>
                    <option value="Pending">Pending Wire</option>
                    <option value="Invoice">Salon House Invoice</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase text-gray-500 mb-1 font-medium">
                    PAYMENT METHOD
                  </label>
                  <select
                    value={manualPaymentMethod}
                    onChange={(e) => setManualPaymentMethod(e.target.value)}
                    className="w-full bg-white border border-gray-300 p-2.5 text-xs text-[#111827] font-mono focus:outline-none focus:border-[#936B34]"
                  >
                    <option value="In-Salon POS / Cash">In-Salon POS / Cash</option>
                    <option value="Centurion AMEX Black">Centurion AMEX Black</option>
                    <option value="Private Wire Transfer">Private Wire Transfer</option>
                    <option value="Atelier Line of Credit">Atelier Line of Credit</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase text-gray-500 mb-1 font-medium">
                    ORDER STATUS
                  </label>
                  <select
                    value={manualOrderStatus}
                    onChange={(e) => setManualOrderStatus(e.target.value as any)}
                    className="w-full bg-white border border-gray-300 p-2.5 text-xs text-[#111827] font-mono focus:outline-none focus:border-[#936B34]"
                  >
                    <option value="Order Confirmed">Order Confirmed</option>
                    <option value="Processing">Processing</option>
                    <option value="Packed">Packed</option>
                    <option value="Shipped">Shipped / With Courier</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                </div>
              </div>

              {/* Alterations Option */}
              <div className="p-4 bg-white border border-gray-200 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={manualAlterationReq}
                    onChange={(e) => setManualAlterationReq(e.target.checked)}
                    className="w-4 h-4 accent-[#936B34]"
                  />
                  <span className="text-xs font-mono uppercase font-semibold text-[#111827]">
                    BOOK SALON FITTING / ALTERATION FOR THIS ORDER
                  </span>
                </label>

                {manualAlterationReq && (
                  <div className="pt-2">
                    <input
                      type="text"
                      placeholder="Fitting instructions (e.g. Hem trousers to 1.75 inch cuff, taper jacket waist)"
                      value={manualAlterationNotes}
                      onChange={(e) => setManualAlterationNotes(e.target.value)}
                      className="w-full bg-[#F9F9F8] border border-gray-300 p-2.5 text-xs text-[#111827] font-mono focus:outline-none focus:border-[#936B34]"
                    />
                  </div>
                )}
              </div>

              {/* Order Summary Calculations */}
              <div className="p-4 bg-white border border-gray-200 text-xs font-mono space-y-1.5">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal:</span>
                  <span>
                    ${manualOrderItems.reduce((acc, it) => acc + (it.price * it.quantity), 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Estimated Luxury Tax (8.875%):</span>
                  <span>
                    ${(manualOrderItems.reduce((acc, it) => acc + (it.price * it.quantity), 0) * 0.08875).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Courier Dispatch:</span>
                  <span className="text-emerald-700 font-semibold">Complimentary White-Glove</span>
                </div>
                <div className="flex justify-between font-serif text-lg text-[#111827] pt-2 border-t border-gray-100">
                  <span className="uppercase">Total Consignment:</span>
                  <span className="font-light">
                    ${(manualOrderItems.reduce((acc, it) => acc + (it.price * it.quantity), 0) * 1.08875).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsManualOrderOpen(false)}
                  className="px-4 py-2.5 border border-gray-300 text-gray-600 text-xs font-mono uppercase hover:text-black cursor-pointer"
                >
                  CANCEL
                </button>

                <button
                  type="submit"
                  disabled={isSubmittingOrder || manualOrderItems.length === 0}
                  className="px-6 py-2.5 bg-[#111827] hover:bg-[#936B34] text-white text-xs font-mono font-semibold uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer shadow-sm flex items-center gap-2"
                >
                  {isSubmittingOrder ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>RECORDING IN LEDGER...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>RECORD CONSIGNMENT ORDER</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
