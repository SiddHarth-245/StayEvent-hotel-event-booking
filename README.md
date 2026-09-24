# StayEvent – Hotel & Event Booking (MERN)

A full-stack hotel and event-venue booking website for India, built with **MongoDB, Express, React (Vite) and Node.js**.
The design follows the Booking.com style: search bar, top destinations, landmarks, top picks, best reviewed, most booked, event venues and a full footer.

## Highlights
- **Browse without an account.** Home, search, filters, hotel and venue pages, prices, availability and reviews are all public.
- **Sign in only when booking.** Simple **User ID + password** (no email, no OTP). After sign in you return to exactly where you were.
- **Multiple payment options:** UPI, Credit/Debit card, Net banking, Mobile banking/wallets, and **Pay at property (COD)**.
- **Smooth payment flow:** processing screen → animated success → confirmation page with booking code, transaction ID, print option.
- **No double bookings:** room stock per room type and one event per venue per day; unpaid bookings hold the room for 15 minutes.
- **Free cancellation** until 24 hours before the stay; paid bookings are marked *Refunded* (simulated).
- **Reviews & ratings** (only guests with a confirmed booking), edit/delete own review, admin moderation.
- **Admin panel:** dashboard stats, hotels, venues, bookings, payments, reviews, users.

## 1. Requirements
- Node.js 18+ and npm
- MongoDB running locally (`mongodb://127.0.0.1:27017`) **or** a free MongoDB Atlas URI

## 2. Setup
```bash
# server
cd server
npm install
cp .env.example .env        # (already included) edit MONGO_URI / JWT_SECRET if needed
npm run dev                 # API on http://localhost:5000

# client (new terminal)
cd client
npm install
npm run dev                 # website on http://localhost:5173
```
Or from the project root: `npm run install-all` then `npm run dev` (runs both together).

On first start the server **auto-loads sample data** (16 hotels, 8 venues, 2 accounts) when the database is empty.
To reset: `cd server && npm run seed:reset`.

## 3. Demo accounts
| Role | User ID | Password |
|------|---------|----------|
| Customer | `demo` | `demo123` |
| Admin | `admin` | `admin123` (opens the Admin panel from the profile menu) |

## 4. Trying the payment flow
Open any hotel → pick dates → **Reserve** → sign in (if needed) → enter details → choose a payment method.

| Method | What to enter | Result |
|--------|---------------|--------|
| UPI | `name@okhdfcbank` | Success |
| UPI | `name@fail` | Declined (shows retry) |
| Card | any 16 digits, future expiry, any CVV | Success |
| Card | `4000 0000 0000 0002` | Declined |
| Net banking | choose a bank | Success |
| Wallet / mobile banking | choose provider + 10-digit mobile | Success |
| Pay at property | – | Confirmed instantly, paid on arrival |

The gateway is a **built-in simulator** so the project runs without API keys. To use real Razorpay/Stripe test mode, replace the "simulate" block in `server/controllers/paymentController.js` with order creation + signature verification; the rest of the app stays the same.

## 5. Folder structure
```
StayEvent-hotel-event-booking/
├── server/
│   ├── server.js                 # Express app entry
│   ├── config/db.js              # MongoDB connection
│   ├── middleware/               # auth (JWT, admin), error handler
│   ├── models/                   # User, Hotel (rooms inside), Venue, Booking, Payment, Review
│   ├── controllers/              # auth, catalog (hotels+venues), booking, payment, review, admin
│   ├── routes/index.js           # all REST routes
│   ├── utils/                    # helpers, availability logic, asyncHandler
│   └── seed/seed.js              # sample data
└── client/
    └── src/
        ├── App.jsx               # routes (public / protected / admin)
        ├── context/              # AuthContext, ToastContext
        ├── components/           # Layout, SearchBar, Cards, Summary, ReviewsSection, ui, Guards
        ├── pages/                # Home, Hotels, HotelDetails, Venues, VenueDetails, Auth,
        │                         # BookingPage, Payment, Confirmation, MyBookings, Profile, MyReviews
        └── pages/admin/          # AdminLayout, Dashboard, AdminItems, AdminTables
```

## 6. API overview
| Area | Endpoints |
|------|-----------|
| Auth | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`, `PUT /api/auth/profile` |
| Hotels / Venues (public read) | `GET /api/hotels?q&city&minPrice&maxPrice&rating&stars&type&amenities&sort`, `GET /api/hotels/cities`, `GET /api/hotels/:id`, `GET /api/hotels/:id/availability?checkIn&checkOut` (same for `/venues`, availability uses `?date=`) |
| Hotels / Venues (admin) | `POST`, `PUT /:id`, `DELETE /:id` |
| Bookings | `POST /api/bookings`, `GET /api/bookings/mine`, `GET /api/bookings/:id`, `PUT /api/bookings/:id/cancel`; admin: `GET /api/bookings`, `PUT /api/bookings/:id/status` |
| Payments | `POST /api/payments/pay`, `GET /api/payments/mine`; admin: `GET /api/payments` |
| Reviews | `GET /api/reviews?hotel=|venue=`, `POST`, `PUT /:id`, `DELETE /:id`, `GET /api/reviews/mine`, admin `GET /api/reviews/all` |
| Admin | `GET /api/admin/stats`, `GET /api/admin/users`, `PUT /api/admin/users/:id/role`, `DELETE /api/admin/users/:id` |

## 7. Business rules
- Tax: 12% GST on stays, 18% on venues. Prices in INR.
- Pending bookings hold inventory for 15 minutes; after that the room is released automatically.
- Users can cancel until 24 hours before check-in / event date. Admins can cancel any time.
- Ratings use a 10-point scale (guest 1–5 stars are doubled and blended with the sample rating).

## 8. Deploying
Set `VITE_API_URL` in the client to your API URL (e.g. `https://api.example.com/api`), set `CLIENT_URL` and a strong `JWT_SECRET` on the server, run `npm run build` in `client`.

## 9. Troubleshooting
- **"Could not load hotels"** → backend not running or MongoDB not started. Check the server terminal.
- **Images missing** → sample images load from Unsplash and need internet; a blue placeholder is shown otherwise.
- Passwords use `bcryptjs` (bcrypt algorithm, no native build needed).
