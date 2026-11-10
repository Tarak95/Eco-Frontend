import React, { useState } from 'react';
import { Mail, Send } from 'lucide-react';
import InputField from '../common/InputField';
import Button from '../common/Button';
import { validateEmail } from '../../utils/validators';

export const ForgotPasswordForm = ({ onSubmit, isLoading }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const err = validateEmail(email);
    if (err) {
      setError(err);
      return;
    }
    onSubmit(email);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full">
      <InputField
        label="Email Address"
        type="email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          if (error) setError('');
        }}
        placeholder="Enter your registered email"
        icon={Mail}
        error={error}
        required
      />

      <Button type="submit" isLoading={isLoading} className="w-full" size="lg">
        <Send size={18} /> Send Reset Code
      </Button>
    </form>
  );
};

export default ForgotPasswordForm;
