import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ForgotPasswordForm from '../../components/auth/ForgotPasswordForm';
import { API_URL } from '../../config';
import { getErrorMessage } from '../../utils/errors';

export const ForgotPassword = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Sends ONLY the password reset code, then moves on to the "enter code + new password" page
  const handleForgotSubmit = async (formData) => {
    setIsLoading(true);
    setErrorMessage('');

    const email = (typeof formData === 'string' ? formData : formData.email).trim();

    try {
      const response = await axios.post(`${API_URL}/forgotpassword`, { email });
      navigate('/reset-password', { state: { email, notice: response.data.message } });
    } catch (err) {
      console.error('Forgot Password Error:', err);
      setErrorMessage(getErrorMessage(err, 'Something went wrong. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Forgot Password</h1>
        <p className="text-xs text-slate-500 mt-1">Enter your email and we'll send you a 6-digit code to reset your password</p>
      </div>

      {errorMessage && (
        <div role="alert" className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-xs font-semibold">
          {errorMessage}
        </div>
      )}

      <ForgotPasswordForm onSubmit={handleForgotSubmit} isLoading={isLoading} />

      <div className="text-center pt-2">
        <Link to="/login" className="text-xs font-bold text-slate-500 hover:text-slate-800">
          ← Back to Sign In
        </Link>
      </div>
    </div>
  );
};

export default ForgotPassword;
