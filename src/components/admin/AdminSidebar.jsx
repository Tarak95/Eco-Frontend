import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  PlusCircle, 
  UploadCloud,
  Users, 
  ShoppingBag, 
  ArrowLeft,
  ShoppingBasket,
  X,
  User
} from 'lucide-react';

export const AdminSidebar = ({ isMobileOpen, setIsMobileOpen }) => {
  const location = useLocation();

  const navItems = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'Orders', path: '/admin/orders', icon: ShoppingBag, section: 'Sales' },
    { label: 'All Products', path: '/admin/products', icon: Package, section: 'Catalog' },
    { label: 'Add Product', path: '/admin/products/create', icon: PlusCircle },
    { label: 'Bulk Upload', path: '/admin/products/bulk', icon: UploadCloud },
    { label: 'Customers', path: '/admin/users', icon: Users, section: 'People' },
    { label: 'My Profile', path: '/admin/profile', icon: User },
  ];

  const handleClose = () => {
    if (setIsMobileOpen) setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          onClick={handleClose}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Drawer - fixed positioned for mobile, relative sticky/full height for desktop */}
      <aside
        className={`fixed lg:sticky top-0 h-screen z-50 w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 transition-transform duration-300 ease-in-out shrink-0 ${
          isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between shrink-0">
          <Link to="/" onClick={handleClose} className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-md">
              <ShoppingBasket size={20} />
            </div>
            <div>
              <span className="text-xl font-black text-white tracking-tight">EcoBazar</span>
              <span className="block text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Control Panel</span>
            </div>
          </Link>

          {/* Close button for mobile */}
          <button
            onClick={handleClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 lg:hidden cursor-pointer"
            title="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path === '/admin/users' && location.pathname.startsWith('/admin/users/')) || (item.path === '/admin/products' && location.pathname.startsWith('/admin/products/edit'));

            return (
              <React.Fragment key={item.path}>
              {item.section && (
                <div className="text-[10px] font-bold uppercase text-slate-500 tracking-wider px-3 pt-3 pb-1">{item.section}</div>
              )}
              <Link
                to={item.path}
                onClick={handleClose}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
              </React.Fragment>
            );
          })}
        </nav>

        {/* Back to store */}
        <div className="p-4 border-t border-slate-800 shrink-0">
          <Link
            to="/"
            onClick={handleClose}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Back to Storefront</span>
          </Link>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;