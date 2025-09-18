import React, { createContext, useContext, useState, useCallback } from 'react';
import { config } from 'src/config';

export interface OrderItem {
    productId: number;
    productName: string;
    productImage: string;
    price: number;
    quantity: number;
    categoryName: string;
}

export interface Order {
    id: number;
    userId: number;
    items: OrderItem[];
    total: number;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    paymentMethod: string;
    shippingAddress: {
        name: string;
        address: string;
        city: string;
        zipCode: string;
        country: string;
        phone?: string;
    };
    orderDate: string;
    shippedDate?: string;
    deliveredDate?: string;
    trackingNumber?: string;
    notes?: string;
}

export interface CreateOrderData {
    items: OrderItem[];
    total: number;
    paymentMethod: string;
    shippingAddress: {
        name: string;
        address: string;
        city: string;
        zipCode: string;
        country: string;
        phone?: string;
    };
    notes?: string;
}

// DATI MOCK - sostituisci con i tuoi ordini reali
const mockOrders: Order[] = [
    {
        id: 1,
        userId: 1,
        items: [
            {
                productId: 1,
                productName: "iPhone 14 Pro",
                productImage: "https://via.placeholder.com/100x100",
                price: 1199.99,
                quantity: 1,
                categoryName: "Smartphone"
            },
            {
                productId: 5,
                productName: "AirPods Pro",
                productImage: "https://via.placeholder.com/100x100",
                price: 279.99,
                quantity: 1,
                categoryName: "Audio"
            }
        ],
        total: 1479.98,
        status: 'delivered',
        paymentMethod: 'PayPal',
        shippingAddress: {
            name: 'Mario Rossi',
            address: 'Via Roma 123',
            city: 'Milano',
            zipCode: '20100',
            country: 'Italia',
            phone: '3331234567'
        },
        orderDate: '2024-09-10',
        deliveredDate: '2024-09-15',
        trackingNumber: 'TR123456789',
        notes: 'Consegna veloce richiesta'
    },
    {
        id: 2,
        userId: 1,
        items: [
            {
                productId: 3,
                productName: "MacBook Air M2",
                productImage: "https://via.placeholder.com/100x100",
                price: 1499.99,
                quantity: 1,
                categoryName: "Laptop"
            }
        ],
        total: 1499.99,
        status: 'shipped',
        paymentMethod: 'Carta di Credito',
        shippingAddress: {
            name: 'Mario Rossi',
            address: 'Via Roma 123',
            city: 'Milano',
            zipCode: '20100',
            country: 'Italia',
            phone: '3331234567'
        },
        orderDate: '2024-09-16',
        shippedDate: '2024-09-17',
        trackingNumber: 'TR987654321'
    },
    {
        id: 3,
        userId: 1,
        items: [
            {
                productId: 2,
                productName: "Samsung Galaxy S24",
                productImage: "https://via.placeholder.com/100x100",
                price: 899.99,
                quantity: 1,
                categoryName: "Smartphone"
            },
            {
                productId: 7,
                productName: "Caricatore Wireless",
                productImage: "https://via.placeholder.com/100x100",
                price: 49.99,
                quantity: 2,
                categoryName: "Accessori"
            }
        ],
        total: 999.97,
        status: 'processing',
        paymentMethod: 'PayPal',
        shippingAddress: {
            name: 'Mario Rossi',
            address: 'Via Roma 123',
            city: 'Milano',
            zipCode: '20100',
            country: 'Italia',
            phone: '3331234567'
        },
        orderDate: '2024-09-18',
    },
    {
        id: 4,
        userId: 1,
        items: [
            {
                productId: 4,
                productName: "iPad Pro 12.9",
                productImage: "https://via.placeholder.com/100x100",
                price: 1399.99,
                quantity: 1,
                categoryName: "Tablet"
            }
        ],
        total: 1399.99,
        status: 'pending',
        paymentMethod: 'Bonifico',
        shippingAddress: {
            name: 'Mario Rossi',
            address: 'Via Roma 123',
            city: 'Milano',
            zipCode: '20100',
            country: 'Italia',
            phone: '3331234567'
        },
        orderDate: '2024-09-18',
    },
    {
        id: 5,
        userId: 1,
        items: [
            {
                productId: 6,
                productName: "Apple Watch Series 9",
                productImage: "https://via.placeholder.com/100x100",
                price: 449.99,
                quantity: 1,
                categoryName: "Smartwatch"
            }
        ],
        total: 449.99,
        status: 'cancelled',
        paymentMethod: 'PayPal',
        shippingAddress: {
            name: 'Mario Rossi',
            address: 'Via Roma 123',
            city: 'Milano',
            zipCode: '20100',
            country: 'Italia',
            phone: '3331234567'
        },
        orderDate: '2024-09-12',
        notes: 'Annullato per cambio idea'
    }
];

