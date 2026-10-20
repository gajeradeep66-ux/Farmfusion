import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

export default function Footer() {
  const [contactEmail, setContactEmail] = useState('admin@farmfusion.com');

  useEffect(() => {
    api.get('/about')
      .then(({ data }) => setContactEmail(data.contactEmail))
      .catch((error) => console.error('Could not load FarmFusion contact email', error));
  }, []);

  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="footer-brand-column">
          <Link to="/" className="footer-brand">farmfusion<span>✳</span></Link>
          <p>Thoughtful essentials for the people who grow our food, care for the land, and keep things flourishing.</p>
        </div>
        <div>
          <h2>Explore</h2>
          <Link to="/shop">Shop all</Link>
          <Link to="/shop?search=seeds">Seeds</Link>
          <Link to="/shop?search=tools">Tools & equipment</Link>
        </div>
        <div>
          <h2>Here to help</h2>
          <Link to="/cart">Your cart</Link>
          <Link to="/login">Your account</Link>
          <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
        </div>
        <div className="footer-signoff">
          <span className="section-kicker">A NOTE FROM THE FIELD</span>
          <p>Here’s to good soil, patient hands, and a season full of possibility.</p>
          <span>GROW GOOD THINGS.™</span>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 FarmFusion</span>
        <span>Made for every kind of grower.</span>
        <Link to="/">Back to top ↑</Link>
      </div>
    </footer>
  );
}
