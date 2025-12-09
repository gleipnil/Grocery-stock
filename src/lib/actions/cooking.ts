'use server'

import { createClient } from '../supabase/server'
import { revalidatePath } from 'next/cache'
import { registerConsumption, registerPurchase } from './inventory'
import { getRecipes } from './recipes'

// Cooking involves:
// 1. Consumption of Inputs (x servings)
// 2. Creation of Outputs (Eat Now vs Save)
//    - Eat Now: Just record consumption? Or don't record anything if it's "cooked and eaten"?
//      User requirements: "Eat Now" = consumption. "Save" = inventory.
//      Typically "Cooking" implies consuming raw ingredients.
//      If I eat it now, I consumed the raw stuff.
//      Do I record that I consumed the "Dish"?
//      If I track nutrition/history, yes.
//      If I just track stock, consuming inputs is enough. 
//      BUT, the user said "Output... can be consumed or saved".
//      Assumption: We consume the inputs regardless.
//      Then we "produce" the output.
//      If "Eat Now", we instantly consume the output too? 
//      Or maybe we just don't add it to stock?
//      Simplest model:
//      1. Deduct Inputs from Stock (FIFO).
//      2. If "Save": Register 'Purchase' (Creation) of Dish Type Ingredient.
//      3. If "Eat Now": Do nothing extra (Inputs are gone, we are full).
//         OR verify if user wants to log "I ate RecipenName".
//         For now, lets focus on Stock Management.
//         Eat Now -> Inputs gone.
//         Save -> Inputs gone, Output Added to Stock.

export async function cookRecipeAction(payload: {
    recipeId: string
    multiplier: number // How many servings (relative to base recipe)
    savedQuantities: Record<string, number> // ingredient_id (Dish) -> quantity to save
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    // 1. Get Recipe Details
    const { data: recipe } = await supabase
        .from('recipes')
        .select(`*, items:recipe_items(*)`)
        .eq('id', payload.recipeId)
        .single()

    if (!recipe) throw new Error('Recipe not found')

    // 2. Calculate Inputs & Consume
    const inputs = recipe.items.filter((i: any) => i.role === 'input')

    for (const input of inputs) {
        const qtyRequired = Number(input.quantity) * payload.multiplier
        if (qtyRequired > 0) {
            await registerConsumption({
                ingredientId: input.ingredient_id,
                quantity: qtyRequired,
                usedAt: new Date().toISOString()
            })
        }
    }

    // 3. Handle Outputs
    // The recipe might have multiple outputs (e.g. main dish + side dish)
    // payload.savedQuantities tells us how much of each output to SAVE.
    // The rest is assumed eaten.

    const outputs = recipe.items.filter((i: any) => i.role === 'output')

    for (const output of outputs) {
        const qtyToSave = payload.savedQuantities[output.ingredient_id] || 0

        if (qtyToSave > 0) {
            // Register as "Stock" (Purchase logic works for this)
            // Need to know Ingredient Name... we only have ID here.
            // registerPurchase takes Name... we should probably update it to take ID if known.
            // Or fetch name.
            const { data: ing } = await supabase.from('ingredients').select('name').eq('id', output.ingredient_id).single()
            if (ing) {
                await registerPurchase({
                    ingredientName: ing.name,
                    quantity: qtyToSave,
                    purchasedAt: new Date().toISOString(),
                    category: '冷蔵庫' // Default to fridge for cooked items? or let user specify? Use ingredient default?
                    // registerPurchase uses existing ingredient's category default if not provided.
                })
            }
        }
    }

    revalidatePath('/')
}
