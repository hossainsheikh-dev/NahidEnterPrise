import { createContext, useContext, useState, useEffect, useMemo } from "react";

const CartContext  = createContext(null);
const API          = process.env.REACT_APP_API_URL || "http://localhost:5000";
const COOKIE_NAME  = "nahid_cart";
const COOKIE_DAYS  = 7;

function getCookie() {
  try {
    const match = document.cookie.split("; ").find(r => r.startsWith(COOKIE_NAME + "="));
    if (!match) return [];
    return JSON.parse(decodeURIComponent(match.split("=")[1]));
  } catch { return []; }
}

function setCookie(items) {
  const expires = new Date();
  expires.setDate(expires.getDate() + COOKIE_DAYS);
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(JSON.stringify(items))}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
}

function clearCookie() {
  document.cookie = `${COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);

  const [deliverySettings, setDeliverySettings] = useState({
    deliveryInDhaka:      60,
    deliveryOutsideDhaka: 120,
    freeDeliveryMinimum:  2500,
    freeDeliveryEnabled:  true,
  });
  const [selectedZone, setSelectedZone] = useState("outside");

  useEffect(() => { setCartItems(getCookie()); }, []);
  useEffect(() => { setCookie(cartItems); }, [cartItems]);

  useEffect(() => {
    fetch(`${API}/api/settings`)
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setDeliverySettings({
            deliveryInDhaka:      d.data.deliveryInDhaka      ?? 60,
            deliveryOutsideDhaka: d.data.deliveryOutsideDhaka ?? 120,
            freeDeliveryMinimum:  d.data.freeDeliveryMinimum  ?? 2500,
            freeDeliveryEnabled:  d.data.freeDeliveryEnabled  ?? true,
          });
        }
      })
      .catch(() => {});
  }, []);

  const addToCart = (product) => {
    setCartItems(prev => {
      const existing = prev.find(i => i._id === product._id);
      if (existing) {
        return prev.map(i => i._id === product._id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      const salePrice = product.salePrice && product.salePrice < product.price
        ? product.salePrice : product.price;
      return [...prev, {
        _id:           product._id,
        name:          product.name,
        slug:          product.slug          || "",
        price:         product.price,
        salePrice,
        discountType:  product.discountType  || "none",
        discountValue: product.discountValue || 0,
        image:         product.images?.[0]?.url || "",
        stock:         product.stock,
        quantity:      1,
      }];
    });
  };

  const removeFromCart = (id) => setCartItems(prev => prev.filter(i => i._id !== id));

  const updateQuantity = (id, qty) => {
    if (qty < 1) return;
    setCartItems(prev => prev.map(i => i._id === id ? { ...i, quantity: qty } : i));
  };

  const clearCart = () => { setCartItems([]); clearCookie(); };

  const cartCount    = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const cartSubtotal = cartItems.reduce((sum, i) => sum + i.salePrice * i.quantity, 0);
  const cartSavings  = cartItems.reduce((sum, i) => sum + (i.price - i.salePrice) * i.quantity, 0);

  const deliveryCharge = useMemo(() => {
    if (
      deliverySettings.freeDeliveryEnabled &&
      cartSubtotal >= deliverySettings.freeDeliveryMinimum
    ) return 0;
    return selectedZone === "dhaka"
      ? deliverySettings.deliveryInDhaka
      : deliverySettings.deliveryOutsideDhaka;
  }, [cartSubtotal, deliverySettings, selectedZone]);

  const cartTotal = cartSubtotal + deliveryCharge;

  return (
    <CartContext.Provider value={{
      cartItems, cartCount, cartSubtotal, cartSavings,
      deliveryCharge, cartTotal, deliverySettings,
      selectedZone, setSelectedZone,
      addToCart, removeFromCart, updateQuantity, clearCart,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() { return useContext(CartContext); }