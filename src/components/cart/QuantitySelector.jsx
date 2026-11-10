import React from 'react';
import { Minus, Plus } from 'lucide-react';

export const QuantitySelector = ({ quantity, onIncrease, onDecrease, min = 1, max = 99 }) => {
  return (
    <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
      <button
        type="button"
        onClick={onDecrease}
        disabled={quantity <= min}
        className="p-2 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
      >
        <Minus size={14} />
      </button>

      <span className="px-3 py-1 text-xs font-bold text-slate-900 min-w-[2.5rem] text-center">
        {quantity}
      </span>

      <button
        type="button"
        onClick={onIncrease}
        disabled={quantity >= max}
        className="p-2 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
      >
        <Plus size={14} />
      </button>
    </div>
  );
};

export default QuantitySelector;
