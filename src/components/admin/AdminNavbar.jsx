import React from 'react';
import { Menu } from 'lucide-react';

export const AdminNavbar = ({ onToggleMobileSidebar }) => {
  return (
    <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className="p-2 text-slate-600 rounded-lg hover:bg-slate-100 lg:hidden cursor-pointer"
          title="Toggle Menu"
        >
          <Menu size={20} />
        </button>
        <h2 className="text-sm font-bold text-slate-800">Control Panel</h2>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold text-slate-500">Admin</span>
      </div>
    </header>
  );
};

export default AdminNavbar;