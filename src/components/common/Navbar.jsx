import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  ShoppingBag, 
  Search, 
  ShoppingCart, 
  User, 
  Menu, 
  X, 
  ChevronDown, 
  LogOut, 
  LayoutDashboard, 
  Package, 
  Heart,
  Grid,
  Smartphone,
  Watch,
  Activity,
  Shirt,
  BookOpen,
  Sparkles,
  Tv,
  Headphones
} from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { CATEGORIES } from '../../utils/constants';
import { getStoredUser, clearSession } from '../../utils/storage';

const categoryIcons = {
  all: Grid,
  smartphone: Smartphone,
  smartwatch: Watch,
  sports: Activity,
  fashion: Shirt,
  books: BookOpen,
  cosmetics: Sparkles,
  electronics: Tv,
  accessories: Headphones
};

export const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);

  // Loading user data from LocalStorage
  const [user, setUser] = useState(() => {
    return getStoredUser();
  });

  useEffect(() => {
    const handleAuthChange = () => {
      setUser(getStoredUser());
    };

    window.addEventListener('authChange', handleAuthChange);
    return () => window.removeEventListener('authChange', handleAuthChange);
  }, []);

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';

  const { cartCount, cartTotal } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  // Logout
  const handleLogout = () => {
    clearSession();
    window.dispatchEvent(new Event('authChange'));
    setAccountDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      {/* Top Banner */}
      <div className="bg-slate-900 text-slate-200 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <p className="hidden sm:block"> Eco-Friendly Deals: Free Delivery on Orders Over $50!</p>
          <p className="sm:hidden text-center w-full font-medium"> Free Delivery Over $50!</p>
          <div className="hidden sm:flex items-center gap-4 text-slate-300">
            <span>24/7 Support: +1 (800) 555-ECOB</span>
            {isAdmin && (
              <Link to="/admin" className="text-emerald-400 hover:underline font-semibold flex items-center gap-1">
                <LayoutDashboard size={13} />
                Admin Panel
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-md">
              <ShoppingBag size={22} />
            </div>
            <span className="text-2xl font-black tracking-tight text-slate-900">
              Eco<span className="text-emerald-600">Bazar</span>
            </span>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-xl mx-4">
            <form onSubmit={handleSearchSubmit} className="relative w-full flex items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products across All Categories, Smartphones, Smartwatches..."
                className="w-full pl-4 pr-12 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all placeholder:text-slate-400"
              />
              <button
                type="submit"
                className="absolute right-1.5 p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors cursor-pointer"
              >
                <Search size={16} />
              </button>
            </form>
          </div>

          {/* Action Buttons: Cart & Account */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Cart Part */}
            <Link
              to="/cart"
              className="relative flex items-center gap-2.5 p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <div className="relative">
                <ShoppingCart size={22} />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-emerald-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                    {cartCount}
                  </span>
                )}
              </div>
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">My Cart</span>
                <span className="text-xs font-bold text-slate-900">${cartTotal.toFixed(2)}</span>
              </div>
            </Link>

            {/* Account Part */}
            <div className="relative">
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer border border-transparent hover:border-slate-200"
                  >
                    <img
                      src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                      alt={user?.name || 'User Profile'}
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-emerald-500/30"
                    />
                    <div className="hidden lg:flex flex-col text-left">
                      <span className="text-xs font-bold text-slate-900 line-clamp-1">{user?.name}</span>
                      <span className="text-[10px] text-emerald-600 font-semibold capitalize">{user?.role}</span>
                    </div>
                    <ChevronDown size={14} className="text-slate-400 hidden sm:block" />
                  </button>

                  {/* Account Dropdown */}
                  {accountDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs font-bold text-slate-900">{user?.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                      </div>

                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setAccountDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 transition-colors"
                        >
                          <LayoutDashboard size={16} />
                          Admin Dashboard
                        </Link>
                      )}

                      <Link
                        to="/profile"
                        onClick={() => setAccountDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <User size={16} />
                        My Profile
                      </Link>

                      <Link
                        to="/my-orders"
                        onClick={() => setAccountDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <Package size={16} />
                        My Orders
                      </Link>

                      <div className="border-t border-slate-100 my-1"></div>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer text-left"
                      >
                        <LogOut size={16} />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-2">
                  <Link
                    to="/login"
                    className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-emerald-600 transition-colors"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/register"
                    className="px-3.5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition-all"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 hover:bg-slate-100 rounded-xl md:hidden cursor-pointer"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Search Input */}
        <div className="mt-3 md:hidden">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-3.5 pr-10 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-500"
            />
            <button type="submit" className="absolute right-2 top-2 text-slate-400">
              <Search size={16} />
            </button>
          </form>
        </div>
      </div>

      {/* Categories Navigation Bar (Desktop & Tablet) */}
      <nav className="bg-slate-50 border-t border-slate-200 overflow-x-auto scrollbar-none hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 py-1">
          {CATEGORIES.map((cat) => {
            const IconComponent = categoryIcons[cat.id] || Grid;
            const isActive = location.pathname === '/products' && (
              location.search.includes(`category=${cat.slug}`) || 
              (cat.slug === 'all' && !location.search.includes('category='))
            );

            return (
              <Link
                key={cat.id}
                to={cat.slug === 'all' ? '/products' : `/products?category=${cat.slug}`}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-slate-200/60 hover:text-emerald-700'
                }`}
              >
                <IconComponent size={15} />
                <span>{cat.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-200 px-4 pt-3 pb-6 space-y-4">
          <div className="font-bold text-xs uppercase text-slate-400 tracking-wider mb-2">Categories</div>
          <div className="grid grid-cols-2 gap-2">
            {CATEGORIES.map((cat) => {
              const IconComponent = categoryIcons[cat.id] || Grid;
              return (
                <Link
                  key={cat.id}
                  to={cat.slug === 'all' ? '/products' : `/products?category=${cat.slug}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 text-xs font-semibold text-slate-800 transition-colors border border-slate-100"
                >
                  <IconComponent size={16} className="text-emerald-600" />
                  <span>{cat.name}</span>
                </Link>
              );
            })}
          </div>

          <div className="border-t border-slate-100 pt-3">
            {isAuthenticated ? (
              <div className="space-y-2">
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 p-2 text-xs font-semibold text-slate-700 hover:text-emerald-600"
                >
                  <User size={16} />
                  My Profile
                </Link>
                <Link
                  to="/my-orders"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 p-2 text-xs font-semibold text-slate-700 hover:text-emerald-600"
                >
                  <Package size={16} />
                  My Orders
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 p-2 text-xs font-semibold text-emerald-600"
                  >
                    <LayoutDashboard size={16} />
                    Admin Panel
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 p-2 text-xs font-semibold text-rose-600 text-left cursor-pointer"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-semibold"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;