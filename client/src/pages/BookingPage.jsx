import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import api, { errMsg } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { ErrorBox, Spinner } from '../components/ui';
import Summary from '../components/Summary';
import { HOTEL_TAX, VENUE_TAX, nightsBetween } from '../utils/format';

// Step 1 of 3: guest details. Reached only after sign in (see Protected route).
export default function BookingPage() {
  const { type, id } = useParams();
  const [sp] = useSearchParams();
  const { user } = useAuth();
  const nav = useNavigate();
  const [item, setItem] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [f, setF] = useState({ name: user.name, phone: user.phone || '', email: '', specialRequests: '' });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  useEffect(() => { api.get(`/${type}s/${id}`).then((r) => setItem(r.data)).catch((e) => setError(errMsg(e))); }, [type, id]);

  if (!item) return <div className="mx-auto max-w-3xl p-6">{error ? <ErrorBox>{error}</ErrorBox> : <Spinner />}</div>;

  // Build a preview of the booking to show the price before it is created
  const isHotel = type === 'hotel';
  const room = isHotel ? item.rooms.find((r) => r.name === sp.get('room')) : null;
  const nights = isHotel ? nightsBetween(sp.get('checkIn'), sp.get('checkOut')) : 0;
  const rooms = Number(sp.get('rooms')) || 1;
  const subtotal = isHotel ? (room?.price || 0) * rooms * nights : item.pricePerDay;
  const tax = Math.round(subtotal * (isHotel ? HOTEL_TAX : VENUE_TAX));
  const preview = {
    type, hotel: isHotel ? item : null, venue: isHotel ? null : item, roomType: room?.name, rooms, nights, guests: Number(sp.get('guests')) || 1,
    checkIn: sp.get('checkIn'), checkOut: sp.get('checkOut'), eventDate: sp.get('date'), eventType: sp.get('eventType'), subtotal, tax, amount: subtotal + tax,
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!/^\d{10}$/.test(f.phone)) return setError('Enter a 10-digit mobile number so the property can reach you.');
    setBusy(true);
    try {
      const { data } = await api.post('/bookings', {
        type, itemId: id, roomType: room?.name, rooms, guests: preview.guests,
        checkIn: sp.get('checkIn'), checkOut: sp.get('checkOut'), eventDate: sp.get('date'), eventType: sp.get('eventType'),
        contact: { name: f.name, phone: f.phone, email: f.email }, specialRequests: f.specialRequests,
      });
      nav(`/payment/${data._id}`);
    } catch (err) { setError(errMsg(err)); setBusy(false); }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <Steps step={1} />
      <div className="mt-6 grid gap-6 md:grid-cols-[1fr_340px]">
        <form onSubmit={submit} className="card space-y-4 p-5" noValidate>
          <h1 className="text-xl font-extrabold">Enter your details</h1>
          <ErrorBox>{error}</ErrorBox>
          <div><label className="label" htmlFor="n">Full name</label><input id="n" className="input" value={f.name} onChange={set('name')} required /></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="label" htmlFor="p">Mobile number</label><input id="p" className="input" inputMode="numeric" maxLength={10} value={f.phone} onChange={set('phone')} required /></div>
            <div><label className="label" htmlFor="e">Email <span className="font-normal text-gray-500">(optional)</span></label><input id="e" type="email" className="input" value={f.email} onChange={set('email')} /></div>
          </div>
          <div><label className="label" htmlFor="s">Special requests <span className="font-normal text-gray-500">(optional)</span></label><textarea id="s" rows={3} className="input" value={f.specialRequests} onChange={set('specialRequests')} placeholder={isHotel ? 'Early check-in, extra bed…' : 'Decor, catering, setup time…'} /></div>
          <p className="rounded-md bg-brand-light p-3 text-sm text-brand">Your {isHotel ? 'room' : 'date'} will be held for 15 minutes while you pay on the next step.</p>
          <button className="btn-primary w-full sm:w-auto" disabled={busy || (isHotel && !room)}>{busy ? 'Reserving…' : 'Next: choose payment'}</button>
        </form>
        <Summary b={preview} />
      </div>
    </div>
  );
}

export function Steps({ step }) {
  const s = ['Your details', 'Payment', 'Confirmed'];
  return (
    <ol className="flex items-center gap-2 text-sm font-semibold" aria-label="Booking steps">
      {s.map((t, i) => (
        <li key={t} className="flex items-center gap-2">
          <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${i + 1 <= step ? 'bg-link text-white' : 'bg-gray-200 text-gray-600'}`}>{i + 1 < step ? '✓' : i + 1}</span>
          <span className={i + 1 === step ? 'text-gray-900' : 'text-gray-500'}>{t}</span>{i < 2 && <span className="mx-1 h-px w-6 bg-gray-300" />}
        </li>))}
    </ol>
  );
}
