import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import api, { errMsg } from '../utils/api';
import { Img, RatingBadge, Spinner, ErrorBox } from '../components/ui';
import ReviewsSection from '../components/ReviewsSection';
import { addDays, inr, todayISO, VENUE_TAX } from '../utils/format';

export default function VenueDetails() {
  const { id } = useParams();
  const [sp] = useSearchParams();
  const nav = useNavigate();
  const [venue, setVenue] = useState(null);
  const [error, setError] = useState('');
  const [img, setImg] = useState(0);
  const [date, setDate] = useState(sp.get('date') || addDays(todayISO(), 14));
  const [guests, setGuests] = useState(Number(sp.get('guests')) || 100);
  const [eventType, setEventType] = useState(sp.get('eventType') || '');
  const [free, setFree] = useState(null);
  const [availErr, setAvailErr] = useState('');

  const load = useCallback(() => api.get(`/venues/${id}`).then((r) => { setVenue(r.data); setEventType((t) => t || r.data.eventTypes[0] || 'Event'); }).catch((e) => setError(errMsg(e))), [id]);
  useEffect(() => { load(); window.scrollTo(0, 0); }, [load]);

  useEffect(() => {
    setFree(null); setAvailErr('');
    if (!date) return;
    api.get(`/venues/${id}/availability`, { params: { date } }).then((r) => setFree(r.data.available)).catch((e) => setAvailErr(errMsg(e)));
  }, [id, date]);

  if (error) return <div className="mx-auto max-w-3xl p-8"><ErrorBox>{error}</ErrorBox></div>;
  if (!venue) return <Spinner />;
  const tooMany = guests > venue.capacity;
  const total = Math.round(venue.pricePerDay * (1 + VENUE_TAX));

  const book = () => nav(`/book/venue/${id}?${new URLSearchParams({ date, guests, eventType })}`);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><h1 className="text-2xl font-extrabold md:text-3xl">{venue.name}</h1><p className="text-sm text-link">{venue.address}</p></div>
        <RatingBadge rating={venue.rating} count={venue.reviewCount} />
      </div>
      <div className="mt-4 grid gap-2 md:h-96 md:grid-cols-[2fr_1fr]">
        <Img src={venue.images[img]} alt={venue.name} className="h-64 w-full rounded-lg md:h-96" />
        <div className="grid grid-cols-3 gap-2 md:grid-cols-1 md:grid-rows-3">
          {venue.images.filter((_, i) => i !== img).slice(0, 3).map((src) => (
            <button key={src} onClick={() => setImg(venue.images.indexOf(src))} className="overflow-hidden rounded-lg"><Img src={src} alt="" className="h-24 w-full md:h-full" /></button>))}
        </div>
      </div>

      <div className="mt-6 grid gap-8 md:grid-cols-[1fr_340px]">
        <div>
          <h2 className="text-xl font-extrabold">About this venue</h2>
          <p className="mt-2 leading-relaxed text-gray-700">{venue.description}</p>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="card p-3"><p className="text-xs text-gray-500">Capacity</p><p className="text-lg font-extrabold">{venue.capacity} guests</p></div>
            <div className="card p-3"><p className="text-xs text-gray-500">Price per day</p><p className="text-lg font-extrabold">{inr(venue.pricePerDay)}</p></div>
            <div className="card p-3"><p className="text-xs text-gray-500">Location</p><p className="text-lg font-extrabold">{venue.city}</p></div>
          </div>
          <h3 className="mt-6 font-extrabold">Facilities</h3>
          <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2">{venue.facilities.map((f) => <span key={f} className="text-sm text-good">✓ <span className="text-gray-800">{f}</span></span>)}</div>
          <h3 className="mt-6 font-extrabold">Great for</h3>
          <div className="mt-2 flex flex-wrap gap-2">{venue.eventTypes.map((t) => <span key={t} className="chip">{t}</span>)}</div>
        </div>

        <div className="card h-fit p-4">
          <p className="text-lg font-extrabold">Check your date</p>
          <div className="mt-3 space-y-3">
            <div><label className="label" htmlFor="d">Event date</label><input id="d" type="date" className="input" min={todayISO()} value={date} onChange={(e) => setDate(e.target.value)} /></div>
            <div><label className="label" htmlFor="et">Event type</label><select id="et" className="input" value={eventType} onChange={(e) => setEventType(e.target.value)}>{venue.eventTypes.map((t) => <option key={t}>{t}</option>)}</select></div>
            <div><label className="label" htmlFor="gs">Guests (max {venue.capacity})</label><input id="gs" type="number" min="1" className="input" value={guests} onChange={(e) => setGuests(Number(e.target.value) || 1)} /></div>
          </div>
          <ErrorBox>{availErr}</ErrorBox>
          <div className="mt-3 rounded-md bg-mist p-3 text-sm" aria-live="polite">
            {free === null ? 'Checking…' : free ? <span className="font-bold text-good">✓ Available on this date</span> : <span className="font-bold text-red-600">Already booked. Try another date.</span>}
            {tooMany && <p className="mt-1 font-semibold text-red-600">This venue holds up to {venue.capacity} guests.</p>}
          </div>
          <p className="mt-3 text-sm text-gray-600">Total with {Math.round(VENUE_TAX * 100)}% tax</p>
          <p className="text-2xl font-extrabold">{inr(total)}</p>
          <button className="btn-primary mt-3 w-full" disabled={!free || tooMany} onClick={book}>Book this venue</button>
        </div>
      </div>

      <div className="mt-10"><ReviewsSection type="venue" itemId={id} onChange={load} /></div>
    </div>
  );
}
