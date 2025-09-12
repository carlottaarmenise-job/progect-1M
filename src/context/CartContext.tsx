import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import type { CartItem, Product } from '../types';

type CartState = {
    items: CartItem[];
    loading: boolean;
};

type CartAction =
    | { type: 'ADD'; product: Product; qty?: number }
    | { type: 'REMOVE'; productId: number }
    | { type: 'SET_QTY'; productId: number; qty: number }
    | { type: 'CLEAR' }
    | { type: 'SET_LOADING'; loading: boolean }
    | { type: 'LOAD_FROM_API'; items: CartItem[] };

type CartContextValue = {
    items: CartItem[];
    count: number;
    total: number;
    loading: boolean;
    addToCart: (product: Product, qty?: number) => Promise<void>;
    removeFromCart: (productId: number) => Promise<void>;
    setQty: (productId: number, qty: number) => Promise<void>;
    clearCart: () => Promise<void>;
    syncFromAPI: () => Promise<void>;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

const API_BASE = 'http://127.0.0.1:1880';

function cartReducer(state: CartState, action: CartAction): CartState {
    switch (action.type) {
        case 'ADD': {
            const qty = Math.max(1, action.qty ?? 1);
            const existing = state.items.find(i => i.product.id === action.product.id);
            if (existing) {
                return {
                    ...state,
                    items: state.items.map(i =>
                        i.product.id === action.product.id ? { ...i, qty: i.qty + qty } : i
                    ),
                };
            }
            return { ...state, items: [...state.items, { product: action.product, qty }] };
        }
        case 'REMOVE': {
            return { ...state, items: state.items.filter(i => i.product.id !== action.productId) };
        }
        case 'SET_QTY': {
            const qty = Math.max(0, action.qty);
            if (qty === 0) {
                return { ...state, items: state.items.filter(i => i.product.id !== action.productId) };
            }
            return {
                ...state,
                items: state.items.map(i =>
                    i.product.id === action.productId ? { ...i, qty } : i
                ),
            };
        }
        case 'CLEAR':
            return { ...state, items: [] };
        case 'SET_LOADING':
            return { ...state, loading: action.loading };
        case 'LOAD_FROM_API':
            return { ...state, items: action.items };
        default:
            return state;
    }
}

const STORAGE_KEY = 'cart:progetto-carlotta';

function loadInitialState(): CartState {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return { items: [], loading: false };
        const parsed: CartState = JSON.parse(raw);
        if (!Array.isArray(parsed.items)) return { items: [], loading: false };
        return { items: parsed.items, loading: false };
    } catch {
        return { items: [], loading: false };
    }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [state, dispatch] = useReducer(cartReducer, undefined, loadInitialState);

    const syncWithAPI = async (items: CartItem[]) => {
        try {
            await fetch(`${API_BASE}/carrello`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items })
            });
        } catch (error) {
            console.error('Sync error:', error);
        }
    };

    const loadFromAPI = async () => {
        dispatch({ type: 'SET_LOADING', loading: true });
        try {
            const response = await fetch(`${API_BASE}/carrello`);
            if (response.ok) {
                const data = await response.json();
                const apiItems = data.cart || [];
                dispatch({ type: 'LOAD_FROM_API', items: apiItems });
                localStorage.setItem(STORAGE_KEY, JSON.stringify({ items: apiItems }));
            }
        } catch (error) {
            console.error('Load from API error:', error);
        } finally {
            dispatch({ type: 'SET_LOADING', loading: false });
        }
    };

    useEffect(() => {
        loadFromAPI();
    }, []);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ items: state.items }));
        if (!state.loading) {
            syncWithAPI(state.items);
        }
    }, [state.items, state.loading]);

    const value = useMemo<CartContextValue>(() => {
        const count = state.items.reduce((sum, i) => sum + i.qty, 0);
        const total = state.items.reduce((sum, i) => sum + i.qty * i.product.price, 0);
        
        return {
            items: state.items,
            count,
            total,
            loading: state.loading,
            addToCart: async (product, qty) => {
                dispatch({ type: 'ADD', product, qty });
            },
            removeFromCart: async (productId) => {
                dispatch({ type: 'REMOVE', productId });
            },
            setQty: async (productId, qty) => {
                dispatch({ type: 'SET_QTY', productId, qty });
            },
            clearCart: async () => {
                dispatch({ type: 'CLEAR' });
            },
            syncFromAPI: loadFromAPI,
        };
    }, [state.items, state.loading]);

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error('useCart must be used within CartProvider');
    return ctx;
}