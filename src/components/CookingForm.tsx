'use client'

import { useState, useEffect } from 'react'
import { RecipeWithItems } from '@/lib/actions/recipes'
import { Database } from '@/types/database.types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
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

    // Map of ingredient_id -> Quantity to Eat
    // Default is usually equal to Total Produced (Eat All)
    const [eatQuantities, setEatQuantities] = useState<Record<string, number>>({})
    const [loading, setLoading] = useState(false)

    // Derived
    const recipe = recipes.find(r => r.id === selectedRecipeId)
    const inputs = recipe?.items.filter(i => i.role === 'input') || []
    const outputs = recipe?.items.filter(i => i.role === 'output') || []

    // Effect: Reset or Update Eat Quantities when Recipe or Servings change
    useEffect(() => {
        if (!recipe) {
            setEatQuantities({})
            return
        }

        const newEatQuantities: Record<string, number> = {}
        outputs.forEach(out => {
            // Default: Eat Everything produced
            newEatQuantities[out.ingredient_id] = Number(out.quantity) * servings
        })
        setEatQuantities(newEatQuantities)
    }, [recipe?.id, servings]) // Missing 'outputs' dependency is fine as it's derived from recipe

    const handleCook = async () => {
        if (!recipe) return
        setLoading(true)
        try {
            const savedQuantities: Record<string, number> = {}
            outputs.forEach(out => {
                const totalProduced = Number(out.quantity) * servings
                const eaten = eatQuantities[out.ingredient_id] || 0
                const toSave = totalProduced - eaten

                // Allow floating point precision issues handling? 
                // Math.max(0, ...) should be enough.
                if (toSave > 0) savedQuantities[out.ingredient_id] = toSave
            })

            await cookRecipeAction({
                recipeId: recipe.id,
                multiplier: servings,
                savedQuantities
            })
            toast.success("Cooking recorded!")
            setServings(1)
            // Effect will handle eatQuantities reset
        } catch (e) {
            toast.error("Failed to record cooking")
        } finally {
            setLoading(false)
        }
    }

    const updateEatQuantity = (ingredientId: string, val: number) => {
        setEatQuantities(prev => ({ ...prev, [ingredientId]: val }))
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
                                            setServings(1) // Reset servings on new recipe
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
                        <p className="font-semibold mb-1">Inputs consumed:</p>
                        <ul className="list-disc list-inside">
                            {inputs.map(i => (
                                <li key={i.id}>
                                    {i.ingredient?.name}: {Number(i.quantity) * servings}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="space-y-4 border-t pt-4">
                        <h3 className="font-medium">Outputs & Consumption</h3>
                        {outputs.length === 0 && <p className="text-sm text-slate-500">No outputs defined for this recipe.</p>}

                        {outputs.map(out => {
                            const totalProduced = Number(out.quantity) * servings
                            const currentEat = eatQuantities[out.ingredient_id] ?? totalProduced // Default to max if undefined (though effect sets it)
                            const saved = Math.max(0, totalProduced - currentEat)

                            return (
                                <div key={out.id} className="space-y-3 p-3 border rounded bg-slate-50 dark:bg-slate-900">
                                    <div className="flex justify-between items-center">
                                        <Label className="text-base">{out.ingredient?.name}</Label>
                                        <span className="text-sm text-slate-500">Total: {totalProduced}</span>
                                    </div>

                                    <div className="space-y-1">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-green-600 font-medium">Eat: {currentEat}</span>
                                            <span className="text-blue-600 font-medium">Save: {saved}</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max={totalProduced}
                                            step="0.1" // Allow decimals if quantity is decimal
                                            value={currentEat}
                                            onChange={e => updateEatQuantity(out.ingredient_id, Number(e.target.value))}
                                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-green-600"
                                        />
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    <Button className="w-full bg-green-600 hover:bg-green-700 mt-4" onClick={handleCook} disabled={loading}>
                        {loading ? 'Cooking...' : 'Record Cooking'}
                    </Button>
                </Card>
            )}
        </div>
    )
}
