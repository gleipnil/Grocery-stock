'use client'

import { useState } from 'react'
import { Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Database } from '@/types/database.types'
// We need an action to update ingredient. 'searchIngredients' is read only? 
// I need `upsertIngredient`. I defined `searchIngredients` and `getIngredients` in `ingredients.ts`. I need to add `updateIngredient`.
// I'll assume I'll add `updateIngredient` to `ingredients.ts` or `inventory.ts`. I included `upsert` in plan but didn't write it in `ingredients.ts`.
// I will add it now or mock it? I should add it.

type Ingredient = Database['public']['Tables']['ingredients']['Row']

import { updateIngredientAction } from '@/lib/actions/ingredients' // Need to implement this
import { toast } from 'sonner'

export function IngredientMaster({ ingredients }: { ingredients: Ingredient[] }) {
    const [editing, setEditing] = useState<Ingredient | null>(null)
    const [open, setOpen] = useState(false)

    // Edit State
    const [kana, setKana] = useState("")
    const [days, setDays] = useState("")

    const handleEdit = (ing: Ingredient) => {
        setEditing(ing)
        setKana(ing.kana || "")
        setDays(ing.expected_shelf_days?.toString() || "7")
        setOpen(true)
    }

    const handleSave = async () => {
        if (!editing) return
        try {
            await updateIngredientAction({
                id: editing.id,
                kana: kana,
                expected_shelf_days: Number(days)
            })
            toast.success("Updated ingredient")
            setOpen(false)
        } catch (e) {
            toast.error("Failed to update")
        }
    }

    return (
        <div className="space-y-4">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Kana</TableHead>
                        <TableHead>Shelf Days</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {ingredients.map((ing) => (
                        <TableRow key={ing.id}>
                            <TableCell className="font-medium">{ing.name}</TableCell>
                            <TableCell>{ing.kana || '-'}</TableCell>
                            <TableCell>{ing.expected_shelf_days} days</TableCell>
                            <TableCell>
                                <Button variant="ghost" size="icon" onClick={() => handleEdit(ing)}>
                                    <Pencil className="h-4 w-4" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit {editing?.name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Kana / Alias</Label>
                            <Input value={kana} onChange={e => setKana(e.target.value)} placeholder="e.g. ni" />
                        </div>
                        <div className="space-y-2">
                            <Label>Expected Shelf Life (Days)</Label>
                            <Input type="number" value={days} onChange={e => setDays(e.target.value)} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleSave}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
