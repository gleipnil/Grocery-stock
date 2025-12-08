import { getIngredients } from '@/lib/actions/ingredients'
import { IngredientMaster } from '@/components/IngredientMaster'

export default async function SettingsPage() {
    const ingredients = await getIngredients()
    return (
        <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Ingredient Master</h2>
            <IngredientMaster ingredients={ingredients} />
        </div>
    )
}
