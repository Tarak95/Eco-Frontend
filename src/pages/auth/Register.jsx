import React from 'react';
import { Link } from 'react-router-dom';
import RegisterForm from '../../components/auth/RegisterForm';

export const Register = () => {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Create Account</h1>
        <p className="text-xs text-slate-500 mt-1">Join EcoBazar for exclusive deals & instant checkout</p>
      </div>

      <RegisterForm />

      <div className="text-center pt-1">
        <p className="text-xs text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-emerald-600 hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
