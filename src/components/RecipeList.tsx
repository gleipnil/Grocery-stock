'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RecipeWithItems } from '@/lib/actions/recipes'
import Link from 'next/link'

import { deleteRecipe } from '@/lib/actions/recipes'
import { Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function RecipeList({ recipes }: { recipes: RecipeWithItems[] }) {
    const router = useRouter() // For refresh after delete if needed, though Server Action revalidates

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this recipe?")) return
        try {
            await deleteRecipe(id)
            toast.success("Recipe deleted")
        } catch (e) {
            toast.error("Failed to delete")
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Recipes</h2>
                <Button size="sm" asChild>
                    <Link href="/recipes/new">
                        <Plus className="w-4 h-4 mr-1" /> New
                    </Link>
                </Button>
            </div>

            {recipes.length === 0 && (
                <div className="text-center py-10 text-slate-500">
                    No recipes yet. Create one!
                </div>
            )}

            <div className="grid gap-3">
                {recipes.map(recipe => (
                    <Card key={recipe.id}>
                        <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
                            <CardTitle className="text-base">{recipe.name}</CardTitle>
                            <div className="flex gap-1">
                                <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                                    <Link href={`/recipes/${recipe.id}/edit`}>
                                        <Pencil className="h-4 w-4" />
                                    </Link>
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDelete(recipe.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-0 text-sm text-slate-500">
                            <div className="flex gap-2">
                                <span>In: {recipe.items.filter(i => i.role === 'input').length}</span>
                                <span>Out: {recipe.items.filter(i => i.role === 'output').length}</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
