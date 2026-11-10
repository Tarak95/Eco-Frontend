import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { ShoppingBag, ShieldCheck, Sparkles, Truck } from 'lucide-react';

export const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2 min-h-[600px] border border-slate-800/40">
        
        {/* Left Brand Panel */}
        <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 p-8 text-white flex flex-col justify-between relative overflow-hidden hidden md:flex">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 z-10">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-lg">
              <ShoppingBag size={22} />
            </div>
            <span className="text-2xl font-black tracking-tight text-white">
              Eco<span className="text-emerald-400">Bazar</span>
            </span>
          </Link>

          {/* Feature Highlights */}
          <div className="space-y-6 z-10 my-auto">
            <h2 className="text-2xl font-black leading-tight text-white">
              Shop Smarter, Live Greener.
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed max-w-xs">
              Access over 90+ premium products spanning Smartphones, Smartwatches, Apparel, Electronics, Literature, and Active Lifestyle gear.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 text-xs text-slate-200">
                <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
                  <Truck size={16} />
                </div>
                <span>Fast 1-2 day express shipping nationwide</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-200">
                <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
                  <ShieldCheck size={16} />
                </div>
                <span>100% Verified buyer protection & return policy</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-200">
                <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
                  <Sparkles size={16} />
                </div>
                <span>Exclusive daily discounts & reward points</span>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <p className="text-[11px] text-slate-500 z-10">
            © 2026 EcoBazar Store. All rights reserved.
          </p>
        </div>

        {/* Right Form Panel */}
        <div className="p-8 sm:p-10 flex flex-col justify-center bg-white">
          <div className="w-full max-w-sm mx-auto">
            <Outlet />
          </div>
        </div>

      </div>
    </div>
  );
};

export default AuthLayout;
