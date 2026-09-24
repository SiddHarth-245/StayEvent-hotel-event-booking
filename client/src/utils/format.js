export const inr = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');
export const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }) : '');
export const fmtDateTime = (d) => new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

// Date strings in "YYYY-MM-DD" (what <input type="date"> uses)
export const todayISO = () => { const n = new Date(); return new Date(n.getTime() - n.getTimezoneOffset() * 60000).toISOString().slice(0, 10); };
export const addDays = (s, n) => { const d = new Date(`${s}T00:00:00Z`); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
export const nightsBetween = (a, b) => Math.round((new Date(b) - new Date(a)) / 86400000);

export const ratingLabel = (r) => (r >= 9.5 ? 'Exceptional' : r >= 9 ? 'Superb' : r >= 8.5 ? 'Fabulous' : r >= 8 ? 'Very good' : r >= 7 ? 'Good' : 'Pleasant');

export const HOTEL_TAX = 0.12;
export const VENUE_TAX = 0.18;

export const METHOD_LABEL = { upi: 'UPI', card: 'Credit / Debit card', netbanking: 'Net banking', wallet: 'Mobile banking / wallet', cod: 'Pay at property' };
