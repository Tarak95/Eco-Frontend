import axios from 'axios';
import { API_URL } from '../config';
import { resolveImage } from '../utils/productMapper';

const BASE_URL = API_URL;

// Backend order -> the shape the customer pages use
export const normalizeOrder = (o = {}) => ({
  _id: o._id,
  id: o.tranid || o._id,
  tranid: o.tranid,
  status: o.status || 'Processing',
  paymentMethod: o.paymentMethod || 'Cash on Delivery',
  paymentStatus: o.paymentStatus || 'unpaid',
  subtotal: Number(o.subtotal ?? o.totalPrice ?? 0),
  shippingCost: Number(o.shippingCost || 0),
  totalAmount: Number(o.totalPrice || 0),
  createdAt: o.createdAt,
  shippingAddress: o.shippingAddress || {},
  items: (o.products || []).map((p, i) => ({
    id: p.productId || `${o._id}-${i}`,
    name: p.title,
    price: Number(p.price || 0),
    quantity: Number(p.quantity || 1),
    image: resolveImage(p.images?.[0]),
  })),
});

export const orderApi = {
  getAllOrders: async (userId = 'all') => {
    return await axios.get(`${BASE_URL}/getorders/${userId}`);
  },

  // logged-in user's orders (newest first)
  getMyOrders: async (userId) => {
    if (!userId) return { data: [] };
    const res = await axios.get(`${BASE_URL}/getorders/${userId}`);
    return { data: (res.data?.data || []).map(normalizeOrder) };
  },

  getOrderByTranId: async (tranId) => {
    const res = await axios.get(`${BASE_URL}/order/${encodeURIComponent(tranId)}`);
    return normalizeOrder(res.data?.data);
  },

  // -> { success, paymentUrl?, order }   (paymentUrl is set for online payments: send the browser there)
  createOrder: async (orderData) => {
    const res = await axios.post(`${BASE_URL}/payment`, orderData);
    return res.data;
  },

  updateOrderStatus: async (orderId, status) => {
    const res = await axios.put(`${BASE_URL}/order/${orderId}/status`, { status });
    return res.data;
  },
};

// readable message from an axios error
export const orderErrorMessage = (err) =>
  err?.response?.data?.message ||
  (err?.request ? 'Cannot reach the server. Please check your connection and try again.' : err?.message) ||
  'Something went wrong.';
