import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

gsap.registerPlugin(ScrollTrigger);
export function useMotion(mobile: boolean) {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    const media = gsap.matchMedia();
    let disposed = false;
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const hero = document.querySelector('[data-name="Hero promise"]');
      if (hero) gsap.from(hero.children, { opacity: 0, y: 24, duration: 1.2, stagger: 0.12, ease: 'power2.out', clearProps: 'transform,opacity' });
      gsap.utils.toArray<HTMLElement>('main > .design-node > section:not([data-name="Arrival"])').forEach(section => {
        const targets = Array.from(section.children).filter(child => !child.classList.contains('absolute'));
        gsap.from(targets, { y: 22, opacity: 0, duration: 0.9, stagger: 0.08, ease: 'power2.out', clearProps: 'transform,opacity', scrollTrigger: { trigger: section, start: 'top 94%', once: true } });
      });
      if (!mobile) {
        const lenis = new Lenis({ duration: 1.1, smoothWheel: true, anchors: true });
        const tick = (time: number) => lenis.raf(time * 1000);
        lenis.on('scroll', ScrollTrigger.update); gsap.ticker.add(tick);
        return () => { gsap.ticker.remove(tick); lenis.destroy(); };
      }
    });
    const jump = () => { if (disposed) return; if (hash) document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView({ behavior: 'instant', block: 'start' }); ScrollTrigger.refresh(); };
    void document.fonts.ready.then(jump);
    const refresh = () => { if (!disposed) ScrollTrigger.refresh(); };
    const images = Array.from(document.images); images.forEach(image => image.addEventListener('load', refresh, { once: true }));
    const frame = requestAnimationFrame(jump);
    return () => { disposed = true; media.revert(); cancelAnimationFrame(frame); images.forEach(image => image.removeEventListener('load', refresh)); };
  }, [pathname, hash, mobile]);
}
