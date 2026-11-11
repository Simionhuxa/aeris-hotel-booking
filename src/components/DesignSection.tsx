import { createContext, useContext, useState, type CSSProperties, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import frameData from '../data/frames.json';
import { rooms, usd, type Room } from '../data/rooms';
import { useMobile } from '../hooks/useViewport';
import { BookingBar } from './BookingBar';
import { Header } from './Header';
import { StaySummary } from './StaySummary';
import { ContactForm } from './ContactForm';
import { SortDropdown } from './SortDropdown';
import { Action, Modal } from './UI';
import { useBooking } from '../hooks/useBooking';
import { demoMode } from '../lib/api';

export interface DesignNode { tag: string; id: string; name: string; classes: string; src?: string; children: (DesignNode | string)[] }
export const frames = frameData as unknown as Record<string, DesignNode>;
export const nodeText = (node: DesignNode | string): string => typeof node === 'string' ? node : node.children.map(nodeText).join(' ');
const cleanText = (text: string) => text.replaceAll('В·', '·').replaceAll('В®', '®').replaceAll('В²', '²').replace(/01 \/ 06( · Your forest sanctuary)/, `01 / ${String(rooms[0].photos.length).padStart(2, '0')}$1`);
interface Runtime { filter: number; sort: string; setFilter: (value: number) => void; setSort: (value: string) => void; openGallery: (room: Room) => void; openInfo: (title: string, content: string) => void }
const RuntimeContext = createContext<Runtime | null>(null);
function useRuntime() { const runtime = useContext(RuntimeContext); if (!runtime) throw new Error('Design runtime is missing'); return runtime; }

function actionDestination(label: string, room?: Room, scope = ''): string | null {
  if (/Book Your Stay|Find Your Quiet/i.test(label)) return `/booking${room ? '?room=' + room.id : ''}`;
  if (/Discover the retreat/i.test(label)) return '/#retreat';
  if (/Our way of being|story of AERIS|Our story/i.test(label)) return '/about';
  if (/all rooms|Rooms & suites/i.test(label)) return '/rooms';
  if (/Step inside|View room|Discover the residence|^Explore$/i.test(label)) return room?.id === 'forest-suite' ? '/rooms/forest-suite' : null;
  if (/Discover experience/i.test(label)) return '/experiences#' + (/Savour/.test(scope) ? 'savour' : /Wander/.test(scope) ? 'wander' : 'restore');
  if (/forest spa/i.test(label)) return '/experiences#restore';
  if (/autumn rituals/i.test(label)) return '/experiences#wander';
  if (label === 'Experiences') return '/experiences';
  if (label === 'Contact') return '/contact';
  return null;
}

function Filters() {
  const runtime = useRuntime();
  return <div className="collection-controls"><div className="room-filters" aria-label="Filter by room capacity">{[[0, 'All rooms (3)'], [2, '2 guests'], [4, '4 guests']].map(([value, label]) => <button key={value} type="button" aria-pressed={runtime.filter === value} onClick={() => runtime.setFilter(Number(value))}>{label}</button>)}</div><SortDropdown value={runtime.sort} onChange={runtime.setSort} /></div>;
}

export function RenderNode({ node, parent = '', scope = '', room: inheritedRoom, depth = 0 }: { node: DesignNode | string; parent?: string; scope?: string; room?: Room; depth?: number }): ReactNode {
  const runtime = useContext(RuntimeContext);
  const { rooms: catalog } = useBooking();
  if (typeof node === 'string') {
    let value = cleanText(node);
    if (inheritedRoom && !demoMode) value = value.replace(/\$[\d,]+/g, () => usd(inheritedRoom.price));
    return value;
  }
  const text = cleanText(nodeText(node));
  const containedRooms = catalog.filter(candidate => text.includes(candidate.name));
  const room = containedRooms.length === 1 ? containedRooms[0] : inheritedRoom;
  const currentScope = /Experience (feature|story)/.test(node.name) ? text : scope;
  const props = { 'data-node-id': node.id || undefined, 'data-name': cleanText(node.name) || undefined };
  if (/^(Solid|Transparent) navigation$/.test(node.name)) return <Header transparent={node.name === 'Transparent navigation'} />;
  if (node.name === 'Shared footer') return <Footer />;
  if (node.name === 'Floating booking bar') return <BookingBar className={node.classes} />;
  if (node.name === 'Enquiry form') return <ContactForm className={node.classes} />;
  if (node.name === 'Your stay summary') return <StaySummary withAction />;
  if (node.name === 'Collection controls') return <Filters />;
  if (node.name === 'Experience index') return <nav className={node.classes + ' experience-index'} aria-label="Explore experiences"><Link to="/experiences#restore">01 / Restore</Link><Link to="/experiences#savour">02 / Savour</Link><Link to="/experiences#wander">03 / Wander</Link></nav>;
  if (node.name === 'Gallery controls' && room) return <div {...props} className={node.classes}><span className="small">01 / {String(room.photos.length).padStart(2, '0')} · {room.name}</span><button type="button" className="gallery-open" onClick={() => runtime?.openGallery(room)} aria-label={`Open ${room.name} photos`}>←　→</button></div>;
  if (node.tag === 'img') {
    const icon = node.src?.endsWith('.svg');
    return <img {...props} className={node.classes + (icon ? '' : ' editorial-image')} src={node.src} alt={icon ? '' : (room?.name ?? (parent === 'Mountain retreat' ? 'AERIS retreat beneath the Swiss Alpine peaks' : parent === 'Editorial photograph' ? 'Natural materials and quiet Alpine surroundings at AERIS' : parent))} aria-hidden={icon || undefined} loading={/Mountain retreat/.test(parent) ? 'eager' : 'lazy'} decoding="async" />;
  }
  const isAction = node.name === 'Action' || node.name === 'Editorial link';
  const isFooterLink = parent === 'Explore' && node.tag === 'p' && text !== 'A little further';
  const isGallery = /View all photos/i.test(text) && (isAction || node.tag === 'p' && parent !== 'Action' && parent !== 'Editorial link');
  if ((isAction || isFooterLink || isGallery) && runtime) {
    const destination = actionDestination(text, room, currentScope);
    const children = node.children.map((child, i) => <RenderNode key={typeof child === 'string' ? i : child.id || i} node={child} parent={node.name} scope={currentScope} room={room} depth={depth + 1} />);
    const className = node.classes + ' design-action';
    if (destination) return <Link {...props} to={destination} className={className}>{children}</Link>;
    return <button {...props} type="button" className={className} onClick={() => {
      if (isGallery || /Step inside|View room|Discover the residence|^Explore$/i.test(text)) runtime.openGallery(room ?? rooms[0]);
      else runtime.openInfo(text, /spa|ritual/i.test(text) ? 'Forest spa · Daily 07:00–21:00. Spa access is included with every stay. Treatments are a separate, unhurried conversation.' : /taste|season/i.test(text) ? 'The table · Breakfast 07:30–10:30 · Dinner 18:30–21:00. A seasonal menu, thoughtful wine pairings, and a seat with a view. Vegetarian dishes are always part of the story.' : 'Guided walks · Gentle to adventurous · 2–6 hours. Routes follow the weather and your pace. Good boots, a light layer, and a little curiosity are all you need.');
    }}>{children}</button>;
  }
  if (node.tag === 'p' && text.includes('Privacy') && text.includes('Instagram') && runtime) return <div className={node.classes + ' legal-links'}>{['Privacy', 'Terms', 'Instagram'].map(label => <button key={label} type="button" onClick={() => runtime.openInfo(label, label === 'Instagram' ? 'AERIS is an imagined place. This portfolio concept has no official Instagram account.' : label === 'Privacy' && !demoMode ? 'Full-stack DEMO mode saves fictional guest details, bookings and contact notes in the local PostgreSQL database. Stay selections are saved in this browser. Admin sessions use an HttpOnly cookie. No payment or email service is connected.' : label === 'Privacy' ? 'This demonstration sends no enquiries or guest details to a server. Stay selections and the demo reference are saved in this browser only. Guest names, email addresses, and notes remain in memory and are cleared when the page is reloaded.' : 'AERIS is a portfolio concept. Prices, availability, and confirmations are illustrative. No payment is taken and no accommodation is reserved.')} >{label}</button>)}</div>;
  let children = node.children;
  if (node.name === 'Room collection' && runtime) {
    const listings = children.filter((child): child is DesignNode => typeof child !== 'string' && child.name === 'Room listing').filter(child => !runtime.filter || catalog.find(candidate => nodeText(child).includes(candidate.name))?.capacity === runtime.filter);
    listings.sort((a, b) => { const price = (n: DesignNode) => catalog.find(candidate => nodeText(n).includes(candidate.name))?.price ?? 0; return (price(a) - price(b)) * (runtime.sort === 'asc' ? 1 : -1); });
    children = [...children.filter(child => typeof child !== 'string' && child.name !== 'Room listing'), ...listings];
  }
  const semanticId = node.name === 'Where the world slows down' ? 'retreat' : node.name === 'Experience story' ? (/01 \/ Restore/.test(text) ? 'restore' : /02 \/ Savour/.test(text) ? 'savour' : 'wander') : undefined;
  const heading = (parent === 'Page introduction' || parent === 'Room introduction') && node.classes.includes('font-display') || parent === 'Hero promise' && node.classes.includes('font-display');
  const tag = node.name === 'Footer' ? 'footer' : depth === 1 && node.name ? 'section' : node.tag === 'p' ? 'p' : 'div';
  const style: CSSProperties = {};
  const fixedWidth = node.classes.match(/(?:^| )w-\[(\d+)px\]/);
  if (fixedWidth && Number(fixedWidth[1]) > 100) { style.maxWidth = '100%'; style.flexShrink = 1; }
  const content = children.map((child, i) => <RenderNode key={typeof child === 'string' ? i : child.id || i} node={child} parent={node.name} scope={currentScope} room={room} depth={depth + 1} />);
  const elementProps = { ...props, id: semanticId, className: node.classes + ' design-node', style, ...(heading ? { role: 'heading', 'aria-level': 1 } : {}) };
  if (tag === 'p') return <p {...elementProps}>{content}</p>;
  if (tag === 'footer') return <footer {...elementProps}>{content}</footer>;
  if (tag === 'section') return <section {...elementProps} aria-label={node.name}>{content}</section>;
  return <div {...elementProps}>{content}</div>;
}

export function DesignRuntime({ children }: { children: ReactNode }) {
  const [filter, setFilter] = useState(0); const [sort, setSort] = useState('asc');
  const [gallery, setGallery] = useState<Room | null>(null); const [photo, setPhoto] = useState(0);
  const [info, setInfo] = useState<{ title: string; content: string } | null>(null);
  return <RuntimeContext.Provider value={{ filter, sort, setFilter, setSort, openGallery: room => { setPhoto(0); setGallery(room); }, openInfo: (title, content) => setInfo({ title, content }) }}>{children}
    {gallery && <Modal title={gallery.name} onClose={() => setGallery(null)}><img className="gallery-photo" src={gallery.photos[photo]} alt={`${gallery.name} photograph ${photo + 1}`} /><div className="gallery-navigation"><button type="button" onClick={() => setPhoto((photo - 1 + gallery.photos.length) % gallery.photos.length)} disabled={gallery.photos.length < 2}>← Previous</button><span>{photo + 1} / {gallery.photos.length}</span><button type="button" onClick={() => setPhoto((photo + 1) % gallery.photos.length)} disabled={gallery.photos.length < 2}>Next →</button></div><p>{gallery.description}</p><p className="small muted">{gallery.features} · {usd(gallery.price)}/night</p><Action to={`/booking?room=${gallery.id}`} onClick={() => setGallery(null)}>Book Your Stay</Action></Modal>}
    {info && <Modal title={info.title} onClose={() => setInfo(null)}><p>{info.content}</p><p className="small muted">An imagined place. A portfolio concept.</p></Modal>}
  </RuntimeContext.Provider>;
}
export function Footer() { const mobile = useMobile(); const frame = frames[mobile ? '3:16043' : '3:15867']; const footer = frame.children.find((child): child is DesignNode => typeof child !== 'string' && child.name === 'Footer')!; return <RenderNode node={footer} />; }
export function MarketingPage({ desktop, mobile }: { desktop: string; mobile: string }) { const isMobile = useMobile(); return <RenderNode node={frames[isMobile ? mobile : desktop]} />; }
