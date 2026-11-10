import React, { useEffect, useState } from 'react';
import { Link, useSearchParams, Navigate } from 'react-router-dom';
import { CheckCircle2, Package, ArrowRight, Clock } from 'lucide-react';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import { orderApi } from '../../api/orderApi';
import { useCart } from '../../hooks/useCart';

export const OrderSuccess = () => {
  const [params] = useSearchParams();
  const tranId = params.get('tran_id');
  const { clearCart } = useCart();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(!!tranId);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!tranId) return;
    let cancelled = false;
    (async () => {
      try {
        const o = await orderApi.getOrderByTranId(tranId);
        if (cancelled) return;
        setOrder(o);
        // the order is final (COD) or the payment was verified by the server -> the cart can be emptied now
        if (o.paymentMethod === 'Cash on Delivery' || o.paymentStatus === 'paid') await clearCart();
      } catch (err) {
        if (!cancelled) setError('We could not load your order details, but your order was received. Check "My Orders" in a moment.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tranId]);

  // opening /order-success directly (no order) must not pretend an order was placed
  if (!tranId) return <Navigate to="/" replace />;
  if (loading) return <Loader text="Confirming your order..." />;

  const isCod = order?.paymentMethod === 'Cash on Delivery';
  const awaiting = order && !isCod && order.paymentStatus !== 'paid';

  return (
    <div className="max-w-2xl mx-auto my-12 bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 text-center space-y-6 shadow-xs">
      <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto ${awaiting ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
        {awaiting ? <Clock size={48} /> : <CheckCircle2 size={48} />}
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
          {awaiting ? 'Confirming Your Payment' : 'Order Placed Successfully!'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
          {error ||
            (awaiting
              ? 'We have not received the final payment confirmation yet. This page will not charge you twice; check My Orders in a few minutes.'
              : 'Thank you for shopping with EcoBazar. Your order has been logged and is currently being prepared.')}
        </p>
      </div>

      {order && (
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 max-w-sm mx-auto text-xs space-y-1 text-slate-700 font-mono text-left">
          <p className="font-bold text-slate-900 break-all">Order Reference: {order.id}</p>
          <p>Items: {order.items.length}</p>
          <p>{isCod ? 'Total to pay on delivery' : 'Total'}: ${order.totalAmount.toFixed(2)}</p>
          <p>Payment: {order.paymentMethod} ({order.paymentStatus})</p>
          <p className="text-emerald-600 font-bold">Status: {order.status}</p>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
        <Link to="/my-orders">
          <Button variant="outline">
            <Package size={18} /> View My Orders
          </Button>
        </Link>
        <Link to="/products">
          <Button>
            Continue Shopping <ArrowRight size={18} />
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default OrderSuccess;
