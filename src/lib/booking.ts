import { getRoom, type RoomId } from '../data/rooms';

export interface Stay { checkIn: string; checkOut: string; roomId: RoomId; adults: number; children: number }
export interface Guest { firstName: string; lastName: string; email: string; phone: string; country: string; note: string; terms: boolean }
export const emptyGuest: Guest = { firstName: '', lastName: '', email: '', phone: '', country: '', note: '', terms: false };
export const todayISO = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Kyiv', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
export function validISO(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value + 'T00:00:00Z')) && new Date(value + 'T00:00:00Z').toISOString().slice(0, 10) === value;
}
export function addDays(value: string, days: number): string {
  const date = new Date(value + 'T12:00:00Z'); date.setUTCDate(date.getUTCDate() + days); return date.toISOString().slice(0, 10);
}
export function nights(stay: Pick<Stay, 'checkIn' | 'checkOut'>): number {
  if (!validISO(stay.checkIn) || !validISO(stay.checkOut)) return 0;
  return Math.max(0, Math.round((Date.parse(stay.checkOut) - Date.parse(stay.checkIn)) / 86400000));
}
export const total = (stay: Stay) => nights(stay) * getRoom(stay.roomId).price;
export function defaultStay(today = todayISO()): Stay {
  const checkIn = today <= '2026-11-16' ? '2026-11-16' : addDays(today, 1);
  return { checkIn, checkOut: addDays(checkIn, 3), adults: 2, children: 0, roomId: 'forest-suite' };
}
export function validateStay(stay: Stay, today = todayISO()): string[] {
  const errors: string[] = [];
  if (!validISO(stay.checkIn) || !validISO(stay.checkOut)) errors.push('Choose valid check-in and check-out dates.');
  else {
    if (stay.checkIn < today) errors.push('Check-in must be today or later.');
    if (nights(stay) < 1) errors.push('Check-out must be after check-in.');
    if (nights(stay) > 30) errors.push('This demonstration supports stays of up to 30 nights.');
  }
  if (!Number.isInteger(stay.adults) || stay.adults < 1 || !Number.isInteger(stay.children) || stay.children < 0) errors.push('Choose at least one adult and a valid number of children.');
  if (stay.adults + stay.children > getRoom(stay.roomId).capacity) errors.push(`${getRoom(stay.roomId).name} accommodates a maximum of ${getRoom(stay.roomId).capacity} guests. Choose a larger room or adjust your guests.`);
  return errors;
}
export function validateGuest(guest: Guest): Partial<Record<keyof Guest, string>> {
  const errors: Partial<Record<keyof Guest, string>> = {};
  if (!guest.firstName.trim()) errors.firstName = 'Enter your first name.';
  if (!guest.lastName.trim()) errors.lastName = 'Enter your last name.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guest.email.trim())) errors.email = 'Enter a valid email address, such as mara@example.com.';
  if (!guest.country.trim()) errors.country = 'Choose your country or region.';
  if (!guest.terms) errors.terms = 'Please accept the demo terms before continuing.';
  return errors;
}
export function restoreStay(value: unknown, today = todayISO()): Stay {
  if (!value || typeof value !== 'object') return defaultStay(today);
  const raw = value as Partial<Stay>;
  if (!['forest-suite', 'panorama-loft', 'summit-residence'].includes(raw.roomId ?? '')) return defaultStay(today);
  const stay: Stay = { checkIn: String(raw.checkIn ?? ''), checkOut: String(raw.checkOut ?? ''), roomId: raw.roomId!, adults: Number(raw.adults), children: Number(raw.children) };
  return validateStay(stay, today).length ? defaultStay(today) : stay;
}
export function formatDate(iso: string, long = false): string {
  if (!validISO(iso)) return 'Choose a date';
  return new Intl.DateTimeFormat('en-GB', { ...(long ? { weekday: 'short' as const } : {}), day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(iso + 'T12:00:00Z'));
}
