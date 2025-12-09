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
                    category: string | null // '冷蔵庫' | '棚' | '倉庫'
                    expected_shelf_days: number | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id?: string
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
        }
    }
}
