import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { api, ApiError, demoMode } from '../lib/api';
import { usd } from '../data/rooms';
interface Booking { reference: string; firstName: string; lastName: string; email: string; roomId: string; checkIn: string; checkOut: string; status: string; totalCents: number }
interface Message { id: string; firstName: string; lastName: string; email: string; topic: string; message: string; createdAt: string }
export function Admin() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [tab, setTab] = useState<'bookings' | 'messages'>('bookings');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [count, setCount] = useState(0);
  const [version, setVersion] = useState(0);
  useEffect(() => {
    if (demoMode) { setChecking(false); return; }
    api('/admin/session').then(() => setAuthenticated(true)).catch(error => { if (!(error instanceof ApiError && error.status === 401)) setError(error.message); }).finally(() => setChecking(false));
  }, []);
  useEffect(() => {
    if (!authenticated) return;
    const controller = new AbortController(); setPending(true); setError('');
    const path = tab === 'bookings' ? `/admin/bookings?page=${page}&q=${encodeURIComponent(search)}${status ? `&status=${status}` : ''}` : `/admin/messages?page=${page}`;
    api<{ items: Booking[] | Message[]; count: number }>(path, { signal: controller.signal }).then(result => {
      if (tab === 'bookings') setBookings(result.items as Booking[]); else setMessages(result.items as Message[]);
      setCount(result.count);
    }).catch(error => { if (!controller.signal.aborted) { setError(error.message); if (error.status === 401) { setAuthenticated(false); setBookings([]); setMessages([]); } } }).finally(() => { if (!controller.signal.aborted) setPending(false); });
    return () => controller.abort();
  }, [authenticated, tab, status, search, page, version]);
  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const data = Object.fromEntries(new FormData(event.currentTarget)); setPending(true); setError('');
    try { await api('/admin/login', { method: 'POST', body: JSON.stringify(data) }); setAuthenticated(true); }
    catch (error) { setError((error as Error).message); } finally { setPending(false); }
  }
  async function logout() {
    setPending(true); setError('');
    try { await api('/admin/logout', { method: 'POST' }); setAuthenticated(false); setBookings([]); setMessages([]); }
    catch (error) { setError((error as Error).message); } finally { setPending(false); }
  }
  async function cancel(reference: string) {
    setPending(true); setError('');
    try { await api(`/admin/bookings/${reference}/cancel`, { method: 'POST' }); setVersion(value => value + 1); }
    catch (error) { setError((error as Error).message); } finally { setPending(false); }
  }
  return <section className="admin-panel"><Link to="/">← AERIS Mountain Retreat</Link><p className="eyebrow">DEMO ONLY / Administration</p><h1>Retreat dashboard</h1>
    <p>Local portfolio inventory. No real reservations, payments, or emails. Use fictional guest details.</p>
    {error && <div className="validation-notice" role="alert">{error}</div>}
    {checking ? <p role="status">Checking session…</p> : demoMode ? <p>Admin requires full-stack mode. Set VITE_DEMO_MODE=false and start the API.</p> : !authenticated ? <form className="guest-form" onSubmit={login}><h2>Admin sign in</h2><label>Email<input name="email" type="email" autoComplete="username" required /></label><label>Password<input name="password" type="password" autoComplete="current-password" required maxLength={256} /></label><button className="action" disabled={pending}>{pending ? 'Signing in…' : 'Sign in'}</button></form> : <>
      <div className="admin-tools"><button onClick={logout} disabled={pending}>Sign out</button><button onClick={() => { setTab('bookings'); setPage(1); }} aria-pressed={tab === 'bookings'}>Bookings</button><button onClick={() => { setTab('messages'); setPage(1); }} aria-pressed={tab === 'messages'}>Contact messages</button><button disabled={pending} onClick={() => setVersion(value => value + 1)}>Refresh</button></div>
      {tab === 'bookings' && <form className="admin-tools" onSubmit={event => { event.preventDefault(); setSearch(query); setPage(1); }}><label>Status<select aria-label="Booking status" value={status} onChange={event => { setStatus(event.target.value); setPage(1); }}><option value="">All</option><option>CONFIRMED</option><option>CANCELLED</option></select></label><label>Reference, guest email or surname<input aria-label="Search bookings" value={query} maxLength={100} onChange={event => setQuery(event.target.value)} /></label><button disabled={pending}>Search</button></form>}
      {pending ? <p role="status">Loading…</p> : <><p role="status">{count} DEMO {tab}</p>{tab === 'bookings' ? <div className="admin-table"><table><thead><tr><th>Reference / Guest</th><th>Room / Stay</th><th>Total</th><th>Status</th><th>Action</th></tr></thead><tbody>{bookings.map(booking => <tr key={booking.reference}><td>{booking.reference}<br />{booking.firstName} {booking.lastName}<br />{booking.email}</td><td>{booking.roomId}<br />{booking.checkIn.slice(0, 10)} – {booking.checkOut.slice(0, 10)}</td><td>{usd(booking.totalCents / 100)}</td><td>{booking.status}</td><td>{booking.status === 'CONFIRMED' && <button disabled={pending} onClick={() => cancel(booking.reference)}>Cancel DEMO booking</button>}</td></tr>)}</tbody></table></div> : <div>{messages.map(message => <article className="notice" key={message.id}><h2>{message.topic}</h2><p>{message.firstName} {message.lastName} · {message.email} · {message.createdAt.slice(0, 10)}</p><p style={{ whiteSpace: 'pre-wrap' }}>{message.message}</p></article>)}</div>}</>}
      <div className="admin-tools"><button disabled={pending || page === 1} onClick={() => setPage(value => value - 1)}>Previous</button><span>Page {page}</span><button disabled={pending || page * 50 >= count} onClick={() => setPage(value => value + 1)}>Next</button></div>
    </>}
  </section>;
}
