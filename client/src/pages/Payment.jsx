import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import api, { errMsg } from '../utils/api';
import { ErrorBox, Spinner } from '../components/ui';
import Summary from '../components/Summary';
import { Steps } from './BookingPage';
import { inr } from '../utils/format';

const METHODS = [
  { id: 'upi', title: 'UPI', sub: 'Google Pay, PhonePe, Paytm, BHIM', icon: '📲' },
  { id: 'card', title: 'Credit / Debit card', sub: 'Visa, Mastercard, RuPay', icon: '💳' },
  { id: 'netbanking', title: 'Net banking', sub: 'All major Indian banks', icon: '🏦' },
  { id: 'wallet', title: 'Mobile banking / wallets', sub: 'Paytm, PhonePe, Amazon Pay and more', icon: '📱' },
  { id: 'cod', title: 'Pay at property', sub: 'Confirm now, pay when you arrive', icon: '💵' },
];
const BANKS = ['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra', 'Punjab National Bank', 'Bank of Baroda', 'Canara Bank'];
const WALLETS = ['Paytm', 'PhonePe', 'Amazon Pay', 'MobiKwik', 'Airtel Payments Bank', 'Freecharge'];
const STEPS_TEXT = ['Contacting your bank…', 'Verifying the payment…', 'Confirming your booking…'];

