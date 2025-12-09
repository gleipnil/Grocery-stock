import { getStocksGrouped } from '@/lib/actions/inventory'
import { StockList } from '@/components/StockList'

export default async function DashboardPage() {
    const groupedStocks = await getStocksGrouped()

    return (
        <div className="pb-20 space-y-4">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 px-1">My Inventory</h2>
            <StockList sections={groupedStocks} />
        </div>
    )
}
