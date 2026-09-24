import { useEffect, useState } from 'react';
import api, { errMsg } from '../../utils/api';
import { ErrorBox, Spinner } from '../../components/ui';
import { StatusPill } from '../MyBookings';
import { inr, METHOD_LABEL, fmtDate } from '../../utils/format';

export default function Dashboard() {
  const [s, setS] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => { api.get('/admin/stats').then((r) => setS(r.data)).catch((e) => setError(errMsg(e))); }, []);
  if (!s) return error ? <ErrorBox>{error}</ErrorBox> : <Spinner />;

  const cards = [['Total bookings', s.bookings], ['Revenue (paid online)', inr(s.revenue)], ['Customers', s.users], ['Hotels', s.hotels], ['Event venues', s.venues], ['Reviews', s.reviews]];
  const maxStatus = Math.max(1, ...s.byStatus.map((x) => x.count));
  return (
    <div>
      <h1 className="text-2xl font-extrabold">Dashboard</h1>
      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-3">{cards.map(([k, v]) => <div key={k} className="card p-4"><p className="text-sm text-gray-500">{k}</p><p className="mt-1 text-2xl font-extrabold">{v}</p></div>)}</div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="card p-4"><h2 className="font-extrabold">Bookings by status</h2>
          <div className="mt-3 space-y-3">{s.byStatus.length === 0 && <p className="text-sm text-gray-500">No bookings yet.</p>}{s.byStatus.map((x) => (
            <div key={x._id}><div className="flex justify-between text-sm"><span>{x._id}</span><b>{x.count}</b></div><div className="mt-1 h-2 rounded bg-gray-100"><div className={`h-2 rounded ${x._id === 'Confirmed' ? 'bg-good' : x._id === 'Cancelled' ? 'bg-red-500' : 'bg-sun'}`} style={{ width: `${(x.count / maxStatus) * 100}%` }} /></div></div>))}</div></div>
        <div className="card p-4"><h2 className="font-extrabold">Payments by method</h2>
          <table className="table-x mt-3"><tbody>{s.byMethod.length === 0 && <tr><td className="text-gray-500">No payments yet.</td></tr>}{s.byMethod.map((x) => <tr key={x._id}><td>{METHOD_LABEL[x._id]}</td><td>{x.count} bookings</td><td className="text-right font-bold">{inr(x.amount)}</td></tr>)}</tbody></table></div>
      </div>
      <div className="card mt-6 overflow-x-auto p-4"><h2 className="font-extrabold">Recent bookings</h2>
        <table className="table-x mt-3 min-w-[560px]"><thead><tr><th>Code</th><th>Customer</th><th>Item</th><th>Date</th><th>Amount</th><th>Status</th></tr></thead>
          <tbody>{s.recent.map((b) => <tr key={b._id}><td className="font-mono text-xs">{b.bookingCode}</td><td>{b.user?.name}</td><td>{(b.hotel || b.venue)?.name}</td><td>{fmtDate(b.createdAt)}</td><td>{inr(b.amount)}</td><td><StatusPill s={b.status} /></td></tr>)}</tbody></table></div>
    </div>
  );
}
