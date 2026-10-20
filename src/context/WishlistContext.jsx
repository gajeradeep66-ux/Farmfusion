import { createContext, useContext, useMemo, useState } from 'react';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const [ids, setIds] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('farmfusion_wishlist') || '[]')); }
    catch { return new Set(); }
  });

  const toggle = (id) => {
    setIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      localStorage.setItem('farmfusion_wishlist', JSON.stringify([...next]));
      return next;
    });
  };

  const value = useMemo(() => ({ ids, toggle, has: (id) => ids.has(id) }), [ids]);
  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}
