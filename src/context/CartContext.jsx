import React, { createContext, useState, useEffect, useCallback, useContext, useRef } from 'react';
import { cartApi, guestCart } from '../api/cartApi';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

// Logged in  -> cart is stored in MongoDB.
// Logged out -> cart is kept in this browser; when the customer logs in it is moved into the database.
export const CartProvider = ({ children }) => {
  const auth = useContext(AuthContext);
  const userId = auth?.user?._id || auth?.user?.id || null;

  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const userIdRef = useRef(userId);
  userIdRef.current = userId;

  const reload = useCallback(async () => {
    const id = userIdRef.current;
    if (!id) {
      setCart(guestCart.get());
      return;
    }
    try {
      setCart(await cartApi.getCart(id));
    } catch (err) {
      console.error('Failed to load cart:', err);
    }
  }, []);

  // (re)load whenever the logged in user changes (login / logout)
  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      setLoading(true);
      if (userId) {
        // move anything added before login into the database
        const pending = guestCart.get();
        if (pending.length) {
          for (const item of pending) {
            try {
              await cartApi.addToCart(item.id, item.quantity);
            } catch (err) {
              console.warn('Could not move guest cart item:', item.name, err.message);
            }
          }
          guestCart.clear();
        }
      }
      if (!cancelled) await reload();
      if (!cancelled) setLoading(false);
    };
    init();
    return () => { cancelled = true; };
  }, [userId, reload]);

  // every action returns { success, message } and never throws, so a failed click cannot crash a page
  const run = async (serverAction, guestAction) => {
    try {
      if (userIdRef.current) {
        const res = await serverAction();
        await reload();
        return { success: true, message: res?.message };
      }
      setCart(guestAction());
      return { success: true };
    } catch (err) {
      console.error('Cart error:', err);
      await reload();
      return { success: false, message: err.message };
    }
  };

  const addToCart = async (product, quantity = 1) => {
    const res = await run(
      () => cartApi.addToCart(product.id, quantity),
      () => guestCart.add(product, quantity)
    );
    if (!res.success && res.message) window.alert(res.message);
    return res;
  };

  const updateQuantity = (productId, quantity) =>
    run(
      () => cartApi.updateQuantity(productId, quantity),
      () => guestCart.setQuantity(productId, quantity)
    );

  const removeFromCart = (productId) =>
    run(
      () => cartApi.removeFromCart(productId),
      () => guestCart.remove(productId)
    );

  const clearCart = async () => {
    const res = await run(
      () => cartApi.clearCart(),
      () => guestCart.clear()
    );
    if (res.success) setCart([]);
    return res;
  };

  const cartTotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ cart, loading, addToCart, updateQuantity, removeFromCart, clearCart, cartTotal, cartCount, reloadCart: reload }}
    >
      {children}
    </CartContext.Provider>
  );
};