export default function Payment() {
  const { id } = useParams();
  const nav = useNavigate();
  const [b, setB] = useState(null);
  const [method, setMethod] = useState('upi');
  const [d, setD] = useState({ vpa: '', number: '', name: '', expiry: '', cvv: '', bank: '', provider: '', mobile: '' });
  const [error, setError] = useState('');
  const [phase, setPhase] = useState('idle');   // idle | processing | success
  const [stepIdx, setStepIdx] = useState(0);
  const [left, setLeft] = useState(null);       // seconds left in the 15-minute hold
  const set = (k, v) => setD((x) => ({ ...x, [k]: v }));

  useEffect(() => { api.get(`/bookings/${id}`).then((r) => setB(r.data)).catch((e) => setError(errMsg(e))); }, [id]);

  // countdown
  useEffect(() => {
    if (!b) return;
    const end = new Date(b.createdAt).getTime() + 15 * 60000;
    const tick = () => setLeft(Math.max(0, Math.round((end - Date.now()) / 1000)));
    tick(); const t = setInterval(tick, 1000); return () => clearInterval(t);
  }, [b]);

  // cycle the progress messages while processing
  useEffect(() => {
    if (phase !== 'processing') return;
    const t = setInterval(() => setStepIdx((i) => (i + 1) % STEPS_TEXT.length), 700);
    return () => clearInterval(t);
  }, [phase]);

  if (!b) return <div className="mx-auto max-w-3xl p-6">{error ? <ErrorBox>{error}</ErrorBox> : <Spinner />}</div>;
  if (b.status === 'Confirmed' && phase === 'idle') return <Navigate to={`/confirmation/${id}`} replace />;
  const expired = b.status === 'Cancelled' || left === 0;
  const mm = String(Math.floor((left || 0) / 60)).padStart(2, '0'), ss = String((left || 0) % 60).padStart(2, '0');

  const pay = async () => {
    setError('');
    setPhase('processing'); setStepIdx(0);
    try {
      const details = method === 'upi' ? { vpa: d.vpa } : method === 'card' ? { number: d.number, name: d.name, expiry: d.expiry, cvv: d.cvv } : method === 'netbanking' ? { bank: d.bank } : method === 'wallet' ? { provider: d.provider, mobile: d.mobile } : {};
      await api.post('/payments/pay', { bookingId: id, method, details });
      setPhase('success');
      setTimeout(() => nav(`/confirmation/${id}`, { replace: true, state: { fresh: true } }), 1600);
    } catch (e) { setPhase('idle'); setError(errMsg(e)); window.scrollTo(0, 0); }
  };

  const fmtCard = (v) => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  const fmtExp = (v) => { const x = v.replace(/\D/g, '').slice(0, 4); return x.length > 2 ? `${x.slice(0, 2)}/${x.slice(2)}` : x; };

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <Steps step={2} />
      <div className="mt-6 grid gap-6 md:grid-cols-[1fr_340px]">
        <div>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h1 className="text-xl font-extrabold">How would you like to pay?</h1>
            {!expired && <span className="rounded-full bg-sun/30 px-3 py-1 text-sm font-bold" role="timer">Held for {mm}:{ss}</span>}
          </div>
          <ErrorBox>{error}</ErrorBox>
          {expired ? (
            <div className="card p-6 text-center"><p className="text-lg font-extrabold">Your 15-minute hold has ended</p><p className="mt-1 text-sm text-gray-600">The {b.type === 'hotel' ? 'room' : 'date'} was released so others can book it.</p><Link to={b.type === 'hotel' ? `/hotels/${b.hotel._id}` : `/venues/${b.venue._id}`} className="btn-primary mt-4">Start again</Link></div>
          ) : (
            <div className="card divide-y overflow-hidden">
              {METHODS.map((m) => (
                <div key={m.id}>
                  <label className={`flex cursor-pointer items-center gap-3 p-4 ${method === m.id ? 'bg-brand-light' : 'hover:bg-mist'}`}>
                    <input type="radio" name="method" checked={method === m.id} onChange={() => { setMethod(m.id); setError(''); }} />
                    <span className="text-2xl" aria-hidden>{m.icon}</span>
                    <span><span className="block font-bold">{m.title}</span><span className="text-sm text-gray-500">{m.sub}</span></span>
                  </label>
                  {method === m.id && (
                    <div className="space-y-3 bg-white p-4 pl-6 md:pl-14">
                      {m.id === 'upi' && <>
                        <div><label className="label" htmlFor="vpa">UPI ID</label><input id="vpa" className="input max-w-sm" placeholder="yourname@okhdfcbank" value={d.vpa} onChange={(e) => set('vpa', e.target.value.trim())} autoCapitalize="none" /></div>
                        <div className="flex flex-wrap gap-2">{['@okhdfcbank', '@oksbi', '@ybl', '@paytm', '@okaxis'].map((s) => <button type="button" key={s} className="chip hover:bg-mist" onClick={() => set('vpa', d.vpa.split('@')[0] + s)}>{s}</button>)}</div>
                        <p className="text-xs text-gray-500">You will get a payment request in your UPI app. Approve it to finish.</p></>}
                      {m.id === 'card' && <div className="grid max-w-md gap-3">
                        <div><label className="label" htmlFor="cn">Card number</label><input id="cn" className="input" inputMode="numeric" placeholder="1234 5678 9012 3456" value={d.number} onChange={(e) => set('number', fmtCard(e.target.value))} autoComplete="cc-number" /></div>
                        <div><label className="label" htmlFor="cname">Name on card</label><input id="cname" className="input" value={d.name} onChange={(e) => set('name', e.target.value)} autoComplete="cc-name" /></div>
                        <div className="grid grid-cols-2 gap-3">
                          <div><label className="label" htmlFor="cx">Expiry (MM/YY)</label><input id="cx" className="input" inputMode="numeric" placeholder="08/29" value={d.expiry} onChange={(e) => set('expiry', fmtExp(e.target.value))} autoComplete="cc-exp" /></div>
                          <div><label className="label" htmlFor="cv">CVV</label><input id="cv" type="password" className="input" inputMode="numeric" maxLength={4} value={d.cvv} onChange={(e) => set('cvv', e.target.value.replace(/\D/g, ''))} autoComplete="cc-csc" /></div></div>
                        <p className="text-xs text-gray-500">Demo mode: use any card number. 4000 0000 0000 0002 simulates a declined card.</p></div>}
                      {m.id === 'netbanking' && <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{BANKS.map((x) => <button type="button" key={x} onClick={() => set('bank', x)} className={`rounded-md border p-3 text-sm font-semibold ${d.bank === x ? 'border-link bg-brand-light text-brand' : 'hover:bg-mist'}`}>{x}</button>)}</div>}
                      {m.id === 'wallet' && <>
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{WALLETS.map((x) => <button type="button" key={x} onClick={() => set('provider', x)} className={`rounded-md border p-3 text-sm font-semibold ${d.provider === x ? 'border-link bg-brand-light text-brand' : 'hover:bg-mist'}`}>{x}</button>)}</div>
                        <div><label className="label" htmlFor="mob">Linked mobile number</label><input id="mob" className="input max-w-xs" inputMode="numeric" maxLength={10} value={d.mobile} onChange={(e) => set('mobile', e.target.value.replace(/\D/g, ''))} /></div></>}
                      {m.id === 'cod' && <p className="text-sm text-gray-700">Your booking is confirmed immediately. Pay <b>{inr(b.amount)}</b> in cash or by card/UPI at the {b.type === 'hotel' ? 'front desk' : 'venue'}. Please carry your booking code.</p>}
                    </div>)}
                </div>))}
            </div>
          )}
          {!expired && <button className="btn-yellow mt-4 w-full py-3 text-base sm:w-auto" onClick={pay} disabled={phase !== 'idle'}>{method === 'cod' ? 'Confirm booking' : `Pay ${inr(b.amount)} securely`}</button>}
        </div>
        <Summary b={b} />
      </div>

      {phase !== 'idle' && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-white/90 backdrop-blur-sm" role="alertdialog" aria-live="assertive">
          <div className="pop text-center">
            {phase === 'processing' ? (<><div className="spin-ring mx-auto h-16 w-16" /><p className="mt-5 text-lg font-extrabold">{STEPS_TEXT[stepIdx]}</p><p className="text-sm text-gray-500">Please do not close or refresh this page.</p></>) : (
              <><svg viewBox="0 0 52 52" className="mx-auto h-24 w-24" fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle className="check-circle" cx="26" cy="26" r="24" stroke="#008234" /><path className="check-tick" d="M14 27l8 8 16-17" stroke="#008234" /></svg>
                <p className="mt-4 text-xl font-extrabold text-good">{method === 'cod' ? 'Booking confirmed' : 'Payment successful'}</p><p className="text-sm text-gray-500">Taking you to your confirmation…</p></>)}
          </div>
        </div>)}
    </div>
  );
}
