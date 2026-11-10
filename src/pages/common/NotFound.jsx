import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Compass } from 'lucide-react';
import Button from '../../components/common/Button';

export const NotFound = () => {
  return (
    <div className="text-center py-20 max-w-lg mx-auto space-y-4">
      <div className="w-20 h-20 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
        <Compass size={40} />
      </div>
      <h1 className="text-4xl font-black text-slate-900">404 - Page Not Found</h1>
      <p className="text-xs sm:text-sm text-slate-500">
        The page you are trying to access does not exist or has been moved.
      </p>
      <Link to="/" className="inline-block pt-2">
        <Button>
          <Home size={18} /> Return Home
        </Button>
      </Link>
    </div>
  );
};

export default NotFound;
