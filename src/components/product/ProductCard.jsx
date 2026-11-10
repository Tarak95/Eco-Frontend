import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingCart, Eye, Heart } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { handleImageError } from '../../utils/imageUtils';

export const ProductCard = ({ product, onQuickView }) => {
  const { addToCart } = useCart();
  const [added, setAdded] = React.useState(false);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const discountPercent = product.oldPrice && product.oldPrice > product.price
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : null;

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/80 hover:border-emerald-300 hover:shadow-xl transition-all duration-300 flex flex-col h-full overflow-hidden relative">
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
        {discountPercent && (
          <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs uppercase tracking-wide">
            -{discountPercent}% OFF
          </span>
        )}
        {product.isDealOfDay && (
          <span className="bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs uppercase tracking-wide">
            Hot Deal
          </span>
        )}
      </div>

      {/* Quick view button */}
      <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1.5">
        {onQuickView && (
          <button
            onClick={() => onQuickView(product)}
            className="p-2 bg-white/90 backdrop-blur-xs text-slate-700 hover:text-emerald-600 rounded-full shadow-md hover:bg-white transition-all cursor-pointer"
            title="Quick View"
          >
            <Eye size={16} />
          </button>
        )}
      </div>

      {/* Product Image */}
      <Link to={`/products/${product.id}`} className="block relative aspect-square overflow-hidden bg-slate-50">
        <img
          src={product.image}
          alt={product.name}
          onError={(e) => handleImageError(e, product.category)}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
      </Link>

      {/* Product Info */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block mb-1">
            {product.categoryName || product.category}
          </span>
          <Link to={`/products/${product.id}`}>
            <h3 className="text-sm font-bold text-slate-900 line-clamp-2 hover:text-emerald-600 transition-colors leading-snug">
              {product.name}
            </h3>
          </Link>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col gap-2">
          {/* Rating */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <div className="flex items-center text-amber-400">
              <Star size={14} className="fill-current" />
              <span className="ml-1 font-bold text-slate-800">{product.rating || 4.8}</span>
            </div>
            <span>({product.reviewsCount || 45})</span>
            <span className="ml-auto text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold">
              In Stock
            </span>
          </div>

          {/* Price & Action */}
          <div className="flex items-center justify-between gap-2 mt-1">
            <div className="flex flex-col">
              <span className="text-lg font-black text-slate-900 leading-none">
                ${product.price.toFixed(2)}
              </span>
              {product.oldPrice && product.oldPrice > product.price && (
                <span className="text-xs text-slate-400 line-through font-medium mt-0.5">
                  ${product.oldPrice.toFixed(2)}
                </span>
              )}
            </div>

            <button
              onClick={handleAddToCart}
              className={`p-2.5 rounded-xl font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                added
                  ? 'bg-emerald-800 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white hover:shadow-md'
              }`}
            >
              <ShoppingCart size={16} />
              <span className="hidden sm:inline">{added ? 'Added!' : 'Add'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
