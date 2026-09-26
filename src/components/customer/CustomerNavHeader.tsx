import React from 'react';
import { 
  LogOut, 
  LogIn, 
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import { useShop, AppView } from '../../context/ShopContext';

interface CustomerNavHeaderProps {
  currentPageTitle: string;
  currentPageSubtitle?: string;
  activeViewKey: AppView;
}

export const CustomerNavHeader: React.FC<CustomerNavHeaderProps> = ({
  currentPageTitle,
  currentPageSubtitle,
  activeViewKey
}) => {
  const { currentCustomer, setActiveView, logout } = useShop();

  return (
    <div className="bg-[#FAF8F5] border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-7">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div>
            {/* Breadcrumb Navigation */}
            <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-[#936B34] mb-1.5 font-semibold">
              <button 
                onClick={() => {
                  setActiveView('home');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="hover:underline cursor-pointer"
              >
                Atelier
              </button>
              <ChevronRight className="w-3 h-3 text-gray-400" />
              <button 
                onClick={() => {
                  setActiveView('customer-dashboard');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="hover:underline cursor-pointer"
              >
                Customer Dashboard
              </button>
              {activeViewKey !== 'customer-dashboard' && (
                <>
                  <ChevronRight className="w-3 h-3 text-gray-400" />
                  <span className="text-gray-600 font-bold">{currentPageTitle}</span>
                </>
              )}
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl text-[#111827] uppercase tracking-wide font-light">
              {currentPageTitle}
            </h1>
            {currentPageSubtitle && (
              <p className="text-xs text-gray-500 font-sans mt-1">
                {currentPageSubtitle}
              </p>
            )}
          </div>

          {/* User state & actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            {activeViewKey !== 'customer-dashboard' && (
              <button
                onClick={() => {
                  setActiveView('customer-dashboard');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-3.5 py-2 bg-white border border-gray-300 text-xs font-mono uppercase tracking-wider text-gray-700 hover:border-[#936B34] hover:text-[#936B34] transition-colors flex items-center gap-1.5 cursor-pointer font-medium"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Customer Dashboard</span>
              </button>
            )}

            {currentCustomer ? (
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-gray-600 hidden sm:inline">
                  Account: <strong className="text-gray-900">{currentCustomer.name || currentCustomer.email}</strong>
                </span>
                <button
                  onClick={() => logout()}
                  className="px-3.5 py-2 bg-white border border-gray-300 text-gray-600 hover:text-red-700 hover:border-red-300 text-xs font-mono uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="Sign out of current account"
                >
                  <LogOut className="w-3 h-3" />
                  <span>SIGN OUT</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setActiveView('login');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-4 py-2 bg-[#111827] text-white hover:bg-[#936B34] text-xs font-mono uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer font-medium"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>SIGN IN</span>
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
