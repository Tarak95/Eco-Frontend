import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminNavbar from '../components/admin/AdminNavbar';

export const AdminLayout = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    
    <div className="flex h-screen bg-slate-100 font-sans antialiased overflow-hidden">
      <AdminSidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />
      
      
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <AdminNavbar onToggleMobileSidebar={() => setIsMobileOpen((prev) => !prev)} />
        <main className="flex-1 p-3 sm:p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;