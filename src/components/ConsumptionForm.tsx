'use client'

import { useState } from 'react'
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { registerConsumption } from '@/lib/actions/inventory'
import { toast } from 'sonner'

type Ingredient = {
    id: string
    name: string
    kana: string | null
}

export function ConsumptionForm({ existingIngredients }: { existingIngredients: Ingredient[] }) {
    const [open, setOpen] = useState(false)
    const [value, setValue] = useState("") // Ingredient Name
    const [ingredientId, setIngredientId] = useState("") // ID

    const [quantity, setQuantity] = useState("1")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!ingredientId) {
            toast.error("Please select an ingredient")
            return
        }

        setLoading(true)
        try {
            await registerConsumption({
                ingredientId: ingredientId,
                quantity: Number(quantity),
                usedAt: new Date().toISOString()
            })
            toast.success("Consumption registered!")
            // Reset
            setQuantity("1")
            setValue("")
            setIngredientId("")
        } catch (error) {
            toast.error("Failed to register consumption")
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-sm mx-auto mt-4">
            <div className="space-y-2 flex flex-col">
                <Label>Ingredient</Label>
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={open}
                            className="w-full justify-between"
                        >
                            {value ? value : "Select ingredient..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0">
                        <Command>
                            <CommandInput placeholder="Search name or kana..." />
                            <CommandList>
                                <CommandEmpty>No ingredient found.</CommandEmpty>
                                <CommandGroup>
                                    {existingIngredients.map((ingredient) => (
                                        <CommandItem
                                            key={ingredient.id}
                                            value={ingredient.name}
                                            keywords={[ingredient.name, ingredient.kana || '']}
                                            onSelect={() => {
                                                setValue(ingredient.name)
                                                setIngredientId(ingredient.id)
                                                setOpen(false)
                                            }}
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    value === ingredient.name ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            {ingredient.name}
                                            {ingredient.kana && <span className="ml-2 text-xs text-slate-400">({ingredient.kana})</span>}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
            </div>

            <div className="space-y-2">
                <Label htmlFor="quantity">Quantity Used</Label>
                <div className="flex items-center gap-2">
                    <Button type="button" variant="outline" size="icon" onClick={() => setQuantity((Number(quantity) - 1).toString())} disabled={Number(quantity) <= 0}>-</Button>
                    <Input
                        id="quantity"
                        type="number"
                        value={quantity}
                        onChange={e => setQuantity(e.target.value)}
                        className="text-center"
                    />
                    <Button type="button" variant="outline" size="icon" onClick={() => setQuantity((Number(quantity) + 1).toString())}>+</Button>
                </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Processing...' : 'Register Consumption'}
            </Button>
        </form>
    )
}
