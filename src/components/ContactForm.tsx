import { useState, type FormEvent } from 'react';
import { Action } from './UI';
import { api, demoMode } from '../lib/api';

export function ContactForm({ className = '' }: { className?: string }) {
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = event.currentTarget;
    if (!form.reportValidity() || pending) return;
    setPending(true); setError(''); setSent(false);
    try {
      if (!demoMode) await api('/contact', { method: 'POST', body: JSON.stringify({ ...Object.fromEntries(new FormData(form)), privacy: true }) });
      setSent(true); form.reset();
    } catch (error) { setError((error as Error).message); } finally { setPending(false); }
  }
  return <form className={`contact-form ${className}`} onSubmit={submit}>
    <p className="eyebrow">Leave a little note</p><h2>What brings you here?</h2>
    {sent && <div role="status" className="notice">{demoMode ? 'Your demonstration note is complete. No message was sent and your details have not been saved.' : 'DEMO message saved. No email was sent.'}</div>}
    {error && <div role="alert" className="validation-notice">{error}</div>}
    <div className="form-two"><label>First name *<input name="firstName" autoComplete="given-name" placeholder="Enter your details" required maxLength={100} /></label><label>Last name *<input name="lastName" autoComplete="family-name" placeholder="Enter your details" required maxLength={100} /></label></div>
    <label>Email address *<input name="email" type="email" autoComplete="email" placeholder="Enter your details" required maxLength={254} /></label>
    <label>Your conversation<select name="topic"><option>Planning a stay</option><option>A special occasion</option><option>Dining and experiences</option><option>Simply a hello</option></select></label>
    <label>Your message *<textarea name="message" placeholder="Tell us what you have in mind…" required rows={4} maxLength={3000} /></label>
    <label className="check-label"><input type="checkbox" required name="privacy" /><span>I agree to the privacy policy and the use of my details to respond to this enquiry.</span></label>
    <Action type="submit" disabled={pending}>{pending ? 'Saving your note…' : 'Send your note'}</Action><p className="small muted">{demoMode ? 'Static enquiry form · no message will be sent.' : 'DEMO enquiry · saved in the local database. Use fictional details.'} Fields marked * are required.</p>
  </form>;
}
