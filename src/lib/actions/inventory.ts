'use server'

import { createClient } from '../supabase/server'
import { revalidatePath } from 'next/cache'

export async function registerPurchase(payload: {
    ingredientName: string
    quantity: number
    purchasedAt: string // ISO Date string
    kana?: string
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    // 1. Find or Create Ingredient
    let ingredientId: string

    // Try to find exact match
    const { data: existing } = await supabase
        .from('ingredients')
        .select('id, expected_shelf_days')
        .eq('name', payload.ingredientName)
        .single()

    let shelfDays = 7
    if (existing) {
        ingredientId = existing.id
        if (existing.expected_shelf_days) shelfDays = existing.expected_shelf_days
    } else {
        // Create new
        const { data: newIng, error: createError } = await supabase
            .from('ingredients')
            .insert({
                user_id: user.id,
                name: payload.ingredientName,
                kana: payload.kana || null,
                expected_shelf_days: 7 // Default
            })
            .select()
            .single()

        if (createError || !newIng) {
            console.error("Create Ingredient Error", createError)
            throw new Error('Failed to create ingredient')
        }
        ingredientId = newIng.id
    }

    // 2. Insert Purchase
    const { error: purchaseError } = await supabase.from('purchases').insert({
        user_id: user.id,
        ingredient_id: ingredientId,
        quantity: payload.quantity,
        purchased_at: payload.purchasedAt,
    })
    if (purchaseError) throw purchaseError

    // 3. Insert Stock
    // Calc expire date
    const purchasedDate = new Date(payload.purchasedAt)
    const expireDate = new Date(purchasedDate) // Copy
    expireDate.setDate(expireDate.getDate() + shelfDays)

    // Format YYYY-MM-DD
    const expireAtStr = expireDate.toISOString().split('T')[0]

    const { error: stockError } = await supabase.from('stocks').insert({
        user_id: user.id,
        ingredient_id: ingredientId,
        quantity: payload.quantity,
        purchased_at: payload.purchasedAt,
        expire_at: expireAtStr,
    })
    if (stockError) throw stockError

    revalidatePath('/')
}

export async function registerConsumption(payload: {
    ingredientId: string
    quantity: number
    usedAt: string // ISO timestamp
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    let remainingToConsume = payload.quantity

    // Fetch stocks sorted by expire_at ASC (Oldest first)
    const { data: stocks, error: fetchError } = await supabase
        .from('stocks')
        .select('*')
        .eq('ingredient_id', payload.ingredientId)
        .order('expire_at', { ascending: true })

    if (fetchError || !stocks) throw new Error('Failed to fetch stocks')

    // Deduction Logic
    for (const stock of stocks) {
        if (remainingToConsume <= 0) break

        const stockQty = Number(stock.quantity)

        if (stockQty <= remainingToConsume) {
            // Consume entire stock record
            await supabase.from('stocks').delete().eq('id', stock.id)
            remainingToConsume -= stockQty
        } else {
            // Partial consume
            const newQty = stockQty - remainingToConsume
            await supabase.from('stocks').update({ quantity: newQty }).eq('id', stock.id)
            remainingToConsume = 0
        }
    }

    // Insert History
    await supabase.from('consumption_history').insert({
        user_id: user.id,
        ingredient_id: payload.ingredientId,
        quantity: payload.quantity, // Total consumed requested. 
        // Note: We might want to record ACTUAL consumed if stock was insufficient? 
        // For MVP assuming we just log what user "consumed" even if stock was virtually negative (logic above assumes physical stock limiting, but if remaining > 0, we just ran out of tracked stock).
        used_at: payload.usedAt
    })

    revalidatePath('/')
}

export async function getStocksGrouped() {
    const supabase = await createClient()

    // Fetch all stocks with ingredient details
    const { data, error } = await supabase
        .from('ingredients')
        .select(`
            *,
            stocks (*)
        `)
        .order('name')

    if (error) return []

    // Filter out ingredients with no stocks? Or keep them?
    // Request says "Inventory List". Usually only items IN stock.
    // But maybe user wants to see 0 stock items?
    // "残量0や賞味期限切れをわかりやすく表示する" -> Implies 0 items might be shown or calculated.
    // But if we deleted the stock record when 0, then `stocks` array is empty.
    // So we should filter in JS or let UI handle "No stock".
    // For MVP, let's return all ingredients that have at least one stock, OR just all ingredients?
    // "在庫の一覧" usually implies "What I have".
    // But "残量0" implies we want to see items we ran out of?
    // If we delete stock rows, we lose the info that we "have" it but 0.
    // Unless we keep ingredients. 
    // Let's return all ingredients, front-end can filter `stocks.length > 0`.

    return data || []
}
