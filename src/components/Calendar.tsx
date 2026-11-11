import { useState } from 'react';
import { useBooking } from '../hooks/useBooking';
import { addDays, formatDate, nights, todayISO } from '../lib/booking';

const isoDate = (date: Date) => date.toISOString().slice(0, 10);
export function Calendar() {
  const { stay, setStay } = useBooking();
  const today = todayISO(); const todayDate = new Date(today + 'T12:00:00Z');
  const [month, setMonth] = useState(() => new Date(Date.UTC(todayDate.getUTCFullYear(), todayDate.getUTCMonth(), 1, 12)));
  const [endpoint, setEndpoint] = useState<'checkIn' | 'checkOut'>('checkIn');
  function selectDate(iso: string) {
    if (endpoint === 'checkIn' || iso <= stay.checkIn) { setStay({ checkIn: iso, checkOut: iso >= stay.checkOut ? addDays(iso, 1) : stay.checkOut }); setEndpoint('checkOut'); }
    else { setStay({ checkOut: iso }); setEndpoint('checkIn'); }
  }
  const shift = (amount: number) => setMonth(current => new Date(Date.UTC(current.getUTCFullYear(), current.getUTCMonth() + amount, 1, 12)));
  return <div className="booking-calendar">
    <div className="calendar-date-fields">{(['checkIn', 'checkOut'] as const).map(field => <label key={field} className={endpoint === field ? 'selected-date-field' : ''}><span className="eyebrow">{field === 'checkIn' ? 'Check-in' : 'Check-out'}</span><span>{formatDate(stay[field])}</span><input type="date" aria-label={field === 'checkIn' ? 'Booking check-in' : 'Booking check-out'} value={stay[field]} min={field === 'checkIn' ? today : addDays(stay.checkIn, 1)} onFocus={() => setEndpoint(field)} onChange={event => { if (event.target.value) setStay({ [field]: event.target.value }); }} /></label>)}</div>
    <div className="calendar-months">{[0, 1].map(offset => {
      const date = new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth() + offset, 1, 12));
      const year = date.getUTCFullYear(), index = date.getUTCMonth(), leading = (date.getUTCDay() + 6) % 7;
      const length = new Date(Date.UTC(year, index + 1, 0)).getUTCDate();
      const title = new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(date);
      return <section className="calendar-month" key={title} aria-label={title}><div className="calendar-heading"><button type="button" aria-label={`Previous month from ${title}`} disabled={month <= new Date(Date.UTC(todayDate.getUTCFullYear(), todayDate.getUTCMonth(), 1, 12))} onClick={() => shift(-1)}>‹</button><h3>{title}</h3><button type="button" aria-label={`Next month from ${title}`} onClick={() => shift(1)}>›</button></div><div className="calendar-grid"><div className="calendar-weekdays">{['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => <span key={i} aria-hidden="true">{day}</span>)}</div>{Array.from({ length: Math.ceil((leading + length) / 7) * 7 }, (_, cell) => {
        const day = cell - leading + 1;
        if (day < 1 || day > length) return <span key={cell} />;
        const iso = isoDate(new Date(Date.UTC(year, index, day, 12))); const selected = iso === stay.checkIn || iso === stay.checkOut; const inRange = iso > stay.checkIn && iso < stay.checkOut;
        return <button type="button" key={cell} disabled={iso < today} aria-label={new Intl.DateTimeFormat('en-GB', { dateStyle: 'full', timeZone: 'UTC' }).format(new Date(iso + 'T12:00:00Z'))} aria-pressed={selected || inRange} aria-current={iso === today ? 'date' : undefined} className={`${selected ? 'range-end' : ''} ${inRange ? 'in-range' : ''} ${iso === today ? 'today' : ''}`} onClick={() => selectDate(iso)}>{day}</button>;
      })}</div></section>;
    })}</div><p className="calendar-legend"><span aria-hidden="true" />{formatDate(stay.checkIn)}–{formatDate(stay.checkOut)} · {nights(stay)} nights. Today: {formatDate(today)}. Past dates are disabled.</p><span className="sr-only" aria-live="polite">Select {endpoint === 'checkIn' ? 'check-in' : 'check-out'}. {nights(stay)} nights selected.</span>
  </div>;
}
