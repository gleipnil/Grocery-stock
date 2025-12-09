'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Check, ChevronsUpDown, Plus } from "lucide-react"
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
import { registerPurchase } from '@/lib/actions/inventory'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

type Ingredient = {
    id: string
    name: string
    kana: string | null
}

export function PurchaseForm({ existingIngredients }: { existingIngredients: Ingredient[] }) {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [value, setValue] = useState("") // Ingredient ID or Name
    const [searchQuery, setSearchQuery] = useState("")

    // Form States
    const [quantity, setQuantity] = useState("1")
    const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"))
    const [kana, setKana] = useState("")
    const [newCategory, setNewCategory] = useState("冷蔵庫")
    const [isNew, setIsNew] = useState(false)
    const [loading, setLoading] = useState(false)

    // Derived
    const selectedIngredient = existingIngredients.find(i => i.name === value)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!value) {
            toast.error("Please select an ingredient")
            return
        }

        setLoading(true)
        try {
            await registerPurchase({
                ingredientName: value,
                quantity: Number(quantity),
                purchasedAt: date,
                kana: isNew ? kana : undefined,
                category: isNew ? newCategory : undefined
            })
            toast.success("Purchase registered!")
            // Reset
            setQuantity("1")
            setValue("")
            setKana("")
            setIsNew(false)
            setSearchQuery("")
            // Optional: Redirect? Or stay to add more.
            // Stay is better for bulk entry.
        } catch (error) {
            toast.error("Failed to register purchase")
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
                        <Command filter={(value, search) => {
                            if (value.includes(search)) return 1
                            // Check kana if available in existingIngredients
                            // Shadcn Command usually filters by 'value' (label).
                            // We need to pass both name and kana to the item text or handle filtering manually.
                            // Hack: Render name + hidden kana
                            return 0
                        }}>
                            <CommandInput
                                placeholder="Search name or kana..."
                                value={searchQuery}
                                onValueChange={setSearchQuery}
                            />
                            <CommandList>
                                <CommandEmpty>
                                    <div className="p-2 cursor-pointer text-sm text-blue-600 font-medium" onClick={() => {
                                        setValue(searchQuery)
                                        setIsNew(true)
                                        setOpen(false)
                                    }}>
                                        <Plus className="inline mr-1 h-3 w-3" />
                                        Create "{searchQuery}"
                                    </div>
                                </CommandEmpty>
                                <CommandGroup>
                                    {existingIngredients.map((ingredient) => (
                                        <CommandItem
                                            key={ingredient.id}
                                            value={ingredient.name} // Used for selection
                                            keywords={[ingredient.name, ingredient.kana || '']} // Keywords for search
                                            onSelect={(currentValue) => {
                                                setValue(ingredient.name)
                                                setIsNew(false)
                                                setOpen(false)
                                                setKana(ingredient.kana || "")
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

            {isNew && (
                <>
                    <div className="space-y-2">
                        <Label htmlFor="kana">Kana (Shortcut) <span className="text-xs text-slate-500">- optional</span></Label>
                        <Input
                            id="kana"
                            placeholder="e.g. ni (for Ninjin)"
                            value={kana}
                            onChange={e => setKana(e.target.value)}
                        />
                        <p className="text-xs text-slate-500">Enter a short alias for faster search next time.</p>
                    </div>

                    <div className="space-y-2">
                        <Label>Category</Label>
                        <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={newCategory}
                            onChange={e => setNewCategory(e.target.value)}
                        >
                            <option value="冷蔵庫">冷蔵庫 (Fridge)</option>
                            <option value="棚">棚 (Shelf)</option>
                            <option value="倉庫">倉庫 (Stock)</option>
                        </select>
                    </div>
                </>
            )}

            <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
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

            <div className="space-y-2">
                <Label htmlFor="date">Purchase Date</Label>
                <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Saving...' : 'Register Purchase'}
            </Button>
        </form>
    )
}
