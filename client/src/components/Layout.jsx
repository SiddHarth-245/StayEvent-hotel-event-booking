import { useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 text-white" aria-label="StayEvent home">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sun text-lg font-extrabold text-brand">S</span>
      <span className="text-xl font-extrabold tracking-tight">StayEvent</span>
    </Link>
  );
}

export function Navbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const pill = ({ isActive }) => `rounded-full border px-4 py-2 text-sm font-semibold ${isActive ? 'border-white bg-white/15 text-white' : 'border-transparent text-white/90 hover:bg-white/10'}`;
  const out = () => { logout(); setMenu(false); nav('/'); };

  return (
    <header className="bg-brand">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Logo />
        <div className="flex items-center gap-2 text-sm text-white">
          <span className="hidden font-semibold sm:inline">INR ₹</span>
          {!user ? (
            <>
              <Link to="/register" className="rounded-md border border-white bg-white px-3 py-1.5 font-semibold text-link hover:bg-brand-light">Register</Link>
              <Link to="/login" className="rounded-md border border-white bg-white px-3 py-1.5 font-semibold text-link hover:bg-brand-light">Sign in</Link>
            </>
          ) : (
            <div className="relative">
              <button onClick={() => setMenu(!menu)} className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-white/10" aria-haspopup="menu" aria-expanded={menu}>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sun font-extrabold text-brand">{user.name[0].toUpperCase()}</span>
                <span className="hidden font-semibold sm:inline">{user.name.split(' ')[0]}</span>
              </button>
              {menu && (
                <div className="absolute right-0 z-40 mt-2 w-52 overflow-hidden rounded-lg bg-white py-1 text-gray-800 shadow-xl" onClick={() => setMenu(false)}>
                  {[['/my-bookings', 'My bookings'], ['/reviews', 'My reviews'], ['/profile', 'Profile']].map(([to, t]) => <Link key={to} to={to} className="block px-4 py-2 text-sm hover:bg-mist">{t}</Link>)}
                  {user.role === 'admin' && <Link to="/admin" className="block px-4 py-2 text-sm font-semibold text-link hover:bg-mist">Admin dashboard</Link>}
                  <button onClick={out} className="block w-full border-t px-4 py-2 text-left text-sm hover:bg-mist">Sign out</button>
                </div>
              )}
            </div>
          )}
          <button className="ml-1 rounded p-1 md:hidden" onClick={() => setOpen(!open)} aria-label="Menu">☰</button>
        </div>
      </div>
      <nav className={`mx-auto max-w-6xl gap-2 px-4 pb-3 md:flex ${open ? 'flex flex-col' : 'hidden'}`}>
        <NavLink to="/" end className={pill}>Home</NavLink>
        <NavLink to="/hotels" className={pill}>Stays</NavLink>
        <NavLink to="/venues" className={pill}>Event venues</NavLink>
        <NavLink to="/my-bookings" className={pill}>My bookings</NavLink>
      </nav>
    </header>
  );
}

export function Footer() {
  const col = (title, links) => (
    <div>
      <h4 className="mb-3 text-sm font-extrabold">{title}</h4>
      <ul className="space-y-2 text-sm text-gray-600">{links.map(([t, to]) => <li key={t}><Link to={to} className="hover:text-link hover:underline">{t}</Link></li>)}</ul>
    </div>
  );
  return (
    <footer className="mt-16 border-t bg-mist">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 md:grid-cols-5">
        {col('Support', [['Manage your trips', '/my-bookings'], ['Contact support', '/'], ['Safety information', '/']])}
        {col('Discover', [['All stays', '/hotels'], ['Event venues', '/venues'], ['Top reviewed', '/hotels?sort=rating'], ['Budget stays', '/hotels?maxPrice=2500']])}
        {col('Terms & settings', [['Privacy notice', '/'], ['Terms of service', '/'], ['Cancellation policy', '/']])}
        {col('Partners', [['List your property', '/'], ['Admin sign in', '/login']])}
        {col('About StayEvent', [['About us', '/'], ['How it works', '/'], ['Careers', '/']])}
      </div>
      <div className="border-t py-4 text-center text-xs text-gray-500">© {new Date().getFullYear()} StayEvent – hotel & event booking. Academic demo project.</div>
    </footer>
  );
}

export default function Layout() {
  const { pathname } = useLocation();
  const plain = pathname.startsWith('/admin');
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1"><Outlet /></main>
      {!plain && <Footer />}
    </div>
  );
}
