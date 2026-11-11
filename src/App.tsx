import { useEffect } from 'react';
import { Link, Route, Routes, useLocation } from 'react-router-dom';
import { DesignRuntime, Footer, MarketingPage } from './components/DesignSection';
import { Header } from './components/Header';
import { Action } from './components/UI';
import { BookingStay, BookingDetails, BookingReview, Confirmation } from './pages/Booking';
import { useMotion } from './hooks/useMotion';
import { useMobile } from './hooks/useViewport';
import { Admin } from './pages/Admin';

function NotFound() { return <><Header /><section className="not-found"><p className="eyebrow">AERIS® Mountain Retreat</p><h1>404</h1><p>This page could not be found.</p><Action to="/" outline>Back to the mountains</Action></section><Footer /></>; }
export default function App() {
  const mobile = useMobile(); const location = useLocation(); useMotion(mobile);
  useEffect(() => { const title = location.pathname.includes('booking') ? 'Your demonstration stay' : ({ '/': 'Mountain Retreat', '/rooms': 'Rooms & Suites', '/rooms/forest-suite': 'Forest Suite', '/experiences': 'Experiences', '/about': 'Our Story', '/contact': 'Contact' } as Record<string, string>)[location.pathname] ?? 'Page not found'; document.title = `AERIS® — ${title}`; }, [location.pathname]);
  return <DesignRuntime><a className="skip-link" href="#main">Skip to content</a><main id="main" tabIndex={-1}><Routes>
    <Route path="/" element={<MarketingPage desktop="3:15867" mobile="3:16043" />} />
    <Route path="/admin" element={<Admin />} />
    <Route path="/rooms" element={<MarketingPage desktop="3:16209" mobile="3:16359" />} />
    <Route path="/rooms/forest-suite" element={<MarketingPage desktop="3:16501" mobile="3:16651" />} />
    <Route path="/experiences" element={<MarketingPage desktop="3:16790" mobile="3:16904" />} />
    <Route path="/about" element={<MarketingPage desktop="3:17010" mobile="3:17110" />} />
    <Route path="/contact" element={<MarketingPage desktop="3:17202" mobile="3:17321" />} />
    <Route path="/booking" element={<BookingStay />} /><Route path="/booking/details" element={<BookingDetails />} /><Route path="/booking/review" element={<BookingReview />} /><Route path="/booking/confirmation" element={<Confirmation />} />
    <Route path="*" element={<NotFound />} />
  </Routes></main><Link className="sr-only focus:not-sr-only" to="/booking">Plan a demonstration stay</Link></DesignRuntime>;
}
