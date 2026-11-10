import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { RefreshCw } from 'lucide-react';
import ResetPasswordForm from '../../components/auth/ResetPasswordForm';
import { API_URL } from '../../config';
import { getErrorMessage } from '../../utils/errors';

const RESEND_SECONDS = 60;

export const ResetPassword = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const initialEmail = state?.email || '';

  const [isLoading, setIsLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState(state?.notice || '');
  const [cooldown, setCooldown] = useState(initialEmail ? RESEND_SECONDS : 0);
  const [email, setEmail] = useState(initialEmail);

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const t = setInterval(() => setCooldown((c) => (c > 0 ? c - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [cooldown > 0]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleResetSubmit = async (data) => {
    setIsLoading(true);
    setErrorMessage('');
    setInfoMessage('');
    setEmail(data.email);

    try {
      const response = await axios.post(`${API_URL}/resetpassword`, data);
      if (response.status === 200) {
        setResetSuccess(true);
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (err) {
      console.error('Reset Password Error:', err);
      setErrorMessage(getErrorMessage(err, 'Invalid or expired code. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  const resendCode = async () => {
    if (!email) {
      setErrorMessage('Enter your email above first, then request a new code.');
      return;
    }
    setIsLoading(true);
    setErrorMessage('');
    try {
      const response = await axios.post(`${API_URL}/forgotpassword`, { email });
      setInfoMessage(response.data.message || 'A new code has been sent.');
      setCooldown(RESEND_SECONDS);
    } catch (err) {
      setErrorMessage(getErrorMessage(err, 'Could not send a new code. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Reset Password</h1>
        <p className="text-xs text-slate-500 mt-1">Enter the 6-digit code we emailed you and choose a new password</p>
      </div>

      {infoMessage && !resetSuccess && (
        <div role="status" className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs font-semibold">
          {infoMessage}
        </div>
      )}

      {errorMessage && (
        <div role="alert" className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-xs font-semibold">
          {errorMessage}
        </div>
      )}

      {resetSuccess ? (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold text-center">
          Password updated successfully! Redirecting to login...
        </div>
      ) : (
        <>
          <ResetPasswordForm onSubmit={handleResetSubmit} isLoading={isLoading} initialEmail={initialEmail} />

          <p className="text-xs text-slate-500 text-center">
            Didn't get a code?{' '}
            {cooldown > 0 ? (
              <span className="font-semibold text-slate-400">resend in {cooldown}s</span>
            ) : (
              <button
                type="button"
                disabled={isLoading}
                onClick={resendCode}
                className="inline-flex items-center gap-1 font-bold text-emerald-600 hover:underline disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} /> send a new code
              </button>
            )}
          </p>
        </>
      )}

      <div className="text-center pt-2">
        <Link to="/login" className="text-xs font-bold text-slate-500 hover:text-slate-800">
          ← Back to Sign In
        </Link>
      </div>
    </div>
  );
};

export default ResetPassword;
