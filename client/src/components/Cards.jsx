import { Link } from 'react-router-dom';
import { Img, RatingBadge, StarRow } from './ui';
import { inr } from '../utils/format';

// layout="v" -> vertical card (home carousels), layout="h" -> wide result row (search page)
export function HotelCard({ h, layout = 'v', search = '' }) {
  const to = `/hotels/${h._id}${search}`;
  if (layout === 'h')
    return (
      <div className="card flex flex-col overflow-hidden sm:flex-row">
        <Link to={to} className="sm:w-64 sm:shrink-0"><Img src={h.images[0]} alt={h.name} className="h-48 w-full sm:h-full" /></Link>
        <div className="flex flex-1 flex-col gap-2 p-4 sm:flex-row">
          <div className="flex-1">
            <Link to={to} className="text-lg font-extrabold text-link hover:underline">{h.name}</Link>
            <div className="mt-0.5 flex items-center gap-2 text-sm"><StarRow n={h.stars} /><span className="chip">{h.propertyType}</span></div>
            <p className="mt-1 text-sm text-link">{h.city}, {h.state}</p>
            <p className="mt-2 line-clamp-2 text-sm text-gray-600">{h.description}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">{h.amenities.slice(0, 4).map((a) => <span key={a} className="text-xs text-good">✓ {a}</span>)}</div>
          </div>
          <div className="flex shrink-0 flex-row items-end justify-between gap-3 sm:w-44 sm:flex-col sm:items-end">
            <RatingBadge rating={h.rating} count={h.reviewCount} />
            <div className="text-right"><p className="text-xs text-gray-500">Starting from</p><p className="text-2xl font-extrabold">{inr(h.priceFrom)}</p><p className="mb-2 text-xs text-gray-500">per night + taxes</p>
              <Link to={to} className="btn-primary">See availability</Link></div>
          </div>
        </div>
      </div>
    );
  return (
    <Link to={to} className="card block w-64 shrink-0 snap-start overflow-hidden transition-shadow hover:shadow-lg sm:w-72">
      <Img src={h.images[0]} alt={h.name} className="h-44 w-full" />
      <div className="p-4">
        <StarRow n={h.stars} />
        <h3 className="mt-0.5 line-clamp-1 font-extrabold">{h.name}</h3>
        <p className="text-sm text-gray-500">{h.propertyType} in {h.city}</p>
        <div className="mt-2"><RatingBadge rating={h.rating} count={h.reviewCount} /></div>
        <p className="mt-2 line-clamp-2 text-xs text-gray-600">{h.description}</p>
        <p className="mt-3 text-sm"><span className="text-gray-500">From </span><b className="text-lg">{inr(h.priceFrom)}</b><span className="text-gray-500"> per night</span></p>
      </div>
    </Link>
  );
}

export function VenueCard({ v, layout = 'v', search = '' }) {
  const to = `/venues/${v._id}${search}`;
  if (layout === 'h')
    return (
      <div className="card flex flex-col overflow-hidden sm:flex-row">
        <Link to={to} className="sm:w-64 sm:shrink-0"><Img src={v.images[0]} alt={v.name} className="h-48 w-full sm:h-full" /></Link>
        <div className="flex flex-1 flex-col gap-2 p-4 sm:flex-row">
          <div className="flex-1">
            <Link to={to} className="text-lg font-extrabold text-link hover:underline">{v.name}</Link>
            <p className="mt-0.5 text-sm text-link">{v.city}, {v.state}</p>
            <p className="mt-1 text-sm font-semibold">Up to {v.capacity} guests</p>
            <p className="mt-2 line-clamp-2 text-sm text-gray-600">{v.description}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">{v.eventTypes.map((t) => <span key={t} className="chip">{t}</span>)}</div>
          </div>
          <div className="flex shrink-0 flex-row items-end justify-between gap-3 sm:w-44 sm:flex-col sm:items-end">
            <RatingBadge rating={v.rating} count={v.reviewCount} />
            <div className="text-right"><p className="text-xs text-gray-500">Per day</p><p className="text-2xl font-extrabold">{inr(v.pricePerDay)}</p><p className="mb-2 text-xs text-gray-500">+ taxes</p>
              <Link to={to} className="btn-primary">Check date</Link></div>
          </div>
        </div>
      </div>
    );
  return (
    <Link to={to} className="card block w-64 shrink-0 snap-start overflow-hidden transition-shadow hover:shadow-lg sm:w-72">
      <Img src={v.images[0]} alt={v.name} className="h-44 w-full" />
      <div className="p-4">
        <h3 className="line-clamp-1 font-extrabold">{v.name}</h3>
        <p className="text-sm text-gray-500">{v.city} · up to {v.capacity} guests</p>
        <div className="mt-2"><RatingBadge rating={v.rating} count={v.reviewCount} /></div>
        <p className="mt-3 text-sm"><span className="text-gray-500">From </span><b className="text-lg">{inr(v.pricePerDay)}</b><span className="text-gray-500"> per day</span></p>
      </div>
    </Link>
  );
}
