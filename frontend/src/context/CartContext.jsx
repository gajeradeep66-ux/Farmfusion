import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../api';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    const stored = localStorage.getItem('farmfusion_cart');
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem('farmfusion_cart', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    const refreshSavedCart = async () => {
      try {
        const { data: products } = await api.get('/products');
        const currentProducts = new Map(products.map((product) => [product._id, product]));
        setItems((currentItems) => currentItems.map((item) => {
          const product = currentProducts.get(item.productId);
          return product
            ? { ...item, name: product.name, price: product.price, image: product.image, stock: product.stock }
            : item;
        }));
      } catch (error) {
        console.error('Failed to refresh saved cart products', error);
      }
    };

    refreshSavedCart();
  }, []);

  const addToCart = (product) => {
    setItems((currentItems) => {
      const existing = currentItems.find((item) => item.productId === product._id);
      if (existing) {
        return currentItems.map((item) =>
          item.productId === product._id
            ? {
                ...item,
                quantity: Math.min(item.quantity + 1, Number.isFinite(product.stock) ? Math.max(1, product.stock) : item.quantity + 1),
                stock: product.stock,
              }
            : item
        );
      }

      return [
        ...currentItems,
        {
          productId: product._id,
          name: product.name,
          price: product.price,
          image: product.image,
          stock: product.stock,
          quantity: 1,
        },
      ];
    });
  };

  const updateQuantity = (productId, delta) => {
    setItems((currentItems) =>
      currentItems
        .map((item) =>
          item.productId === productId
            ? {
                ...item,
                quantity: Math.min(
                  Number.isFinite(item.stock) ? Math.max(1, item.stock) : Number.MAX_SAFE_INTEGER,
                  Math.max(1, item.quantity + delta)
                ),
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (productId) => {
    setItems((currentItems) => currentItems.filter((item) => item.productId !== productId));
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const value = useMemo(
    () => ({ items, addToCart, updateQuantity, removeFromCart, clearCart, totalItems, totalAmount }),
    [items, totalItems, totalAmount]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};
