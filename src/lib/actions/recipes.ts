'use server'

import { createClient } from '../supabase/server'
import { revalidatePath } from 'next/cache'
import { Database } from '@/types/database.types'

export type Recipe = Database['public']['Tables']['recipes']['Row']
export type RecipeItem = Database['public']['Tables']['recipe_items']['Row']
export type RecipeWithItems = Recipe & {
    items: (RecipeItem & { ingredient: Database['public']['Tables']['ingredients']['Row'] })[]
}

export async function getRecipes(): Promise<RecipeWithItems[]> {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('recipes')
        .select(`
            *,
            items:recipe_items(
                *,
                ingredient:ingredients(*)
            )
        `)
        .order('name')

    if (error) return []
    return (data as any) || []
}

export async function getRecipe(id: string): Promise<RecipeWithItems | null> {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('recipes')
        .select(`
            *,
            items:recipe_items(
                *,
                ingredient:ingredients(*)
            )
        `)
        .eq('id', id)
        .single()

    if (error) return null
    return (data as any)
}

export async function createRecipe(data: {
    name: string
    description?: string
    items: { ingredient_id: string, role: 'input' | 'output', quantity: number }[]
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    // 1. Create Recipe
    const { data: recipe, error: recipeError } = await supabase
        .from('recipes')
        .insert({
            user_id: user.id,
            name: data.name,
            description: data.description
        })
        .select()
        .single()

    if (recipeError || !recipe) throw recipeError

    // 2. Create Recipe Items
    const itemsToInsert = data.items.map(item => ({
        recipe_id: recipe.id,
        ingredient_id: item.ingredient_id,
        role: item.role,
        quantity: item.quantity
    }))

    const { error: itemsError } = await supabase
        .from('recipe_items')
        .insert(itemsToInsert)

    if (itemsError) throw itemsError

    revalidatePath('/recipes')
}

export async function updateRecipe(id: string, data: {
    name: string
    description?: string
    items: { ingredient_id: string, role: 'input' | 'output', quantity: number }[]
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    // 1. Update Recipe Details
    const { error: recipeError } = await supabase
        .from('recipes')
        .update({
            name: data.name,
            description: data.description
        })
        .eq('id', id)
        .eq('user_id', user.id)

    if (recipeError) throw recipeError

    // 2. Update Items (Delete all and Re-insert logic is simplest for now)
    // Transaction support in Supabase JS client isn't direct like SQL, but RLS protects other users.
    // Ideally this should be an RPC or careful batch.
    // For now: Delete items for this recipe -> Insert new items.

    // Check ownership by ensuring the delete only affects items of the recipe owned by user.
    // Actually RLS on recipe_items often checks recipe ownership.
    // Assuming simple RLS where user can delete items of their own recipes.

    // Delete existing items
    const { error: deleteError } = await supabase
        .from('recipe_items')
        .delete()
        .eq('recipe_id', id)

    if (deleteError) throw deleteError

    // Insert new items
    const itemsToInsert = data.items.map(item => ({
        recipe_id: id,
        ingredient_id: item.ingredient_id,
        role: item.role,
        quantity: item.quantity
    }))

    const { error: insertError } = await supabase
        .from('recipe_items')
        .insert(itemsToInsert)

    if (insertError) throw insertError

    revalidatePath('/recipes')
}

export async function deleteRecipe(id: string) {
    const supabase = await createClient()
    await supabase.from('recipes').delete().eq('id', id)
    revalidatePath('/recipes')
}
