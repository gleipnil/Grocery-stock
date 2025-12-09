import { getRecipes } from '@/lib/actions/recipes'
import { getIngredients } from '@/lib/actions/ingredients'
import { CookingForm } from '@/components/CookingForm'

export default async function CookPage() {
    const recipes = await getRecipes()
    const ingredients = await getIngredients() // For "Arrangement" features if needed (e.g. adding extra ingredients)

    return (
        <div className="pb-20">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 px-1 mb-4">Cooking</h2>
            <CookingForm recipes={recipes} ingredients={ingredients} />
        </div>
    )
}
