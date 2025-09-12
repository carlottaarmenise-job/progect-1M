import React, { createContext, useContext, useEffect, useState } from 'react';
import { config } from '../config';
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  categoryId: number;
  image?: string;
  stock: number;
  featured?: boolean;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  featured?: boolean;
}

interface ProductContextValue {
  products: Product[];
  loading: boolean;
  error: string | null;
  fetchProducts: (filters?: ProductFilters) => Promise<void>;
  createProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateProduct: (id: number, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: number) => Promise<void>;
  getProductById: (id: number) => Product | undefined;
}

const ProductContext = createContext<ProductContextValue | undefined>(undefined);

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async (filters?: ProductFilters): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams();
      if (filters?.category) queryParams.append('category', filters.category);
      if (filters?.minPrice) queryParams.append('minPrice', filters.minPrice.toString());
      if (filters?.maxPrice) queryParams.append('maxPrice', filters.maxPrice.toString());
      if (filters?.search) queryParams.append('search', filters.search);
      if (filters?.featured !== undefined) queryParams.append('featured', filters.featured.toString());

      const url = `${config.API_BASE}/prodotti${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`Errore nel caricamento prodotti: ${response.statusText}`);
      }

      const data = await response.json();
      setProducts(Array.isArray(data) ? data : data.products || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto');
      console.error('Errore fetchProducts:', err);
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${config.API_BASE}/prodotti`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });

      if (!response.ok) {
        throw new Error(`Errore nella creazione prodotto: ${response.statusText}`);
      }

      const newProduct = await response.json();
      setProducts(prev => [...prev, newProduct]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nella creazione');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateProduct = async (id: number, productData: Partial<Product>): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${config.API_BASE}/prodotti/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });

      if (!response.ok) {
        throw new Error(`Errore nell'aggiornamento prodotto: ${response.statusText}`);
      }

      const updatedProduct = await response.json();
      setProducts(prev => prev.map(p => p.id === id ? updatedProduct : p));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nell\'aggiornamento');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id: number): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${config.API_BASE}/prodotti/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`Errore nell'eliminazione prodotto: ${response.statusText}`);
      }

      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nell\'eliminazione');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getProductById = (id: number): Product | undefined => {
    return products.find(p => p.id === id);
  };

  const value: ProductContextValue = {
    products,
    loading,
    error,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductById
  };

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>;
}

export function useProducts() {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts deve essere usato dentro ProductProvider');
  }
  return context;
}