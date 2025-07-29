import { useState } from 'react';

export interface ToastMessage {
    id: string;
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
    icon?: string;
}

export const useToast = () => {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const showToast = (message: string, type: ToastMessage['type'] = 'success', icon?: string) => {
        const id = Date.now().toString();
        const newToast: ToastMessage = {
            id,
            type,
            message,
            icon: icon || getDefaultIcon(type)
        };

        setToasts(prev => [...prev, newToast]);

        // Auto remove after 3 seconds
        setTimeout(() => {
            removeToast(id);
        }, 3000);

        return id;
    };

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    const showSuccess = (message: string, icon?: string) => showToast(message, 'success', icon);
    const showError = (message: string, icon?: string) => showToast(message, 'error', icon);
    const showInfo = (message: string, icon?: string) => showToast(message, 'info', icon);
    const showWarning = (message: string, icon?: string) => showToast(message, 'warning', icon);

    return {
        toasts,
        showToast,
        showSuccess,
        showError,
        showInfo,
        showWarning,
        removeToast
    };
};

const getDefaultIcon = (type: ToastMessage['type']): string => {
    switch (type) {
        case 'success':
            return '✅';
        case 'error':
            return '❌';
        case 'info':
            return 'ℹ️';
        case 'warning':
            return '⚠️';
        default:
            return '✅';
    }
}; 