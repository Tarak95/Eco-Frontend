import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, LogIn } from 'lucide-react';
import axios from 'axios';
import InputField from '../common/InputField';
import Button from '../common/Button';
import { validateEmail, validatePassword } from '../../utils/validators';
import { API_URL } from '../../config';
import { getErrorMessage } from '../../utils/errors';
import { setSession } from '../../utils/storage';

export const LoginForm = ({ onSubmit, isLoading: externalLoading }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({ email: '', password: '', rememberMe: false });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name] || errors.form) {
      setErrors(prev => ({ ...prev, [name]: '', form: '' }));
    }
  };

  const handleLoginSubmit = async (dataToSubmit) => {
    setLoading(true);
    setErrors({});

    try {
      const response = await axios.post(`${API_URL}/login`, {
        email: dataToSubmit.email,
        password: dataToSubmit.password
      });

      if (response.data.success) {
        setSession(response.data.token, response.data.data);

        window.dispatchEvent(new Event('authChange'));

        if (onSubmit) {
          onSubmit(response.data);
        }

        const role = response.data.data?.role;
        const from = location.state?.from?.pathname;
        if (role === 'admin') navigate('/admin', { replace: true });
        else navigate(from && !from.startsWith('/admin') ? from : '/', { replace: true });
      } else {
        setErrors({ form: response.data.message || 'Login failed' });
      }
    } catch (err) {
      console.error('Login Error:', err);
      setErrors({
        form: getErrorMessage(err, 'Server error occurred. Please try again.')
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const emailErr = validateEmail(formData.email);
    const passErr = validatePassword(formData.password);

    if (emailErr || passErr) {
      setErrors({ email: emailErr, password: passErr });
      return;
    }

    handleLoginSubmit(formData);
  };

  const handleQuickFill = (email, password) => {
    const newData = { email, password, rememberMe: true };
    setFormData(newData);
    setErrors({});
    handleLoginSubmit(newData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full">
      {errors.form && (
        <div className="p-2.5 text-xs text-rose-600 bg-rose-50 rounded border border-rose-200 font-medium">
          {errors.form}
        </div>
      )}

      <InputField
        label="Email Address"
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="user@ecobazar.com"
        icon={Mail}
        error={errors.email}
        required
      />

      <InputField
        label="Password"
        type="password"
        name="password"
        value={formData.password}
        onChange={handleChange}
        placeholder="••••••••"
        icon={Lock}
        error={errors.password}
        required
      />

      <div className="flex items-center justify-between text-xs pt-1">
        <label className="flex items-center gap-2 cursor-pointer text-slate-600">
          <input
            type="checkbox"
            name="rememberMe"
            checked={formData.rememberMe}
            onChange={handleChange}
            className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 rounded border-slate-300"
          />
          Remember me
        </label>
        <Link to="/forgot-password" className="font-semibold text-emerald-600 hover:underline">
          Forgot Password?
        </Link>
      </div>

      <Button type="submit" isLoading={loading || externalLoading} className="w-full mt-2" size="lg">
        <LogIn size={18} /> Sign In
      </Button>
    </form>
  );
};

export default LoginForm;