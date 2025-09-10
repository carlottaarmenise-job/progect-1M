import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import type { CartItem, Product } from '../types';

type CartState = {
    items: CartItem[];
};

type CartAction =
    | { type: 'ADD'; product: Product; qty?: number }
    | { type: 'REMOVE'; productId: number }
    | { type: 'SET_QTY'; productId: number; qty: number }
    | { type: 'CLEAR' };

type CartContextValue = {
    items: CartItem[];
    count: number;
    total: number;
    addToCart: (product: Product, qty?: number) => void;
    removeFromCart: (productId: number) => void;
    setQty: (productId: number, qty: number) => void;
    clearCart: () => void;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

function cartReducer(state: CartState, action: CartAction): CartState {
    switch (action.type) {
        case 'ADD': {
            const qty = Math.max(1, action.qty ?? 1);
            const existing = state.items.find(i => i.product.id === action.product.id);
            if (existing) {
                return {
                    items: state.items.map(i =>
                        i.product.id === action.product.id ? { ...i, qty: i.qty + qty } : i
                    ),
                };
            }
            return { items: [...state.items, { product: action.product, qty }] };
        }
        case 'REMOVE': {
            return { items: state.items.filter(i => i.product.id !== action.productId) };
        }
        case 'SET_QTY': {
            const qty = Math.max(0, action.qty);
            if (qty === 0) {
                return { items: state.items.filter(i => i.product.id !== action.productId) };
            }
            return {
                items: state.items.map(i =>
                    i.product.id === action.productId ? { ...i, qty } : i
                ),
            };
        }
        case 'CLEAR':
            return { items: [] };
        default:
            return state;
    }
}

const STORAGE_KEY = 'cart:progetto-carlotta';

function loadInitialState(): CartState {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return { items: [] };
        const parsed: CartState = JSON.parse(raw);
        if (!Array.isArray(parsed.items)) return { items: [] };
        return parsed;
    } catch {
        return { items: [] };
    }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [state, dispatch] = useReducer(cartReducer, undefined, loadInitialState);

    // Persistenza su localStorage
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }, [state]);

    const value = useMemo<CartContextValue>(() => {
        const count = state.items.reduce((sum, i) => sum + i.qty, 0);
        const total = state.items.reduce((sum, i) => sum + i.qty * i.product.price, 0);
        return {
            items: state.items,
            count,
            total,
            addToCart: (product, qty) => dispatch({ type: 'ADD', product, qty }),
            removeFromCart: (productId) => dispatch({ type: 'REMOVE', productId }),
            setQty: (productId, qty) => dispatch({ type: 'SET_QTY', productId, qty }),
            clearCart: () => dispatch({ type: 'CLEAR' }),
        };
    }, [state.items]);

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error('useCart must be used within CartProvider');
    return ctx;
}
