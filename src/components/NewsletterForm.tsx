'use client';

import { useState } from 'react';

export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
      setEmail('');
      setTimeout(() => setSubmitted(false), 3000);
    }
  };

  return (
    <form className="newsletter-card__form" onSubmit={handleSubmit}>
      <input
        type="email"
        placeholder="Email Anda"
        className="newsletter-card__input"
        id="newsletter-email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <button
        type="submit"
        className="btn btn-secondary newsletter-card__btn"
        id="newsletter-submit"
      >
        {submitted ? '✓ Berhasil!' : 'Langganan'}
      </button>
    </form>
  );
}
