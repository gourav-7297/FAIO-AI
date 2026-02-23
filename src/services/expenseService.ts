import { supabaseUntyped as supabase, isSupabaseAvailable } from '../lib/supabase';

// ============================
// TYPES
// ============================

export interface Expense {
    id: string;
    category: string;
    name: string;
    amount: number;
    currency: string;
    date: string;
    carbonKg?: number;
    isEcoOption?: boolean;
}

interface ExpenseInput {
    category: string;
    name: string;
    amount: number;
    currency?: string;
    carbonKg?: number;
    isEcoOption?: boolean;
}

// ============================
// LOCAL STORAGE FALLBACK
// ============================

const STORAGE_KEY = 'faio_expenses';

function getLocalExpenses(): Expense[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function saveLocalExpenses(expenses: Expense[]): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
    } catch {
        // silently fail
    }
}

// ============================
// SERVICE
// ============================

export const expenseService = {
    async getExpenses(userId?: string): Promise<{ data: Expense[]; error: Error | null }> {
        // Try Supabase first
        if (isSupabaseAvailable && supabase && userId) {
            try {
                const { data, error } = await supabase
                    .from('expenses')
                    .select('*')
                    .eq('user_id', userId)
                    .order('created_at', { ascending: false });

                if (error) throw error;

                if (data && data.length > 0) {
                    const expenses: Expense[] = data.map((row: any) => ({
                        id: row.id,
                        category: row.category,
                        name: row.name,
                        amount: Number(row.amount),
                        currency: row.currency || 'USD',
                        date: formatDate(new Date(row.date || row.created_at)),
                        carbonKg: row.carbon_kg ? Number(row.carbon_kg) : undefined,
                        isEcoOption: row.is_eco_option || false,
                    }));
                    return { data: expenses, error: null };
                }
            } catch (error) {
                console.error('Error fetching expenses from Supabase:', error);
            }
        }

        // Fallback to localStorage
        return { data: getLocalExpenses(), error: null };
    },

    async addExpense(userId: string | undefined, input: ExpenseInput): Promise<{ data: Expense | null; error: Error | null }> {
        const newExpense: Expense = {
            id: crypto.randomUUID(),
            category: input.category,
            name: input.name,
            amount: input.amount,
            currency: input.currency || 'USD',
            date: 'Today',
            carbonKg: input.carbonKg,
            isEcoOption: input.isEcoOption,
        };

        // Try Supabase first
        if (isSupabaseAvailable && supabase && userId) {
            try {
                const { data, error } = await supabase
                    .from('expenses')
                    .insert({
                        user_id: userId,
                        category: input.category,
                        name: input.name,
                        amount: input.amount,
                        currency: input.currency || 'USD',
                        carbon_kg: input.carbonKg || null,
                        is_eco_option: input.isEcoOption || false,
                    } as any)
                    .select()
                    .single();

                if (error) throw error;

                return {
                    data: {
                        id: data.id,
                        category: data.category,
                        name: data.name,
                        amount: Number(data.amount),
                        currency: data.currency || 'USD',
                        date: 'Today',
                        carbonKg: data.carbon_kg ? Number(data.carbon_kg) : undefined,
                        isEcoOption: data.is_eco_option || false,
                    },
                    error: null,
                };
            } catch (error) {
                console.error('Error adding expense to Supabase:', error);
            }
        }

        // Fallback to localStorage
        const local = getLocalExpenses();
        local.unshift(newExpense);
        saveLocalExpenses(local);

        return { data: newExpense, error: null };
    },

    async deleteExpense(userId: string | undefined, expenseId: string): Promise<{ error: Error | null }> {
        // Try Supabase
        if (isSupabaseAvailable && supabase && userId) {
            try {
                const { error } = await supabase
                    .from('expenses')
                    .delete()
                    .eq('id', expenseId)
                    .eq('user_id', userId);

                if (error) throw error;
                return { error: null };
            } catch (error) {
                console.error('Error deleting expense:', error);
            }
        }

        // Fallback to localStorage
        const local = getLocalExpenses().filter(e => e.id !== expenseId);
        saveLocalExpenses(local);

        return { error: null };
    },
};

// ============================
// HELPERS
// ============================

function formatDate(date: Date): string {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default expenseService;
