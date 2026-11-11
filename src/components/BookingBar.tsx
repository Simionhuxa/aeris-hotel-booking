import { useBooking } from '../hooks/useBooking';
import { addDays, formatDate, todayISO } from '../lib/booking';
import { Action } from './UI';

export function BookingBar({ className }: { className?: string }) {
  const { stay, setStay } = useBooking();
  return <div className={`booking-bar ${className ?? ''}`} data-name="Floating booking bar">
    <div className="bar-dates">{(['checkIn', 'checkOut'] as const).map((field, i) => <label className="bar-field" key={field}><span className="eyebrow">{i ? 'Check-out' : 'Check-in'}</span><span>{formatDate(stay[field])}</span><input aria-label={i ? 'Check-out date' : 'Check-in date'} type="date" value={stay[field]} min={i ? addDays(stay.checkIn, 1) : todayISO()} onChange={event => { if (!event.target.value) return; const value = event.target.value; setStay({ [field]: value, ...(field === 'checkIn' && value >= stay.checkOut ? { checkOut: addDays(value, 3) } : {}) }); }} /></label>)}</div>
    <div className="bar-guests"><label className="bar-field"><span className="eyebrow">Guests</span><select aria-label="Number of guests" value={stay.adults + stay.children} onChange={event => { const count = Number(event.target.value); setStay({ adults: count, children: 0, roomId: count > 2 ? 'summit-residence' : stay.roomId }); }}>{[1, 2, 3, 4].map(n => <option key={n} value={n}>{n} {n === 1 ? 'guest' : 'guests'} · 1 room</option>)}</select></label><Action to="/booking">Find Your Quiet</Action></div>
  </div>;
}
