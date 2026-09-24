import { useRef, useState } from 'react';
import { ratingLabel } from '../utils/format';

// Inline SVG shown when an image URL fails to load
const FALLBACK = "data:image/svg+xml;utf8," + encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' width='800' height='500'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='#0b3a8c'/><stop offset='1' stop-color='#3b82c4'/></linearGradient></defs><rect width='800' height='500' fill='url(#g)'/><text x='400' y='265' font-size='44' text-anchor='middle' fill='white' opacity='.7' font-family='Arial'>StayEvent</text></svg>");

export function Img({ src, alt = '', className = '' }) {
  return <img src={src || FALLBACK} alt={alt} loading="lazy" className={`object-cover ${className}`} onError={(e) => { if (e.currentTarget.src !== FALLBACK) e.currentTarget.src = FALLBACK; }} />;
}

export function Spinner({ text = 'Loading…' }) {
  return (
    <div className="flex flex-col items-center gap-3 py-20 text-gray-500" role="status">
      <div className="spin-ring h-10 w-10" />
      <span className="text-sm">{text}</span>
    </div>
  );
}

export function ErrorBox({ children }) {
  if (!children) return null;
  return <div role="alert" className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{children}</div>;
}

export function Empty({ title, text, children }) {
  return (
    <div className="rounded-lg border border-dashed border-gray-300 bg-mist px-6 py-14 text-center">
      <p className="text-lg font-bold">{title}</p>
      {text && <p className="mx-auto mt-1 max-w-md text-sm text-gray-600">{text}</p>}
      <div className="mt-4">{children}</div>
    </div>
  );
}

// Booking-style rating badge: [9.2] Superb · 1,163 reviews
export function RatingBadge({ rating, count, compact }) {
  if (!rating) return null;
  return (
    <div className="flex items-center gap-2">
      <span className="rounded-md rounded-bl-none bg-brand px-1.5 py-1 text-sm font-bold text-white">{Number(rating).toFixed(1)}</span>
      {!compact && <span className="text-sm"><b>{ratingLabel(rating)}</b>{count ? <span className="text-gray-500"> · {count.toLocaleString('en-IN')} reviews</span> : null}</span>}
    </div>
  );
}

export function StarRow({ n = 0, size = 'text-sm' }) {
  return <span className={`${size} tracking-tighter text-sun`} aria-label={`${n} stars`}>{'★'.repeat(n)}</span>;
}

// Clickable 1-5 star picker for reviews
export function StarPicker({ value, onChange }) {
  return (
    <div className="flex gap-1" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button type="button" key={n} onClick={() => onChange(n)} className={`text-3xl leading-none ${n <= value ? 'text-sun' : 'text-gray-300'}`} aria-label={`${n} star`}>★</button>
      ))}
    </div>
  );
}

// Horizontal scrolling row with a next arrow, like Booking.com carousels
export function Row({ children }) {
  const ref = useRef(null);
  return (
    <div className="relative">
      <div ref={ref} className="scrollbar-none -mx-1 flex snap-x gap-4 overflow-x-auto px-1 pb-2">{children}</div>
      <button onClick={() => ref.current.scrollBy({ left: 700, behavior: 'smooth' })} aria-label="Scroll right" className="absolute -right-3 top-1/3 hidden h-9 w-9 items-center justify-center rounded-full border bg-white shadow-md hover:bg-mist md:flex">›</button>
    </div>
  );
}

export function Section({ title, sub, action, children }) {
  return (
    <section className="mt-10">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div><h2 className="text-2xl font-extrabold">{title}</h2>{sub && <p className="mt-1 text-sm text-gray-600">{sub}</p>}</div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function Modal({ title, onClose, children, wide }) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`pop my-8 w-full rounded-xl bg-white p-6 shadow-xl ${wide ? 'max-w-3xl' : 'max-w-lg'}`}>
        <div className="mb-4 flex items-center justify-between"><h3 className="text-xl font-extrabold">{title}</h3><button onClick={onClose} className="text-2xl leading-none text-gray-500" aria-label="Close">×</button></div>
        {children}
      </div>
    </div>
  );
}

export function useAsyncState(initial) { return useState(initial); }
