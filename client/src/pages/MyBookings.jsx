import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errMsg } from '../utils/api';
import { useToast } from '../context/ToastContext';
import { Empty, ErrorBox, Img, Spinner } from '../components/ui';
import { fmtDate, inr, METHOD_LABEL } from '../utils/format';

const COLORS = { Confirmed: 'bg-green-100 text-green-800', Pending: 'bg-yellow-100 text-yellow-800', Cancelled: 'bg-red-100 text-red-700' };
export const StatusPill = ({ s }) => <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${COLORS[s] || 'bg-gray-100'}`}>{s}</span>;

export default function MyBookings() {
  const toast = useToast();
  const [list, setList] = useState(null);
  const [tab, setTab] = useState('All');
  const [error, setError] = useState('');
  const load = () => api.get('/bookings/mine').then((r) => setList(r.data)).catch((e) => setError(errMsg(e)));
  useEffect(() => { load(); }, []);

  const cancel = async (b) => {
    if (!confirm(`Cancel booking ${b.bookingCode}?${b.paymentStatus === 'Paid' ? ' Your payment will be refunded.' : ''}`)) return;
    try { await api.put(`/bookings/${b._id}/cancel`); toast.success('Booking cancelled'); load(); } catch (e) { toast.error(errMsg(e)); }
  };

  if (!list) return <div className="mx-auto max-w-4xl p-6">{error ? <ErrorBox>{error}</ErrorBox> : <Spinner />}</div>;
  const shown = list.filter((b) => tab === 'All' || b.status === tab);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-extrabold">My bookings</h1>
      <div className="mt-4 flex flex-wrap gap-2">{['All', 'Confirmed', 'Pending', 'Cancelled'].map((t) => (
        <button key={t} onClick={() => setTab(t)} className={`rounded-full border px-4 py-1.5 text-sm font-semibold ${tab === t ? 'border-link bg-link text-white' : 'hover:bg-mist'}`}>{t}</button>))}</div>
      <div className="mt-5 space-y-4">
        {shown.length === 0 && <Empty title="No bookings here yet" text="Find a hotel or event venue and your bookings will appear here."><Link to="/hotels" className="btn-primary">Find a stay</Link></Empty>}
        {shown.map((b) => {
          const item = b.type === 'hotel' ? b.hotel : b.venue;
          const held = b.status === 'Pending' && Date.now() - new Date(b.createdAt) < 15 * 60000;
          const start = b.type === 'hotel' ? b.checkIn : b.eventDate;
          const canCancel = b.status !== 'Cancelled' && new Date(start) - Date.now() >= 24 * 3600 * 1000;
          return (
            <div key={b._id} className="card flex flex-col overflow-hidden sm:flex-row">
              <Img src={item?.images?.[0]} alt="" className="h-40 w-full sm:h-auto sm:w-48" />
              <div className="flex-1 space-y-1 p-4 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2"><p className="text-lg font-extrabold">{item?.name || 'Removed listing'}</p><StatusPill s={b.status === 'Pending' && !held ? 'Cancelled' : b.status} /></div>
                <p className="text-gray-500">{item?.city} · Code <b className="text-gray-800">{b.bookingCode}</b></p>
                <p>{b.type === 'hotel' ? `${fmtDate(b.checkIn)} → ${fmtDate(b.checkOut)} · ${b.rooms} × ${b.roomType}` : `${fmtDate(b.eventDate)} · ${b.eventType} · ${b.guests} guests`}</p>
                <p><b>{inr(b.amount)}</b> · <span className="text-gray-600">{b.paymentStatus}{b.paymentMethod ? ` via ${METHOD_LABEL[b.paymentMethod]}` : ''}</span></p>
                <div className="flex flex-wrap gap-2 pt-2">
                  {held && <Link to={`/payment/${b._id}`} className="btn-yellow">Pay now</Link>}
                  {b.status === 'Confirmed' && <Link to={`/confirmation/${b._id}`} className="btn-outline">View confirmation</Link>}
                  {b.status === 'Confirmed' && item && <Link to={`/${b.type}s/${item._id}#reviews`} className="btn-outline">Write a review</Link>}
                  {(b.status === 'Confirmed' || held) && canCancel && <button className="btn-danger" onClick={() => cancel(b)}>Cancel</button>}
                </div>
                {b.status === 'Confirmed' && !canCancel && <p className="text-xs text-gray-500">Free cancellation ended 24 hours before the start date.</p>}
              </div>
            </div>);
        })}
      </div>
    </div>
  );
}
