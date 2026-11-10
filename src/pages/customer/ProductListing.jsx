import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, Search, SlidersHorizontal, Grid, X } from 'lucide-react';
import ProductGrid from '../../components/product/ProductGrid';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import ProductImageGallery from '../../components/product/ProductImageGallery';
import Button from '../../components/common/Button';
import { productApi } from '../../api/productApi';
import { CATEGORIES } from '../../utils/constants';
import { useCart } from '../../hooks/useCart';

export const ProductListing = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') || 'all';
  const searchParam = searchParams.get('search') || '';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [searchTerm, setSearchTerm] = useState(searchParam);
  const [sortBy, setSortBy] = useState('newest');
  const [maxPrice, setMaxPrice] = useState(2000);
  const [currentPage, setCurrentPage] = useState(1);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const { addToCart } = useCart();
  const itemsPerPage = 12;

  useEffect(() => {
    setSelectedCategory(categoryParam);
  }, [categoryParam]);

  useEffect(() => {
    setSearchTerm(searchParam);
  }, [searchParam]);

  useEffect(() => {
    const fetchCatalog = async () => {
      setLoading(true);
      setLoadError('');
      try {
        const res = await productApi.getProducts({
          category: selectedCategory,
          search: searchTerm,
          maxPrice: maxPrice,
          sortBy: sortBy
        });
        setProducts(res.data || []);
        setCurrentPage(1);
      } catch (err) {
        setLoadError(err.message || 'Could not load products.');
        console.error('Error fetching catalog products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCatalog();
  }, [selectedCategory, searchTerm, sortBy, maxPrice]);

  const handleCategoryChange = (slug) => {
    setSelectedCategory(slug);
    if (slug === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', slug);
    }
    setSearchParams(searchParams);
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    if (val) {
      searchParams.set('search', val);
    } else {
      searchParams.delete('search');
    }
    setSearchParams(searchParams);
  };

  const totalPages = Math.ceil(products.length / itemsPerPage);
  const paginatedProducts = products.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black capitalize tracking-tight">
            {selectedCategory === 'all' ? 'All EcoBazar Products' : CATEGORIES.find(c => c.slug === selectedCategory)?.name || selectedCategory}
          </h1>
          <p className="text-xs text-slate-400 mt-1">Showing {products.length} products available in store</p>
        </div>

        {/* Search Bar inside Page */}
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search products..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-800 border border-slate-700 text-white rounded-xl focus:outline-none focus:border-emerald-500 placeholder:text-slate-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filter - Desktop */}
        <div className="hidden lg:block space-y-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs h-fit">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Filter size={16} className="text-emerald-600" />
              Filter Products
            </h3>
            {(selectedCategory !== 'all' || searchTerm) && (
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchTerm('');
                  setSearchParams({});
                }}
                className="text-[11px] font-semibold text-rose-500 hover:underline"
              >
                Reset All
              </button>
            )}
          </div>

          {/* Categories Filter */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Categories</h4>
            <div className="space-y-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.slug)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center justify-between cursor-pointer ${
                    selectedCategory === cat.slug
                      ? 'bg-emerald-600 text-white font-bold'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span>{cat.name}</span>
                  <span className="text-[10px] opacity-75">({cat.count})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex justify-between text-xs font-bold text-slate-800 mb-2">
              <span>Max Price:</span>
              <span className="text-emerald-600">${maxPrice}</span>
            </div>
            <input
              type="range"
              min="20"
              max="2000"
              step="50"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
          </div>
        </div>

        {/* Main Product Section */}
        <div className="lg:col-span-3 space-y-6">
          {/* Controls Bar */}
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200">
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-2 text-xs font-bold text-slate-800 p-2 border border-slate-200 rounded-xl"
            >
              <SlidersHorizontal size={16} /> Filters
            </button>

            <div className="text-xs font-medium text-slate-500">
              Showing <span className="font-bold text-slate-900">{paginatedProducts.length}</span> of {products.length}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className="text-slate-500 hidden sm:inline">Sort By:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="p-2 border border-slate-200 rounded-xl bg-white text-slate-900 font-bold focus:outline-none focus:border-emerald-500 text-xs"
              >
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>

          {loadError && (
            <div role="alert" className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-sm font-semibold text-rose-700">
              Products load kora jayni: {loadError}
            </div>
          )}

          {/* Product Grid */}
          <ProductGrid
            products={paginatedProducts}
            loading={loading}
            onQuickView={(p) => setQuickViewProduct(p)}
          />

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      </div>

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
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Mobile Filter Modal */}
      {mobileFilterOpen && (
        <Modal isOpen={mobileFilterOpen} onClose={() => setMobileFilterOpen(false)} title="Filter Products">
          <div className="space-y-6">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Categories</h4>
              <div className="space-y-1.5">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      handleCategoryChange(cat.slug);
                      setMobileFilterOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold ${
                      selectedCategory === cat.slug ? 'bg-emerald-600 text-white' : 'text-slate-700 bg-slate-50'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ProductListing;
