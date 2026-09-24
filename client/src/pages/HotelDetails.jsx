import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import api, { errMsg } from '../utils/api';
import { Img, RatingBadge, Spinner, StarRow, ErrorBox } from '../components/ui';
import ReviewsSection from '../components/ReviewsSection';
import { addDays, inr, nightsBetween, todayISO, HOTEL_TAX } from '../utils/format';

export default function HotelDetails() {
  const { id } = useParams();
  const [sp] = useSearchParams();
  const nav = useNavigate();
  const [hotel, setHotel] = useState(null);
  const [error, setError] = useState('');
  const [img, setImg] = useState(0);
  const [checkIn, setCheckIn] = useState(sp.get('checkIn') || addDays(todayISO(), 1));
  const [checkOut, setCheckOut] = useState(sp.get('checkOut') || addDays(todayISO(), 2));
  const [guests, setGuests] = useState(Number(sp.get('guests')) || 2);
  const [qty, setQty] = useState({});            // rooms chosen per room type
  const [avail, setAvail] = useState(null);
  const [availErr, setAvailErr] = useState('');

  const loadHotel = useCallback(() => api.get(`/hotels/${id}`).then((r) => setHotel(r.data)).catch((e) => setError(errMsg(e))), [id]);
  useEffect(() => { loadHotel(); window.scrollTo(0, 0); }, [loadHotel]);

  // Check availability whenever the dates change
  useEffect(() => {
    setAvail(null); setAvailErr('');
    if (!checkIn || !checkOut || checkOut <= checkIn) return setAvailErr('Check-out must be after check-in.');
    api.get(`/hotels/${id}/availability`, { params: { checkIn, checkOut } }).then((r) => setAvail(r.data.available)).catch((e) => setAvailErr(errMsg(e)));
  }, [id, checkIn, checkOut]);

  if (error) return <div className="mx-auto max-w-3xl p-8"><ErrorBox>{error}</ErrorBox></div>;
  if (!hotel) return <Spinner />;
  const nights = checkOut > checkIn ? nightsBetween(checkIn, checkOut) : 0;

  const reserve = (room) => {
    const rooms = qty[room.name] || 1;
    const p = new URLSearchParams({ room: room.name, rooms, guests, checkIn, checkOut });
    nav(`/book/hotel/${id}?${p}`);   // guests are asked to sign in on the next page, not before
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2"><StarRow n={hotel.stars} size="text-lg" /><span className="chip">{hotel.propertyType}</span></div>
          <h1 className="mt-1 text-2xl font-extrabold md:text-3xl">{hotel.name}</h1>
          <p className="text-sm text-link">{hotel.address}</p>
        </div>
        <RatingBadge rating={hotel.rating} count={hotel.reviewCount} />
      </div>

      <div className="mt-4 grid gap-2 md:h-96 md:grid-cols-[2fr_1fr]">
        <Img src={hotel.images[img]} alt={hotel.name} className="h-64 w-full rounded-lg md:h-96" />
        <div className="grid grid-cols-3 gap-2 md:grid-cols-1 md:grid-rows-3">
          {hotel.images.slice(0, 4).filter((_, i) => i !== img).slice(0, 3).map((src) => (
            <button key={src} onClick={() => setImg(hotel.images.indexOf(src))} className="overflow-hidden rounded-lg"><Img src={src} alt="" className="h-24 w-full md:h-full" /></button>))}
        </div>
      </div>

      <div className="mt-6 grid gap-8 md:grid-cols-[1fr_320px]">
        <div>
          <h2 className="text-xl font-extrabold">About this property</h2>
          <p className="mt-2 leading-relaxed text-gray-700">{hotel.description}</p>
          <h3 className="mt-6 font-extrabold">Most popular facilities</h3>
          <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2">{hotel.amenities.map((a) => <span key={a} className="text-sm text-good">✓ <span className="text-gray-800">{a}</span></span>)}</div>
        </div>
        <div className="card h-fit p-4">
          <p className="font-extrabold">Your stay</p>
          <div className="mt-3 space-y-3">
            <div><label className="label" htmlFor="ci">Check-in</label><input id="ci" type="date" className="input" min={todayISO()} value={checkIn} onChange={(e) => { setCheckIn(e.target.value); if (checkOut <= e.target.value) setCheckOut(addDays(e.target.value, 1)); }} /></div>
            <div><label className="label" htmlFor="co">Check-out</label><input id="co" type="date" className="input" min={addDays(checkIn, 1)} value={checkOut} onChange={(e) => setCheckOut(e.target.value)} /></div>
            <div><label className="label" htmlFor="g">Guests</label><input id="g" type="number" min="1" max="20" className="input" value={guests} onChange={(e) => setGuests(Number(e.target.value) || 1)} /></div>
          </div>
          {nights > 0 && <p className="mt-3 text-sm text-gray-600">{nights} night{nights > 1 ? 's' : ''} selected</p>}
        </div>
      </div>

      {/* Rooms */}
      <h2 className="mt-8 text-2xl font-extrabold" id="rooms">Choose your room</h2>
      <ErrorBox>{availErr}</ErrorBox>
      <div className="mt-3 overflow-x-auto">
        <table className="table-x min-w-[640px] card">
          <thead><tr><th>Room type</th><th>Sleeps</th><th>Price for {nights || '–'} night{nights === 1 ? '' : 's'}</th><th>Availability</th><th>Rooms</th><th></th></tr></thead>
          <tbody>
            {hotel.rooms.map((r) => {
              const left = avail ? avail[r.name] : null;
              const sold = left === 0;
              const total = r.price * (qty[r.name] || 1) * nights;
              return (
                <tr key={r._id}>
                  <td><p className="font-bold text-link">{r.name}</p><p className="text-xs text-gray-500">{r.bed}</p></td>
                  <td>{'👤'.repeat(Math.min(r.capacity, 4))}</td>
                  <td><p className="text-lg font-extrabold">{inr(total)}</p><p className="text-xs text-gray-500">{inr(r.price)}/night + {Math.round(HOTEL_TAX * 100)}% tax</p></td>
                  <td className="text-sm">{left === null ? '…' : sold ? <span className="font-bold text-red-600">Sold out</span> : left <= 3 ? <span className="font-bold text-red-600">Only {left} left!</span> : <span className="text-good">Available</span>}</td>
                  <td><select className="input w-20" disabled={!left} value={qty[r.name] || 1} onChange={(e) => setQty({ ...qty, [r.name]: Number(e.target.value) })}>{Array.from({ length: Math.min(left || 1, 5) }, (_, i) => <option key={i + 1}>{i + 1}</option>)}</select></td>
                  <td><button className="btn-primary" disabled={!left || !nights} onClick={() => reserve(r)}>Reserve</button></td>
                </tr>);
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-sm text-gray-500">No account needed to look around. You will be asked to sign in at the next step to confirm.</p>

      <div className="mt-10"><ReviewsSection type="hotel" itemId={id} onChange={loadHotel} /></div>
    </div>
  );
}
