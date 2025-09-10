import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';

type ToastItem = {
    id: number;
    message: string;
    variant?: 'success' | 'danger' | 'warning' | 'info' | 'primary' | 'secondary' | 'dark' | 'light';
};

type ToastContextValue = {
    showToast: (message: string, variant?: ToastItem['variant']) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    const showToast = useCallback((message: string, variant: ToastItem['variant'] = 'success') => {
        setToasts(prev => [...prev, { id: Date.now() + Math.random(), message, variant }]);
    }, []);

    const remove = useCallback((id: number) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const value = useMemo(() => ({ showToast }), [showToast]);

    return (
        <ToastContext.Provider value={value}>
            {children}

            {/* viewport dei toast */}
            <ToastContainer position="bottom-end" className="p-3">
                {toasts.map(t => (
                    <Toast key={t.id} onClose={() => remove(t.id)} delay={2200} autohide bg={t.variant}>
                        <Toast.Body className={t.variant === 'light' ? '' : 'text-white'}>{t.message}</Toast.Body>
                    </Toast>
                ))}
            </ToastContainer>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used within ToastProvider');
    return ctx;
}
