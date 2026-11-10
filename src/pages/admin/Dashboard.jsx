import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign, ShoppingBag, Users, Package, Plus, UploadCloud, ArrowUpRight, ArrowDownRight,
  AlertTriangle, RefreshCw, Trophy, Boxes,
} from 'lucide-react';
import Loader from '../../components/common/Loader';
import { adminApi } from '../../api/adminApi';
import { useAuth } from '../../hooks/useAuth';

const money = (n) => `$${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const shortMoney = (n) => (n >= 1000 ? `$${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : `$${Math.round(n)}`);

const STATUS_STYLE = {
  Processing: { bar: 'bg-amber-400', badge: 'bg-amber-100 text-amber-800' },
  Shipped: { bar: 'bg-blue-500', badge: 'bg-blue-100 text-blue-800' },
  Delivered: { bar: 'bg-emerald-500', badge: 'bg-emerald-100 text-emerald-800' },
  Cancelled: { bar: 'bg-rose-400', badge: 'bg-rose-100 text-rose-800' },
};

const Trend = ({ now, before }) => {
  if (!before && !now) return <span className="text-[11px] text-slate-400">No data yet</span>;
  if (!before) return <span className="text-[11px] font-bold text-emerald-600">New</span>;
  const pct = ((now - before) / before) * 100;
  const up = pct >= 0;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span className={`inline-flex items-center gap-0.5 text-[11px] font-bold ${up ? 'text-emerald-600' : 'text-rose-600'}`}>
      <Icon size={13} /> {Math.abs(pct).toFixed(0)}% <span className="font-medium text-slate-400">vs previous</span>
    </span>
  );
};

// Daily revenue bars (plain SVG, no chart library needed)
const SalesChart = ({ series }) => {
  const W = 640, H = 220, padL = 44, padB = 26, padT = 10;
  const max = Math.max(...series.map((d) => d.revenue), 1);
  const nice = Math.pow(10, Math.floor(Math.log10(max)));
  const top = Math.ceil(max / nice) * nice;
  const bw = (W - padL) / series.length;
  const ticks = [0, 0.5, 1].map((t) => top * t);
  const every = Math.ceil(series.length / 7);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="Daily revenue">
      {ticks.map((t) => {
        const y = padT + (H - padT - padB) * (1 - t / top);
        return (
          <g key={t}>
            <line x1={padL} x2={W} y1={y} y2={y} stroke="#e2e8f0" strokeDasharray="3 4" />
            <text x={padL - 6} y={y + 3} textAnchor="end" fontSize="10" fill="#94a3b8">{shortMoney(t)}</text>
          </g>
        );
      })}
      {series.map((d, i) => {
        const h = (H - padT - padB) * (d.revenue / top);
        const x = padL + i * bw + bw * 0.18;
        return (
          <g key={d.date}>
            <rect x={x} y={H - padB - h} width={bw * 0.64} height={Math.max(h, d.revenue > 0 ? 2 : 0)} rx="3" fill="#10b981">
              <title>{`${d.date}: ${money(d.revenue)} · ${d.orders} order(s)`}</title>
            </rect>
            {i % every === 0 && (
              <text x={x + bw * 0.32} y={H - 8} textAnchor="middle" fontSize="10" fill="#94a3b8">{d.date.slice(5)}</text>
            )}
          </g>
        );
      })}
    </svg>
  );
};

const Card = ({ title, action, children, className = '' }) => (
  <section className={`bg-white p-5 rounded-2xl border border-slate-200 shadow-xs ${className}`}>
    <div className="flex items-center justify-between mb-3">
      <h3 className="font-black text-sm text-slate-900">{title}</h3>
      {action}
    </div>
    {children}
  </section>
);

const Thumb = ({ src, alt }) =>
  src ? <img src={src} alt={alt} className="w-9 h-9 rounded-lg object-cover bg-slate-100 shrink-0" /> : (
    <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-300 flex items-center justify-center shrink-0"><Package size={16} /></div>
  );

