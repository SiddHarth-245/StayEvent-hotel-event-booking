import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errMsg } from '../utils/api';
import { useToast } from '../context/ToastContext';
import { Empty, Spinner, StarPicker } from '../components/ui';
import { fmtDate } from '../utils/format';

export default function MyReviews() {
  const toast = useToast();
  const [reviews, setReviews] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [edit, setEdit] = useState(null);
  const load = () => Promise.all([api.get('/reviews/mine'), api.get('/bookings/mine')]).then(([r, b]) => { setReviews(r.data); setBookings(b.data); });
  useEffect(() => { load(); }, []);

  const save = async () => {
    try { await api.put(`/reviews/${edit._id}`, { rating: edit.rating, comment: edit.comment }); toast.success('Review updated'); setEdit(null); load(); } catch (e) { toast.error(errMsg(e)); }
  };
  const del = async (id) => { if (confirm('Delete this review?')) { await api.delete(`/reviews/${id}`); toast.success('Review deleted'); load(); } };

  if (!reviews) return <Spinner />;
  const reviewed = new Set(reviews.map((r) => String((r.hotel || r.venue)?._id)));
  const todo = bookings.filter((b) => b.status === 'Confirmed').map((b) => ({ b, item: b.type === 'hotel' ? b.hotel : b.venue })).filter(({ item }) => item && !reviewed.has(String(item._id)));

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-extrabold">My reviews</h1>
      {todo.length > 0 && (
        <div className="card mt-4 bg-brand-light p-4"><p className="font-bold">Waiting for your review</p>
          <ul className="mt-2 space-y-1 text-sm">{[...new Map(todo.map((t) => [t.item._id, t])).values()].map(({ b, item }) => <li key={item._id}><Link className="link" to={`/${b.type}s/${item._id}#reviews`}>{item.name}</Link> · {item.city}</li>)}</ul></div>)}
      <div className="mt-5 space-y-3">
        {reviews.length === 0 && <Empty title="No reviews yet" text="After a confirmed booking you can rate the hotel or venue." />}
        {reviews.map((r) => {
          const item = r.hotel || r.venue;
          return (
            <div key={r._id} className="card p-4">
              <div className="flex items-center justify-between"><Link to={`/${r.type}s/${item?._id}`} className="font-extrabold text-link hover:underline">{item?.name || 'Removed listing'}</Link><span className="text-sun">{'★'.repeat(r.rating)}</span></div>
              <p className="text-xs text-gray-500">{fmtDate(r.createdAt)}</p>
              {edit?._id === r._id ? (
                <div className="mt-2 space-y-2"><StarPicker value={edit.rating} onChange={(rating) => setEdit({ ...edit, rating })} /><textarea className="input" rows={3} value={edit.comment} onChange={(e) => setEdit({ ...edit, comment: e.target.value })} />
                  <div className="flex gap-2"><button className="btn-primary" onClick={save}>Save</button><button className="btn-outline" onClick={() => setEdit(null)}>Cancel</button></div></div>
              ) : (<><p className="mt-2 text-sm">{r.comment}</p><div className="mt-2 flex gap-3 text-sm"><button className="link" onClick={() => setEdit({ ...r })}>Edit</button><button className="text-red-600 hover:underline" onClick={() => del(r._id)}>Delete</button></div></>)}
            </div>);
        })}
      </div>
    </div>
  );
}
