import { getIngredients } from '@/lib/actions/ingredients'
import { RecipeForm } from '@/components/RecipeForm'

export default async function NewRecipePage() {
    const ingredients = await getIngredients()
    return (
        <div className="pb-20">
            <h2 className="text-lg font-bold mb-4">New Recipe</h2>
            <RecipeForm ingredients={ingredients} />
        </div>
    )
}
