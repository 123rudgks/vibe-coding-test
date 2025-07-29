import React from 'react';
import { ToastMessage } from '../hooks/useToast';

interface ToastProps {
    toasts: ToastMessage[];
    onRemove: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onRemove }) => {
    const getToastStyles = (type: ToastMessage['type']) => {
        switch (type) {
            case 'success':
                return 'bg-green-600 border-green-400 text-white';
            case 'error':
                return 'bg-red-600 border-red-400 text-white';
            case 'info':
                return 'bg-blue-600 border-blue-400 text-white';
            case 'warning':
                return 'bg-yellow-600 border-yellow-400 text-white';
            default:
                return 'bg-green-600 border-green-400 text-white';
        }
    };

    if (toasts.length === 0) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 space-y-2">
            {toasts.map((toast, index) => (
                <div
                    key={toast.id}
                    className={`transition-all duration-300 ease-in-out opacity-100 transform translate-y-0`}
                    style={{
                        animationDelay: `${index * 100}ms`
                    }}
                >
                    <div className={`px-6 py-3 rounded-lg shadow-xl flex items-center space-x-3 border ${getToastStyles(toast.type)} min-w-[250px]`}>
                        <span className="text-lg flex-shrink-0">{toast.icon}</span>
                        <span className="font-medium flex-1">{toast.message}</span>
                        <button
                            onClick={() => onRemove(toast.id)}
                            className="text-white/80 hover:text-white transition-colors flex-shrink-0 ml-2"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}; 