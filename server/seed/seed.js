/*
  Sample data: hotels, event venues and two demo accounts.
    npm run seed         -> adds data only if the database is empty
    npm run seed:reset   -> wipes everything and re-adds the sample data
  Demo accounts:  admin / admin123   (Admin panel)     demo / demo123   (normal customer)
*/
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Hotel = require('../models/Hotel');
const Venue = require('../models/Venue');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Review = require('../models/Review');

const img = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=70`;
const HOTEL_IMGS = ['1566073771259-6a8506099945', '1520250497591-112f2f40a3f4', '1551882547-ff40c63fe5fa', '1564501049412-61c2a3083791', '1542314831-068cd1dbfeeb', '1582719508461-905c673771fd', '1571896349842-33c89424de2d', '1578683010236-d716f9a3f461', '1590490360182-c33d57733427', '1611892440504-42a792e24d32', '1512918728675-ed5a9ecdebfd', '1618773928121-c32242e63f39'].map(img);
const VENUE_IMGS = ['1519167758481-83f550bb49b3', '1464366400600-7168b8af9bc3', '1505236858219-8359eb29e329', '1511795409834-ef04bbd61622', '1478146896981-b80fe463b330', '1540575467063-178a50c2df87', '1431540015161-0bf868a2d407'].map(img);
const pick = (pool, i, n = 4) => Array.from({ length: n }, (_, k) => pool[(i + k * 3) % pool.length]);

const A_LUX = ['Free WiFi', 'Swimming pool', 'Spa', 'Restaurant', 'Bar', 'Fitness centre', 'Airport shuttle', 'Room service', 'Air conditioning', 'Parking'];
const A_MID = ['Free WiFi', 'Restaurant', 'Room service', 'Air conditioning', 'Parking', 'Fitness centre'];
const A_BUD = ['Free WiFi', 'Air conditioning', 'Parking', 'Room service'];

function hotel(i, name, city, state, stars, type, base, rating, count, amenities, description) {
  const rooms = [{ name: 'Standard Room', bed: '1 double bed', price: base, capacity: 2, totalRooms: 8 }];
  if (stars >= 2) rooms.push({ name: 'Deluxe Room', bed: '1 king bed', price: Math.round((base * 1.35) / 50) * 50, capacity: 3, totalRooms: 6 });
  if (stars >= 3) rooms.push({ name: 'Family Suite', bed: '2 queen beds', price: Math.round((base * 2.1) / 50) * 50, capacity: 4, totalRooms: 3 });
  return { name, city, state, address: `${name.split(' ')[0]} Road, ${city}, ${state}`, stars, propertyType: type, images: pick(HOTEL_IMGS, i), amenities, rooms, baseRating: rating, baseCount: count, bookingCount: Math.round(count / 12), description };
}

const hotels = [
  hotel(0, 'The Grand Harbour Palace', 'Mumbai', 'Maharashtra', 5, 'Hotel', 24500, 9.2, 2388, A_LUX, 'A landmark sea-facing palace hotel opposite the Gateway. Grand arched lobbies, sea-view suites and an award-winning restaurant make it the classic Mumbai stay.'),
  hotel(1, 'Marine Drive Towers', 'Mumbai', 'Maharashtra', 5, 'Hotel', 11800, 9.0, 4061, A_LUX, 'Contemporary high-rise on the Queen\'s Necklace with sweeping Arabian Sea views, a rooftop bar and quick access to South Mumbai\'s business district.'),
  hotel(2, 'The Regency New Delhi', 'New Delhi', 'Delhi', 5, 'Hotel', 9800, 8.1, 3903, A_LUX, 'Elegant five-star hotel in the heart of the capital, close to Connaught Place, India Gate and the metro. Two pools and four restaurants on site.'),
  hotel(3, 'Skyline Plaza Airport Hotel', 'New Delhi', 'Delhi', 4, 'Hotel', 6400, 8.9, 7786, A_LUX, 'Just minutes from Delhi International Airport. Soundproof rooms, 24-hour dining and a free airport shuttle for early flights and late arrivals.'),
  hotel(4, 'Shyam Palace Agra', 'Agra', 'Uttar Pradesh', 3, 'Hotel', 4200, 9.1, 1163, A_MID, 'One minute\'s walk from the Taj Mahal east gate. Rooftop restaurant with a direct view of the monument at sunrise.'),
  hotel(5, 'The Coral Garden Homestay', 'Agra', 'Uttar Pradesh', 2, 'Homestay', 2750, 9.4, 1430, A_BUD, 'A warm family-run homestay with a sun terrace and garden, 700 metres from the Taj Mahal. Home-cooked breakfast included.'),
  hotel(6, 'Rajmahal Heritage Haveli', 'Jaipur', 'Rajasthan', 4, 'Hotel', 7200, 8.8, 2334, A_LUX, 'A restored 18th-century haveli with painted courtyards, camel-safari arrangements and Rajasthani thali dinners under the stars.'),
  hotel(7, 'Garden City Business Suites', 'Bengaluru', 'Karnataka', 4, 'Hotel', 5600, 8.6, 3650, A_MID, 'Modern suites near MG Road and the tech corridor. Co-working lounge, craft-coffee bar and a rooftop pool.'),
  hotel(8, 'Nizam\'s Retreat', 'Hyderabad', 'Telangana', 4, 'Hotel', 5200, 8.5, 2338, A_MID, 'Boutique stay inspired by Hyderabad\'s royal past. Biryani masterclasses, a lake-view terrace and free shuttle to Hi-Tech City.'),
  hotel(9, 'Palm Beach Resort Goa', 'Goa', 'Goa', 4, 'Resort', 8900, 8.8, 1976, A_LUX, 'Beachfront resort with palm-lined gardens, a lagoon pool and sunset shacks on the sand. Water sports and yoga included.'),
  hotel(10, 'Backwater Villa Kochi', 'Kochi', 'Kerala', 3, 'Villa', 6100, 9.3, 812, A_MID, 'Private villa rooms on the Kerala backwaters. Canoe rides, Ayurvedic massages and fresh seafood cooked to order.'),
  hotel(11, 'Hilltop Resort Mussoorie', 'Mussoorie', 'Uttarakhand', 4, 'Resort', 6800, 8.8, 97, A_MID, 'Top-rated mountain resort with valley views from every balcony. Bonfire evenings and guided treks from the door.'),
  hotel(12, 'Lake View Palace Udaipur', 'Udaipur', 'Rajasthan', 5, 'Hotel', 13500, 9.2, 1520, A_LUX, 'Overlooking Lake Pichola with marble courtyards, a rooftop restaurant and boat transfers to the City Palace.'),
  hotel(13, 'Marina Bay Residency', 'Chennai', 'Tamil Nadu', 4, 'Hotel', 5900, 8.7, 2100, A_MID, 'Steps from Marina Beach with south-Indian breakfast buffets and easy access to Chennai International Airport.'),
  hotel(14, 'Sea Breeze Inn Puri', 'Puri', 'Odisha', 2, 'Guest house', 1499, 9.6, 312, A_BUD, 'Simple, spotless rooms a short walk from the beach and the Jagannath Temple. Excellent value for pilgrims and families.'),
  hotel(15, 'Kasauli Pine Cottage', 'Kasauli', 'Himachal Pradesh', 2, 'Guest house', 1099, 9.8, 21, A_BUD, 'Quiet pine-forest cottage with a fireplace lounge and mountain walks from the garden gate.'),
];

const F_ALL = ['Stage & sound system', 'Catering kitchen', 'Parking', 'Air conditioning', 'Bridal suite', 'Projector & screen', 'Free WiFi', 'Power backup'];
function venue(i, name, city, state, capacity, price, rating, count, types, facilities, description) {
  return { name, city, state, address: `${name.split(' ')[0]} Lane, ${city}, ${state}`, images: pick(VENUE_IMGS, i, 3), capacity, pricePerDay: price, eventTypes: types, facilities, baseRating: rating, baseCount: count, bookingCount: Math.round(count / 8), description };
}
const venues = [
  venue(0, 'Grand Crystal Ballroom', 'Mumbai', 'Maharashtra', 800, 250000, 9.1, 214, ['Wedding', 'Reception', 'Corporate party'], F_ALL, 'A pillar-free ballroom with crystal chandeliers, an in-house catering team and a bridal suite. Ideal for big weddings and galas.'),
  venue(1, 'Royal Lawns & Banquet', 'Jaipur', 'Rajasthan', 1200, 180000, 8.8, 176, ['Wedding', 'Reception', 'Birthday'], F_ALL, 'Sprawling lawns framed by fort-style walls with a covered banquet hall for the rain plan. Mandap decor included.'),
  venue(2, 'Tech Summit Convention Centre', 'Bengaluru', 'Karnataka', 500, 120000, 8.9, 98, ['Conference', 'Corporate party', 'Seminar'], F_ALL, 'Auditorium-style hall with tiered seating, 4K projection, breakout rooms and fibre internet for conferences and product launches.'),
  venue(3, 'Sunset Beach Deck', 'Goa', 'Goa', 250, 150000, 9.3, 143, ['Wedding', 'Birthday', 'Reception'], ['Stage & sound system', 'Parking', 'Bridal suite', 'Free WiFi', 'Power backup'], 'A beachfront deck for barefoot weddings and sunset parties, with a lit dance floor and a beach-side bar.'),
  venue(4, 'Heritage Haveli Courtyard', 'Udaipur', 'Rajasthan', 400, 200000, 9.0, 121, ['Wedding', 'Reception'], F_ALL, 'A candle-lit courtyard inside a restored haveli with lake views. Includes traditional welcome and folk performers.'),
  venue(5, 'Skyline Terrace Hall', 'Hyderabad', 'Telangana', 350, 90000, 8.4, 87, ['Birthday', 'Corporate party', 'Reception'], F_ALL, 'Rooftop terrace with skyline views and a glass-walled indoor hall. Great for birthdays and team celebrations.'),
  venue(6, 'Capital Banquet Hall', 'New Delhi', 'Delhi', 600, 140000, 8.6, 160, ['Wedding', 'Reception', 'Birthday'], F_ALL, 'A flexible banquet hall with two dining halls, valet parking and a dedicated kitchen for large guest lists.'),
  venue(7, 'Lakeview Conference Hall', 'Kochi', 'Kerala', 300, 70000, 9.0, 64, ['Conference', 'Seminar', 'Corporate party'], ['Projector & screen', 'Free WiFi', 'Parking', 'Air conditioning', 'Catering kitchen', 'Power backup'], 'A calm waterfront hall for workshops and seminars with a lake-view lunch terrace.'),
];

async function seedData(force) {
  if (force) {
    await Promise.all([User, Hotel, Venue, Booking, Payment, Review].map((m) => m.deleteMany({})));
  } else if ((await Hotel.countDocuments()) > 0) {
    return;
  }
  if (!(await User.findOne({ userId: 'admin' }))) await User.create({ name: 'Site Admin', userId: 'admin', password: 'admin123', role: 'admin' });
  if (!(await User.findOne({ userId: 'demo' }))) await User.create({ name: 'Demo Customer', userId: 'demo', password: 'demo123', phone: '9876543210' });
  for (const h of hotels) await Hotel.create(h);   // create() runs the pre-save hook (price, rating)
  for (const v of venues) await Venue.create(v);
  console.log(`🌱 Seeded ${hotels.length} hotels, ${venues.length} venues. Logins -> admin/admin123 and demo/demo123`);
}

module.exports = { seedData };

// Run directly: node seed/seed.js [--reset]
if (require.main === module) {
  mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/stayevent')
    .then(() => seedData(process.argv.includes('--reset')))
    .then(() => process.exit(0))
    .catch((e) => { console.error(e); process.exit(1); });
}
