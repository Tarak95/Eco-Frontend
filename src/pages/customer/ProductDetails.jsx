import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, ShoppingCart, ShieldCheck, Truck, RefreshCw, CheckCircle, ArrowLeft } from 'lucide-react';
import ProductImageGallery from '../../components/product/ProductImageGallery';
import QuantitySelector from '../../components/cart/QuantitySelector';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import ProductCard from '../../components/product/ProductCard';
import { productApi } from '../../api/productApi';
import { useCart } from '../../hooks/useCart';

export const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await productApi.getProductById(id);
        setProduct(res.data);

        // Fetch related category products
        if (res.data) {
          const all = await productApi.getProducts({ category: res.data.category });
          setRelatedProducts((all.data || []).filter(p => p.id !== id).slice(0, 4));
        }
      } catch (err) {
        console.error('Error fetching product details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  if (loading) return <Loader text="Loading product information..." />;

  if (!product) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-slate-800">Product Not Found</h2>
        <p className="text-slate-500 my-2">The product you are looking for does not exist or has been removed.</p>
        <Link to="/products">
          <Button className="mt-4">Back to Catalog</Button>
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="space-y-12">
      <Link to="/products" className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-emerald-600 transition-colors">
        <ArrowLeft size={16} /> Back to Catalog
      </Link>

      {/* Main Details Layout */}
      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/80 shadow-xs grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Gallery */}
        <ProductImageGallery images={product.images} mainImage={product.image} title={product.name} />

        {/* Info */}
        <div className="space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold uppercase rounded-full tracking-wider">
              {product.categoryName || product.category}
            </span>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2 text-xs">
              <div className="flex items-center text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className="fill-current" />
                ))}
              </div>
              <span className="font-bold text-slate-900">{product.rating || 4.8}</span>
              <span className="text-slate-400">• ({product.reviewsCount || 45} customer reviews)</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 pt-2">
              <span className="text-3xl font-black text-slate-900">${product.price.toFixed(2)}</span>
              {product.oldPrice && (
                <span className="text-base text-slate-400 line-through font-semibold">${product.oldPrice.toFixed(2)}</span>
              )}
              <span className="ml-auto text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                In Stock ({product.stock} available)
              </span>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
              {product.description}
            </p>

            {/* Specifications */}
            {product.specs && (
              <div className="border-t border-slate-100 pt-4 space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Key Specifications</h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {Object.entries(product.specs).map(([key, val]) => (
                    <div key={key} className="bg-slate-50 p-2 rounded-xl">
                      <span className="text-slate-400 block text-[10px] uppercase">{key}</span>
                      <span className="font-bold text-slate-800">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Row */}
          <div className="border-t border-slate-100 pt-6 space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-slate-700 uppercase">Quantity:</span>
              <QuantitySelector
                quantity={quantity}
                onIncrease={() => setQuantity(q => Math.min(q + 1, product.stock || 20))}
                onDecrease={() => setQuantity(q => Math.max(q - 1, 1))}
              />
            </div>

            <Button onClick={handleAddToCart} size="lg" className="w-full">
              {added ? (
                <>
                  <CheckCircle size={20} /> Added to Cart!
                </>
              ) : (
                <>
                  <ShoppingCart size={20} /> Add to Cart
                </>
              )}
            </Button>

            {/* Assurance badging */}
            <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-500 pt-2 text-center">
              <div className="flex flex-col items-center gap-1">
                <Truck size={18} className="text-emerald-600" />
                <span>Fast Express Delivery</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <ShieldCheck size={18} className="text-emerald-600" />
                <span>2-Year Warranty</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <RefreshCw size={18} className="text-emerald-600" />
                <span>30-Day Easy Returns</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="space-y-6 pt-6">
          <h2 className="text-2xl font-black text-slate-900">You May Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {relatedProducts.map(rel => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
