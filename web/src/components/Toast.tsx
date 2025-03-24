import * as ToastPrimitive from '@radix-ui/react-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { createContext, useContext, useState } from 'react';

interface ToastContextType {
    showToast: (message: string, type?: 'error' | 'success') => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: 'error' | 'success' }>>([]);

    const showToast = (message: string, type: 'error' | 'success' = 'error') => {
        const id = Math.random().toString(36).substring(7);
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((toast) => toast.id !== id));
        }, 5000);
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <ToastPrimitive.Provider>
                <AnimatePresence>
                    {toasts.map((toast) => (
                        <ToastPrimitive.Root key={toast.id} asChild>
                            <motion.div
                                initial={{ opacity: 0, y: 50, scale: 0.3 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                                className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg ${toast.type === 'error'
                                    ? 'bg-red-500 text-white'
                                    : 'bg-green-500 text-white'
                                    }`}
                            >
                                <ToastPrimitive.Title className="text-sm font-medium">
                                    {toast.message}
                                </ToastPrimitive.Title>
                                <ToastPrimitive.Close className="absolute top-2 right-2 text-white hover:text-gray-200">
                                    ×
                                </ToastPrimitive.Close>
                            </motion.div>
                        </ToastPrimitive.Root>
                    ))}
                </AnimatePresence>
            </ToastPrimitive.Provider>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (context === undefined) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
} 