import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthGarden from '../components/AuthGarden';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      await register(form);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'We could not create your account. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-frame">
        <AuthGarden mode="register" />
        <section className="auth-form-side">
          <Link to="/" className="auth-mobile-brand">farmfusion<span>✳</span></Link>
          <div className="auth-form-wrap">
            <span className="section-kicker">A GOOD PLACE TO GROW</span>
            <h1>Come grow with us.</h1>
            <p className="auth-intro">Create your account and make room for good things.</p>
            <form className="auth-form" onSubmit={handleSubmit}>
              <label className="auth-field">Your name
                <input name="name" value={form.name} onChange={handleChange} autoComplete="name" placeholder="How should we call you?" required />
              </label>
              <label className="auth-field">Email address
                <input name="email" type="email" value={form.email} onChange={handleChange} autoComplete="email" placeholder="you@example.com" required />
              </label>
              <label className="auth-field">Create a password
                <input name="password" type="password" value={form.password} onChange={handleChange} autoComplete="new-password" minLength={8} placeholder="At least 8 characters" required />
              </label>
              {error && <p className="auth-error" role="alert">{error}</p>}
              <button type="submit" className="auth-submit" disabled={isSubmitting}>{isSubmitting ? 'Creating your account…' : 'Create my account'}<span aria-hidden="true">→</span></button>
            </form>
            <p className="auth-switch">Already part of the garden? <Link to="/login">Sign in</Link></p>
            <Link to="/" className="auth-back">← Back to FarmFusion</Link>
          </div>
          <div className="auth-privacy">Your details stay yours. Always.</div>
        </section>
      </div>
    </div>
  );
}
