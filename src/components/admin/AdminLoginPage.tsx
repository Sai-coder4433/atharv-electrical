import React, { useState, useEffect } from 'react';
import { Lock, Mail, Eye, EyeOff, ShieldCheck, ArrowLeft, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Logo } from '../common/Logo';
import { useNavigate } from 'react-router-dom';
import { sendAdminPasswordReset } from '../../firebase/services';

export const AdminLoginPage: React.FC = () => {
  const { authUser, authLoading, login, showToast } = useApp();
  const navigate = useNavigate();

  const [email, setEmail] = useState('atharvelectricals@gmail.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);

  // If already authenticated with admin claims, redirect immediately to admin dashboard!
  useEffect(() => {
    if (!authLoading && authUser?.isAdmin) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [authUser, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setResetSuccess(null);

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setErrorMessage('Please enter both administrator email and password.');
      return;
    }

    setIsLoading(true);
    try {
      const user = await login(cleanEmail, password);
      if (user && user.isAdmin) {
        navigate('/admin/dashboard', { replace: true });
      } else {
        setErrorMessage('Access Denied: This account does not possess verified administrator privileges.');
        showToast('Access Denied: Administrator privileges required.', 'error');
      }
    } catch (err: any) {
      console.error('Admin login error:', err);
      let userFriendlyMsg = 'Authentication failed. Please verify your credentials.';
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        userFriendlyMsg = 'Incorrect password. Please verify your credentials or click "Forgot Password" below.';
      } else if (err.code === 'auth/user-not-found') {
        userFriendlyMsg = 'Administrator account not found in Firebase Authentication.';
      } else if (err.code === 'auth/too-many-requests') {
        userFriendlyMsg = 'Too many failed login attempts. Access temporarily restricted. Try again later or reset password.';
      } else if (err.message) {
        userFriendlyMsg = err.message;
      }
      setErrorMessage(userFriendlyMsg);
      showToast(userFriendlyMsg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    const targetEmail = email.trim() || 'atharvelectricals@gmail.com';
    setIsResetting(true);
    setErrorMessage(null);
    setResetSuccess(null);

    try {
      await sendAdminPasswordReset(targetEmail);
      setResetSuccess(`Password reset link dispatched to ${targetEmail}. Please check your email inbox to update your password.`);
      showToast(`Password reset link sent to ${targetEmail}`, 'success');
    } catch (err: any) {
      const msg = err.message || 'Could not send password reset email.';
      setErrorMessage(msg);
      showToast(msg, 'error');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col justify-center items-center p-4 sm:p-6 text-[#171717]">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 p-7 sm:p-9 space-y-6">
        
        {/* Top Header & Logo */}
        <div className="flex flex-col items-center text-center space-y-2">
          <Logo size="md" />
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-50 text-[#FF6A00] rounded-full text-[11px] font-bold mt-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Central Admin Portal</span>
          </div>
          <p className="text-xs text-[#666666] pt-1">
            Restricted access for authorized store administrators only.
          </p>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Success Reset Notification */}
        {resetSuccess && (
          <div className="p-3.5 rounded-2xl bg-green-50 border border-green-200 text-green-800 text-xs flex items-start gap-2.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-green-600" />
            <span>{resetSuccess}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-gray-700 mb-1.5">
              Administrator Email
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="atharvelectricals@gmail.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF6A00] focus:ring-2 focus:ring-orange-100 font-medium text-gray-900 transition-all"
              />
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-bold text-gray-700">Password</label>
              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={isResetting}
                className="text-[11px] font-bold text-[#FF6A00] hover:text-[#F4511E] hover:underline disabled:opacity-50"
              >
                {isResetting ? 'Sending link...' : 'Forgot Password?'}
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF6A00] focus:ring-2 focus:ring-orange-100 text-gray-900 transition-all"
              />
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-1 text-gray-400 hover:text-gray-700 absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-4 rounded-xl text-xs font-bold text-white bg-atharvay-gradient shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-70 mt-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying Administrator Token...</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Sign In to Admin Portal</span>
              </>
            )}
          </button>
        </form>

        {/* Bottom Navigation Link */}
        <div className="pt-2 border-t border-gray-100 flex items-center justify-center">
          <button
            onClick={() => navigate('/')}
            className="text-xs font-semibold text-gray-500 hover:text-[#171717] flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Customer Store</span>
          </button>
        </div>

      </div>

      <div className="mt-6 text-center text-[11px] text-gray-400 font-medium">
        ATHARV ELECTRICAL · Manik Chowk, Chakan, India · Secured by Firebase Authentication
      </div>
    </div>
  );
};
