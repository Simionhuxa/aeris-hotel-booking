import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { defaultStay, emptyGuest, restoreStay, type Guest, type Stay } from '../lib/booking';
import { api, demoMode, type ApiRoom, type Receipt } from '../lib/api';
import { rooms as staticRooms, type Room } from '../data/rooms';

interface BookingContextValue { stay: Stay; setStay: (update: Partial<Stay>) => void; guest: Guest; setGuest: (update: Partial<Guest>) => void; confirmation: string; confirm: () => Promise<void>; rooms: Room[]; roomsLoading: boolean; roomsError: string; receipt: Receipt | null; cancel: () => Promise<void>; reloadRooms: () => void }
const BookingContext = createContext<BookingContextValue | null>(null);
const key = 'aeris-demo-stay-v1';
export function BookingProvider({ children }: { children: ReactNode }) {
  const [catalog, setCatalog] = useState<Room[]>(staticRooms);
  const [roomsLoading, setRoomsLoading] = useState(!demoMode);
  const [roomsError, setRoomsError] = useState('');
  const [catalogVersion, setCatalogVersion] = useState(0);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  useEffect(() => {
    if (demoMode) return;
    const controller = new AbortController();
    setRoomsLoading(true); setRoomsError('');
    api<ApiRoom[]>('/rooms', { signal: controller.signal }).then(data => {
      if (!staticRooms.every(room => data.some(item => item.id === room.id))) throw new Error('Room catalogue is incomplete. Seed the database and retry.');
      setCatalog(staticRooms.map(room => { const item = data.find(item => item.id === room.id)!; return { ...room, name: item.name, capacity: item.capacity, area: item.area, price: item.priceCents / 100 }; }));
    }).catch(error => { if (!controller.signal.aborted) setRoomsError(error.message); }).finally(() => { if (!controller.signal.aborted) setRoomsLoading(false); });
    return () => controller.abort();
  }, [catalogVersion]);
  const [stay, updateStay] = useState<Stay>(() => { try { return restoreStay(JSON.parse(localStorage.getItem(key) ?? 'null')); } catch { return defaultStay(); } });
  const [guest, updateGuest] = useState<Guest>(emptyGuest);
  const [confirmation, setConfirmation] = useState(() => { if (!demoMode) return ''; try { const value = localStorage.getItem('aeris-demo-reference') ?? ''; return /^DEMO-AER\d{6}-[A-Z0-9]{6}$/.test(value) ? value : ''; } catch { return ''; } });
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(stay)); } catch { /* Booking still works with storage disabled. */ } }, [stay]);
  const setStay = (update: Partial<Stay>) => { updateStay(previous => ({ ...previous, ...update })); setConfirmation(''); setReceipt(null); try { localStorage.removeItem('aeris-demo-reference'); } catch { /* optional persistence */ } };
  const setGuest = (update: Partial<Guest>) => updateGuest(previous => ({ ...previous, ...update }));
  const confirm = async () => {
    if (!demoMode) {
      const result = await api<Receipt>('/bookings', { method: 'POST', body: JSON.stringify({ stay, guest }) });
      setReceipt(result); setConfirmation(result.reference); return;
    }
    const bytes = crypto.getRandomValues(new Uint8Array(3));
    const reference = `DEMO-AER${stay.checkIn.replaceAll('-', '').slice(2)}-${Array.from(bytes, value => value.toString(16).padStart(2, '0')).join('').toUpperCase()}`;
    setConfirmation(reference);
    try { localStorage.setItem('aeris-demo-reference', reference); } catch { /* optional persistence */ }
  };
  const cancel = async () => {
    if (!receipt) return;
    await api(`/bookings/${receipt.reference}/cancel`, { method: 'POST', body: JSON.stringify({ cancellationToken: receipt.cancellationToken }) });
    setReceipt({ ...receipt, status: 'CANCELLED' });
  };
  return <BookingContext.Provider value={{ stay, setStay, guest, setGuest, confirmation, confirm, rooms: catalog, roomsLoading, roomsError, receipt, cancel, reloadRooms: () => setCatalogVersion(v => v + 1) }}>{children}</BookingContext.Provider>;
}
export function useBooking() { const context = useContext(BookingContext); if (!context) throw new Error('BookingProvider is missing'); return context; }
