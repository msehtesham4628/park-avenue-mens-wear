import React from 'react';
import { ShopProvider, useShop } from './context/ShopContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { NotificationDrawer } from './components/layout/NotificationDrawer';
import { CartDrawer } from './components/cart/CartDrawer';
import { SearchModal } from './components/search/SearchModal';
import { ToastContainer } from './components/common/ToastContainer';
import { SeoHead } from './components/common/SeoHead';
import { ErrorBoundary } from './components/common/ErrorBoundary';

// View Pages
import { Hero } from './components/home/Hero';
import { CategoryShowcase } from './components/home/CategoryShowcase';
import { FeaturedProducts } from './components/home/FeaturedProducts';
import { CampaignBanner } from './components/home/CampaignBanner';
import { TailoringBanner } from './components/home/TailoringBanner';
import { ShopPage } from './components/shop/ShopPage';
import { CategoryPage } from './components/category/CategoryPage';
import { CategoriesIndexPage } from './components/category/CategoriesIndexPage';
import { ProductDetailPage } from './components/pdp/ProductDetailPage';
import { CartPage } from './components/cart/CartPage';
import { CheckoutPage } from './components/checkout/CheckoutPage';
import { OrderTrackingPage } from './components/tracking/OrderTrackingPage';
import { AlterationTrackingPage } from './components/tracking/AlterationTrackingPage';
import { AccountPage } from './components/account/AccountPage';
import { CustomerDashboard } from './components/customer/CustomerDashboard';
import { AccountInfoPage } from './components/customer/AccountInfoPage';
import { ResetPasswordPage } from './components/customer/ResetPasswordPage';
import { ReturnTrackingPage } from './components/customer/ReturnTrackingPage';
import { LoginPage } from './components/account/LoginPage';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { WelcomePage } from './components/welcome/WelcomePage';

const MainContent: React.FC = () => {
  const { activeView, currentCustomer } = useShop();

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#111827] selection:bg-[#936B34] selection:text-white">
      <SeoHead />
      {activeView !== 'welcome' && <Navbar />}

      <main className={`flex-1 ${activeView === 'home' ? 'pt-0' : (activeView !== 'welcome' ? 'pt-24 sm:pt-28 md:pt-32' : '')}`}>
        {activeView === 'welcome' && <WelcomePage />}

        {activeView === 'home' && (
          <>
            <Hero />
            <CategoryShowcase />
            <FeaturedProducts />
            <CampaignBanner />
            <TailoringBanner />
          </>
        )}

        {activeView === 'shop' && <ShopPage />}
        {activeView === 'category' && <CategoryPage />}
        {activeView === 'categories' && <CategoriesIndexPage />}
        {activeView === 'pdp' && <ProductDetailPage />}
        {(activeView === 'cart' || activeView === 'checkout') && <CartPage />}
        {activeView === 'track-order' && <OrderTrackingPage />}
        {activeView === 'track-alteration' && <AlterationTrackingPage />}
        {activeView === 'track-return' && <ReturnTrackingPage />}
        {activeView === 'account-info' && (currentCustomer ? <AccountInfoPage /> : <LoginPage />)}
        {activeView === 'reset-password' && (currentCustomer ? <ResetPasswordPage /> : <LoginPage />)}
        {(activeView === 'account' || activeView === 'customer-dashboard') && (
          currentCustomer ? <CustomerDashboard /> : <LoginPage />
        )}
        {activeView === 'login' && (
          currentCustomer ? <CustomerDashboard /> : <LoginPage />
        )}
        {(activeView === 'admin' || activeView === 'dashboard') && <AdminDashboard />}
      </main>

      {/* Persistent global layout overlays */}
      {activeView !== 'welcome' && <Footer />}
      <NotificationDrawer />
      <CartDrawer />
      <SearchModal />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <ShopProvider>
        <MainContent />
      </ShopProvider>
    </ErrorBoundary>
  );
}
