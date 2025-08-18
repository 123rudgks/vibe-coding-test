import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// 환경변수 체크
if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Supabase 환경변수가 설정되지 않았습니다!');
    console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl);
    console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '[설정됨]' : '[미설정]');
    throw new Error('Supabase 환경변수를 .env.local 파일에 설정해주세요.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types for better TypeScript support
export interface ApiKeyRow {
    id: string;
    name: string;
    key: string;
    created_at: string;
    last_used: string | null;
    is_active: boolean;
    usage: number;
    monthly_limit: number;
    user_id?: string;
}

// API functions for database operations
export const apiKeyService = {
    // Get all API keys
    async getAllKeys(): Promise<ApiKeyRow[]> {
        const { data, error } = await supabase
            .from('api_keys')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching API keys:', error);
            throw error;
        }

        return data || [];
    },

    // Create a new API key
    async createKey(keyData: Omit<ApiKeyRow, 'id' | 'created_at'>): Promise<ApiKeyRow> {
        const { data, error } = await supabase
            .from('api_keys')
            .insert([keyData])
            .select()
            .single();

        if (error) {
            console.error('Error creating API key:', error);
            throw error;
        }

        return data;
    },

    // Update an API key
    async updateKey(id: string, updates: Partial<ApiKeyRow>): Promise<ApiKeyRow> {
        const { data, error } = await supabase
            .from('api_keys')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating API key:', error);
            throw error;
        }

        return data;
    },

    // Delete an API key
    async deleteKey(id: string): Promise<void> {
        const { error } = await supabase
            .from('api_keys')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting API key:', error);
            throw error;
        }
    },

    // Update usage count
    async incrementUsage(id: string): Promise<void> {
        const { error } = await supabase
            .rpc('increment_api_key_usage', { api_key_id: id });

        if (error) {
            console.error('Error incrementing usage:', error);
            throw error;
        }
    }
}; 