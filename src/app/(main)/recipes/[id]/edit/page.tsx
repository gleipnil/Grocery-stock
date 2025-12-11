import { getIngredients } from '@/lib/actions/ingredients'
import { getRecipe } from '@/lib/actions/recipes'
import { RecipeForm } from '@/components/RecipeForm'
import { notFound } from 'next/navigation'

export default async function EditRecipePage({ params }: { params: { id: string } }) {
    const recipe = await getRecipe(params.id)
    const ingredients = await getIngredients()

    if (!recipe) {
        notFound()
    }

    return (
        <div className="pb-20">
            <h2 className="text-lg font-bold mb-4">Edit Recipe</h2>
            <RecipeForm ingredients={ingredients} initialData={recipe} />
        </div>
    )
}
