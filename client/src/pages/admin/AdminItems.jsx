import { useEffect, useState } from 'react';
import api, { errMsg } from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import { ErrorBox, Modal, Spinner } from '../../components/ui';
import { inr } from '../../utils/format';

// One screen used for both hotel and venue management (kind = "hotel" | "venue")
const blankHotel = { name: '', city: '', state: '', address: '', description: '', propertyType: 'Hotel', stars: 3, images: '', amenities: '', rooms: [{ name: 'Standard Room', bed: '1 double bed', price: 2000, capacity: 2, totalRooms: 5 }] };
const blankVenue = { name: '', city: '', state: '', address: '', description: '', capacity: 200, pricePerDay: 50000, images: '', facilities: '', eventTypes: '' };
const csv = (v) => (Array.isArray(v) ? v.join(', ') : v);
const list = (v) => String(v || '').split(/[,\n]/).map((x) => x.trim()).filter(Boolean);

export default function AdminItems({ kind }) {
  const toast = useToast();
  const isHotel = kind === 'hotel';
  const [items, setItems] = useState(null);
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');
  const load = () => api.get(`/${kind}s`, { params: { limit: 100, sort: 'newest' } }).then((r) => setItems(r.data));
  useEffect(() => { setItems(null); load(); }, [kind]);

  const open = (it) => {
    const base = it ? { ...it, images: csv(it.images), amenities: csv(it.amenities), facilities: csv(it.facilities), eventTypes: csv(it.eventTypes) } : { ...(isHotel ? blankHotel : blankVenue) };
    setError(''); setForm(base);
  };
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const setRoom = (i, k, v) => setForm({ ...form, rooms: form.rooms.map((r, j) => (j === i ? { ...r, [k]: v } : r)) });

  const save = async (e) => {
    e.preventDefault(); setError('');
    const body = { ...form, images: list(form.images) };
    if (isHotel) { body.amenities = list(form.amenities); body.stars = Number(form.stars); body.rooms = form.rooms.map((r) => ({ ...r, price: Number(r.price), capacity: Number(r.capacity), totalRooms: Number(r.totalRooms) })); }
    else { body.facilities = list(form.facilities); body.eventTypes = list(form.eventTypes); body.capacity = Number(form.capacity); body.pricePerDay = Number(form.pricePerDay); }
    try {
      if (form._id) await api.put(`/${kind}s/${form._id}`, body); else await api.post(`/${kind}s`, body);
      toast.success('Saved'); setForm(null); load();
    } catch (err) { setError(errMsg(err)); }
  };
  const del = async (it) => { if (confirm(`Delete "${it.name}"?`)) { try { await api.delete(`/${kind}s/${it._id}`); toast.success('Deleted'); load(); } catch (e) { toast.error(errMsg(e)); } } };

  if (!items) return <Spinner />;
  return (
    <div>
      <div className="flex items-center justify-between"><h1 className="text-2xl font-extrabold">{isHotel ? 'Hotels' : 'Event venues'} ({items.length})</h1><button className="btn-primary" onClick={() => open(null)}>+ Add {isHotel ? 'hotel' : 'venue'}</button></div>
      <div className="card mt-4 overflow-x-auto"><table className="table-x min-w-[640px]">
        <thead><tr><th>Name</th><th>City</th><th>{isHotel ? 'Rooms' : 'Capacity'}</th><th>{isHotel ? 'From / night' : 'Per day'}</th><th>Rating</th><th></th></tr></thead>
        <tbody>{items.map((it) => (
          <tr key={it._id}><td className="font-semibold">{it.name}</td><td>{it.city}</td><td>{isHotel ? it.rooms.reduce((s, r) => s + r.totalRooms, 0) : it.capacity}</td><td>{inr(isHotel ? it.priceFrom : it.pricePerDay)}</td><td>{it.rating?.toFixed(1)}</td>
            <td className="whitespace-nowrap text-right"><button className="link mr-3" onClick={() => open(it)}>Edit</button><button className="text-red-600 hover:underline" onClick={() => del(it)}>Delete</button></td></tr>))}</tbody></table></div>

      {form && (
        <Modal title={`${form._id ? 'Edit' : 'Add'} ${isHotel ? 'hotel' : 'venue'}`} onClose={() => setForm(null)} wide>
          <form onSubmit={save} className="space-y-3">
            <ErrorBox>{error}</ErrorBox>
            <div className="grid gap-3 sm:grid-cols-2">
              <div><label className="label">Name</label><input className="input" value={form.name} onChange={set('name')} required /></div>
              <div><label className="label">City</label><input className="input" value={form.city} onChange={set('city')} required /></div>
              <div><label className="label">State</label><input className="input" value={form.state} onChange={set('state')} /></div>
              <div><label className="label">Address</label><input className="input" value={form.address} onChange={set('address')} /></div>
              {isHotel ? (<>
                <div><label className="label">Property type</label><select className="input" value={form.propertyType} onChange={set('propertyType')}>{['Hotel', 'Resort', 'Villa', 'Homestay', 'Guest house'].map((t) => <option key={t}>{t}</option>)}</select></div>
                <div><label className="label">Stars (1-5)</label><input type="number" min="1" max="5" className="input" value={form.stars} onChange={set('stars')} /></div></>) : (<>
                <div><label className="label">Capacity (guests)</label><input type="number" min="1" className="input" value={form.capacity} onChange={set('capacity')} /></div>
                <div><label className="label">Price per day (₹)</label><input type="number" min="0" className="input" value={form.pricePerDay} onChange={set('pricePerDay')} /></div></>)}
            </div>
            <div><label className="label">Description</label><textarea rows={3} className="input" value={form.description} onChange={set('description')} /></div>
            <div><label className="label">Image URLs (comma or new-line separated)</label><textarea rows={2} className="input" value={form.images} onChange={set('images')} placeholder="https://..." /></div>
            <div><label className="label">{isHotel ? 'Amenities' : 'Facilities'} (comma separated)</label><input className="input" value={isHotel ? form.amenities : form.facilities} onChange={set(isHotel ? 'amenities' : 'facilities')} /></div>
            {!isHotel && <div><label className="label">Event types (comma separated)</label><input className="input" value={form.eventTypes} onChange={set('eventTypes')} placeholder="Wedding, Conference, Birthday" /></div>}
            {isHotel && (
              <div><p className="label">Room types</p>
                {form.rooms.map((r, i) => (
                  <div key={i} className="mb-2 grid grid-cols-2 gap-2 rounded-md bg-mist p-2 sm:grid-cols-6">
                    <input className="input sm:col-span-2" placeholder="Name" value={r.name} onChange={(e) => setRoom(i, 'name', e.target.value)} required />
                    <input className="input" placeholder="Bed" value={r.bed} onChange={(e) => setRoom(i, 'bed', e.target.value)} />
                    <input className="input" type="number" min="0" placeholder="₹ / night" value={r.price} onChange={(e) => setRoom(i, 'price', e.target.value)} />
                    <input className="input" type="number" min="1" placeholder="Sleeps" value={r.capacity} onChange={(e) => setRoom(i, 'capacity', e.target.value)} />
                    <div className="flex gap-1"><input className="input" type="number" min="1" placeholder="Rooms" value={r.totalRooms} onChange={(e) => setRoom(i, 'totalRooms', e.target.value)} />{form.rooms.length > 1 && <button type="button" className="px-2 text-red-600" onClick={() => setForm({ ...form, rooms: form.rooms.filter((_, j) => j !== i) })} aria-label="Remove room">×</button>}</div>
                  </div>))}
                <button type="button" className="link text-sm" onClick={() => setForm({ ...form, rooms: [...form.rooms, { name: '', bed: '1 double bed', price: 2000, capacity: 2, totalRooms: 3 }] })}>+ Add room type</button></div>)}
            <div className="flex justify-end gap-2 pt-2"><button type="button" className="btn-outline" onClick={() => setForm(null)}>Cancel</button><button className="btn-primary">Save</button></div>
          </form>
        </Modal>)}
    </div>
  );
}
