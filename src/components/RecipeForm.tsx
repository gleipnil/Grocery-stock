'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createRecipe } from '@/lib/actions/recipes' // Need to export createRecipe from server action file
import { toast } from 'sonner'
import { Plus, Trash2 } from 'lucide-react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Database } from '@/types/database.types'

type Ingredient = Database['public']['Tables']['ingredients']['Row']

export function RecipeForm({ ingredients }: { ingredients: Ingredient[] }) {
    const router = useRouter()
    const [name, setName] = useState("")
    const [items, setItems] = useState<{ ingredient_id: string, role: 'input' | 'output', quantity: number }[]>([
        { ingredient_id: "", role: 'input', quantity: 1 }
    ])
    const [loading, setLoading] = useState(false)

    // Filter ingredients depending on role? 
    // Basically Inputs are 'raw' or 'dish'. Outputs are 'dish' usually.
    // User requested "Output can be consumed or saved".
    // Ingredients table has type 'raw' | 'dish'.

    // For MVP, allow any ingredient selection.

    const addItem = () => {
        setItems([...items, { ingredient_id: "", role: 'input', quantity: 1 }])
    }

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index))
    }

    const updateItem = (index: number, field: string, value: any) => {
        const newItems = [...items]
        newItems[index] = { ...newItems[index], [field]: value }
        setItems(newItems)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name) return toast.error("Name is required")
        if (items.some(i => !i.ingredient_id)) return toast.error("Select ingredients for all items")

        setLoading(true)
        try {
            await createRecipe({
                name,
                items
            })
            toast.success("Recipe created")
            router.push('/recipes')
        } catch (e) {
            toast.error("Failed to create recipe")
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                <Label>Recipe Name</Label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="Curry Rice" />
            </div>

            <div className="space-y-4">
                <Label>Ingredients & Outputs</Label>
                {items.map((item, index) => (
                    <div key={index} className="flex flex-col gap-2 p-3 border rounded-md">
                        <div className="flex gap-2">
                            <Select
                                value={item.role}
                                onValueChange={(v: 'input' | 'output') => updateItem(index, 'role', v)}
                            >
                                <SelectTrigger className="w-[100px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="input">Input</SelectItem>
                                    <SelectItem value="output">Output</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select
                                value={item.ingredient_id}
                                onValueChange={(v) => updateItem(index, 'ingredient_id', v)}
                            >
                                <SelectTrigger className="flex-1">
                                    <SelectValue placeholder="Ingredient" />
                                </SelectTrigger>
                                <SelectContent>
                                    {ingredients.map(ing => (
                                        <SelectItem key={ing.id} value={ing.id}>
                                            {ing.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex gap-2 items-center">
                            <Input
                                type="number"
                                value={item.quantity}
                                onChange={e => updateItem(index, 'quantity', Number(e.target.value))}
                                className="w-[100px]"
                                min="0.1"
                                step="0.1"
                            />
                            <span className="text-sm text-slate-500">Qty (per serving)</span>
                            <Button type="button" variant="ghost" size="icon" className="ml-auto text-red-500" onClick={() => removeItem(index)}>
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                ))}
                <Button type="button" variant="outline" className="w-full" onClick={addItem}>
                    <Plus className="w-4 h-4 mr-1" /> Add Item
                </Button>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Creating...' : 'Create Recipe'}
            </Button>
        </form>
    )
}
