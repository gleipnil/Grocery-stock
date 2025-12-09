export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            ingredients: {
                Row: {
                    id: string
                    user_id: string
                    name: string
                    kana: string | null
                    category: string | null
                    type: 'raw' | 'dish' | null // Added type
                    expected_shelf_days: number | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id?: string
                    name: string
                    kana?: string | null
                    category?: string | null
                    type?: 'raw' | 'dish' | null
                    expected_shelf_days?: number | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    name?: string
                    kana?: string | null
                    category?: string | null
                    type?: 'raw' | 'dish' | null
                    expected_shelf_days?: number | null
                    created_at?: string
                }
            }
            stocks: {
                Row: {
                    id: string
                    user_id: string
                    ingredient_id: string
                    quantity: number
                    purchased_at: string | null
                    expire_at: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id?: string
                    ingredient_id: string
                    quantity: number
                    purchased_at?: string | null
                    expire_at: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    ingredient_id?: string
                    quantity?: number
                    purchased_at?: string | null
                    expire_at?: string
                    created_at?: string
                }
            }
            purchases: {
                Row: {
                    id: string
                    user_id: string
                    ingredient_id: string
                    quantity: number
                    purchased_at: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id?: string
                    ingredient_id: string
                    quantity: number
                    purchased_at?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    ingredient_id?: string
                    quantity?: number
                    purchased_at?: string | null
                    created_at?: string
                }
            }
            consumption_history: {
                Row: {
                    id: string
                    user_id: string
                    ingredient_id: string | null
                    quantity: number
                    used_at: string
                }
                Insert: {
                    id?: string
                    user_id?: string
                    ingredient_id?: string | null
                    quantity: number
                    used_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    ingredient_id?: string | null
                    quantity?: number
                    used_at?: string
                }
            }
            recipes: {
                Row: {
                    id: string
                    user_id: string
                    name: string
                    description: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id?: string
                    name: string
                    description?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    name?: string
                    description?: string | null
                    created_at?: string
                }
            }
            recipe_items: {
                Row: {
                    id: string
                    recipe_id: string
                    ingredient_id: string
                    role: 'input' | 'output'
                    quantity: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    recipe_id: string
                    ingredient_id: string
                    role: 'input' | 'output'
                    quantity: number
                    created_at?: string
                }
                Update: {
                    id?: string
                    recipe_id?: string
                    ingredient_id?: string
                    role?: 'input' | 'output'
                    quantity?: number
                    created_at?: string
                }
            }
        }
    }
}
