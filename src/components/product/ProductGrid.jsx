import React from 'react';
import ProductCard from './ProductCard';
import Loader from '../common/Loader';

export const ProductGrid = ({ products, loading, onQuickView }) => {
  if (loading) {
    return <Loader text="Loading catalog products..." />;
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 px-4 my-6">
        <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
          🔍
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-1">No products found</h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          We couldn't find any products matching your search criteria or category filter. Try clearing filters or searching for something else!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} onQuickView={onQuickView} />
      ))}
    </div>
  );
};

export default ProductGrid;
