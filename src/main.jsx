import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { PreferencesProvider } from './context/PreferencesContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <PreferencesProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </PreferencesProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
