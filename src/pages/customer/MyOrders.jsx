import React, { useState, useEffect } from 'react';
import { Package, Clock, CheckCircle2, ChevronRight, Eye } from 'lucide-react';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import { orderApi } from '../../api/orderApi';
import { useAuth } from '../../hooks/useAuth';

export const MyOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const res = await orderApi.getMyOrders(user?._id || user?.id);
        setOrders(res.data || []);
      } catch (err) {
        console.error('Error fetching user orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  if (loading) return <Loader text="Loading order history..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">My Orders</h1>
        <p className="text-xs text-slate-500">Track and manage your order history</p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
          <Package size={40} className="mx-auto text-slate-300" />
          <h3 className="text-lg font-bold text-slate-800">No Orders Placed Yet</h3>
          <p className="text-xs text-slate-500">When you purchase items, your delivery updates will show here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((ord) => (
            <div key={ord.id} className="bg-white p-5 rounded-2xl border border-slate-200/80 hover:border-emerald-300 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-slate-900 text-sm">{ord.id}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    ord.status === 'Delivered' ? 'bg-emerald-100 text-emerald-800'
                      : ord.status === 'Cancelled' ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {ord.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Placed on {new Date(ord.createdAt).toLocaleDateString()} • {ord.items?.length || 1} item(s)
                </p>
              </div>

              <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-0 pt-3 sm:pt-0">
                <span className="text-base font-black text-slate-900">${ord.totalAmount?.toFixed(2)}</span>
                <button
                  onClick={() => setSelectedOrder(ord)}
                  className="px-3.5 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Eye size={14} /> Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <Modal
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          title={`Order ${selectedOrder.id}`}
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl space-y-1">
              <p><strong className="text-slate-900">Status:</strong> {selectedOrder.status}</p>
              <p><strong className="text-slate-900">Payment:</strong> {selectedOrder.paymentMethod} ({selectedOrder.paymentStatus})</p>
              <p><strong className="text-slate-900">Delivery Address:</strong> {selectedOrder.shippingAddress?.street}, {selectedOrder.shippingAddress?.city}</p>
            </div>

            <h4 className="font-bold text-slate-900 uppercase">Items</h4>
            <div className="divide-y divide-slate-100">
              {selectedOrder.items?.map((item) => (
                <div key={item.id} className="py-2 flex justify-between items-center">
                  <span>{item.quantity}x {item.name}</span>
                  <span className="font-bold">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-100 pt-3 flex justify-between font-bold text-sm text-slate-900">
              <span>{selectedOrder.paymentStatus === 'paid' ? 'Total Paid:' : 'Total:'}</span>
              <span className="text-emerald-600">${selectedOrder.totalAmount?.toFixed(2)}</span>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default MyOrders;
