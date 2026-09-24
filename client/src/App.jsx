import { Route, Routes, Link } from 'react-router-dom';
import Layout from './components/Layout';
import { Protected, AdminOnly } from './components/Guards';
import Home from './pages/Home';
import { Login, Register } from './pages/Auth';
import Hotels from './pages/Hotels';
import Venues from './pages/Venues';
import HotelDetails from './pages/HotelDetails';
import VenueDetails from './pages/VenueDetails';
import BookingPage from './pages/BookingPage';
import Payment from './pages/Payment';
import Confirmation from './pages/Confirmation';
import MyBookings from './pages/MyBookings';
import Profile from './pages/Profile';
import MyReviews from './pages/MyReviews';
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import AdminItems from './pages/admin/AdminItems';
import { AdminBookings, AdminPayments, AdminReviews, AdminUsers } from './pages/admin/AdminTables';

const NotFound = () => (
  <div className="mx-auto max-w-md px-4 py-24 text-center">
    <p className="text-6xl font-extrabold text-brand">404</p>
    <p className="mt-2 text-gray-600">We couldn't find that page.</p>
    <Link to="/" className="btn-primary mt-6">Go to home</Link>
  </div>
);

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Public: anyone can browse */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/hotels" element={<Hotels />} />
        <Route path="/hotels/:id" element={<HotelDetails />} />
        <Route path="/venues" element={<Venues />} />
        <Route path="/venues/:id" element={<VenueDetails />} />

        {/* Sign in needed only from here (booking onwards) */}
        <Route path="/book/:type/:id" element={<Protected><BookingPage /></Protected>} />
        <Route path="/payment/:id" element={<Protected><Payment /></Protected>} />
        <Route path="/confirmation/:id" element={<Protected><Confirmation /></Protected>} />
        <Route path="/my-bookings" element={<Protected><MyBookings /></Protected>} />
        <Route path="/profile" element={<Protected><Profile /></Protected>} />
        <Route path="/reviews" element={<Protected><MyReviews /></Protected>} />

        {/* Admin panel */}
        <Route path="/admin" element={<AdminOnly><AdminLayout /></AdminOnly>}>
          <Route index element={<Dashboard />} />
          <Route path="hotels" element={<AdminItems kind="hotel" />} />
          <Route path="venues" element={<AdminItems kind="venue" />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="payments" element={<AdminPayments />} />
          <Route path="reviews" element={<AdminReviews />} />
          <Route path="users" element={<AdminUsers />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
