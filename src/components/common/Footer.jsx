import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, CreditCard, ShieldCheck, Truck, RefreshCw } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 border-t border-slate-800">
      {/* Value props */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 pb-12 border-b border-slate-800">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center md:text-left">
          <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/40">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <Truck size={24} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Free & Fast Shipping</h4>
              <p className="text-xs text-slate-400">On all orders over $50</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/40">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">100% Secure Payment</h4>
              <p className="text-xs text-slate-400">Guaranteed safe checkout</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/40">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <RefreshCw size={24} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">30 Days Return</h4>
              <p className="text-xs text-slate-400">Hassle-free replacement</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/40">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <Phone size={24} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">24/7 Dedicated Support</h4>
              <p className="text-xs text-slate-400">Instant expert customer service</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
        {/* Brand Info */}
        <div className="lg:col-span-2">
          <Link to="/" className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-lg">
              <ShoppingBag size={22} />
            </div>
            <span className="text-2xl font-black tracking-tight text-white">
              Eco<span className="text-emerald-400">Bazar</span>
            </span>
          </Link>
          <p className="text-sm text-slate-400 mb-6 max-w-sm leading-relaxed">
            Your trusted eco-conscious shopping destination for premium electronics, fashion, cosmetics, literature, smartphones, and active lifestyle essentials.
          </p>
          <div className="flex items-center gap-3">
            <a href="#" className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors">
              <Facebook size={18} />
            </a>
            <a href="#" className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors">
              <Twitter size={18} />
            </a>
            <a href="#" className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors">
              <Instagram size={18} />
            </a>
            <a href="#" className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors">
              <Linkedin size={18} />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Quick Links</h3>
          <ul className="space-y-2.5 text-sm">
            <li><Link to="/" className="hover:text-emerald-400 transition-colors">Home</Link></li>
            <li><Link to="/products" className="hover:text-emerald-400 transition-colors">All Products</Link></li>
            <li><Link to="/cart" className="hover:text-emerald-400 transition-colors">Shopping Cart</Link></li>
            <li><Link to="/my-orders" className="hover:text-emerald-400 transition-colors">Track Orders</Link></li>
            <li><Link to="/profile" className="hover:text-emerald-400 transition-colors">My Account</Link></li>
          </ul>
        </div>

        {/* Top Categories */}
        <div>
          <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Categories</h3>
          <ul className="space-y-2.5 text-sm">
            <li><Link to="/products?category=smartphone" className="hover:text-emerald-400 transition-colors">Smart phone</Link></li>
            <li><Link to="/products?category=smartwatch" className="hover:text-emerald-400 transition-colors">Smartwatch</Link></li>
            <li><Link to="/products?category=sports" className="hover:text-emerald-400 transition-colors">Sports & Fitness</Link></li>
            <li><Link to="/products?category=fashion" className="hover:text-emerald-400 transition-colors">Fashion & Apparel</Link></li>
            <li><Link to="/products?category=books" className="hover:text-emerald-400 transition-colors">Books & Literature</Link></li>
            <li><Link to="/products?category=cosmetics" className="hover:text-emerald-400 transition-colors">Cosmetics</Link></li>
            <li><Link to="/products?category=electronics" className="hover:text-emerald-400 transition-colors">Electronics</Link></li>
            <li><Link to="/products?category=accessories" className="hover:text-emerald-400 transition-colors">Accessories</Link></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Get in Touch</h3>
          <ul className="space-y-3 text-sm text-slate-400">
            <li className="flex items-start gap-3">
              <MapPin size={18} className="text-emerald-400 shrink-0 mt-0.5" />
              <span>100 Eco Tower, Suite 500, Tech District, USA</span>
            </li>
            <li className="flex items-center gap-3">
              <Phone size={18} className="text-emerald-400 shrink-0" />
              <span>+1 (800) 555-ECOB</span>
            </li>
            <li className="flex items-center gap-3">
              <Mail size={18} className="text-emerald-400 shrink-0" />
              <span>support@ecobazar.com</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <p>© 2026 EcoBazar Inc. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
          <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
          <span className="hover:text-slate-400 cursor-pointer">Cookie Preferences</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
