import React, { useState } from 'react';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, Key, LogIn } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { AuthService } from '../../services/api';
import { CustomerNavHeader } from './CustomerNavHeader';

export const ResetPasswordPage: React.FC = () => {
  const { currentCustomer, showToast, setActiveView } = useShop();

  const [form, setForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!currentCustomer) {
      setStatusMessage({ type: 'error', text: 'Please sign in to update your password.' });
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setStatusMessage({ type: 'error', text: 'New password and confirmation do not match.' });
      return;
    }

    if (form.newPassword.length < 6) {
      setStatusMessage({ type: 'error', text: 'New password must contain at least 6 characters.' });
      return;
    }

    setIsResetting(true);
    try {
      const res = await AuthService.changePassword(
        form.oldPassword,
        form.newPassword
      );

      if (res?.success) {
        setStatusMessage({
          type: 'success',
          text: 'Your password has been successfully updated. Please use your new password next time you sign in.'
        });
        setForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
        showToast('Password updated successfully.', 'success');
      } else {
        setStatusMessage({
          type: 'error',
          text: res?.message || 'Verification failed. Please check your current password and try again.'
        });
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Unable to update password. Please try again.'
      });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#111827] pb-24">
      <CustomerNavHeader 
        currentPageTitle="Password & Security"
        currentPageSubtitle="Update your account password to keep your personal information and orders secure."
        activeViewKey="reset-password"
      />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        {!currentCustomer && (
          <div className="bg-[#FAF8F5] border border-gray-200 p-5 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-serif text-lg text-[#111827]">Sign in to change password</h3>
              <p className="text-xs text-gray-600 font-sans mt-0.5">
                You must be logged in to your account to update your security credentials.
              </p>
            </div>
            <button
              onClick={() => {
                setActiveView('login');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-5 py-2.5 bg-[#111827] text-white hover:bg-[#936B34] text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          </div>
        )}

        <div className="border border-gray-200 bg-[#FAF8F5] p-6 sm:p-10 shadow-xs">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-200 mb-6">
            <div className="w-10 h-10 bg-white border border-gray-200 flex items-center justify-center">
              <Key className="w-5 h-5 text-[#936B34]" />
            </div>
            <div>
              <h2 className="font-serif text-2xl text-[#111827]">
                Change Password
              </h2>
              {currentCustomer && (
                <span className="text-xs font-mono text-gray-500 block mt-0.5">
                  Account: {currentCustomer.email}
                </span>
              )}
            </div>
          </div>

          {statusMessage && (
            <div className={`p-4 mb-6 border text-xs font-mono flex items-start gap-2.5 ${
              statusMessage.type === 'success' 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                : 'bg-red-50 border-red-200 text-red-700'
            }`}>
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[10px] font-mono uppercase text-gray-600 mb-1 font-semibold">
                Current Password *
              </label>
              <div className="relative">
                <input
                  type={showOldPassword ? 'text' : 'password'}
                  required
                  value={form.oldPassword}
                  onChange={e => setForm({ ...form, oldPassword: e.target.value })}
                  placeholder="Enter your current password"
                  className="w-full bg-white border border-gray-300 px-3.5 py-2.5 text-xs text-[#111827] focus:outline-none focus:border-[#936B34]"
                />
                <button
                  type="button"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-700 cursor-pointer"
                >
                  {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase text-gray-600 mb-1 font-semibold">
                New Password *
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  value={form.newPassword}
                  onChange={e => setForm({ ...form, newPassword: e.target.value })}
                  placeholder="Enter new password (min. 6 characters)"
                  className="w-full bg-white border border-gray-300 px-3.5 py-2.5 text-xs text-[#111827] focus:outline-none focus:border-[#936B34]"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-700 cursor-pointer"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase text-gray-600 mb-1 font-semibold">
                Confirm New Password *
              </label>
              <input
                type="password"
                required
                value={form.confirmPassword}
                onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                placeholder="Confirm your new password"
                className="w-full bg-white border border-gray-300 px-3.5 py-2.5 text-xs text-[#111827] focus:outline-none focus:border-[#936B34]"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isResetting || !currentCustomer}
                className="w-full py-3 bg-[#111827] text-white hover:bg-[#936B34] text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isResetting ? 'UPDATING PASSWORD...' : 'UPDATE PASSWORD'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
