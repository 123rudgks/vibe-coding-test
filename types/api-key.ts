import { type ApiKeyRow } from '../lib/supabase';

export interface ApiKey {
    id: string;
    name: string;
    key: string;
    createdAt: string;
    lastUsed: string | null;
    isActive: boolean;
    usage: number;
    monthlyLimit: number;
}

// Helper function to convert database row to component format
export const convertFromDb = (row: ApiKeyRow): ApiKey => ({
    id: row.id,
    name: row.name,
    key: row.key,
    createdAt: row.created_at,
    lastUsed: row.last_used,
    isActive: row.is_active,
    usage: row.usage,
    monthlyLimit: row.monthly_limit,
});

// Helper function to convert component format to database row
export const convertToDb = (apiKey: Omit<ApiKey, 'id' | 'createdAt'>): Omit<ApiKeyRow, 'id' | 'created_at'> => ({
    name: apiKey.name,
    key: apiKey.key,
    last_used: apiKey.lastUsed,
    is_active: apiKey.isActive,
    usage: apiKey.usage,
    monthly_limit: apiKey.monthlyLimit,
});

// Utility functions
export const generateApiKey = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = 'marunose-';
    for (let i = 0; i < 35; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

export const maskApiKey = (key: string): string => {
    if (key.length <= 10) return key;
    const prefix = key.substring(0, 5);
    const masked = '*'.repeat(25);
    return `${prefix}${masked}`;
};

export const displayApiKey = (key: string, keyId: string, visibleKeys: Set<string>): string => {
    if (visibleKeys.has(keyId)) {
        return key;
    }
    return maskApiKey(key);
}; 