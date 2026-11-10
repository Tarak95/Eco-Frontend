import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import QuantitySelector from './QuantitySelector';
import { handleImageError } from '../../utils/imageUtils';

export const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-slate-200/80 hover:border-slate-300 transition-all">
      {/* Product info */}
      <div className="flex items-center gap-4 w-full sm:w-auto">
        <Link to={`/products/${item.id}`} className="w-20 h-20 rounded-xl overflow-hidden bg-slate-50 shrink-0 border border-slate-100">
          <img 
            src={item.image} 
            alt={item.name} 
            onError={(e) => handleImageError(e, item.category)}
            className="w-full h-full object-cover" 
          />
        </Link>
        <div className="flex-1">
          <Link to={`/products/${item.id}`} className="text-sm font-bold text-slate-900 hover:text-emerald-600 line-clamp-1 transition-colors">
            {item.name}
          </Link>
          <p className="text-xs text-slate-500 capitalize mt-0.5">${item.price.toFixed(2)} each</p>
        </div>
      </div>

      {/* Quantity & Total */}
      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-0 pt-3 sm:pt-0">
        <QuantitySelector
          quantity={item.quantity}
          onIncrease={() => onUpdateQuantity(item.id, item.quantity + 1)}
          onDecrease={() => onUpdateQuantity(item.id, item.quantity - 1)}
          max={item.stock || 50}
        />

        <div className="text-right min-w-[5rem]">
          <span className="text-sm font-black text-slate-900 block">
            ${(item.price * item.quantity).toFixed(2)}
          </span>
        </div>

        <button
          onClick={() => onRemove(item.id)}
          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
          title="Remove Item"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};

export default CartItem;
