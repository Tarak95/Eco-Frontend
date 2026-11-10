import React from 'react';

export const OrderTable = ({ orders = [], onUpdateStatus }) => {
  const statusOptions = ['Processing', 'Shipped', 'Delivered', 'Cancelled'];

  const orderList = Array.isArray(orders)
    ? orders
    : Array.isArray(orders?.data)
    ? orders.data
    : Array.isArray(orders?.orders)
    ? orders.orders
    : [];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Delivered':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Shipped':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Cancelled':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden p-4 space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 uppercase font-bold tracking-wider border-b border-slate-200">
            <tr>
              <th className="p-3">Order ID</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Items</th>
              <th className="p-3">Total</th>
              <th className="p-3">Payment</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Update Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orderList.length > 0 ? (
              orderList.map((ord) => {
                const orderId = ord._id || ord.id || 'N/A';
                const customerName = ord.user?.name || ord.cus_name || 'Customer';
                const customerEmail = ord.user?.email || ord.cus_email || 'N/A';
                const totalAmount = Number(ord.totalPrice || ord.totalAmount || 0);
                const itemCount = ord.products?.length || ord.items?.length || 1;
                const paymentMethod = ord.paymentMethod || 'AamarPay';
                const currentStatus = ord.status || 'Processing';

                return (
                  <tr key={orderId} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-mono font-bold text-slate-900">{orderId}</td>
                    <td className="p-3">
                      <span className="font-bold text-slate-900 block">{customerName}</span>
                      <span className="text-[10px] text-slate-400">{customerEmail}</span>
                    </td>
                    <td className="p-3 font-semibold text-slate-700">
                      {itemCount} item(s)
                    </td>
                    <td className="p-3 font-black text-slate-900">
                      ${totalAmount.toFixed(2)}
                    </td>
                    <td className="p-3 text-slate-600">{paymentMethod}</td>
                    <td className="p-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(currentStatus)}`}>
                        {currentStatus}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <select
                        value={currentStatus}
                        onChange={(e) => onUpdateStatus && onUpdateStatus(orderId, e.target.value)}
                        className="p-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 font-semibold text-slate-800 cursor-pointer"
                      >
                        {statusOptions.map((st) => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" className="p-6 text-center text-slate-400 font-medium">
                  No orders available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderTable;