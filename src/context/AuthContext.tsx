import React, { createContext, useContext, useEffect, useState } from 'react';

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'admin';
  avatar?: string;
  phone?: string;
  address?: string;
  city?: string;
  zipCode?: string;
  country?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateProfile: (profileData: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = 'auth:user';

// Mock users (da sostituire con API)
const MOCK_USERS: (User & { password: string })[] = [
  {
    id: 1,
    email: 'admin@manuzon.com',
    password: 'admin123',
    firstName: 'Admin',
    lastName: 'Manuzon',
    role: 'admin'
  },
  {
    id: 2,
    email: 'user@example.com',
    password: 'user123',
    firstName: 'Mario',
    lastName: 'Rossi',
    role: 'user'
  }
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // utente dal localStorage
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem(STORAGE_KEY);
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.warn('Errore nel caricamento utente salvato:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    setLoading(true);

    await new Promise(resolve => setTimeout(resolve, 800));

    // Mock autenticazione - da sostituire con API reale
    const mockUser = MOCK_USERS.find(
      u => u.email === credentials.email && u.password === credentials.password
    );

    if (!mockUser) {
      setLoading(false);
      throw new Error('Email o password non corretti');
    }

    const { password, ...userWithoutPassword } = mockUser;

    setUser(userWithoutPassword);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userWithoutPassword));
    setLoading(false);
  };

  const register = async (data: RegisterData): Promise<void> => {
    setLoading(true);

    // Simula chiamata API con delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock registrazione,sostituire con API
    const existingUser = MOCK_USERS.find(u => u.email === data.email);
    if (existingUser) {
      setLoading(false);
      throw new Error('Email già registrata');
    }

    const newUser: User = {
      id: Date.now(),
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      role: 'user'
    };

    setUser(newUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));

    const res = await fetch("http://127.0.0.1:1880/utente", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({...newUser})
    });
    console.log('res:::', res)
    setLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const updateProfile = async (profileData: Partial<User>): Promise<void> => {
    setLoading(true);
    
    try {
      // Simula chiamata API con delay
      await new Promise(resolve => setTimeout(resolve, 800));

      if (!user) {
        throw new Error('Utente non autenticato');
      }

      const updatedUser = { ...user, ...profileData };
      
      setUser(updatedUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));

      // TODO: Chiamata API reale per aggiornare il profilo
      /*
      const response = await fetch("http://127.0.0.1:1880/utente/profile", {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify(profileData)
      });
      
      if (!response.ok) {
        throw new Error('Errore nell\'aggiornamento del profilo');
      }
      */
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextValue = {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve essere usato dentro AuthProvider');
  }
  return context;
}