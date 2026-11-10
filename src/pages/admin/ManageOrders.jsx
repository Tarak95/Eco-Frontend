import React, { useState, useEffect } from 'react';
import OrderTable from '../../components/admin/OrderTable';
import Loader from '../../components/common/Loader';
import { orderApi } from '../../api/orderApi';

export const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await orderApi.getAllOrders();
      setOrders(res.data || []);
    } catch (err) {
      console.error('Error fetching admin orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await orderApi.updateOrderStatus(orderId, newStatus);
      fetchOrders();
    } catch (err) {
      console.error('Error updating order status:', err);
    }
  };

  if (loading) return <Loader text="Loading order log..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Manage Customer Orders</h1>
        <p className="text-xs text-slate-500">Track and update fulfillment status for store orders</p>
      </div>

      <OrderTable orders={orders} onUpdateStatus={handleUpdateStatus} />
    </div>
  );
};

export default ManageOrders;