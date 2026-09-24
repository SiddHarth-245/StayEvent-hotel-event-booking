import { NavLink, Outlet } from 'react-router-dom';

const LINKS = [['/admin', 'Dashboard', true], ['/admin/hotels', 'Hotels'], ['/admin/venues', 'Venues'], ['/admin/bookings', 'Bookings'], ['/admin/payments', 'Payments'], ['/admin/reviews', 'Reviews'], ['/admin/users', 'Users']];

export default function AdminLayout() {
  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 md:grid-cols-[200px_1fr]">
      <nav className="card h-fit p-2" aria-label="Admin">
        <p className="px-3 py-2 text-xs font-bold text-gray-500">ADMIN PANEL</p>
        <div className="flex gap-1 overflow-x-auto md:flex-col">
          {LINKS.map(([to, t, end]) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => `whitespace-nowrap rounded-md px-3 py-2 text-sm font-semibold ${isActive ? 'bg-brand text-white' : 'hover:bg-mist'}`}>{t}</NavLink>))}
        </div>
      </nav>
      <div className="min-w-0"><Outlet /></div>
    </div>
  );
}
