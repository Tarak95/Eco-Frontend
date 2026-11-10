import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Tag, ShieldCheck } from 'lucide-react';
import Button from '../common/Button';

export const CartSummary = ({ subtotal, discount = 0, shipping = 0 }) => {
  const [coupon, setCoupon] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(discount);
  const [couponMessage, setCouponMessage] = useState('');

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (coupon.trim().toUpperCase() === 'ECO10') {
      const disc = subtotal * 0.1;
      setAppliedDiscount(disc);
      setCouponMessage('10% Eco discount applied!');
    } else if (coupon.trim().toUpperCase() === 'FREESHIP') {
      setCouponMessage('Free shipping promo applied!');
    } else {
      setCouponMessage('Invalid coupon code. Try ECO10 for 10% off!');
    }
  };

  const finalTotal = Math.max(0, subtotal - appliedDiscount + (subtotal > 50 ? 0 : shipping));

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
      <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
        <ShoppingBag size={18} className="text-emerald-600" />
        Order Summary
      </h3>

      {/* Coupon Code Input */}
      <form onSubmit={handleApplyCoupon} className="space-y-2">
        <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
          Promo Code
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={coupon}
            onChange={(e) => setCoupon(e.target.value)}
            placeholder="Try ECO10"
            className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 uppercase"
          />
          <Button type="submit" variant="outline" size="sm">
            Apply
          </Button>
        </div>
        {couponMessage && (
          <p className={`text-[11px] font-medium ${couponMessage.includes('applied') ? 'text-emerald-600' : 'text-rose-500'}`}>
            {couponMessage}
          </p>
        )}
      </form>

      {/* Calculations */}
      <div className="space-y-3 pt-2 text-sm">
        <div className="flex justify-between text-slate-600">
          <span>Subtotal</span>
          <span className="font-semibold text-slate-900">${subtotal.toFixed(2)}</span>
        </div>

        {appliedDiscount > 0 && (
          <div className="flex justify-between text-emerald-600 font-medium">
            <span className="flex items-center gap-1">
              <Tag size={14} /> Discount
            </span>
            <span>-${appliedDiscount.toFixed(2)}</span>
          </div>
        )}

        <div className="flex justify-between text-slate-600">
          <span>Shipping</span>
          <span className="font-semibold text-slate-900">
            {subtotal > 50 || subtotal === 0 ? (
              <span className="text-emerald-600 font-bold uppercase text-xs">FREE</span>
            ) : (
              `$${shipping.toFixed(2)}`
            )}
          </span>
        </div>

        <div className="border-t border-slate-100 pt-3 flex justify-between items-center">
          <span className="text-base font-bold text-slate-900">Total</span>
          <span className="text-xl font-black text-emerald-600">${finalTotal.toFixed(2)}</span>
        </div>
      </div>

      <Link to="/checkout" className="block">
        <Button size="lg" className="w-full">
          Proceed to Checkout <ArrowRight size={18} />
        </Button>
      </Link>

      <div className="flex items-center justify-center gap-2 text-xs text-slate-400 pt-1">
        <ShieldCheck size={16} className="text-emerald-500" />
        <span>Safe 256-Bit Encrypted Checkout</span>
      </div>
    </div>
  );
};

export default CartSummary;
