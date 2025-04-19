import { createClient } from '@/utils/supabase/server';
export async function fetchIsUserActive(id: string): Promise<any> {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase.from('users').select('is_active').eq('id', id).single();
        if (error) {
            throw new Error('Failed to fetch user data');
        }
        return data.is_active;
    } catch (error) {
        console.error('Failed to fetch user data:', error);
        throw error;
    }
}