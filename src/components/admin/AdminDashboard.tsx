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
  Settings as SettingsIcon
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

type AdminTab = 
  | 'dashboard' 
  | 'products' 
  | 'inventory' 
  | 'orders' 
  | 'customers' 
  | 'alterations' 
  | 'notifications' 
  | 'settings';

export const AdminDashboard: React.FC = () => {
  const { refreshProducts, showToast, setActiveView } = useShop();

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
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-xl sm:text-2xl text-[#111827] uppercase tracking-wide font-light">
                  PRODUCTS REPOSITORY
                </h2>
                <p className="text-xs text-gray-500 font-mono">
                  Catalog and garment configuration
                </p>
              </div>

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
                className="px-4 py-2.5 bg-[#111827] text-white font-semibold text-xs uppercase tracking-wider hover:bg-[#936B34] transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>ADD PRODUCT</span>
              </button>
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
            <div>
              <h2 className="font-serif text-xl sm:text-2xl text-[#111827] uppercase tracking-wide font-light">
                CUSTOMER ORDERS &amp; CONSIGNMENTS
              </h2>
              <p className="text-xs text-gray-500 font-mono">
                Order fulfillment and luxury courier statuses
              </p>
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
            <div>
              <h2 className="font-serif text-xl sm:text-2xl text-[#111827] uppercase tracking-wide font-light">
                CUSTOMER DIRECTORY
              </h2>
              <p className="text-xs text-gray-500 font-mono">
                Atelier client accounts and bespoke profiles
              </p>
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
                  <span className="text-[10px] font-mono uppercase text-[#936B34] block font-medium">FLAGSHIP ATELIER</span>
                  <p className="text-xs font-mono text-[#111827]">Park Avenue Flagship Atelier, Suite 740</p>
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
                    <option value="Dress Shirts">Dress Shirts</option>
                    <option value="Dress Pants">Dress Pants</option>
                    <option value="Ties">Ties</option>
                    <option value="New Arrivals">New Arrivals</option>
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

    </div>
  );
};
