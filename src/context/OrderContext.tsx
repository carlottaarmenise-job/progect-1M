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
      const response = await fetch(`${config.API_BASE}/ordini`, {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error(`Errore nel caricamento ordini: ${response.statusText}`);
      }

      const data = await response.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto');
      console.error('Errore fetchOrders:', err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [loading]);

  const createOrder = async (orderData: CreateOrderData): Promise<Order> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${config.API_BASE}/ordini`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        throw new Error(`Errore nella creazione ordine: ${response.statusText}`);
      }

      const newOrder = await response.json();
      setOrders(prev => [newOrder, ...prev]);
      return newOrder;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nella creazione');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (id: number): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${config.API_BASE}/ordini/${id}/cancel`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error(`Errore nell'annullamento ordine: ${response.statusText}`);
      }

      setOrders(prev => prev.map(order => 
        order.id === id ? { ...order, status: 'cancelled' } : order
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nell\'annullamento');
      throw err;
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