import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { CartProvider } from './context/CartContext';
import { LanguageProvider } from './context/LanguageContext';
import { WishlistProvider } from "./context/WishlistContext";



const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <LanguageProvider>
    <WishlistProvider>
        <CartProvider>
          <App />
        </CartProvider>
    </WishlistProvider>
</LanguageProvider>
);