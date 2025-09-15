import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { config } from 'src/config';

export interface Category {
  id: number;
  name: string;
  description?: string;
  slug: string;
  parentId?: number;
  image?: string;
  active: boolean;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface CategoryContextValue {
  categories: Category[];
  loading: boolean;
  error: string | null;
  fetchCategories: () => Promise<void>;
  createCategory: (category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateCategory: (id: number, category: Partial<Category>) => Promise<void>;
  deleteCategory: (id: number) => Promise<void>;
  getCategoryById: (id: number) => Category | undefined;
  getCategoriesByParent: (parentId?: number) => Category[];
}

const CategoryContext = createContext<CategoryContextValue | undefined>(undefined);

export function CategoryProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async (): Promise<void> => {
    if (loading) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${config.API_BASE}/categorie`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`Errore nel caricamento categorie: ${response.statusText}`);
      }

      const data = await response.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto');
      console.error('Errore fetchCategories:', err);
      // Fallback con array vuoto invece di bloccare l'app
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, [loading]);

  // Carica le categorie solo una volta al mount
  useEffect(() => {
    fetchCategories();
  }, []); // Dipendenze vuote per caricare solo una volta

  const createCategory = async (categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${config.API_BASE}/categorie`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryData)
      });

      if (!response.ok) {
        throw new Error(`Errore nella creazione categoria: ${response.statusText}`);
      }

      const newCategory = await response.json();
      setCategories(prev => [...prev, newCategory]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nella creazione');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateCategory = async (id: number, categoryData: Partial<Category>): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${config.API_BASE}/categorie/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryData)
      });

      if (!response.ok) {
        throw new Error(`Errore nell'aggiornamento categoria: ${response.statusText}`);
      }

      const updatedCategory = await response.json();
      setCategories(prev => prev.map(c => c.id === id ? updatedCategory : c));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nell\'aggiornamento');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (id: number): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${config.API_BASE}/categorie/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`Errore nell'eliminazione categoria: ${response.statusText}`);
      }

      setCategories(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nell\'eliminazione');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getCategoryById = (id: number): Category | undefined => {
    return categories.find(c => c.id === id);
  };

  const getCategoriesByParent = (parentId?: number): Category[] => {
    return categories.filter(c => c.parentId === parentId);
  };

  const value: CategoryContextValue = {
    categories,
    loading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoryById,
    getCategoriesByParent
  };

  return (
    <CategoryContext.Provider value={value}>
      {children}
    </CategoryContext.Provider>
  );
}

export function useCategories() {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error('useCategories deve essere usato dentro CategoryProvider');
  }
  return context;
}