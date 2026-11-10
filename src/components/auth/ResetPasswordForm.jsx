import React, { useState } from 'react';
import { Mail, Lock, CheckCircle, KeyRound } from 'lucide-react';
import InputField from '../common/InputField';
import Button from '../common/Button';
import { validateEmail, validatePassword } from '../../utils/validators';

export const ResetPasswordForm = ({ onSubmit, isLoading, initialEmail = '' }) => {
  const [formData, setFormData] = useState({
    email: initialEmail,
    code: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    let { name, value } = e.target;
    if (name === 'code') value = value.replace(/\D/g, '').slice(0, 6);
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    const emailErr = validateEmail(formData.email);
    const passErr = validatePassword(formData.password);

    if (emailErr) newErrors.email = emailErr;
    if (formData.code.length !== 6) newErrors.code = 'Enter the 6-digit code from your email';
    if (passErr) newErrors.password = passErr;
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      email: formData.email.trim(),
      code: formData.code,
      newPassword: formData.password,
      confirmPassword: formData.confirmPassword
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full">
      <InputField
        label="Email Address"
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="Your registered email"
        icon={Mail}
        error={errors.email}
        required
      />

      <InputField
        label="6-digit Reset Code"
        name="code"
        value={formData.code}
        onChange={handleChange}
        placeholder="123456"
        icon={KeyRound}
        error={errors.code}
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
        required
      />

      <InputField
        label="New Password"
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
        label="Confirm New Password"
        type="password"
        name="confirmPassword"
        value={formData.confirmPassword}
        onChange={handleChange}
        placeholder="••••••••"
        icon={Lock}
        error={errors.confirmPassword}
        required
      />

      <Button type="submit" isLoading={isLoading} className="w-full" size="lg">
        <CheckCircle size={18} /> Update Password
      </Button>
    </form>
  );
};

export default ResetPasswordForm;
