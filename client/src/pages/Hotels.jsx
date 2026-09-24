import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../utils/api';
import SearchBar from '../components/SearchBar';
import { HotelCard } from '../components/Cards';
import { Empty, Spinner } from '../components/ui';

const AMENITIES = ['Free WiFi', 'Swimming pool', 'Spa', 'Restaurant', 'Bar', 'Fitness centre', 'Airport shuttle', 'Parking', 'Air conditioning', 'Room service'];
const TYPES = ['Hotel', 'Resort', 'Villa', 'Homestay', 'Guest house'];
const toggle = (csv, v) => { const a = csv ? csv.split(',') : []; return (a.includes(v) ? a.filter((x) => x !== v) : [...a, v]).join(','); };

export default function Hotels() {
  const [sp, setSp] = useSearchParams();
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');
  const [price, setPrice] = useState({ min: sp.get('minPrice') || '', max: sp.get('maxPrice') || '' });
  const get = (k) => sp.get(k) || '';
  const setParam = (k, v) => { const n = new URLSearchParams(sp); v ? n.set(k, v) : n.delete(k); setSp(n, { replace: true }); };

  useEffect(() => {
    setItems(null); setError('');
    api.get('/hotels', { params: Object.fromEntries(sp) }).then((r) => setItems(r.data)).catch(() => setError('Could not load hotels. Is the backend running?'));
  }, [sp]);

  // keep the dates when opening a hotel
  const carry = new URLSearchParams(['checkIn', 'checkOut', 'guests', 'rooms'].filter((k) => sp.get(k)).map((k) => [k, sp.get(k)])).toString();
  const check = (key, v) => (
    <label key={v} className="flex cursor-pointer items-center gap-2 py-1 text-sm"><input type="checkbox" checked={get(key).split(',').includes(v)} onChange={() => setParam(key, toggle(get(key), v))} />{v}</label>
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <SearchBar kind="hotel" initial={{ q: get('q'), checkIn: get('checkIn'), checkOut: get('checkOut'), guests: get('guests'), rooms: get('rooms') }} key={sp.toString().length > 0 ? 's' : 'e'} />
      <div className="mt-6 grid gap-6 md:grid-cols-[250px_1fr]">
        <aside className="card h-fit space-y-5 p-4">
          <h2 className="font-extrabold">Filter by</h2>
          <div>
            <p className="label">Your budget (per night)</p>
            <div className="flex gap-2"><input className="input" placeholder="Min ₹" inputMode="numeric" value={price.min} onChange={(e) => setPrice({ ...price, min: e.target.value })} /><input className="input" placeholder="Max ₹" inputMode="numeric" value={price.max} onChange={(e) => setPrice({ ...price, max: e.target.value })} /></div>
            <button className="btn-outline mt-2 w-full" onClick={() => { const n = new URLSearchParams(sp); price.min ? n.set('minPrice', price.min) : n.delete('minPrice'); price.max ? n.set('maxPrice', price.max) : n.delete('maxPrice'); setSp(n); }}>Apply budget</button>
          </div>
          <div><p className="label">Guest rating</p>
            {[['', 'Any'], ['7', '7+ Good'], ['8', '8+ Very good'], ['9', '9+ Superb']].map(([v, t]) => (
              <label key={t} className="flex cursor-pointer items-center gap-2 py-1 text-sm"><input type="radio" name="rating" checked={get('rating') === v} onChange={() => setParam('rating', v)} />{t}</label>))}</div>
          <div><p className="label">Star rating</p>{[5, 4, 3, 2].map((s) => (
            <label key={s} className="flex cursor-pointer items-center gap-2 py-1 text-sm"><input type="checkbox" checked={get('stars').split(',').includes(String(s))} onChange={() => setParam('stars', toggle(get('stars'), String(s)))} /><span className="text-sun">{'★'.repeat(s)}</span></label>))}</div>
          <div><p className="label">Property type</p>{TYPES.map((t) => check('type', t))}</div>
          <div><p className="label">Facilities</p>{AMENITIES.map((a) => check('amenities', a))}</div>
          <button className="text-sm text-link hover:underline" onClick={() => { setPrice({ min: '', max: '' }); setSp(new URLSearchParams(carry)); }}>Clear all filters</button>
        </aside>

        <section aria-live="polite">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h1 className="text-xl font-extrabold">{get('q') ? `${get('q')}: ` : 'India: '}{items ? `${items.length} properties found` : 'searching…'}</h1>
            <label className="flex items-center gap-2 text-sm">Sort by
              <select className="input w-auto" value={get('sort') || 'popular'} onChange={(e) => setParam('sort', e.target.value)}>
                <option value="popular">Most popular</option><option value="rating">Best reviewed</option><option value="price_asc">Price (low to high)</option><option value="price_desc">Price (high to low)</option></select></label>
          </div>
          {error && <p role="alert" className="rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          {!items && !error && <Spinner text="Searching stays…" />}
          {items && items.length === 0 && <Empty title="No stays match these filters" text="Try a different city or remove some filters."><button className="btn-primary" onClick={() => setSp(new URLSearchParams())}>Show all stays</button></Empty>}
          <div className="space-y-4">{items?.map((h) => <HotelCard key={h._id} h={h} layout="h" search={carry ? `?${carry}` : ''} />)}</div>
          <p className="mt-6 text-sm text-gray-500">Planning an event instead? <Link className="link" to="/venues">Browse event venues</Link></p>
        </section>
      </div>
    </div>
  );
}
