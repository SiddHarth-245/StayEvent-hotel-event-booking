import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import api, { errMsg } from '../utils/api';
import { ErrorBox, Spinner } from '../components/ui';
import Summary from '../components/Summary';
import { Steps } from './BookingPage';
import { METHOD_LABEL, fmtDateTime, inr } from '../utils/format';

export default function Confirmation() {
  const { id } = useParams();
  const { state } = useLocation();
  const [b, setB] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => { api.get(`/bookings/${id}`).then((r) => setB(r.data)).catch((e) => setError(errMsg(e))); }, [id]);

  if (!b) return <div className="mx-auto max-w-3xl p-6">{error ? <ErrorBox>{error}</ErrorBox> : <Spinner />}</div>;
  const ok = b.status === 'Confirmed';
  const p = b.payment;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="print:hidden"><Steps step={ok ? 4 : 2} /></div>
      <div className="mt-6 grid gap-6 md:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          <div className={`card pop p-6 text-center ${ok ? 'border-good/40' : ''}`}>
            {ok ? (
              <>
                <svg viewBox="0 0 52 52" className="mx-auto h-20 w-20" fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle className="check-circle" cx="26" cy="26" r="24" stroke="#008234" /><path className="check-tick" d="M14 27l8 8 16-17" stroke="#008234" /></svg>
                <h1 className="mt-3 text-2xl font-extrabold">{state?.fresh ? 'Your booking is confirmed!' : 'Booking confirmed'}</h1>
                <p className="mt-1 text-gray-600">Show this code at {b.type === 'hotel' ? 'check-in' : 'the venue'}.</p>
                <p className="mx-auto mt-3 inline-block rounded-lg bg-brand-light px-6 py-3 text-2xl font-extrabold tracking-widest text-brand">{b.bookingCode}</p>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-extrabold">{b.status === 'Cancelled' ? 'This booking was cancelled' : 'Payment still pending'}</h1>
                <p className="mt-1 text-gray-600">Booking code {b.bookingCode}</p>
                {b.status === 'Pending' && <Link to={`/payment/${b._id}`} className="btn-yellow mt-4">Complete payment</Link>}
              </>
            )}
          </div>

          <div className="card space-y-2 p-5 text-sm">
            <h2 className="text-lg font-extrabold">Payment</h2>
            <Line k="Status" v={<span className={`font-bold ${b.paymentStatus === 'Paid' ? 'text-good' : ''}`}>{b.paymentStatus}</span>} />
            {b.paymentMethod && <Line k="Method" v={`${METHOD_LABEL[b.paymentMethod]}${p?.methodDetail && b.paymentMethod !== 'cod' ? ` (${p.methodDetail})` : ''}`} />}
            {p && <Line k="Transaction ID" v={p.transactionId} />}
            {p && <Line k="Date" v={fmtDateTime(p.createdAt)} />}
            <Line k={b.paymentStatus === 'Pay at property' ? 'Amount due at property' : 'Amount'} v={<b>{inr(b.amount)}</b>} />
          </div>

          <div className="card space-y-2 p-5 text-sm">
            <h2 className="text-lg font-extrabold">Guest</h2>
            <Line k="Name" v={b.contact?.name} /><Line k="Mobile" v={b.contact?.phone} />
            {b.specialRequests && <Line k="Requests" v={b.specialRequests} />}
          </div>

          <div className="flex flex-wrap gap-3 print:hidden">
            <Link to="/my-bookings" className="btn-primary">View my bookings</Link>
            <button className="btn-outline" onClick={() => window.print()}>Print / save as PDF</button>
            <Link to="/" className="btn-outline">Explore more</Link>
          </div>
        </div>
        <Summary b={b} />
      </div>
    </div>
  );
}
const Line = ({ k, v }) => <div className="flex justify-between gap-4"><span className="text-gray-500">{k}</span><span className="text-right font-semibold">{v}</span></div>;
