import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import assets from '../data/assets.json';

export function Arrow({ dark = false }: { dark?: boolean }) { return <img src={dark ? assets['3:15867'].imgArrowUpRight1 : assets['3:15867'].imgArrowUpRight} alt="" aria-hidden="true" width="16" height="16" />; }
export function Action({ children, to, onClick, outline = false, type = 'button', disabled = false }: { children: ReactNode; to?: string; onClick?: () => void; outline?: boolean; type?: 'button' | 'submit'; disabled?: boolean }) {
  const content = <>{children}<Arrow dark={outline} /></>;
  const className = `action ${outline ? 'action-outline' : ''}`;
  return to ? <Link className={className} to={to} onClick={onClick}>{content}</Link> : <button type={type} className={className} onClick={onClick} disabled={disabled}>{content}</button>;
}
export function Modal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { const dialog = ref.current!; dialog.showModal(); const previous = document.body.style.overflow; document.body.style.overflow = 'hidden'; return () => { document.body.style.overflow = previous; dialog.close(); }; }, []);
  return createPortal(<dialog ref={ref} data-lenis-prevent className="modal" aria-label={title} onCancel={onClose} onClick={event => { if (event.target === ref.current) onClose(); }}><div className="modal-inner"><div className="modal-top"><p className="eyebrow">AERIS® Mountain Retreat</p><button type="button" onClick={onClose} className="text-link">Close</button></div><h2>{title}</h2>{children}</div></dialog>, document.body);
}
