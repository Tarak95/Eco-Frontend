import React, { useState, useEffect } from 'react';
import axios from 'axios';
import UserTable from '../../components/admin/UserTable';
import Loader from '../../components/common/Loader';
import { Users, Search, Trash2, UserCheck } from 'lucide-react';
import { API_URL } from '../../config';
import { userApi } from '../../api/userApi';
import { getErrorMessage } from '../../utils/errors';

export const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('active'); // 'active' or 'deleted'
  const [searchInput, setSearchInput] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // ১. ব্যাকএন্ড থেকে ডেটা আনার মূল ফাংশন
  const fetchUsers = async (searchQuery = '') => {
    setLoading(true);
    setErrorMessage('');
    try {
      let res;
      // যদি সার্চ ইনপুটে কোনো লেখা থাকে, ব্যাকএন্ড সার্চ API-তে রিকোয়েস্ট যাবে
      if (searchQuery.trim()) {
        res = await axios.post(`${API_URL}/search`, {
          name: searchQuery.trim(),
          isDelete: activeTab === 'deleted'
        });
      } else {
        // সার্চ খালি থাকলে একটিভ/ডিলিটেড ট্যাবের সব ইউজার আসবে
        const endpoint = activeTab === 'active' 
          ? `${API_URL}/allusers` 
          : `${API_URL}/deletedusers`;
        res = await axios.get(endpoint);
      }

      let data = res.data?.userData || (Array.isArray(res.data) ? res.data : []);
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
      setErrorMessage(getErrorMessage(err, 'Failed to load users from server.'));
    } finally {
      setLoading(false);
    }
  };

  // ট্যাব পরিবর্তন হলে বা পেজ প্রথম লোড হলে ব্যাকএন্ড থেকে নতুন ডেটা আসবে
  useEffect(() => {
    setSearchInput('');
    fetchUsers('');
  }, [activeTab]);

  // Soft Delete User
  const handleDeleteUser = async (id) => {
    if (!id) return;
    try {
      await axios.delete(`${API_URL}/deleteuser/${id}`);
      fetchUsers(searchInput); // বর্তমান সার্চ স্টেট ধরে রেখেই রিফ্রেশ হবে
    } catch (err) {
      console.error('Error deleting user:', err);
      setErrorMessage(getErrorMessage(err, 'Failed to delete user.'));
    }
  };

  // Make / remove admin
  const handleChangeRole = async (usr, role) => {
    const id = usr?._id || usr?.id;
    if (!id) return;
    const question = role === 'admin'
      ? `Make ${usr.email} an admin?\n\nThey will be able to manage products, orders and users.`
      : `Remove admin rights from ${usr.email}?`;
    if (!window.confirm(question)) return;

    setErrorMessage('');
    setSuccessMessage('');
    try {
      const res = await userApi.setRole(id, role);
      setSuccessMessage(res.data?.message || 'Role updated.');
      fetchUsers(searchInput);
    } catch (err) {
      console.error('Error changing role:', err);
      setErrorMessage(getErrorMessage(err, 'Failed to change role.'));
    }
  };

  // Restore User
  const handleRestoreUser = async (id) => {
    if (!id) return;
    try {
      await axios.put(`${API_URL}/restoreuser/${id}`);
      fetchUsers(searchInput);
    } catch (err) {
      console.error('Error restoring user:', err);
      setErrorMessage(getErrorMessage(err, 'Failed to restore user.'));
    }
  };

  // ২. টাইপ করে পুরো মুছে ফেললে অটোমেটিক ব্যাকএন্ড থেকে আগের লিস্ট চলে আসবে
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);
    
    if (value.trim() === '') {
      fetchUsers('');
    }
  };

  // ৩. Enter চাপলে বা Search বাটনে ক্লিক করলে ব্যাকএন্ডে সার্চ রিকোয়েস্ট পাঠাবে
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers(searchInput);
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {activeTab === 'active' ? 'Users' : 'Deleted Users'}
          </h1>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 border ${
            activeTab === 'deleted' 
              ? 'bg-rose-100 text-rose-800 border-rose-200' 
              : 'bg-emerald-100 text-emerald-800 border-emerald-200'
          }`}>
            <Users size={14} /> Total: {users.length}
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          {activeTab === 'active' ? 'View registered customers and permissions' : 'View soft-deleted user accounts'}
        </p>
      </div>

      {/* Search Form + Tab Buttons */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search Bar */}
        <form 
          onSubmit={handleSearchSubmit} 
          className="flex items-center bg-white border border-slate-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 transition-all w-full md:w-96 shadow-xs"
        >
          <div className="pl-3 text-slate-400">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchInput}
            onChange={handleSearchChange}
            className="w-full px-3 py-2 text-xs font-medium bg-transparent focus:outline-none text-slate-800"
          />
          <button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 transition-colors flex items-center gap-1 cursor-pointer"
          >
            Search
          </button>
        </form>

        {/* Users & Deleted Users Tabs */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => setActiveTab('active')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'active'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <UserCheck size={16} /> Active Users
          </button>

          <button
            onClick={() => setActiveTab('deleted')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'deleted'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-200'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Trash2 size={16} /> Deleted Users
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs font-semibold">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-xs font-semibold">
          {errorMessage}
        </div>
      )}

      {/* User Table Component */}
      {loading ? (
        <Loader text="Searching database..." />
      ) : (
        <UserTable 
          users={users} 
          onDeleteUser={activeTab === 'active' ? handleDeleteUser : null}
          onRestoreUser={activeTab === 'deleted' ? handleRestoreUser : null}
          onChangeRole={activeTab === 'active' ? handleChangeRole : null}
          isDeletedView={activeTab === 'deleted'}
        />
      )}
    </div>
  );
};

export default ManageUsers;