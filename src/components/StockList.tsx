'use client'

import { useState } from 'react'
import { format, differenceInDays } from 'date-fns'
import { ChevronDown, ChevronUp, AlertCircle, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
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
import { GroupedStocks } from '@/lib/actions/inventory'

type IngredientWithStocks = Database['public']['Tables']['ingredients']['Row'] & {
    stocks: Database['public']['Tables']['stocks']['Row'][]
}

const CATEGORY_ORDER = ['冷蔵庫', '棚', '倉庫']
const CATEGORY_COLORS: Record<string, string> = {
    '冷蔵庫': 'bg-blue-500',
    '棚': 'bg-green-500',
    '倉庫': 'bg-orange-500',
    'その他': 'bg-slate-500'
}

export function StockList({ sections }: { sections: GroupedStocks }) {
    // Determine which categories have items
    const availableCategories = CATEGORY_ORDER.filter(cat => sections[cat]?.length > 0)
    // Add '其他' (Others) if exists and not empty
    Object.keys(sections).forEach(key => {
        if (!CATEGORY_ORDER.includes(key) && sections[key]?.length > 0) {
            availableCategories.push(key)
        }
    })

    if (availableCategories.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-10 text-slate-500">
                <p>No items in stock.</p>
                <p className="text-sm">Go to Purchase tab to add some!</p>
            </div>
        )
    }

    return (
        <Accordion type="multiple" defaultValue={['冷蔵庫']} className="space-y-4">
            {availableCategories.map(category => (
                <CategorySection key={category} title={category} items={sections[category]} />
            ))}
        </Accordion>
    )
}

function CategorySection({ title, items }: { title: string, items: IngredientWithStocks[] }) {
    // Calculate Stats for Header (Option 2: Exception Management)
    let alertCount = 0
    let warningCount = 0
    let safeCount = 0

    items.forEach(ing => {
        const stocks = ing.stocks || []
        const nearest = stocks.sort((a, b) => new Date(a.expire_at).getTime() - new Date(b.expire_at).getTime())[0]
        if (!nearest) return // Should not happen if filtered
        const days = differenceInDays(new Date(nearest.expire_at), new Date())

        if (days < 0) alertCount++
        else if (days <= 3) warningCount++
        else safeCount++
    })

    const total = items.length

    return (
        <AccordionItem value={title} className="border rounded-xl px-0 overflow-hidden bg-white dark:bg-slate-950 shadow-sm">
            <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-slate-50 dark:hover:bg-slate-900 transition-all">
                <div className="flex items-center gap-3 w-full">
                    {/* Category Icon/Color Box */}
                    <div className={cn("w-3 h-8 rounded-sm shrink-0", CATEGORY_COLORS[title] || 'bg-slate-400')} />

                    <span className="font-bold text-lg">{title}</span>

                    {/* Stats (Exception Management) */}
                    <div className="ml-auto flex items-center gap-3 mr-2">
                        {alertCount > 0 && (
                            <div className="flex items-center text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded-full text-sm">
                                <AlertCircle className="w-4 h-4 mr-1" />
                                {alertCount}
                            </div>
                        )}
                        {warningCount > 0 && (
                            <div className="flex items-center text-yellow-600 font-bold bg-yellow-50 px-2 py-0.5 rounded-full text-sm">
                                <AlertTriangle className="w-4 h-4 mr-1" />
                                {warningCount}
                            </div>
                        )}
                        {/* If all safe, show simple Total or Check */}
                        {alertCount === 0 && warningCount === 0 && (
                            <div className="text-slate-400 text-sm font-medium flex items-center">
                                <CheckCircle2 className="w-4 h-4 mr-1 text-green-500" />
                                Total {total}
                            </div>
                        )}
                    </div>
                </div>
            </AccordionTrigger>
            <AccordionContent className="px-0 pb-0 pt-0 border-t">
                <div>
                    {items.map(ing => (
                        <StockItem key={ing.id} ingredient={ing} />
                    ))}
                </div>
            </AccordionContent>
        </AccordionItem>
    )
}

