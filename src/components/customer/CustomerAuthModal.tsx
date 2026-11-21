import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, X, ArrowRight, KeyRound, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const CustomerAuthModal: React.FC = () => {
  const {
    isLoginModalOpen,
    setIsLoginModalOpen,
    login,
    register,
    loginGoogle,
    sendCustomerPasswordResetEmail,
    showToast,
    setCustomerView,
    addToCart,
  } = useApp();

  const navigate = useNavigate();
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  if (!isLoginModalOpen) return null;

  const handlePostAuthActions = () => {
    setIsLoginModalOpen(false);

    // 1. Automatically resume pending Add to Cart / Buy Now
    try {
      const raw = sessionStorage.getItem('ae_pending_cart_action');
      if (raw) {
        sessionStorage.removeItem('ae_pending_cart_action');
        const pending = JSON.parse(raw);
        if (pending && pending.product) {
          addToCart(pending.product, pending.variants, pending.qty || 1, false, true);
          if (pending.isBuyNow) {
            navigate('/checkout');
            setCustomerView('checkout');
            return;
          }
        }
      }
    } catch (e) {
      console.warn('Error resuming pending cart action:', e);
    }

    // 2. Process Pending Redirect if any
    const pendingRedirect = sessionStorage.getItem('ae_pending_redirect');
    if (pendingRedirect) {
      sessionStorage.removeItem('ae_pending_redirect');
      navigate(pendingRedirect);
      setCustomerView(pendingRedirect.replace(/^\//, ''));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please enter your email and password', 'error');
      return;
    }

    if (tab === 'signup') {
      if (!name) {
        showToast('Please enter your full name', 'error');
        return;
      }
      if (password !== confirmPassword) {
        showToast('Passwords do not match. Please verify.', 'error');
        return;
      }
      if (password.length < 6) {
        showToast('Password must be at least 6 characters long', 'error');
        return;
      }
    }

    setLoading(true);
    let ok = false;
    if (tab === 'signin') {
      try {
        const u = await login(email, password);
        ok = Boolean(u);
      } catch {
        ok = false;
      }
    } else {
      ok = await register(email, password, name);
    }
    setLoading(false);

    if (ok) {
      handlePostAuthActions();
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      showToast('Please enter your registered email address', 'error');
      return;
    }
    setLoading(true);
    try {
      await sendCustomerPasswordResetEmail(email);
      setResetSent(true);
    } catch (err: any) {
      showToast(err.message || 'Failed to send reset email', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    const ok = await loginGoogle();
    setLoading(false);
    if (ok) {
      handlePostAuthActions();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 sm:p-7 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-base text-gray-900">
              {showForgotPassword
                ? 'Reset Password'
                : tab === 'signin'
                ? 'Sign In to Your Account'
                : 'Create Customer Account'}
            </h3>
          </div>
          <button
            onClick={() => {
              setIsLoginModalOpen(false);
              setShowForgotPassword(false);
              setResetSent(false);
            }}
            className="p-1 text-gray-400 hover:text-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {showForgotPassword ? (
          <div className="space-y-4 text-xs">
            {resetSent ? (
              <div className="text-center py-6 space-y-3">
                <CheckCircle2 className="w-10 h-10 text-[#168A45] mx-auto animate-bounce" />
                <p className="font-bold text-gray-900 text-sm">Reset Link Dispatched</p>
                <p className="text-gray-500 text-xs">
                  We have dispatched a password reset link to <strong className="text-gray-800">{email}</strong>. Check your inbox.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setResetSent(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 font-bold text-gray-800 text-xs"
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <p className="text-gray-500">
                  Enter your registered account email to receive a secure password recovery link.
                </p>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Email Address *</label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="customer@example.com"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF6A00]"
                    />
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-2.5 rounded-xl text-white font-bold bg-atharvay-gradient shadow-xs hover:shadow transition-all flex items-center justify-center gap-1.5"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>{loading ? 'Sending...' : 'Send Recovery Link'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(false)}
                    className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          <>
            {/* Tab switch */}
            <div className="grid grid-cols-2 p-1 bg-gray-100 rounded-xl mb-4 text-xs font-bold">
              <button
                type="button"
                onClick={() => setTab('signin')}
                className={`py-1.5 rounded-lg transition-colors ${
                  tab === 'signin' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setTab('signup')}
                className={`py-1.5 rounded-lg transition-colors ${
                  tab === 'signup' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Register
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              {tab === 'signup' && (
                <>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Full Name *</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Rahul Sharma"
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF6A00]"
                      />
                      <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Mobile Number (Optional)</label>
                    <div className="relative">
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                        placeholder="10-digit mobile number"
                        maxLength={10}
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF6A00]"
                      />
                      <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block font-bold text-gray-700 mb-1">Email Address *</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="customer@example.com"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF6A00]"
                  />
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-gray-700">Password *</label>
                  {tab === 'signin' && (
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-[11px] font-semibold text-[#FF6A00] hover:underline"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF6A00]"
                  />
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {tab === 'signup' && (
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Confirm Password *</label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF6A00]"
                    />
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl text-white font-bold bg-atharvay-gradient shadow-xs hover:shadow flex items-center justify-center gap-1.5 transition-all mt-2"
              >
                <span>{loading ? 'Processing...' : tab === 'signin' ? 'Sign In' : 'Create Account'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <div className="relative my-3 text-center">
                <span className="relative z-10 bg-white px-2 text-[10px] uppercase font-bold text-gray-400">or</span>
                <div className="absolute inset-0 top-1/2 border-t border-gray-200" />
              </div>

              <button
                type="button"
                onClick={handleGoogle}
                disabled={loading}
                className="w-full py-2 px-3 rounded-xl border border-gray-200 hover:bg-gray-50 font-bold text-gray-700 flex items-center justify-center gap-2 transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
