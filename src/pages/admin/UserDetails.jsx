import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Shield,
  CheckCircle,
  XCircle,
  ShoppingBag,
  Calendar,
  Clock,
  Building,
  FileText
} from 'lucide-react';
import { userApi } from '../../api/userApi';
import { orderApi } from '../../api/orderApi';
import Loader from '../../components/common/Loader';

export const UserDetails = ({ userId: propUserId, onClose }) => {
  const { id: routeUserId } = useParams();
  const userId = propUserId || routeUserId;
  const navigate = useNavigate();

  const [userData, setUserData] = useState(null);
  const [userOrders, setUserOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!userId) {
          setError('User ID is missing');
          setLoading(false);
          return;
        }

        // 1. Fetch Single User Info
        let userObj = null;
        try {
          const res = await userApi.getUserById(userId);
          // Backend res.data.userData পাঠাচ্ছে
          userObj = res.data?.userData || res.data;
        } catch (err) {
          // Fallback search from all users list
          const allRes = await userApi.getUsers();
          const usersList = allRes.data?.userData || allRes.data || [];
          userObj = usersList.find(u => u.id === userId || u._id === userId);
        }

        if (!userObj) {
          setError('User details not found');
          setLoading(false);
          return;
        }

        setUserData(userObj);

        // 2. Fetch User's Orders
        try {
          const identifier = userObj._id || userObj.id;
          const ordersRes = await orderApi.getMyOrders(identifier);
          const rawOrders = ordersRes.data?.orders || ordersRes.data || [];
          setUserOrders(Array.isArray(rawOrders) ? rawOrders : []);
        } catch (oErr) {
          console.error('Error fetching user orders:', oErr);
        }

      } catch (err) {
        console.error('Error in UserDetails:', err);
        setError('Failed to load user information.');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [userId]);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[300px]">
        <Loader text="Loading user details..." />
      </div>
    );
  }

  if (error || !userData) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-4">
        <XCircle size={48} className="mx-auto text-rose-500" />
        <h2 className="text-xl font-bold text-slate-900">{error || 'User Not Found'}</h2>
        <p className="text-xs text-slate-500">The user you are looking for does not exist or has been removed.</p>
        <button
          onClick={() => onClose ? onClose() : navigate('/admin/users')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} /> Back to Users
        </button>
      </div>
    );
  }

  const billing = userData.billingAddress || {};

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onClose ? onClose() : navigate('/admin/users')}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            title="Go Back"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              User Profile & Details
            </h1>
            <p className="text-xs text-slate-500">System ID: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 font-mono">{userData._id || userData.id}</code></p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold capitalize ${userData.role === 'admin'
              ? 'bg-purple-100 text-purple-800 ring-1 ring-purple-300'
              : 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-300'
            }`}>
            {userData.role === 'admin' ? <Shield size={14} /> : <User size={14} />}
            {userData.role || 'Customer'}
          </span>

          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${userData.isVerified !== false ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}>
            {userData.isVerified !== false ? <CheckCircle size={13} /> : <Clock size={13} />}
            {userData.isVerified !== false ? 'Verified' : 'Unverified'}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Basic Information */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6 lg:col-span-1">
          <div className="text-center space-y-3 pb-6 border-b border-slate-100">
            <img
              src={userData.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80'}
              alt={userData.name}
              className="w-24 h-24 mx-auto rounded-full object-cover ring-4 ring-emerald-500/20 shadow-md"
            />
            <div>
              <h2 className="text-lg font-bold text-slate-900">{userData.name || 'User Name'}</h2>
              <p className="text-xs text-slate-500 font-medium">{userData.email || 'No email'}</p>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex items-start gap-3 text-slate-700">
              <Mail size={16} className="text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Email Address</span>
                <span className="font-semibold text-slate-900">{userData.email || 'N/A'}</span>
              </div>
            </div>

            <div className="flex items-start gap-3 text-slate-700">
              <Phone size={16} className="text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Phone Number</span>
                <span className="font-semibold text-slate-900">{userData.phone || 'Not Provided'}</span>
              </div>
            </div>

            <div className="flex items-start gap-3 text-slate-700">
              <MapPin size={16} className="text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Shipping Address</span>
                <span className="font-medium text-slate-900">{userData.address || 'Not Provided'}</span>
                {(userData.city || userData.postalCode) && (
                  <span className="block text-slate-500">{userData.city} {userData.postalCode}</span>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3 text-slate-700">
              <Calendar size={16} className="text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Registered On</span>
                <span className="font-medium text-slate-700">
                  {/* {userData.createdAt ? new Date(userData.createdAt).toLocaleDateString('en-US', { dateStyle: 'medium' }) : 'Standard Account'} */}
                  {userData.createdAt ? new Date(userData.createdAt).toLocaleString('en-US', {
                    dateStyle: 'medium',
                    timeStyle: 'short'
                  }) : 'Standard Account'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Billing Address Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Building size={16} className="text-emerald-600" />
              Billing Address Details
            </h3>

            {billing.fullName || billing.street || billing.email ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Full Name</span>
                  <span className="font-bold text-slate-800">{billing.fullName || userData.name}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Billing Email</span>
                  <span className="font-medium text-slate-800">{billing.email || userData.email}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Street Address</span>
                  <span className="font-medium text-slate-800">{billing.street || userData.address || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Zip Code / Phone</span>
                  <span className="font-medium text-slate-800">
                    {billing.zipCode || userData.postalCode || 'N/A'} / {billing.phoneNumber || userData.phone || 'N/A'}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No separate billing address recorded. Uses standard profile address.</p>
            )}
          </div>

          {/* User Orders History */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShoppingBag size={16} className="text-emerald-600" />
                Customer Order History ({userOrders.length})
              </h3>
            </div>

            {userOrders.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                <FileText size={32} className="mx-auto mb-2 opacity-40" />
                No purchase history found for this user.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto pr-1">
                {userOrders.map((ord) => (
                  <div key={ord._id || ord.id} className="py-3 flex items-center justify-between gap-4 text-xs hover:bg-slate-50 p-2 rounded-xl transition-colors">
                    <div>
                      <span className="font-bold text-slate-900 block">{ord._id || ord.id}</span>
                      <span className="text-[10px] text-slate-500">
                        {ord.createdAt ? new Date(ord.createdAt).toLocaleDateString() : 'Recent Order'} • {ord.items?.length || 1} Item(s)
                      </span>
                    </div>

                    <div className="text-right flex items-center gap-3">
                      <div>
                        <span className="font-bold text-slate-900 block">${Number(ord.totalAmount || ord.total || 0).toFixed(2)}</span>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${ord.status === 'Delivered' ? 'bg-emerald-100 text-emerald-800' :
                            ord.status === 'Cancelled' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                          {ord.status || 'Processing'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetails;