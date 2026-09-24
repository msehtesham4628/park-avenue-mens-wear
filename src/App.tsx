import React from 'react';
import { ShopProvider, useShop } from './context/ShopContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { NotificationDrawer } from './components/layout/NotificationDrawer';
import { CartDrawer } from './components/cart/CartDrawer';
import { SearchModal } from './components/search/SearchModal';
import { ToastContainer } from './components/common/ToastContainer';

// View Pages
import { Hero } from './components/home/Hero';
import { CategoryShowcase } from './components/home/CategoryShowcase';
import { FeaturedProducts } from './components/home/FeaturedProducts';
import { CampaignBanner } from './components/home/CampaignBanner';
import { ShopPage } from './components/shop/ShopPage';
import { ProductDetailPage } from './components/pdp/ProductDetailPage';
import { CartPage } from './components/cart/CartPage';
import { CheckoutPage } from './components/checkout/CheckoutPage';
import { OrderTrackingPage } from './components/tracking/OrderTrackingPage';
import { AlterationTrackingPage } from './components/tracking/AlterationTrackingPage';
import { AccountPage } from './components/account/AccountPage';
import { LoginPage } from './components/account/LoginPage';
import { AdminDashboard } from './components/admin/AdminDashboard';

const MainContent: React.FC = () => {
  const { activeView } = useShop();

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#111827] selection:bg-[#936B34] selection:text-white">
      <Navbar />

      <main className={`flex-1 ${activeView !== 'home' ? 'pt-24 sm:pt-28' : ''}`}>
        {activeView === 'home' && (
          <>
            <Hero />
            <CategoryShowcase />
            <FeaturedProducts />
            <CampaignBanner />
          </>
        )}

        {activeView === 'shop' && <ShopPage />}
        {activeView === 'pdp' && <ProductDetailPage />}
        {activeView === 'cart' && <CartPage />}
        {activeView === 'checkout' && <CheckoutPage />}
        {activeView === 'track-order' && <OrderTrackingPage />}
        {activeView === 'track-alteration' && <AlterationTrackingPage />}
        {activeView === 'account' && <AccountPage />}
        {activeView === 'login' && <LoginPage />}
        {activeView === 'admin' && <AdminDashboard />}
      </main>

      {/* Persistent global layout overlays */}
      <Footer />
      <NotificationDrawer />
      <CartDrawer />
      <SearchModal />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <ShopProvider>
      <MainContent />
    </ShopProvider>
  );
}
