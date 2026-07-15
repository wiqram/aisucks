'use client';

import { useState } from 'react';

const STUDIO_EMAIL = 'hello@silverandsignal.studio';

// Booking enquiry form. No backend by design (marketing site) — on submit it
// composes a pre-filled email to the studio, which works from any device/mail
// client without us storing anyone's data.
export default function BookingForm() {
  const [line, setLine] = useState<'silver' | 'signal'>('silver');

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const name = String(data.get('name') ?? '');
    const email = String(data.get('email') ?? '');
    const brief = String(data.get('brief') ?? '');
    const collection = line === 'silver' ? 'Silver (genuine / film & portraiture)' : 'Signal (AI + drone)';

    const subject = `Shoot enquiry — ${collection}`;
    const body =
      `Name: ${name}\n` +
      `Email: ${email}\n` +
      `Collection: ${collection}\n\n` +
      `Brief:\n${brief}\n`;

    window.location.href =
      `mailto:${STUDIO_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <div className="field">
        <label>Which line?</label>
        <div className="seg">
          <label className={line === 'silver' ? 'on-silver' : ''}>
            <input
              type="radio"
              name="line"
              value="silver"
              checked={line === 'silver'}
              onChange={() => setLine('silver')}
            />
            Silver — genuine
          </label>
          <label className={line === 'signal' ? 'on-signal' : ''}>
            <input
              type="radio"
              name="line"
              value="signal"
              checked={line === 'signal'}
              onChange={() => setLine('signal')}
            />
            Signal — AI + drone
          </label>
        </div>
      </div>

      <div className="field">
        <label htmlFor="name">Your name</label>
        <input id="name" name="name" type="text" required placeholder="Jordan Ellis" autoComplete="name" />
      </div>

      <div className="field">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required placeholder="you@studio.com" autoComplete="email" />
      </div>

      <div className="field">
        <label htmlFor="brief">The brief</label>
        <textarea
          id="brief"
          name="brief"
          required
          placeholder="Wedding in September, coastal venue, ~120 guests. Want a drone reel too…"
        />
      </div>

      <button type="submit" className="btn">
        Send enquiry <span className="arrow">→</span>
      </button>
      <p className="form__note">Opens your mail app · we reply within one working day</p>
    </form>
  );
}
