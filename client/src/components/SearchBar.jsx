import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addDays, todayISO } from '../utils/format';

const CITIES = ['Mumbai', 'New Delhi', 'Bengaluru', 'Hyderabad', 'Jaipur', 'Agra', 'Goa', 'Kochi', 'Udaipur', 'Chennai', 'Mussoorie', 'Puri'];

// Booking.com style search bar (yellow frame). kind = "hotel" | "venue"
export default function SearchBar({ kind = 'hotel', initial = {} }) {
  const nav = useNavigate();
  const [q, setQ] = useState(initial.q || '');
  const [checkIn, setCheckIn] = useState(initial.checkIn || '');
  const [checkOut, setCheckOut] = useState(initial.checkOut || '');
  const [date, setDate] = useState(initial.date || '');
  const [guests, setGuests] = useState(Number(initial.guests) || 2);
  const [rooms, setRooms] = useState(Number(initial.rooms) || 1);
  const today = todayISO();

  const submit = (e) => {
    e.preventDefault();
    const p = new URLSearchParams();
    if (q.trim()) p.set('q', q.trim());
    if (kind === 'hotel') {
      if (checkIn) p.set('checkIn', checkIn);
      if (checkOut) p.set('checkOut', checkOut);
      p.set('guests', guests); p.set('rooms', rooms);
      nav(`/hotels?${p}`);
    } else {
      if (date) p.set('date', date);
      p.set('guests', guests);
      nav(`/venues?${p}`);
    }
  };
  const box = 'flex flex-1 flex-col justify-center rounded-md bg-white px-3 py-1.5 min-w-0';
  const lab = 'text-[11px] font-semibold text-gray-500';
  const field = 'w-full bg-transparent text-sm font-semibold outline-none';

  return (
    <form onSubmit={submit} className="grid gap-1 rounded-lg border-4 border-sun bg-sun p-0 md:flex md:items-stretch" aria-label={kind === 'hotel' ? 'Search stays' : 'Search event venues'}>
      <label className={`${box} md:flex-[1.6]`}>
        <span className={lab}>Where to?</span>
        <input list="se-cities" value={q} onChange={(e) => setQ(e.target.value)} placeholder="City, hotel or area" className={field} />
        <datalist id="se-cities">{CITIES.map((c) => <option key={c} value={c} />)}</datalist>
      </label>
      {kind === 'hotel' ? (
        <>
          <label className={box}><span className={lab}>Check-in</span>
            <input type="date" min={today} value={checkIn} onChange={(e) => { setCheckIn(e.target.value); if (!checkOut || checkOut <= e.target.value) setCheckOut(addDays(e.target.value, 1)); }} className={field} /></label>
          <label className={box}><span className={lab}>Check-out</span>
            <input type="date" min={checkIn ? addDays(checkIn, 1) : today} value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className={field} /></label>
        </>
      ) : (
        <label className={`${box} md:flex-[2]`}><span className={lab}>Event date</span>
          <input type="date" min={today} value={date} onChange={(e) => setDate(e.target.value)} className={field} /></label>
      )}
      <div className={box}>
        <span className={lab}>{kind === 'hotel' ? 'Guests & rooms' : 'Guests'}</span>
        <div className="flex items-center gap-2 text-sm font-semibold">
          <input type="number" min="1" max={kind === 'hotel' ? 20 : 5000} value={guests} onChange={(e) => setGuests(e.target.value)} className="w-14 bg-transparent outline-none" aria-label="Guests" />guests
          {kind === 'hotel' && <><input type="number" min="1" max="10" value={rooms} onChange={(e) => setRooms(e.target.value)} className="w-10 bg-transparent outline-none" aria-label="Rooms" />rooms</>}
        </div>
      </div>
      <button className="rounded-md bg-link px-8 py-3 text-base font-bold text-white hover:bg-brand md:py-0">Search</button>
    </form>
  );
}
