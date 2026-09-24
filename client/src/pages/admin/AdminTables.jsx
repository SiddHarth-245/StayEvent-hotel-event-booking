import { useEffect, useState } from 'react';
import api, { errMsg } from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { Empty, Spinner } from '../../components/ui';
import { StatusPill } from '../MyBookings';
import { fmtDate, fmtDateTime, inr, METHOD_LABEL } from '../../utils/format';

// Tiny hook: load a list from the API and expose reload()
function useList(url) {
  const [rows, setRows] = useState(null);
  const load = () => api.get(url).then((r) => setRows(r.data));
  useEffect(() => { load(); }, [url]);
  return [rows, load];
}
const Table = ({ title, children, head, empty, count }) => (
  <div><h1 className="text-2xl font-extrabold">{title} {count !== undefined && `(${count})`}</h1>
    {count === 0 ? <div className="mt-4"><Empty title={empty} /></div> : <div className="card mt-4 overflow-x-auto"><table className="table-x min-w-[720px]"><thead><tr>{head.map((h) => <th key={h}>{h}</th>)}</tr></thead><tbody>{children}</tbody></table></div>}</div>
);

export function AdminBookings() {
  const toast = useToast();
  const [status, setStatus] = useState('');
  const [rows, load] = useList(`/bookings${status ? `?status=${status}` : ''}`);
  const change = async (id, s) => { try { await api.put(`/bookings/${id}/status`, { status: s }); toast.success(`Marked ${s}`); load(); } catch (e) { toast.error(errMsg(e)); } };
  if (!rows) return <Spinner />;
  return (
    <div>
      <div className="mb-3 flex gap-2">{['', 'Pending', 'Confirmed', 'Cancelled'].map((s) => <button key={s} onClick={() => setStatus(s)} className={`rounded-full border px-3 py-1 text-sm font-semibold ${status === s ? 'border-link bg-link text-white' : 'hover:bg-mist'}`}>{s || 'All'}</button>)}</div>
      <Table title="Bookings" count={rows.length} empty="No bookings" head={['Code', 'Customer', 'Item', 'Dates', 'Amount', 'Payment', 'Status', 'Change']}>
        {rows.map((b) => (
          <tr key={b._id}><td className="font-mono text-xs">{b.bookingCode}</td><td>{b.user?.name}<br /><span className="text-xs text-gray-500">{b.contact?.phone}</span></td><td>{(b.hotel || b.venue)?.name}<br /><span className="text-xs text-gray-500">{b.type === 'hotel' ? `${b.rooms} × ${b.roomType}` : b.eventType}</span></td>
            <td className="whitespace-nowrap">{b.type === 'hotel' ? `${fmtDate(b.checkIn)} → ${fmtDate(b.checkOut)}` : fmtDate(b.eventDate)}</td><td>{inr(b.amount)}</td><td className="text-xs">{b.paymentStatus}</td><td><StatusPill s={b.status} /></td>
            <td><select className="input w-32 py-1" value={b.status} onChange={(e) => change(b._id, e.target.value)}>{['Pending', 'Confirmed', 'Cancelled'].map((s) => <option key={s}>{s}</option>)}</select></td></tr>))}
      </Table>
    </div>
  );
}

export function AdminPayments() {
  const [rows] = useList('/payments');
  if (!rows) return <Spinner />;
  const c = { Success: 'text-good', Failed: 'text-red-600', Pending: 'text-yellow-700', Refunded: 'text-gray-600' };
  return (
    <Table title="Payments" count={rows.length} empty="No payments yet" head={['Transaction', 'Booking', 'Customer', 'Method', 'Amount', 'Status', 'Time']}>
      {rows.map((p) => (
        <tr key={p._id}><td className="font-mono text-xs">{p.transactionId}</td><td className="font-mono text-xs">{p.booking?.bookingCode}</td><td>{p.user?.name}</td><td>{METHOD_LABEL[p.method]}<br /><span className="text-xs text-gray-500">{p.methodDetail}</span></td><td>{inr(p.amount)}</td>
          <td className={`font-bold ${c[p.status]}`}>{p.status}{p.failureReason && <span className="block text-xs font-normal">{p.failureReason}</span>}</td><td className="whitespace-nowrap text-xs">{fmtDateTime(p.createdAt)}</td></tr>))}
    </Table>
  );
}

export function AdminReviews() {
  const toast = useToast();
  const [rows, load] = useList('/reviews/all');
  const del = async (id) => { if (confirm('Remove this review?')) { try { await api.delete(`/reviews/${id}`); toast.success('Review removed'); load(); } catch (e) { toast.error(errMsg(e)); } } };
  if (!rows) return <Spinner />;
  return (
    <Table title="Reviews" count={rows.length} empty="No reviews yet" head={['Item', 'Guest', 'Rating', 'Comment', 'Date', '']}>
      {rows.map((r) => (
        <tr key={r._id}><td className="font-semibold">{(r.hotel || r.venue)?.name}</td><td>{r.user?.name}</td><td className="text-sun">{'★'.repeat(r.rating)}</td><td className="max-w-xs text-sm">{r.comment}</td><td className="whitespace-nowrap">{fmtDate(r.createdAt)}</td><td><button className="text-red-600 hover:underline" onClick={() => del(r._id)}>Remove</button></td></tr>))}
    </Table>
  );
}

export function AdminUsers() {
  const toast = useToast();
  const { user: me } = useAuth();
  const [rows, load] = useList('/admin/users');
  const role = async (u) => { try { await api.put(`/admin/users/${u._id}/role`, { role: u.role === 'admin' ? 'user' : 'admin' }); toast.success('Role updated'); load(); } catch (e) { toast.error(errMsg(e)); } };
  const del = async (u) => { if (confirm(`Delete user ${u.userId}?`)) { try { await api.delete(`/admin/users/${u._id}`); toast.success('User deleted'); load(); } catch (e) { toast.error(errMsg(e)); } } };
  if (!rows) return <Spinner />;
  return (
    <Table title="Users" count={rows.length} empty="No users" head={['Name', 'User ID', 'Mobile', 'Role', 'Bookings', 'Joined', '']}>
      {rows.map((u) => (
        <tr key={u._id}><td className="font-semibold">{u.name}</td><td>{u.userId}</td><td>{u.phone || '-'}</td><td><span className={`chip ${u.role === 'admin' ? 'border-link text-link' : ''}`}>{u.role}</span></td><td>{u.bookings}</td><td>{fmtDate(u.createdAt)}</td>
          <td className="whitespace-nowrap text-right">{u._id !== me._id && <><button className="link mr-3" onClick={() => role(u)}>Make {u.role === 'admin' ? 'user' : 'admin'}</button><button className="text-red-600 hover:underline" onClick={() => del(u)}>Delete</button></>}</td></tr>))}
    </Table>
  );
}