function StockItem({ ingredient }: { ingredient: IngredientWithStocks }) {
    const [isOpen, setIsOpen] = useState(false)
    const stocks = ingredient.stocks || []

    const totalQty = stocks.reduce((sum, s) => sum + Number(s.quantity), 0)
    if (totalQty <= 0) return null

    const sortedStocks = [...stocks].sort((a, b) => new Date(a.expire_at).getTime() - new Date(b.expire_at).getTime())
    const nearestStock = sortedStocks[0]
    const daysLeft = nearestStock ? differenceInDays(new Date(nearestStock.expire_at), new Date()) : 999

    // Option C: Color Bar
    let barColor = "bg-green-500"
    let dateColor = "text-slate-400"
    if (daysLeft < 0) {
        barColor = "bg-red-500"
        dateColor = "text-red-500 font-bold"
    } else if (daysLeft <= 3) {
        barColor = "bg-yellow-500"
        dateColor = "text-yellow-600 font-medium"
    }

    return (
        <div className="group border-b last:border-0 bg-white dark:bg-slate-950 relative">
            {/* Main Row */}
            <div
                className="flex items-center py-3 pl-0 pr-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                onClick={() => setIsOpen(!isOpen)}
            >
                {/* Status Bar */}
                <div className={cn("w-1.5 self-stretch mr-4 shrink-0 transition-colors", barColor)} />

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between mb-0.5">
                        <h3 className="font-bold text-base truncate pr-2">{ingredient.name}</h3>
                        <span className="text-xl font-bold font-mono tracking-tight shrink-0">{Math.round(totalQty * 10) / 10}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                        <span className={cn("truncate", dateColor)}>
                            {nearestStock ? (
                                <>
                                    {format(new Date(nearestStock.expire_at), 'yyyy/MM/dd')}
                                    <span className="ml-2">
                                        (あと{daysLeft}日)
                                    </span>
                                </>
                            ) : 'No expiry'}
                        </span>
                    </div>
                </div>

                {/* Quick Action (Right side, slightly separated) */}
                <div className="ml-4 shrink-0">
                    <QuickConsumeAction ingredient={ingredient} />
                </div>
            </div>

            {/* Expanded Details */}
            {isOpen && (
                <div className="bg-slate-50 dark:bg-slate-900 px-4 py-3 pl-7 text-sm space-y-2 border-t border-slate-100">
                    <div className="flex justify-between text-slate-400 text-xs uppercase font-medium tracking-wider">
                        <span>Expiration</span>
                        <span>Qty</span>
                        <span>In</span>
                    </div>
                    {sortedStocks.map(stock => (
                        <div key={stock.id} className="flex justify-between items-center">
                            <span className={cn(new Date(stock.expire_at) < new Date() ? "text-red-600 font-bold" : "")}>
                                {format(new Date(stock.expire_at), 'yyyy-MM-dd')}
                            </span>
                            <span className="font-mono">{stock.quantity}</span>
                            <span className="text-slate-400 text-xs">{format(new Date(stock.purchased_at || stock.created_at), 'MM/dd')}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
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
                <Button variant="outline" size="sm" className="h-8 px-3 text-xs font-medium rounded-full" onClick={(e) => e.stopPropagation()}>
                    Consume
                </Button>
            </DialogTrigger>
            <DialogContent onClick={(e) => e.stopPropagation()} className="max-w-xs rounded-xl">
                <DialogHeader>
                    <DialogTitle>Consume {ingredient.name}</DialogTitle>
                </DialogHeader>
                <div className="py-4 space-y-3">
                    <Label>Quantity to consume</Label>
                    <div className="flex gap-2">
                        <Input
                            type="number"
                            value={qty}
                            onChange={e => setQty(e.target.value)}
                            min="0"
                            step="0.1"
                            className="text-lg font-bold text-center"
                            autoFocus
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleConsume} disabled={loading} className="w-full">
                        {loading ? 'Processing...' : 'Confirm Consumption'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
