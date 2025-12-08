'use client'

import { useState } from 'react'
import { format, differenceInDays } from 'date-fns'
import { ChevronDown, ChevronUp, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { registerConsumption } from '@/lib/actions/inventory'
import { toast } from 'sonner'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from '@/lib/utils'
import { Database } from '@/types/database.types'

type IngredientWithStocks = Database['public']['Tables']['ingredients']['Row'] & {
    stocks: Database['public']['Tables']['stocks']['Row'][]
}

export function StockList({ initialData }: { initialData: IngredientWithStocks[] }) {
    // Filter out items with 0 total quantity
    const activeItems = initialData.filter(ing => {
        const total = ing.stocks?.reduce((sum, s) => sum + Number(s.quantity), 0) || 0
        return total > 0
    })

    if (!activeItems.length) {
        return (
            <div className="flex flex-col items-center justify-center py-10 text-slate-500">
                <p>No items in stock.</p>
                <p className="text-sm">Go to Purchase tab to add some!</p>
            </div>
        )
    }

    return (
        <div className="space-y-3">
            {activeItems.map(ing => (
                <StockItem key={ing.id} ingredient={ing} />
            ))}
        </div>
    )
}

function StockItem({ ingredient }: { ingredient: IngredientWithStocks }) {
    const [isOpen, setIsOpen] = useState(false)
    const stocks = ingredient.stocks || []

    // Calculate total quantity
    const totalQty = stocks.reduce((sum, s) => sum + Number(s.quantity), 0)

    // Find shortest expiry
    const sortedStocks = [...stocks].sort((a, b) => new Date(a.expire_at).getTime() - new Date(b.expire_at).getTime())
    const nearestStock = sortedStocks[0]
    const daysLeft = nearestStock ? differenceInDays(new Date(nearestStock.expire_at), new Date()) : 999

    // Status Color
    let statusColor = "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
    let Icon = CheckCircle
    if (daysLeft < 0) {
        statusColor = "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
        Icon = AlertCircle
    } else if (daysLeft <= 3) {
        statusColor = "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
        Icon = AlertTriangle
    }

    return (
        <Card className="overflow-hidden">
            <div
                className="p-3 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-full", statusColor)}>
                        <Icon className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="font-semibold">{ingredient.name}</h3>
                        <div className="text-xs text-slate-500">
                            {nearestStock ? `Exp: ${format(new Date(nearestStock.expire_at), 'MM/dd')} (${daysLeft}d)` : 'No expiry'}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-lg font-bold">{Math.round(totalQty * 100) / 100}</span>
                    <QuickConsumeAction ingredient={ingredient} />
                    {isOpen ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                </div>
            </div>
            {isOpen && (
                <div className="bg-slate-50 dark:bg-slate-900 p-3 border-t">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-slate-500">
                                <th className="font-normal pb-2">Exp</th>
                                <th className="font-normal pb-2">Qty</th>
                                <th className="font-normal pb-2">Purchased</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedStocks.map(stock => (
                                <tr key={stock.id}>
                                    <td className={cn("py-1", new Date(stock.expire_at) < new Date() ? "text-red-600 font-medium" : "")}>
                                        {format(new Date(stock.expire_at), 'yyyy-MM-dd')}
                                    </td>
                                    <td className="py-1">{stock.quantity}</td>
                                    <td className="text-slate-500 py-1">{format(new Date(stock.purchased_at || stock.created_at), 'MM/dd')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </Card>
    )
}

function QuickConsumeAction({ ingredient }: { ingredient: IngredientWithStocks }) {
    const [open, setOpen] = useState(false)
    const [qty, setQty] = useState("1")
    const [loading, setLoading] = useState(false)

    const handleConsume = async () => {
        setLoading(true)
        try {
            await registerConsumption({
                ingredientId: ingredient.id,
                quantity: Number(qty),
                usedAt: new Date().toISOString()
            })
            toast.success(`Consumed ${qty} of ${ingredient.name}`)
            setOpen(false)
        } catch (e) {
            toast.error("Failed to consume")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-2 text-xs"
                    onClick={(e) => { e.stopPropagation() }}
                >
                    Consume
                </Button>
            </DialogTrigger>
            <DialogContent onClick={(e) => e.stopPropagation()} className="max-w-xs rounded-lg">
                <DialogHeader>
                    <DialogTitle>Consume {ingredient.name}</DialogTitle>
                </DialogHeader>
                <div className="py-4 space-y-2">
                    <Label>Quantity to consume</Label>
                    <Input
                        type="number"
                        value={qty}
                        onChange={e => setQty(e.target.value)}
                        min="0"
                        step="0.1"
                        autoFocus
                    />
                </div>
                <DialogFooter>
                    <Button onClick={handleConsume} disabled={loading}>
                        {loading ? 'Processing...' : 'Confirm'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
