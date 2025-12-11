'use server'

import { createClient } from '../supabase/server'
import { Database } from '@/types/database.types'
import { revalidatePath } from 'next/cache'

type Ingredient = Database['public']['Tables']['ingredients']['Row']

export async function searchIngredients(query: string): Promise<Ingredient[]> {
    const supabase = await createClient()

    if (!query) return []

    const { data, error } = await supabase
        .from('ingredients')
        .select('*')
        .or(`name.ilike.%${query}%,kana.ilike.%${query}%`)
        .limit(10)

    if (error) {
        console.error('Error searching ingredients:', error)
        return []
    }

    return data || []
}

export async function getIngredients(): Promise<Ingredient[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('ingredients')
        .select('*')
        .order('name')

    if (error) return []
    return data
}

export async function updateIngredientAction(data: { id: string, kana: string, expected_shelf_days: number, category: string }) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('ingredients')
        .update({
            kana: data.kana || null,
            expected_shelf_days: data.expected_shelf_days,
            category: data.category
        })
        .eq('id', data.id)

    if (error) throw error

    revalidatePath('/', 'layout')
}

export async function createIngredient(name: string, category: string = '冷蔵庫') {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    // Check existing
    const { data: existing } = await supabase
        .from('ingredients')
        .select('*')
        .eq('name', name)
        .eq('user_id', user.id)
        .single()

    if (existing) return existing

    const { data: newIng, error } = await supabase
        .from('ingredients')
        .insert({
            user_id: user.id,
            name,
            category,
            expected_shelf_days: 7
        })
        .select()
        .single()

    if (error) throw error

    // Revalidate relevant paths
    revalidatePath('/', 'layout')
    return newIng
}
