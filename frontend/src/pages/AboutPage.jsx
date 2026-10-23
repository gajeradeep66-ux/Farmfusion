import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { resolveImageUrl } from '../api';

export default function AboutPage() {
  const [content, setContent] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/about')
      .then(({ data }) => setContent(data))
      .catch((requestError) => setError(requestError.response?.data?.message || 'About information is unavailable right now.'));
  }, []);

  return (
    <section className="about-page">
      <div className="about-copy">
        <span className="section-kicker">A BETTER WAY TO GROW</span>
        <h1>{content?.title || 'Rooted in care. Growing together.'}</h1>
        <p>{error || content?.story || 'Loading our story…'}</p>
        {content?.contactEmail && <a className="about-contact" href={`mailto:${content.contactEmail}`}>Talk to our team <strong>{content.contactEmail}</strong></a>}
        <Link className="button-primary" to="/shop">Explore farm essentials <span aria-hidden="true">→</span></Link>
      </div>
      <div className="about-image-wrap">
        <img src={resolveImageUrl(content?.image && !content.image.startsWith('/images/about-farm.svg') ? content.image : 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1800&q=90')} alt="Sunlit green fields stretching across a farm landscape" />
        <span>GROW GOOD THINGS</span>
      </div>
    </section>
  );
}
