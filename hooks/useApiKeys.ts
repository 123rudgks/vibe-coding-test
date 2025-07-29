import { useState, useEffect } from 'react';
import { apiKeyService } from '../lib/supabase';
import { type ApiKey, convertFromDb, convertToDb, generateApiKey } from '../types/api-key';

interface UseApiKeysProps {
    showSuccess: (message: string, icon?: string) => void;
    showError: (message: string, icon?: string) => void;
}

export const useApiKeys = ({ showSuccess, showError }: UseApiKeysProps) => {
    const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());

    // Load API keys from Supabase
    useEffect(() => {
        loadApiKeys();
    }, []);

    const loadApiKeys = async () => {
        try {
            setLoading(true);
            setError(null);
            const keys = await apiKeyService.getAllKeys();
            setApiKeys(keys.map(convertFromDb));
        } catch (err) {
            console.error('Failed to load API keys:', err);
            setError('Failed to load API keys. Please check your Supabase configuration.');
            // Fallback to sample data for development
            const sampleKeys: ApiKey[] = [
                {
                    id: '1',
                    name: 'default',
                    key: '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',
                    createdAt: '2024-01-15',
                    lastUsed: '2024-01-20',
                    isActive: true,
                    usage: 24,
                    monthlyLimit: 1000
                }
            ];
            setApiKeys(sampleKeys);
        } finally {
            setLoading(false);
        }
    };

    const createKey = async (name: string, monthlyLimit: number) => {
        try {
            const newKeyData = {
                name,
                key: generateApiKey(),
                last_used: null,
                is_active: true,
                usage: 0,
                monthly_limit: monthlyLimit,
            };

            const createdKey = await apiKeyService.createKey(newKeyData);
            setApiKeys(prev => [convertFromDb(createdKey), ...prev]);
            showSuccess(`API key "${name}" created successfully!`, '🎉');
            return true;
        } catch (err) {
            console.error('Failed to create API key:', err);
            setError('Failed to create API key. Please try again.');
            showError('Failed to create API key. Please try again.', '❌');
            return false;
        }
    };

    const updateKey = async (updatedKey: ApiKey) => {
        try {
            const dbUpdate = {
                name: updatedKey.name,
                is_active: updatedKey.isActive,
                monthly_limit: updatedKey.monthlyLimit,
            };

            await apiKeyService.updateKey(updatedKey.id, dbUpdate);
            setApiKeys(prev => prev.map(key => key.id === updatedKey.id ? updatedKey : key));
            showSuccess(`API key "${updatedKey.name}" updated successfully!`, '✏️');
            return true;
        } catch (err) {
            console.error('Failed to update API key:', err);
            setError('Failed to update API key. Please try again.');
            showError('Failed to update API key. Please try again.', '❌');
            return false;
        }
    };

    const deleteKey = async (keyId: string) => {
        const keyToDelete = apiKeys.find(key => key.id === keyId);
        if (!confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
            return false;
        }

        try {
            await apiKeyService.deleteKey(keyId);
            setApiKeys(prev => prev.filter(key => key.id !== keyId));
            showSuccess(`API key "${keyToDelete?.name || 'Unknown'}" deleted successfully!`, '🗑️');
            return true;
        } catch (err) {
            console.error('Failed to delete API key:', err);
            setError('Failed to delete API key. Please try again.');
            showError('Failed to delete API key. Please try again.', '❌');
            return false;
        }
    };

    const toggleKeyStatus = async (keyId: string) => {
        const key = apiKeys.find(k => k.id === keyId);
        if (!key) return false;

        try {
            const updatedKey = { ...key, isActive: !key.isActive };
            return await updateKey(updatedKey);
        } catch (err) {
            console.error('Failed to toggle key status:', err);
            setError('Failed to update key status. Please try again.');
            showError('Failed to update key status. Please try again.', '❌');
            return false;
        }
    };

    const toggleKeyVisibility = (keyId: string) => {
        const newVisibleKeys = new Set(visibleKeys);
        if (newVisibleKeys.has(keyId)) {
            newVisibleKeys.delete(keyId);
        } else {
            newVisibleKeys.add(keyId);
        }
        setVisibleKeys(newVisibleKeys);
    };

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            showSuccess('API key copied!', '📋');
        } catch (err) {
            console.error('Failed to copy to clipboard:', err);
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            showSuccess('API key copied!', '📋');
        }
    };

    const clearError = () => setError(null);

    const totalUsage = apiKeys.reduce((sum, key) => sum + key.usage, 0);

    return {
        apiKeys,
        loading,
        error,
        visibleKeys,
        totalUsage,
        loadApiKeys,
        createKey,
        updateKey,
        deleteKey,
        toggleKeyStatus,
        toggleKeyVisibility,
        copyToClipboard,
        clearError,
    };
}; 