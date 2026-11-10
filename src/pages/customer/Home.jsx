import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Sparkles, 
  ChevronLeft,
  ChevronRight,
  Clock, 
  Percent, 
  Smartphone, 
  Watch, 
  Activity, 
  Shirt, 
  BookOpen, 
  Tv, 
  Headphones, 
  Grid
} from 'lucide-react';
import ProductGrid from '../../components/product/ProductGrid';
import Modal from '../../components/common/Modal';
import ProductImageGallery from '../../components/product/ProductImageGallery';
import Button from '../../components/common/Button';
import { productApi } from '../../api/productApi';
import { CATEGORIES } from '../../utils/constants';
import { useCart } from '../../hooks/useCart';
import { handleImageError } from '../../utils/imageUtils';

const categoryIcons = {
  smartphone: Smartphone,
  smartwatch: Watch,
  sports: Activity,
  fashion: Shirt,
  books: BookOpen,
  cosmetics: Sparkles,
  electronics: Tv,
  accessories: Headphones
};

export const Home = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [dealProducts, setDealProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const { addToCart } = useCart();

  // Hero section category product rotator
  const [heroIndex, setHeroIndex] = useState(0);

  // Filter 1 product from each of the 8 categories for the Hero Section
  const heroCategoryProducts = useMemo(() => {
    if (!allProducts || allProducts.length === 0) return [];
    const mainCats = CATEGORIES.filter(c => c.id !== 'all');
    const items = [];

    mainCats.forEach(cat => {
      const match = allProducts.find(p => p.category === cat.id || p.categorySlug === cat.id);
      if (match) {
        items.push({ ...match, categoryLabel: cat.name });
      }
    });

    return items;
  }, [allProducts]);

  // Auto rotate hero product every 3.5 seconds
  useEffect(() => {
    if (heroCategoryProducts.length <= 1) return;
    const interval = setInterval(() => {
      setHeroIndex(prev => (prev + 1) % heroCategoryProducts.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [heroCategoryProducts]);

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState({ hours: 12, minutes: 45, seconds: 30 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 24, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const res = await productApi.getProducts();
        const all = res.data || [];
        setAllProducts(all);
        setFeaturedProducts(all.filter(p => p.isFeatured).slice(0, 8));
        setDealProducts(all.filter(p => p.isDealOfDay).slice(0, 4));
      } catch (err) {
        console.error('Error loading homepage catalog:', err);
      } finally {
        setLoading(false);
      }
    };
    loadHomeData();
  }, []);

  const currentHeroProduct = heroCategoryProducts[heroIndex] || heroCategoryProducts[0];

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white overflow-hidden p-8 sm:p-12 lg:p-16 border border-slate-800 shadow-2xl min-h-[420px] flex items-center">
        <div className="max-w-xl space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles size={14} /> EcoBazar Mega Super Sale
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Premium Tech, Fashion & Lifestyle Essentials.
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-lg">
            Discover 90+ top-tier smartphones, smartwatches, active wear, literature, cosmetics & accessories with free 2-day delivery!
          </p>

          {/* SINGLE Shop Now Button */}
          <div className="pt-2">
            <Link to="/products">
              <Button size="lg" className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-8 py-3.5 shadow-xl shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95">
                Shop Now <ArrowRight size={18} />
              </Button>
            </Link>
          </div>
        </div>

        {/* Dynamic Category Hero Product Card (Shows 1 Product from Each Category) */}
        {currentHeroProduct && (
          <div className="hidden lg:flex flex-col absolute right-8 lg:right-12 top-1/2 -translate-y-1/2 w-80 h-[380px] rounded-2xl overflow-hidden border-2 border-emerald-500/40 shadow-2xl bg-slate-900 group transition-all duration-500">
            {/* Product Image Area */}
            <div className="relative h-60 overflow-hidden bg-slate-950">
              <img
                key={currentHeroProduct.id}
                src={currentHeroProduct.image}
                alt={currentHeroProduct.name}
                onError={(e) => handleImageError(e, currentHeroProduct.category)}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
              />
              
              {/* Discount Badge */}
              <div className="absolute top-3 left-3 bg-rose-600/90 text-white backdrop-blur-md px-3 py-1 rounded-full border border-rose-500/50 text-[11px] font-black uppercase tracking-wide flex items-center gap-1.5 shadow-lg">
                <Percent size={12} className="animate-pulse" />
                <span>
                  {currentHeroProduct.oldPrice && currentHeroProduct.oldPrice > currentHeroProduct.price
                    ? `${Math.round(((currentHeroProduct.oldPrice - currentHeroProduct.price) / currentHeroProduct.oldPrice) * 100)}% OFF`
                    : '25% OFF'}
                </span>
              </div>

              {/* Prev / Next controls */}
              <div className="absolute top-3 right-3 flex items-center gap-1 bg-slate-950/80 backdrop-blur-md p-1 rounded-lg border border-slate-700/60">
                <button
                  onClick={() => setHeroIndex(prev => (prev - 1 + heroCategoryProducts.length) % heroCategoryProducts.length)}
                  className="p-1 hover:text-emerald-400 text-slate-300 transition-colors cursor-pointer"
                  title="Previous Category"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  onClick={() => setHeroIndex(prev => (prev + 1) % heroCategoryProducts.length)}
                  className="p-1 hover:text-emerald-400 text-slate-300 transition-colors cursor-pointer"
                  title="Next Category"
                >
                  <ChevronRight size={14} />
                </button>
              </div>

              {/* Indicator Dots for 8 categories */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-slate-800">
                {heroCategoryProducts.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setHeroIndex(idx)}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                      idx === heroIndex ? 'w-4 bg-emerald-400' : 'w-1.5 bg-slate-600 hover:bg-slate-400'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Bottom Product Info */}
            <div className="p-4 bg-slate-900 border-t border-slate-800/80 flex-1 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
                  Hot Deal ({heroIndex + 1}/{heroCategoryProducts.length})
                </span>
                <Link to={`/products/${currentHeroProduct.id}`}>
                  <h3 className="text-sm font-bold text-white hover:text-emerald-300 transition-colors line-clamp-1 mt-0.5">
                    {currentHeroProduct.name}
                  </h3>
                </Link>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                <div>
                  <span className="text-lg font-black text-emerald-400">
                    ${currentHeroProduct.price.toFixed(2)}
                  </span>
                  {currentHeroProduct.oldPrice && (
                    <span className="text-xs text-slate-400 line-through ml-2">
                      ${currentHeroProduct.oldPrice.toFixed(2)}
                    </span>
                  )}
                </div>

                <Link to={`/products/${currentHeroProduct.id}`}>
                  <span className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    Shop Now <ArrowRight size={13} />
                  </span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Category Grid Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Shop by Categories</h2>
            <p className="text-xs sm:text-sm text-slate-500">Explore items across all our 8 major category departments</p>
          </div>
          <Link to="/products" className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1">
            View All Categories <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
          {CATEGORIES.filter(c => c.id !== 'all').map((cat) => {
            const IconComp = categoryIcons[cat.id] || Grid;
            const matchedProduct = allProducts.find(p => p.category === cat.id || p.categorySlug === cat.slug);
            const displayImage = matchedProduct?.image || cat.image;

            return (
              <Link
                key={cat.id}
                to={`/products?category=${cat.slug}`}
                className="group p-2.5 bg-white rounded-2xl border border-slate-200/80 hover:border-emerald-500 hover:shadow-xl transition-all text-center flex flex-col items-center gap-2 overflow-hidden"
              >
                <div className="w-full aspect-square rounded-xl overflow-hidden bg-slate-100 relative">
                  <img 
                    src={displayImage} 
                    alt={cat.name} 
                    onError={(e) => handleImageError(e, cat.id)}
                    className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500" 
                  />
                  <div className="absolute top-1.5 right-1.5 w-6 h-6 rounded-lg bg-slate-900/80 text-emerald-400 backdrop-blur-xs flex items-center justify-center shadow-md">
                    <IconComp size={13} />
                  </div>
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-600 transition-colors line-clamp-1 block leading-tight">
                    {cat.name}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium block mt-0.5">12+ Products</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Deal of the Day Section */}
      <section className="bg-emerald-900 text-white rounded-3xl p-6 sm:p-10 border border-emerald-800 shadow-xl space-y-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-emerald-800 pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500 text-slate-950 font-black text-xs uppercase rounded-full mb-2">
              <Percent size={14} /> Limited Time Offers
            </div>
            <h2 className="text-2xl sm:text-3xl font-black">Deal of the Day</h2>
          </div>

          {/* Countdown Clock */}
          <div className="flex items-center gap-3 bg-emerald-950/80 px-4 py-2.5 rounded-2xl border border-emerald-700/50">
            <Clock size={20} className="text-amber-400" />
            <span className="text-xs text-emerald-200 font-medium mr-2">Ends in:</span>
            <div className="flex items-center gap-1 font-mono font-black text-lg">
              <span className="bg-emerald-900 px-2.5 py-1 rounded-lg border border-emerald-700">{String(timeLeft.hours).padStart(2, '0')}</span>:
              <span className="bg-emerald-900 px-2.5 py-1 rounded-lg border border-emerald-700">{String(timeLeft.minutes).padStart(2, '0')}</span>:
              <span className="bg-emerald-900 px-2.5 py-1 rounded-lg border border-emerald-700">{String(timeLeft.seconds).padStart(2, '0')}</span>
            </div>
          </div>
        </div>

        <ProductGrid products={dealProducts} loading={loading} onQuickView={(p) => setQuickViewProduct(p)} />
      </section>

      {/* Featured Products */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Featured Products</h2>
            <p className="text-xs sm:text-sm text-slate-500">Hand-picked top rated items from EcoBazar</p>
          </div>
          <Link to="/products" className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1">
            View All ({featuredProducts.length}+) <ArrowRight size={14} />
          </Link>
        </div>

        <ProductGrid products={featuredProducts} loading={loading} onQuickView={(p) => setQuickViewProduct(p)} />
      </section>

      {/* Promotional Banners */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-3xl p-8 border border-slate-800 flex flex-col justify-between min-h-[220px]">
          <div>
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Next-Gen Audio</span>
            <h3 className="text-2xl font-black mt-1">Noise-Canceling Headphones</h3>
            <p className="text-xs text-slate-300 mt-2">Up to 40 hours wireless playtime with studio Hi-Res drivers.</p>
          </div>
          <Link to="/products?category=electronics" className="pt-4">
            <Button size="sm" variant="secondary">Shop Audio Gear</Button>
          </Link>
        </div>

        <div className="bg-gradient-to-r from-teal-900 to-emerald-950 text-white rounded-3xl p-8 border border-emerald-800 flex flex-col justify-between min-h-[220px]">
          <div>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Smart Fitness</span>
            <h3 className="text-2xl font-black mt-1">Pulse Pro Smartwatches</h3>
            <p className="text-xs text-slate-300 mt-2">Track heart rate, SpO2, and GPS workout routines daily.</p>
          </div>
          <Link to="/products?category=smartwatch" className="pt-4">
            <Button size="sm">Explore Wearables</Button>
          </Link>
        </div>
      </section>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <Modal
          isOpen={!!quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
          title={quickViewProduct.name}
          maxWidth="max-w-3xl"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ProductImageGallery
              images={quickViewProduct.images}
              mainImage={quickViewProduct.image}
              title={quickViewProduct.name}
              category={quickViewProduct.category}
            />

            <div className="space-y-4">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                {quickViewProduct.categoryName || quickViewProduct.category}
              </span>
              <h2 className="text-xl font-black text-slate-900">{quickViewProduct.name}</h2>

              <div className="flex items-center gap-3">
                <span className="text-2xl font-black text-slate-900">${quickViewProduct.price.toFixed(2)}</span>
                {quickViewProduct.oldPrice && (
                  <span className="text-sm text-slate-400 line-through">${quickViewProduct.oldPrice.toFixed(2)}</span>
                )}
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">{quickViewProduct.description}</p>

              <div className="pt-4 border-t border-slate-100 flex gap-3">
                <Button
                  onClick={() => {
                    addToCart(quickViewProduct, 1);
                    setQuickViewProduct(null);
                  }}
                  className="w-full"
                >
                  Add to Cart
                </Button>
                <Link to={`/products/${quickViewProduct.id}`} onClick={() => setQuickViewProduct(null)}>
                  <Button variant="outline">View Details</Button>
                </Link>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Home;

