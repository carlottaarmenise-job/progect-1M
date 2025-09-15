import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './styles/theme.css';
import { OrderProvider } from './context/OrderContext';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { ProductProvider } from './context/ProductContext';
import { CategoryProvider } from './context/CategoryContext';

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Elemento #root non trovato');

createRoot(rootEl).render(
  <BrowserRouter>
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <ProductProvider>
            <CategoryProvider>
              <OrderProvider>
                  <App />
              </OrderProvider>
            </CategoryProvider>
          </ProductProvider>
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  </BrowserRouter>
);