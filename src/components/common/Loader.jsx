import React from 'react';

export const Loader = ({ fullScreen = false, size = 'md', text = 'Loading...' }) => {
  const sizes = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-3',
    lg: 'w-16 h-16 border-4'
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={`${sizes[size] || sizes.md} border-emerald-600 border-t-transparent rounded-full animate-spin`} />
      {text && <p className="text-xs font-medium text-slate-500 tracking-wide">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-xs z-50 flex items-center justify-center min-h-screen">
        {spinner}
      </div>
    );
  }

  return <div className="py-12 flex items-center justify-center w-full">{spinner}</div>;
};

export default Loader;
