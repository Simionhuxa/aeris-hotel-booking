import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import assets from '../data/assets.json';
import { Arrow, Modal } from './UI';

const links = [['/rooms', 'Rooms'], ['/experiences', 'Experiences'], ['/about', 'About'], ['/contact', 'Contact']];
export function Header({ transparent = false }: { transparent?: boolean }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(window.scrollY > 160);
  useEffect(() => { const onScroll = () => setScrolled(window.scrollY > 160); window.addEventListener('scroll', onScroll, { passive: true }); return () => window.removeEventListener('scroll', onScroll); }, []);
  return <div className="header-space"><header className={`site-header ${transparent && !scrolled ? 'transparent' : ''} ${scrolled ? 'scrolled' : ''}`}>
    <Link to="/" className="brand" aria-label="AERIS home">AERIS®</Link>
    <nav className="desktop-nav" aria-label="Main navigation">{links.map(([url, label]) => <NavLink key={url} to={url}>{label}</NavLink>)}<Link to="/booking" className="header-book">Book Your Stay<Arrow /></Link></nav>
    <div className="mobile-actions"><Link to="/booking">Book Your Stay</Link><button type="button" className="menu-button" aria-label="Open navigation" aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen(true)}><img src={transparent && !scrolled ? assets['3:16043'].imgMenu : assets['3:16359'].imgMenu} alt="" width="24" height="24" /></button></div>
  </header>{open && <Modal title="Explore AERIS" onClose={() => setOpen(false)}><nav id="mobile-navigation" aria-label="Mobile navigation" className="mobile-menu">{[['/', 'Home'], ...links, ['/booking', 'Book Your Stay']].map(([url, label]) => <Link key={url} to={url} onClick={() => setOpen(false)}>{label}</Link>)}</nav><p className="muted">Somewhere Between Earth and Sky.</p></Modal>}</div>;
}