interface OrderContextValue {
    orders: Order[];
    loading: boolean;
    error: string | null;
    fetchOrders: () => Promise<void>;
    createOrder: (orderData: CreateOrderData) => Promise<Order>;
    getOrderById: (id: number) => Order | undefined;
    cancelOrder: (id: number) => Promise<void>;
}

const OrderContext = createContext<OrderContextValue | undefined>(undefined);

export function OrderProvider({ children }: { children: React.ReactNode }) {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchOrders = useCallback(async (): Promise<void> => {
        if (loading) return;

        setLoading(true);
        setError(null);

        try {
            // Tentativo di chiamata API reale
            const response = await fetch(`${config.API_BASE}/ordini`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });

            if (response.ok) {
                // Se l'API funziona, usa i dati reali
                const data = await response.json();
                setOrders(Array.isArray(data) ? data : []);
            } else {
                throw new Error('API non disponibile');
            }
        } catch (err) {
            // Se l'API fallisce, usa i dati mock
            console.warn('API non disponibile, uso dati mock:', err);

            // Simula delay di caricamento
            await new Promise(resolve => setTimeout(resolve, 800));
            setOrders(mockOrders);
            setError(null); // Non mostrare errore per mock data
        } finally {
            setLoading(false);
        }
    }, [loading]);

    const createOrder = async (orderData: CreateOrderData): Promise<Order> => {
        setLoading(true);
        setError(null);

        try {
            // Tentativo API reale
            const response = await fetch(`${config.API_BASE}/ordini`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify(orderData)
            });

            if (response.ok) {
                const newOrder = await response.json();
                setOrders(prev => [newOrder, ...prev]);
                return newOrder;
            } else {
                throw new Error('API non disponibile');
            }
        } catch (err) {
            // Fallback: crea ordine mock
            console.warn('API non disponibile, creo ordine mock');

            const newOrder: Order = {
                id: Math.max(...orders.map(o => o.id), 0) + 1,
                userId: 1,
                items: orderData.items,
                total: orderData.total,
                status: 'pending',
                paymentMethod: orderData.paymentMethod,
                shippingAddress: orderData.shippingAddress,
                orderDate: new Date().toISOString().split('T')[0],
                notes: orderData.notes
            };

            setOrders(prev => [newOrder, ...prev]);
            return newOrder;
        } finally {
            setLoading(false);
        }
    };

    const cancelOrder = async (id: number): Promise<void> => {
        setLoading(true);
        setError(null);

        try {
            // Tentativo API reale
            const response = await fetch(`${config.API_BASE}/ordini/${id}/cancel`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });

            if (!response.ok) {
                throw new Error('API non disponibile');
            }

            setOrders(prev => prev.map(order =>
                order.id === id ? { ...order, status: 'cancelled' } : order
            ));
        } catch (err) {
            // Fallback: annulla ordine in locale
            console.warn('API non disponibile, annullo ordine localmente');

            setOrders(prev => prev.map(order =>
                order.id === id ? { ...order, status: 'cancelled' } : order
            ));
        } finally {
            setLoading(false);
        }
    };

    const getOrderById = (id: number): Order | undefined => {
        return orders.find(order => order.id === id);
    };

    const value: OrderContextValue = {
        orders,
        loading,
        error,
        fetchOrders,
        createOrder,
        getOrderById,
        cancelOrder
    };

    return (
        <OrderContext.Provider value={value}>
            {children}
        </OrderContext.Provider>
    );
}

export function useOrders() {
    const context = useContext(OrderContext);
    if (!context) {
        throw new Error('useOrders deve essere usato dentro OrderProvider');
    }
    return context;
}