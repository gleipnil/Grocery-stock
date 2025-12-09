'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RecipeWithItems } from '@/lib/actions/recipes'
import Link from 'next/link'

export function RecipeList({ recipes }: { recipes: RecipeWithItems[] }) {
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
                        <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-base">{recipe.name}</CardTitle>
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
