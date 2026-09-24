import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errMsg } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { StarPicker } from './ui';
import { fmtDate } from '../utils/format';

// Reviews list + "write a review" form. Used on hotel and venue pages.
export default function ReviewsSection({ type, itemId, onChange }) {
  const { user } = useAuth();
  const toast = useToast();
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ rating: 5, comment: '' });
  const [editId, setEditId] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = () => api.get('/reviews', { params: { [type]: itemId } }).then((r) => setList(r.data)).catch(() => {});
  useEffect(() => { load(); }, [itemId]);

  const mine = user && list.find((r) => r.user?._id === user._id);
  const done = (msg) => { toast.success(msg); setForm({ rating: 5, comment: '' }); setEditId(null); load(); onChange?.(); };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (editId) await api.put(`/reviews/${editId}`, form);
      else await api.post('/reviews', { type, itemId, ...form });
      done(editId ? 'Review updated' : 'Thanks for your review!');
    } catch (err) { toast.error(errMsg(err)); } finally { setBusy(false); }
  };
  const del = async (id) => {
    if (!confirm('Delete this review?')) return;
    try { await api.delete(`/reviews/${id}`); done('Review deleted'); } catch (err) { toast.error(errMsg(err)); }
  };

  return (
    <div id="reviews">
      <h2 className="text-2xl font-extrabold">Guest reviews</h2>
      {list.length === 0 && <p className="mt-2 text-sm text-gray-600">No written reviews yet. Book a stay and be the first to review.</p>}
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {list.map((r) => (
          <div key={r._id} className="card p-4">
            <div className="flex items-center justify-between"><p className="font-bold">{r.user?.name || 'Guest'}</p><span className="text-sun">{'★'.repeat(r.rating)}<span className="text-gray-300">{'★'.repeat(5 - r.rating)}</span></span></div>
            <p className="text-xs text-gray-500">{fmtDate(r.createdAt)}</p>
            <p className="mt-2 text-sm">{r.comment}</p>
            {user && r.user?._id === user._id && (
              <div className="mt-2 flex gap-3 text-sm"><button className="link" onClick={() => { setEditId(r._id); setForm({ rating: r.rating, comment: r.comment }); }}>Edit</button><button className="text-red-600 hover:underline" onClick={() => del(r._id)}>Delete</button></div>)}
          </div>))}
      </div>

      {user && (!mine || editId) && (
        <form onSubmit={submit} className="card mt-5 max-w-xl space-y-3 p-4">
          <p className="font-bold">{editId ? 'Edit your review' : 'Write a review'}</p>
          <StarPicker value={form.rating} onChange={(rating) => setForm({ ...form, rating })} />
          <textarea className="input" rows={3} placeholder="How was your experience?" value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} required />
          <div className="flex gap-2"><button className="btn-primary" disabled={busy}>{editId ? 'Save changes' : 'Post review'}</button>{editId && <button type="button" className="btn-outline" onClick={() => { setEditId(null); setForm({ rating: 5, comment: '' }); }}>Cancel</button>}</div>
          <p className="text-xs text-gray-500">Reviews are open to guests with a confirmed booking.</p>
        </form>)}
      {!user && <p className="mt-4 text-sm text-gray-600"><Link to="/login" className="link">Sign in</Link> to write a review after your booking.</p>}
    </div>
  );
}
