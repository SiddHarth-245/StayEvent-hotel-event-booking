import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import SearchBar from '../components/SearchBar';
import { HotelCard, VenueCard } from '../components/Cards';
import { Img, Row, Section, Spinner } from '../components/ui';

const HERO = 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1800&q=70';
const LANDMARKS = [
  ['Taj Mahal, Agra', 'Agra', 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=70'],
  ['Hawa Mahal, Jaipur', 'Jaipur', 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=800&q=70'],
  ['Gateway of India, Mumbai', 'Mumbai', 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=800&q=70'],
  ['Kerala backwaters, Kochi', 'Kochi', 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=70'],
  ['Baga Beach, Goa', 'Goa', 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=70'],
];

export default function Home() {
  const [tab, setTab] = useState('hotel');
  const [cities, setCities] = useState([]);
  const [hotels, setHotels] = useState(null);
  const [venues, setVenues] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.get('/hotels/cities'), api.get('/hotels?limit=100'), api.get('/venues?limit=8')])
      .then(([c, h, v]) => { setCities(c.data); setHotels(h.data); setVenues(v.data); })
      .catch(() => setError('Could not load hotels. Please make sure the backend server is running on port 5000.'));
  }, []);

  const by = (key, n = 8) => [...(hotels || [])].sort((a, b) => b[key] - a[key]).slice(0, n);
  const types = hotels ? Object.entries(hotels.reduce((m, h) => ({ ...m, [h.propertyType]: (m[h.propertyType] || 0) + 1 }), {})) : [];

  return (
    <div>
      {/* HERO */}
      <div className="relative">
        <Img src={HERO} alt="" className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-0 bg-brand/80" />
        <div className="relative mx-auto max-w-6xl px-4 pb-10 pt-14 md:pt-24">
          <h1 className="text-3xl font-extrabold text-white md:text-5xl">Hotels and event venues across India</h1>
          <p className="mt-2 max-w-2xl text-white/90">Browse freely, no account needed. Sign in only when you are ready to book.</p>
          <div className="mt-6 flex gap-2">
            {[['hotel', 'Stays'], ['venue', 'Event venues']].map(([k, t]) => (
              <button key={k} onClick={() => setTab(k)} className={`rounded-full border px-4 py-2 text-sm font-semibold ${tab === k ? 'border-white bg-white text-brand' : 'border-white/60 text-white hover:bg-white/10'}`}>{t}</button>
            ))}
          </div>
          <div className="mt-3"><SearchBar key={tab} kind={tab} /></div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4">
        {/* Promises */}
        <div className="mt-8 grid gap-3 md:grid-cols-3">
          {[['No account to browse', 'Explore every hotel, venue and price first.'], ['Pay your way', 'UPI, cards, net banking, wallets or pay at the property.'], ['Free cancellation', 'Cancel up to 24 hours before you arrive.']].map(([t, d]) => (
            <div key={t} className="card flex gap-3 p-4"><span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-good text-sm text-white">✓</span><div><p className="font-bold">{t}</p><p className="text-sm text-gray-600">{d}</p></div></div>
          ))}
        </div>

        {error && <div className="mt-8 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert">{error}</div>}
        {!hotels && !error && <Spinner text="Finding the best stays…" />}

        {hotels && (
          <>
            <Section title="Top destinations for India city trips" sub="Find hotels in some of the most popular cities">
              <Row>{cities.map((c) => (
                <Link key={c.city} to={`/hotels?q=${encodeURIComponent(c.city)}`} className="block w-52 shrink-0 snap-start sm:w-56">
                  <Img src={c.image} alt={c.city} className="h-36 w-full rounded-lg" />
                  <p className="mt-2 font-extrabold">{c.city}</p><p className="text-sm text-gray-500">{c.state}</p><p className="text-sm font-bold">{c.count} {c.count === 1 ? 'hotel' : 'hotels'}</p>
                </Link>))}</Row>
            </Section>

            <Section title="Browse by property type" sub="Hotels, resorts, villas, homestays and more">
              <div className="flex flex-wrap gap-3">{types.map(([t, n]) => (
                <Link key={t} to={`/hotels?type=${encodeURIComponent(t)}`} className="card px-5 py-3 hover:border-link hover:shadow"><p className="font-extrabold">{t}</p><p className="text-sm text-gray-500">{n} properties</p></Link>))}</div>
            </Section>

            <Section title="Hotels near popular landmarks" sub="Pick a point of interest and find a hotel nearby">
              <Row>{LANDMARKS.map(([t, q, src]) => (
                <Link key={t} to={`/hotels?q=${q}`} className="block w-52 shrink-0 snap-start sm:w-60">
                  <Img src={src} alt={t} className="h-36 w-full rounded-lg" /><p className="mt-2 font-extrabold">{t}</p>
                  <p className="text-sm text-gray-500">{hotels.filter((h) => h.city === q).length} hotels</p></Link>))}</Row>
            </Section>

            <Section title="Explore India, one stay at a time">
              <div className="grid gap-6 md:grid-cols-2">
                <p className="text-sm leading-relaxed text-gray-700">Beautiful yet gritty, tranquil yet bustling: travelling in India is like riding an emotional roller coaster. From the snow peaks of the Himalayas to the steamy backwaters of Kerala, the country holds an endless variety of landscapes and thousands of years of history. Short on time? Follow the Golden Triangle of Delhi, Jaipur and Agra, where you will find spice markets, palaces, red forts and the Taj Mahal. With more time, head to the lakes of Udaipur, the beaches of Goa or the hill stations of Uttarakhand. Whatever your route, StayEvent has a place for you, from ₹999 homestays to five-star palaces, and venues for the weddings, conferences and celebrations along the way.</p>
                <Img src={HERO} alt="Beach in Goa" className="h-56 w-full rounded-lg" />
              </div>
            </Section>

            <Section title="Top picks for hotels in India" sub="Popular and highly rated" action={<Link to="/hotels" className="btn-outline">See all</Link>}>
              <Row>{by('rating', 8).map((h) => <HotelCard key={h._id} h={h} />)}</Row>
            </Section>
            <Section title="Best reviewed stays" sub="Guests loved these" action={<Link to="/hotels?sort=rating" className="btn-outline">See all</Link>}>
              <Row>{[...hotels].filter((h) => h.reviewCount > 0).sort((a, b) => b.rating - a.rating).slice(0, 8).map((h) => <HotelCard key={h._id} h={h} />)}</Row>
            </Section>
            <Section title="Most booked in the past month" action={<Link to="/hotels?sort=popular" className="btn-outline">See all</Link>}>
              <Row>{by('bookingCount', 8).map((h) => <HotelCard key={h._id} h={h} />)}</Row>
            </Section>

            <Section title="Event venues for every occasion" sub="Weddings, conferences, birthdays and receptions" action={<Link to="/venues" className="btn-outline">See all venues</Link>}>
              <Row>{venues.map((v) => <VenueCard key={v._id} v={v} />)}</Row>
            </Section>

            <Section title="Stay close to the airport">
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">{[['Delhi International Airport (DEL)', 'New Delhi'], ['Mumbai Airport (BOM)', 'Mumbai'], ['Chennai Airport (MAA)', 'Chennai'], ['Kochi Airport (COK)', 'Kochi']].map(([t, q]) => (
                <Link key={t} to={`/hotels?q=${encodeURIComponent(q)}`} className="card flex items-center gap-3 p-4 hover:border-link"><span aria-hidden>✈</span><span className="text-sm font-semibold">{t}</span></Link>))}</div>
            </Section>

            <Section title="More places to explore">
              <div className="grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2 md:grid-cols-3">
                {cities.map((c) => <Link key={c.city} to={`/hotels?q=${encodeURIComponent(c.city)}`} className="link">Hotels in {c.city}</Link>)}
                {['Wedding', 'Conference', 'Birthday'].map((t) => <Link key={t} to={`/venues?eventType=${t}`} className="link">{t} venues in India</Link>)}
              </div>
            </Section>
          </>
        )}
      </div>
    </div>
  );
}
