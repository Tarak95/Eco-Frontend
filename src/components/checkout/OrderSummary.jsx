import React from 'react';
import { ShoppingCart } from 'lucide-react';

export const OrderSummary = ({ items = [], totalAmount, shippingCost = 0 }) => {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
      <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
        <span className="flex items-center gap-2">
          <ShoppingCart size={18} className="text-emerald-600" />
          Review Items ({items.length})
        </span>
      </h3>

      <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto pr-1">
        {items.map((item) => (
          <div key={item.id} className="py-3 flex items-center gap-3">
            <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover bg-slate-50 border border-slate-100" />
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-slate-900 truncate">{item.name}</h4>
              <p className="text-[11px] text-slate-500">
                {item.quantity} x ${item.price.toFixed(2)}
              </p>
            </div>
            <span className="text-xs font-bold text-slate-900">${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
      </div>

      <div className="border-t border-slate-100 pt-3 space-y-2 text-xs">
        <div className="flex justify-between text-slate-600">
          <span>Subtotal</span>
          <span className="font-semibold text-slate-900">${totalAmount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-slate-600">
          <span>Shipping</span>
          <span className="font-semibold text-emerald-600">
            {totalAmount > 50 ? 'FREE' : `$${shippingCost.toFixed(2)}`}
          </span>
        </div>
        <div className="border-t border-slate-100 pt-2 flex justify-between items-center text-sm">
          <span className="font-bold text-slate-900">Total Payable</span>
          <span className="font-black text-emerald-600 text-base">
            ${(totalAmount + (totalAmount > 50 ? 0 : shippingCost)).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
