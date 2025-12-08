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
                    expected_shelf_days: number | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id?: string // Often handled by default/trigger or app needs to pass it if no default
                    name: string
                    kana?: string | null
                    category?: string | null
                    expected_shelf_days?: number | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    name?: string
                    kana?: string | null
                    category?: string | null
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
                    purchased_at: string | null // can be null in default? Schema says 'default CURRENT_DATE', implies not null in practice but Typescript might see it as text/date string.
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
        }
    }
}