export const Dashboard = () => {
  const { user } = useAuth() || {};
  const [days, setDays] = useState(14);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setData(await adminApi.getStats(days));
    } catch (err) {
      setError(err?.response?.data?.message || (err?.request && !err?.response ? 'Cannot reach the server. Is the backend running?' : err.message) || 'Could not load the dashboard.');
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => { load(); }, [load]);

  if (loading && !data) return <Loader text="Loading dashboard..." />;

  if (error && !data) {
    return (
      <div className="max-w-md mx-auto mt-16 bg-white rounded-2xl border border-rose-200 p-6 text-center space-y-3">
        <AlertTriangle className="mx-auto text-rose-500" size={30} />
        <p className="text-sm font-semibold text-slate-800">{error}</p>
        <button onClick={load} className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl cursor-pointer">Try again</button>
      </div>
    );
  }

  const { totals, period, series, orderStatus, topProducts, categories, lowStockProducts, recentOrders } = data;
  const statusTotal = Object.values(orderStatus).reduce((a, b) => a + b, 0);
  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const firstName = String(user?.name || 'Admin').split(' ')[0];
  const catMax = Math.max(...categories.map((c) => c.count), 1);

  const kpis = [
    { label: 'Revenue', value: money(period.revenue), sub: <Trend now={period.revenue} before={period.prevRevenue} />, note: `All time ${money(totals.revenue)}`, icon: DollarSign, tint: 'bg-emerald-50 text-emerald-600' },
    { label: 'Orders', value: period.orders, sub: <Trend now={period.orders} before={period.prevOrders} />, note: `All time ${totals.orders}`, icon: ShoppingBag, tint: 'bg-blue-50 text-blue-600' },
    { label: 'Customers', value: totals.customers, sub: <span className="text-[11px] font-bold text-emerald-600">+{period.newCustomers} new</span>, note: `in last ${days} days`, icon: Users, tint: 'bg-violet-50 text-violet-600' },
    { label: 'Products', value: totals.products, sub: <span className="text-[11px] font-bold text-slate-500">{totals.activeProducts} active</span>, note: `${totals.inactiveProducts} hidden / draft`, icon: Package, tint: 'bg-amber-50 text-amber-600' },
  ];

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">{greet}, {firstName} 👋</h1>
          <p className="text-xs text-slate-500">Here is how your store is doing.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="text-xs font-semibold bg-white border border-slate-200 rounded-xl px-3 py-2.5 cursor-pointer focus:outline-none focus:border-emerald-500"
          >
            <option value={7}>Last 7 days</option>
            <option value={14}>Last 14 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          <button onClick={load} title="Refresh" className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-emerald-600 cursor-pointer">
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
          <Link to="/admin/products/bulk" className="px-4 py-2.5 bg-white border border-slate-200 hover:border-emerald-500 text-slate-800 font-bold text-xs rounded-xl flex items-center gap-2">
            <UploadCloud size={15} /> Bulk Upload
          </Link>
          <Link to="/admin/products/create" className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-sm">
            <Plus size={15} /> Add Product
          </Link>
        </div>
      </div>

      {error && <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-800">{error}</div>}

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{k.label}</span>
                  <div className="text-2xl font-black text-slate-900 mt-1">{k.value}</div>
                </div>
                <div className={`p-2.5 rounded-xl ${k.tint}`}><Icon size={20} /></div>
              </div>
              <div className="mt-3 flex items-center justify-between gap-2">
                {k.sub}
                <span className="text-[11px] text-slate-400 text-right">{k.note}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Alerts */}
      {(totals.outOfStock > 0 || totals.lowStock > 0) && (
        <Link to="/admin/products" className="flex items-center gap-3 p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-900 hover:bg-amber-100/70">
          <AlertTriangle size={18} className="text-amber-600 shrink-0" />
          <span>
            {totals.outOfStock > 0 && <b>{totals.outOfStock} product(s) out of stock</b>}
            {totals.outOfStock > 0 && totals.lowStock > 0 && ' · '}
            {totals.lowStock > 0 && <b>{totals.lowStock} running low</b>}
            {' '}— restock soon.
          </span>
        </Link>
      )}

      {/* Sales + order status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title={`Sales — last ${days} days`} className="lg:col-span-2" action={<span className="text-xs font-bold text-slate-500">{money(period.revenue)}</span>}>
          <SalesChart series={series} />
        </Card>

        <Card title="Order status">
          {statusTotal === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center">No orders yet.</p>
          ) : (
            <div className="space-y-4">
              <div className="flex h-3 rounded-full overflow-hidden bg-slate-100">
                {Object.keys(STATUS_STYLE).map((s) => (
                  <div key={s} className={STATUS_STYLE[s].bar} style={{ width: `${((orderStatus[s] || 0) / statusTotal) * 100}%` }} title={s} />
                ))}
              </div>
              <ul className="space-y-2.5">
                {Object.keys(STATUS_STYLE).map((s) => (
                  <li key={s} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 font-semibold text-slate-700"><i className={`w-2.5 h-2.5 rounded-full ${STATUS_STYLE[s].bar}`} />{s}</span>
                    <span className="font-black text-slate-900">{orderStatus[s] || 0}</span>
                  </li>
                ))}
              </ul>
              <Link to="/admin/orders" className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1">Manage orders <ArrowUpRight size={13} /></Link>
            </div>
          )}
        </Card>
      </div>

      {/* Recent orders + top products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card
          title="Recent orders"
          className="lg:col-span-2"
          action={<Link to="/admin/orders" className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1">View all <ArrowUpRight size={13} /></Link>}
        >
          {recentOrders.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No orders yet.</p>
          ) : (
            <div className="overflow-x-auto -mx-1">
              <table className="w-full text-left text-xs">
                <thead className="text-slate-400 uppercase tracking-wider text-[10px]">
                  <tr><th className="px-1 py-2">Order</th><th className="px-1 py-2">Customer</th><th className="px-1 py-2">Total</th><th className="px-1 py-2">Status</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentOrders.map((o) => (
                    <tr key={o._id}>
                      <td className="px-1 py-2.5">
                        <span className="font-mono font-bold text-slate-900 block">{o.tranid || String(o._id).slice(-8)}</span>
                        <span className="text-[10px] text-slate-400">{o.createdAt ? new Date(o.createdAt).toLocaleDateString() : ''}</span>
                      </td>
                      <td className="px-1 py-2.5 text-slate-700">{o.user?.name || o.customer?.name || 'Customer'}<span className="text-slate-400"> · {o.products?.length || 0} item(s)</span></td>
                      <td className="px-1 py-2.5 font-black text-slate-900">{money(o.totalPrice)}</td>
                      <td className="px-1 py-2.5"><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${(STATUS_STYLE[o.status] || STATUS_STYLE.Processing).badge}`}>{o.status || 'Processing'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card title="Top selling products" action={<Trophy size={16} className="text-amber-500" />}>
          {topProducts.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">Sales will appear here.</p>
          ) : (
            <ol className="space-y-3">
              {topProducts.map((p, i) => (
                <li key={p.id || i} className="flex items-center gap-3">
                  <span className="w-5 text-xs font-black text-slate-300">{i + 1}</span>
                  <Thumb src={p.image} alt={p.title} />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 truncate">{p.title}</p>
                    <p className="text-[10px] text-slate-400">{p.sold} sold</p>
                  </div>
                  <span className="text-xs font-black text-slate-800">{money(p.revenue)}</span>
                </li>
              ))}
            </ol>
          )}
        </Card>
      </div>

      {/* Low stock + categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Low stock" action={<Boxes size={16} className="text-amber-500" />}>
          {lowStockProducts.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">All products are well stocked. 🎉</p>
          ) : (
            <ul className="space-y-2.5">
              {lowStockProducts.map((p) => (
                <li key={p._id} className="flex items-center gap-3">
                  <Thumb src={p.image} alt={p.title} />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 truncate">{p.title}</p>
                    <p className="text-[10px] text-slate-400 capitalize">{p.categoryName || p.category}</p>
                  </div>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${p.stock === 0 ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-800'}`}>
                    {p.stock === 0 ? 'Out of stock' : `${p.stock} left`}
                  </span>
                  <Link to={`/admin/products/edit/${p._id}`} className="text-[11px] font-bold text-emerald-600 hover:underline">Restock</Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Products by category">
          {categories.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No active products yet.</p>
          ) : (
            <ul className="space-y-3">
              {categories.map((c) => (
                <li key={c.name} className="text-xs">
                  <div className="flex justify-between font-semibold text-slate-700 mb-1"><span>{c.name}</span><span className="font-black text-slate-900">{c.count}</span></div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${(c.count / catMax) * 100}%` }} /></div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
