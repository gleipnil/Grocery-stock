import { getIngredients } from '@/lib/actions/ingredients'
import { ConsumptionForm } from '@/components/ConsumptionForm'

export default async function ConsumePage() {
    const ingredients = await getIngredients()
    return (
        <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Manual Consumption</h2>
            <ConsumptionForm existingIngredients={ingredients} />
        </div>
    )
}
