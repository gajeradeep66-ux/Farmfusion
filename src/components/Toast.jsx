import { useEffect, useState } from 'react';

let _addToast = null;

export function toast(message, type = 'success') {
  _addToast?.({ message, type, id: Date.now() });
}

export default function Toast() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    _addToast = (t) => {
      setToasts((prev) => [...prev.slice(-3), t]);
      setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== t.id)), 3000);
    };
    return () => { _addToast = null; };
  }, []);

  if (!toasts.length) return null;

  return (
    <div className="toast-stack" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast-item toast-${t.type}`}>
          <span className="toast-icon">{t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : 'ℹ'}</span>
          {t.message}
        </div>
      ))}
    </div>
  );
}
