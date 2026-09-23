import React from 'react';
import { ShopProvider, useShop } from './context/ShopContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { NotificationDrawer } from './components/layout/NotificationDrawer';
import { CartDrawer } from './components/cart/CartDrawer';
import { SearchModal } from './components/search/SearchModal';
import { ToastContainer } from './components/common/ToastContainer';
import { WelcomeCurtain } from './components/common/WelcomeCurtain';

// View Pages
import { Hero } from './components/home/Hero';
import { CategoryShowcase } from './components/home/CategoryShowcase';
import { FeaturedProducts } from './components/home/FeaturedProducts';
import { TailoringBanner } from './components/home/TailoringBanner';
import { CampaignBanner } from './components/home/CampaignBanner';
import { ShopPage } from './components/shop/ShopPage';
import { ProductDetailPage } from './components/pdp/ProductDetailPage';
import { CheckoutPage } from './components/checkout/CheckoutPage';
import { OrderTrackingPage } from './components/tracking/OrderTrackingPage';
import { AlterationTrackingPage } from './components/tracking/AlterationTrackingPage';
import { AccountPage } from './components/account/AccountPage';
import { AdminDashboard } from './components/admin/AdminDashboard';

const MainContent: React.FC = () => {
  const { activeView } = useShop();

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#111111] selection:bg-[#B38E5D] selection:text-white">
      {/* Welcome Entrance Screen & Loading Transition */}
      <WelcomeCurtain />

      <Navbar />

      <main className={`flex-1 ${activeView !== 'home' ? 'pt-24 sm:pt-28' : ''}`}>
        {activeView === 'home' && (
          <>
            <Hero />
            <CategoryShowcase />
            <FeaturedProducts />
            <TailoringBanner />
            <CampaignBanner />
          </>
        )}

        {activeView === 'shop' && <ShopPage />}
        {activeView === 'pdp' && <ProductDetailPage />}
        {activeView === 'checkout' && <CheckoutPage />}
        {activeView === 'track-order' && <OrderTrackingPage />}
        {activeView === 'track-alteration' && <AlterationTrackingPage />}
        {activeView === 'account' && <AccountPage />}
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
