import { getStocksGrouped } from '@/lib/actions/inventory'
import { StockList } from '@/components/StockList'

export default async function DashboardPage() {
    const ingredients = await getStocksGrouped()

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">My Inventory</h2>
            </div>
            <StockList initialData={ingredients as any} />
        </div>
    )
}
