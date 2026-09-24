import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../utils/api';
import SearchBar from '../components/SearchBar';
import { VenueCard } from '../components/Cards';
import { Empty, Spinner } from '../components/ui';

const FACILITIES = ['Catering kitchen', 'Stage & sound system', 'Parking', 'Air conditioning', 'Bridal suite', 'Projector & screen', 'Free WiFi', 'Power backup'];
const EVENTS = ['Wedding', 'Reception', 'Birthday', 'Conference', 'Corporate party', 'Seminar'];
const toggle = (csv, v) => { const a = csv ? csv.split(',') : []; return (a.includes(v) ? a.filter((x) => x !== v) : [...a, v]).join(','); };

export default function Venues() {
  const [sp, setSp] = useSearchParams();
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');
  const [price, setPrice] = useState({ min: sp.get('minPrice') || '', max: sp.get('maxPrice') || '' });
  const get = (k) => sp.get(k) || '';
  const setParam = (k, v) => { const n = new URLSearchParams(sp); v ? n.set(k, v) : n.delete(k); setSp(n, { replace: true }); };

  useEffect(() => {
    setItems(null); setError('');
    const p = Object.fromEntries(sp);
    if (p.guests) { p.capacity = p.guests; }    // show only venues big enough
    api.get('/venues', { params: p }).then((r) => setItems(r.data)).catch(() => setError('Could not load venues. Is the backend running?'));
  }, [sp]);

  const carry = new URLSearchParams(['date', 'guests', 'eventType'].filter((k) => sp.get(k)).map((k) => [k, sp.get(k)])).toString();

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <SearchBar kind="venue" initial={{ q: get('q'), date: get('date'), guests: get('guests') || 100 }} />
      <div className="mt-6 grid gap-6 md:grid-cols-[250px_1fr]">
        <aside className="card h-fit space-y-5 p-4">
          <h2 className="font-extrabold">Filter by</h2>
          <div><p className="label">Event type</p>
            <select className="input" value={get('eventType')} onChange={(e) => setParam('eventType', e.target.value)}><option value="">Any event</option>{EVENTS.map((e) => <option key={e}>{e}</option>)}</select></div>
          <div><p className="label">Budget (per day)</p>
            <div className="flex gap-2"><input className="input" placeholder="Min ₹" inputMode="numeric" value={price.min} onChange={(e) => setPrice({ ...price, min: e.target.value })} /><input className="input" placeholder="Max ₹" inputMode="numeric" value={price.max} onChange={(e) => setPrice({ ...price, max: e.target.value })} /></div>
            <button className="btn-outline mt-2 w-full" onClick={() => { const n = new URLSearchParams(sp); price.min ? n.set('minPrice', price.min) : n.delete('minPrice'); price.max ? n.set('maxPrice', price.max) : n.delete('maxPrice'); setSp(n); }}>Apply budget</button></div>
          <div><p className="label">Guest rating</p>
            {[['', 'Any'], ['8', '8+ Very good'], ['9', '9+ Superb']].map(([v, t]) => (
              <label key={t} className="flex cursor-pointer items-center gap-2 py-1 text-sm"><input type="radio" name="vr" checked={get('rating') === v} onChange={() => setParam('rating', v)} />{t}</label>))}</div>
          <div><p className="label">Facilities</p>{FACILITIES.map((a) => (
            <label key={a} className="flex cursor-pointer items-center gap-2 py-1 text-sm"><input type="checkbox" checked={get('facilities').split(',').includes(a)} onChange={() => setParam('facilities', toggle(get('facilities'), a))} />{a}</label>))}</div>
          <button className="text-sm text-link hover:underline" onClick={() => { setPrice({ min: '', max: '' }); setSp(new URLSearchParams(carry)); }}>Clear all filters</button>
        </aside>
        <section aria-live="polite">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h1 className="text-xl font-extrabold">{items ? `${items.length} event venues found` : 'searching…'}</h1>
            <label className="flex items-center gap-2 text-sm">Sort by
              <select className="input w-auto" value={get('sort') || 'popular'} onChange={(e) => setParam('sort', e.target.value)}>
                <option value="popular">Most popular</option><option value="rating">Best reviewed</option><option value="price_asc">Price (low to high)</option><option value="price_desc">Price (high to low)</option></select></label>
          </div>
          {error && <p role="alert" className="rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          {!items && !error && <Spinner text="Searching venues…" />}
          {items && items.length === 0 && <Empty title="No venues match" text="Try a smaller guest count or clear filters."><button className="btn-primary" onClick={() => setSp(new URLSearchParams())}>Show all venues</button></Empty>}
          <div className="space-y-4">{items?.map((v) => <VenueCard key={v._id} v={v} layout="h" search={carry ? `?${carry}` : ''} />)}</div>
          <p className="mt-6 text-sm text-gray-500">Need a room too? <Link className="link" to="/hotels">Browse stays</Link></p>
        </section>
      </div>
    </div>
  );
}
