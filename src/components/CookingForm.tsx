'use client'

import { useState } from 'react'
import { RecipeWithItems } from '@/lib/actions/recipes'
import { Database } from '@/types/database.types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider' // Need to check if I have this
import { cookRecipeAction } from '@/lib/actions/cooking'
import { toast } from 'sonner'
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

type Ingredient = Database['public']['Tables']['ingredients']['Row']

export function CookingForm({ recipes, ingredients }: { recipes: RecipeWithItems[], ingredients: Ingredient[] }) {
    const [selectedRecipeId, setSelectedRecipeId] = useState("")
    const [open, setOpen] = useState(false)
    const [servings, setServings] = useState(1)
    const [eatCount, setEatCount] = useState(1)
    const [loading, setLoading] = useState(false)

    // Derived
    const recipe = recipes.find(r => r.id === selectedRecipeId)
    const inputs = recipe?.items.filter(i => i.role === 'input') || []
    const outputs = recipe?.items.filter(i => i.role === 'output') || []

    const handleCook = async () => {
        if (!recipe) return
        setLoading(true)
        try {
            // Logic:
            // Multiplier = servings
            // Save Qty = (servings - eatCount) * (output base qty per serving)
            // But wait, recipe quantity is usually "Base". 
            // Assume Base Recipe = 1 Person? Or X Persons?
            // Let's assume input quantities in recipe are for "1 batch".
            // We need to know "Servings per batch". 
            // For MVP, assume recipe quantities are for 1 Serving.
            // So multiplier = servings.

            // Output handling:
            // If recipe has outputs (e.g. Dish A), calculate total produced = servings * output.quantity (if output is per serving).
            // Eat Now = eatCount.
            // Save = Total - Eat.

            const savedQuantities: Record<string, number> = {}
            outputs.forEach(out => {
                const totalProduced = out.quantity * servings
                // Assumption: Output unit matches "Eat" unit. (e.g. "1 serving" of Curry).
                // If I eat 1, I save (Total - 1).
                // Warning: Units might differ.
                // Assuming Output Quantity 1 = 1 Serving.
                const toSave = totalProduced - (eatCount * out.quantity)
                if (toSave > 0) savedQuantities[out.ingredient_id] = toSave
            })

            await cookRecipeAction({
                recipeId: recipe.id,
                multiplier: servings,
                savedQuantities
            })
            toast.success("Cooking recorded!")
            setServings(1)
            setEatCount(1)
        } catch (e) {
            toast.error("Failed to record cooking")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* Recipe Selector */}
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between"
                    >
                        {recipe ? recipe.name : "Select recipe..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0">
                    <Command>
                        <CommandInput placeholder="Search recipes..." />
                        <CommandList>
                            <CommandEmpty>No recipe found.</CommandEmpty>
                            <CommandGroup>
                                {recipes.map((r) => (
                                    <CommandItem
                                        key={r.id}
                                        value={r.name}
                                        onSelect={() => {
                                            setSelectedRecipeId(r.id)
                                            setOpen(false)
                                        }}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                selectedRecipeId === r.id ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        {r.name}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>

            {recipe && (
                <Card className="p-4 space-y-4">
                    <div className="space-y-2">
                        <Label>Quantity (Servings)</Label>
                        <div className="flex items-center gap-4">
                            <Button variant="outline" size="icon" onClick={() => setServings(Math.max(1, servings - 1))}>-</Button>
                            <span className="text-xl font-bold w-8 text-center">{servings}</span>
                            <Button variant="outline" size="icon" onClick={() => setServings(servings + 1)}>+</Button>
                        </div>
                    </div>

                    <div className="text-sm text-slate-500 bg-slate-50 p-2 rounded">
                        <p className="font-semibold mb-1">Inputs required:</p>
                        <ul className="list-disc list-inside">
                            {inputs.map(i => (
                                <li key={i.id}>
                                    {i.ingredient?.name}: {Number(i.quantity) * servings}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="space-y-2">
                        <Label>Eat Now: {eatCount}</Label>
                        <input
                            type="range"
                            min="0"
                            max={servings}
                            step="1"
                            value={eatCount}
                            onChange={e => setEatCount(Number(e.target.value))}
                            className="w-full"
                        />
                        <div className="flex justify-between text-sm text-slate-500">
                            <span>Save: {servings - eatCount}</span>
                        </div>
                    </div>

                    <Button className="w-full bg-green-600 hover:bg-green-700" onClick={handleCook} disabled={loading}>
                        {loading ? 'Cooking...' : 'Cook'}
                    </Button>
                </Card>
            )}
        </div>
    )
}
