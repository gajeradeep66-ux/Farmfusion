import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import AuthGarden from '../components/AuthGarden';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
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
      await login(form);
      const redirect = searchParams.get('redirect');
      navigate(redirect?.startsWith('/') ? redirect : '/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'We could not sign you in. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-frame">
        <AuthGarden mode="login" />
        <section className="auth-form-side">
          <Link to="/" className="auth-mobile-brand">farmfusion<span>✳</span></Link>
          <div className="auth-form-wrap">
            <span className="section-kicker">WELCOME BACK, GROWER</span>
            <h1>Let’s get growing.</h1>
            <p className="auth-intro">Sign in to pick up where you left off.</p>
            <form className="auth-form" onSubmit={handleSubmit}>
              <label className="auth-field">Email address
                <input name="email" type="email" value={form.email} onChange={handleChange} autoComplete="email" placeholder="you@example.com" required />
              </label>
              <label className="auth-field">Password
                <input name="password" type="password" value={form.password} onChange={handleChange} autoComplete="current-password" placeholder="Your password" required />
              </label>
              {error && <p className="auth-error" role="alert">{error}</p>}
              <button type="submit" className="auth-submit" disabled={isSubmitting}>{isSubmitting ? 'Signing you in…' : 'Sign in'}<span aria-hidden="true">→</span></button>
            </form>
            <p className="auth-switch">New to the garden? <Link to="/register">Create an account</Link></p>
            <Link to="/" className="auth-back">← Back to FarmFusion</Link>
          </div>
          <div className="auth-privacy">Your details stay yours. Always.</div>
        </section>
      </div>
    </div>
  );
}
