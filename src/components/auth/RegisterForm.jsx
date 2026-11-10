import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { User, Mail, Lock, Phone, UserPlus } from 'lucide-react';
import InputField from '../common/InputField';
import Button from '../common/Button';
import { validateEmail, validatePassword, validateRequired } from '../../utils/validators';
import { API_URL } from '../../config';
import { getErrorMessage } from '../../utils/errors';
import { setSession } from '../../utils/storage';

export const RegisterForm = ({ onSubmit, isLoading: externalLoading }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const newErrors = {};
    const nameErr = validateRequired(formData.name, 'Full name');
    const emailErr = validateEmail(formData.email);
    const passErr = validatePassword(formData.password);

    if (nameErr) newErrors.name = nameErr;
    if (emailErr) newErrors.email = emailErr;
    if (passErr) newErrors.password = passErr;
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!formData.agreeTerms) {
      newErrors.agreeTerms = 'You must accept the Terms and Conditions';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/registration`, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        confirmPassword: formData.confirmPassword
      });

      const data = response.data;

      // Account is active immediately (no email verification) -> sign the user in straight away
      try {
        const login = await axios.post(`${API_URL}/login`, {
          email: data.email || formData.email,
          password: formData.password
        });
        if (login.data?.success) {
          setSession(login.data.token, login.data.data);
          window.dispatchEvent(new Event('authChange'));
          navigate('/'); // new accounts are always normal users
          return;
        }
      } catch (loginErr) {
        console.error('Auto login after registration failed:', loginErr);
      }
      navigate('/login');
    } catch (err) {
      console.error('Registration Error:', err);
      setErrors({
        form: getErrorMessage(err, 'Registration failed. Please try again.')
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5 w-full">
      {errors.form && (
        <div className="p-2.5 text-xs text-rose-600 bg-rose-50 rounded border border-rose-200">
          {errors.form}
        </div>
      )}


      <InputField
        label="Full Name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Lucas"
        icon={User}
        error={errors.name}
        required
      />

      <InputField
        label="Email Address"
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="lucas@example.com"
        icon={Mail}
        error={errors.email}
        required
      />

      <InputField
        label="Phone Number"
        name="phone"
        value={formData.phone}
        onChange={handleChange}
        placeholder="+12123658444"
        icon={Phone}
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

      <InputField
        label="Confirm Password"
        type="password"
        name="confirmPassword"
        value={formData.confirmPassword}
        onChange={handleChange}
        placeholder="••••••••"
        icon={Lock}
        error={errors.confirmPassword}
        required
      />

      <div className="pt-1">
        <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600">
          <input
            type="checkbox"
            name="agreeTerms"
            checked={formData.agreeTerms}
            onChange={handleChange}
            className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 rounded border-slate-300"
          />
          I agree to the <span className="text-emerald-600 font-semibold underline">Terms & Conditions</span>
        </label>
        {errors.agreeTerms && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.agreeTerms}</p>}
      </div>

      <Button type="submit" isLoading={loading || externalLoading} className="w-full mt-2" size="lg">
        <UserPlus size={18} /> Create Account
      </Button>
    </form>
  );
};

export default RegisterForm;