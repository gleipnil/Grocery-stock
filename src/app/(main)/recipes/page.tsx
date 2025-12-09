import { getRecipes } from '@/lib/actions/recipes'
import { RecipeList } from '@/components/RecipeList'

export default async function RecipesPage() {
    const recipes = await getRecipes()
    return (
        <div className="pb-20">
            <RecipeList recipes={recipes} />
        </div>
    )
}
