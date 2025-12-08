import { getIngredients } from '@/lib/actions/ingredients'
import { PurchaseForm } from '@/components/PurchaseForm'

export default async function PurchasePage() {
    const ingredients = await getIngredients()
    return (
        <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Register Purchase</h2>
            <PurchaseForm existingIngredients={ingredients} />
        </div>
    )
}
