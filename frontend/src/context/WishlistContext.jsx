import { createContext, useContext, useState, useEffect, useCallback } from "react";

const WishlistContext = createContext();
const API       = process.env.REACT_APP_API_URL || `${process.env.REACT_APP_BACKEND_URL}`;
const LOCAL_KEY = "ne_wishlist";

// localStorage helpers
const getLocal = () => { try { return JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]"); } catch { return []; } };
const setLocal = (ids) => { try { localStorage.setItem(LOCAL_KEY, JSON.stringify(ids)); } catch {} };

// cookie helpers (7 দিন)
const COOKIE_NAME  = "nahid_wishlist";
const COOKIE_DAYS  = 7;

function getWishlistCookie() {
  try {
    const match = document.cookie.split("; ").find(r => r.startsWith(COOKIE_NAME + "="));
    if (!match) return [];
    return JSON.parse(decodeURIComponent(match.split("=")[1]));
  } catch { return []; }
}

function setWishlistCookie(ids) {
  const exp = new Date();
  exp.setDate(exp.getDate() + COOKIE_DAYS);
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(JSON.stringify(ids))}; expires=${exp.toUTCString()}; path=/; SameSite=Lax`;
}

// localStorage ও cookie দুইটা মিলিয়ে নাও
function getAllLocalIds() {
  const fromLocal  = getLocal();
  const fromCookie = getWishlistCookie();
  return [...new Set([...fromLocal, ...fromCookie])];
}

// দুইটাতেই save করো
function saveLocalIds(ids) {
  setLocal(ids);
  setWishlistCookie(ids);
}

export function WishlistProvider({ children }) {
  const [wishlistIds,      setWishlistIds     ] = useState(getAllLocalIds);
  const [wishlistProducts, setWishlistProducts] = useState([]);

  const getToken = () => localStorage.getItem("customerToken");

  // product details fetch
  const fetchProducts = useCallback(async (ids) => {
    if (!ids || ids.length === 0) { setWishlistProducts([]); return; }
    try {
      const res  = await fetch(`${API}/api/products/public`);
      const data = await res.json();
      if (data.success) {
        const filtered = data.data.filter(p => ids.includes(p._id));
        setWishlistProducts(filtered);
      }
    } catch {}
  }, []);

  // ── Initial load ──
  useEffect(() => {
    const token = getToken();
    if (token) {
      // Login করা — server থেকে fetch করো, local/cookie এর সাথে merge করো
      fetch(`${API}/api/customer/wishlist`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(r => r.json())
        .then(data => {
          const backendIds = (data.wishlist || []).map(p => typeof p === "object" ? p._id : p);
          const localIds   = getAllLocalIds();
          const merged     = [...new Set([...backendIds, ...localIds])];

          setWishlistIds(merged);
          saveLocalIds(merged);
          fetchProducts(merged);

          // local এ যা আছে কিন্তু server এ নেই — server এ push করো
          localIds.forEach(id => {
            if (!backendIds.includes(id)) {
              fetch(`${API}/api/customer/wishlist/toggle`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ productId: id }),
              }).catch(() => {});
            }
          });
        })
        .catch(() => {
          const local = getAllLocalIds();
          setWishlistIds(local);
          fetchProducts(local);
        });
    } else {
      // Logout — local + cookie থেকে load
      const local = getAllLocalIds();
      setWishlistIds(local);
      fetchProducts(local);
    }
  }, [fetchProducts]);

  // ── Auth change (login/logout) ──
  useEffect(() => {
    const handle = () => {
      const token = getToken();
      if (token) {
        // নতুন login — server থেকে fetch করে merge করো
        fetch(`${API}/api/customer/wishlist`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then(r => r.json())
          .then(data => {
            const backendIds = (data.wishlist || []).map(p => typeof p === "object" ? p._id : p);
            const localIds   = getAllLocalIds();
            const merged     = [...new Set([...backendIds, ...localIds])];

            setWishlistIds(merged);
            saveLocalIds(merged);
            fetchProducts(merged);

            // local items → server এ sync করো
            localIds.forEach(id => {
              if (!backendIds.includes(id)) {
                fetch(`${API}/api/customer/wishlist/toggle`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                  body: JSON.stringify({ productId: id }),
                }).catch(() => {});
              }
            });
          })
          .catch(() => {});
      } else {
        // Logout — local + cookie দেখাও
        const local = getAllLocalIds();
        setWishlistIds(local);
        fetchProducts(local);
      }
    };

    window.addEventListener("customerAuthChanged", handle);
    return () => window.removeEventListener("customerAuthChanged", handle);
  }, [fetchProducts]);

  // ── Toggle wishlist ──
  const toggleWishlist = useCallback(async (productId) => {
    const current = getAllLocalIds();
    const isIn    = current.includes(productId);
    const updated = isIn
      ? current.filter(id => id !== productId)
      : [...current, productId];

    setWishlistIds(updated);
    saveLocalIds(updated);
    setWishlistProducts(prev => isIn ? prev.filter(p => p._id !== productId) : prev);

    // Server sync (login করা থাকলে)
    const token = getToken();
    if (token) {
      try {
        await fetch(`${API}/api/customer/wishlist/toggle`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ productId }),
        });
      } catch {}
    }

    // Product details fetch (add হলে)
    if (!isIn) {
      try {
        const res  = await fetch(`${API}/api/products/public`);
        const data = await res.json();
        if (data.success) {
          const prod = data.data.find(p => p._id === productId);
          if (prod) setWishlistProducts(prev => {
            const exists = prev.find(p => p._id === productId);
            return exists ? prev : [...prev, prod];
          });
        }
      } catch {}
    }
  }, []);

  const isWished = useCallback((productId) => wishlistIds.includes(productId), [wishlistIds]);

  const clearWishlist = useCallback(() => {
    setWishlistIds([]);
    setWishlistProducts([]);
    saveLocalIds([]);
  }, []);

  return (
    <WishlistContext.Provider value={{
      wishlistIds, wishlistProducts,
      toggleWishlist, isWished, clearWishlist,
      wishlistCount: wishlistIds.length,
    }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}