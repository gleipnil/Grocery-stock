'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createRecipe, updateRecipe, RecipeWithItems } from '@/lib/actions/recipes'
import { createIngredient } from '@/lib/actions/ingredients'
import { toast } from 'sonner'
import { Plus, Trash2, Check, ChevronsUpDown } from 'lucide-react'
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Database } from '@/types/database.types'
import { cn } from "@/lib/utils"

type Ingredient = Database['public']['Tables']['ingredients']['Row']

export function RecipeForm({ ingredients: initialIngredients, initialData }: { ingredients: Ingredient[], initialData?: RecipeWithItems }) {
    const router = useRouter()
    const [ingredients, setIngredients] = useState<Ingredient[]>(initialIngredients)
    const [name, setName] = useState(initialData?.name || "")
    const [items, setItems] = useState<{ ingredient_id: string, role: 'input' | 'output', quantity: number }[]>(
        initialData?.items.map(i => ({
            ingredient_id: i.ingredient_id,
            role: i.role as 'input' | 'output',
            quantity: i.quantity
        })) || [{ ingredient_id: "", role: 'input', quantity: 1 }]
    )
    const [loading, setLoading] = useState(false)

    // State for managing which row's combobox is open
    const [openRowIndex, setOpenRowIndex] = useState<number | null>(null)
    const [searchQuery, setSearchQuery] = useState("")

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

    const handleCreateIngredient = async (name: string, index: number) => {
        try {
            const newIng = await createIngredient(name)
            setIngredients(prev => [...prev, newIng].sort((a, b) => a.name.localeCompare(b.name)))
            updateItem(index, 'ingredient_id', newIng.id)
            setOpenRowIndex(null)
            toast.success(`Created ingredient: ${newIng.name}`)
        } catch (e) {
            toast.error("Failed to create ingredient")
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name) return toast.error("Name is required")
        if (items.some(i => !i.ingredient_id)) return toast.error("Select ingredients for all items")

        setLoading(true)
        try {
            if (initialData) {
                await updateRecipe(initialData.id, {
                    name,
                    items
                })
                toast.success("Recipe updated")
                router.refresh()
                router.push('/recipes')
            } else {
                await createRecipe({
                    name,
                    items
                })
                toast.success("Recipe created")
                router.push('/recipes')
            }
        } catch (e) {
            toast.error("Failed to save recipe")
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
                {items.map((item, index) => {
                    const selectedIngredient = ingredients.find(ing => ing.id === item.ingredient_id)

                    return (
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

                                <Popover
                                    open={openRowIndex === index}
                                    onOpenChange={(open) => {
                                        setOpenRowIndex(open ? index : null)
                                        if (!open) setSearchQuery("")
                                    }}
                                >
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={openRowIndex === index}
                                            className="flex-1 justify-between"
                                        >
                                            {selectedIngredient ? selectedIngredient.name : "Select ingredient..."}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[250px] p-0">
                                        <Command>
                                            <CommandInput
                                                placeholder="Search or create..."
                                                value={searchQuery}
                                                onValueChange={setSearchQuery}
                                            />
                                            <CommandList>
                                                <CommandEmpty>
                                                    <div
                                                        className="p-2 cursor-pointer text-sm text-blue-600 font-medium hover:bg-slate-100"
                                                        onClick={() => handleCreateIngredient(searchQuery, index)}
                                                    >
                                                        <Plus className="inline mr-1 h-3 w-3" />
                                                        Create "{searchQuery}"
                                                    </div>
                                                </CommandEmpty>
                                                <CommandGroup>
                                                    {ingredients.map((ing) => (
                                                        <CommandItem
                                                            key={ing.id}
                                                            value={ing.name}
                                                            keywords={[ing.name, ing.kana || '']}
                                                            onSelect={() => {
                                                                updateItem(index, 'ingredient_id', ing.id)
                                                                setOpenRowIndex(null)
                                                            }}
                                                        >
                                                            <Check
                                                                className={cn(
                                                                    "mr-2 h-4 w-4",
                                                                    item.ingredient_id === ing.id ? "opacity-100" : "opacity-0"
                                                                )}
                                                            />
                                                            {ing.name}
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
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
                    )
                })}
                <Button type="button" variant="outline" className="w-full" onClick={addItem}>
                    <Plus className="w-4 h-4 mr-1" /> Add Item
                </Button>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Saving...' : (initialData ? 'Update Recipe' : 'Create Recipe')}
            </Button>
        </form>
    )
}
