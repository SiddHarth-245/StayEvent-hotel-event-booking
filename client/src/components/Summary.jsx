import { Img, StarRow } from './ui';
import { fmtDate, inr } from '../utils/format';

// Price + booking summary card. `b` is a booking object (populated hotel / venue)
export default function Summary({ b }) {
  const item = b.type === 'hotel' ? b.hotel : b.venue;
  return (
    <div className="card overflow-hidden">
      <Img src={item?.images?.[0]} alt="" className="h-36 w-full" />
      <div className="space-y-2 p-4 text-sm">
        {b.type === 'hotel' && <StarRow n={item?.stars} />}
        <p className="text-lg font-extrabold">{item?.name}</p>
        <p className="text-gray-500">{item?.city}, {item?.state}</p>
        <hr />
        {b.type === 'hotel' ? (
          <>
            <Row k="Check-in" v={fmtDate(b.checkIn)} /><Row k="Check-out" v={fmtDate(b.checkOut)} />
            <Row k="Stay" v={`${b.nights} night${b.nights > 1 ? 's' : ''}`} /><Row k="Room" v={`${b.rooms} × ${b.roomType}`} /><Row k="Guests" v={b.guests} />
          </>
        ) : (
          <><Row k="Event date" v={fmtDate(b.eventDate)} /><Row k="Event" v={b.eventType} /><Row k="Guests" v={b.guests} /></>
        )}
        <hr />
        <Row k="Price" v={inr(b.subtotal)} /><Row k="Taxes (GST)" v={inr(b.tax)} />
        <div className="flex items-end justify-between border-t pt-3"><span className="font-bold">Total</span><span className="text-2xl font-extrabold">{inr(b.amount)}</span></div>
      </div>
    </div>
  );
}
const Row = ({ k, v }) => <div className="flex justify-between gap-4"><span className="text-gray-500">{k}</span><span className="text-right font-semibold">{v}</span></div>;
