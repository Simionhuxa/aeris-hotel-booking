import { useBooking } from '../hooks/useBooking';
import { getRoom, usd } from '../data/rooms';
import { formatDate, nights } from '../lib/booking';
import { Action } from './UI';
import assets from '../data/assets.json';
import { useMobile } from '../hooks/useViewport';

export function StaySummary({ withAction = false, confirmed = false }: { withAction?: boolean; confirmed?: boolean }) {
  const { stay, rooms, receipt } = useBooking(); const selected = getRoom(withAction ? 'forest-suite' : stay.roomId); const room = rooms.find(room => room.id === selected.id) ?? selected; const count = nights(stay);
  const mobile = useMobile();
  const photo = room.id !== 'forest-suite' ? room.photos[0] : withAction ? (mobile ? assets['3:16651'].imgEditorialPhotograph1 : assets['3:16501'].imgEditorialPhotograph3) : confirmed ? assets[mobile ? '3:18683' : '3:18587'].imgEditorialPhotograph1 : assets[mobile ? '3:17771' : '3:17432'].imgEditorialPhotograph;
  return <aside className="stay-summary"><p className="eyebrow">Your quiet escape</p><img className="summary-photo" src={photo} alt={room.name} width="700" height="400" /><h2>{room.name}</h2><p className="muted small">{room.capacity} guests · {room.area}m² · 1 room</p><hr />
    <dl className="stay-details">{[['Check-in', formatDate(stay.checkIn, true)], ['Check-out', formatDate(stay.checkOut, true)], ['Duration', `${count} ${count === 1 ? 'night' : 'nights'}`], ['Guests', `${stay.adults} ${stay.adults === 1 ? 'adult' : 'adults'}${stay.children ? ` · ${stay.children} ${stay.children === 1 ? 'child' : 'children'}` : ''}`]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl><hr />
    <p className="summary-calculation"><span>{usd(confirmed && receipt ? receipt.nightlyCents / 100 : room.price)} × {count} nights</span><span>{usd(confirmed && receipt ? receipt.totalCents / 100 : room.price * count)}</span></p><p className="summary-total"><span>Total · USD</span><strong>{usd(confirmed && receipt ? receipt.totalCents / 100 : room.price * count)}</strong></p><p className="small muted">Illustrative total. No extra charges in this demo. No payment or real reservation.</p>{withAction && <Action to="/booking?room=forest-suite">Book Your Stay</Action>}
  </aside>;
}
