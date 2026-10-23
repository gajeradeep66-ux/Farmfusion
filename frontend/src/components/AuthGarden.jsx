export default function AuthGarden({ mode }) {
  return (
    <aside className="auth-story">
      <div className="auth-story-brand">
        <span className="auth-story-mark"><svg viewBox="0 0 48 48" aria-hidden="true"><path d="M24 41V22m0 12c-11 0-17-7-17-17 11 0 17 6 17 17Zm0-8c0-11 7-17 17-17 0 11-6 17-17 17Z" /></svg></span>
        <span>farmfusion<small>GROW GOOD THINGS</small></span>
      </div>
      <div className="auth-story-copy">
        <span className="auth-story-kicker">A LITTLE MORE ROOM TO GROW</span>
        <h2>{mode === 'register' ? 'Your next growing story starts here.' : 'Good to have you back in the garden.'}</h2>
        <p>{mode === 'register'
          ? 'Join a community of growers who believe the best things begin with care.'
          : 'Your favourite growing essentials and fresh-season finds are just around the corner.'}</p>
      </div>
      <div className="auth-garden-art" aria-hidden="true">
        <img src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1600&q=85" alt="Sunlit green fields stretching across a farm landscape" />
      </div>
      <div className="auth-story-foot"><span>✳</span> THOUGHTFULLY PICKED FOR EVERY GROWER</div>
    </aside>
  );
}
