'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, PlusCircle, Utensils, Settings, BookOpen, ShoppingCart } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function BottomNav() {
    const pathname = usePathname()

    const items = [
        { href: '/', label: 'Stock', icon: Home },
        { href: '/cook', label: 'Cook', icon: Utensils },
        { href: '/purchase', label: 'Shop', icon: ShoppingCart },
        { href: '/recipes', label: 'Recipes', icon: BookOpen },
        { href: '/settings', label: 'Setting', icon: Settings },
    ]

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-10 border-t bg-white pb-safe pt-2 px-2 dark:bg-slate-950 dark:border-slate-800">
            <ul className="flex justify-around pb-2">
                {items.map(({ href, label, icon: Icon }) => {
                    const isActive = pathname === href || (href !== '/' && pathname.startsWith(href))
                    return (
                        <li key={href} className="flex-1">
                            <Link href={href} className={cn(
                                "flex flex-col items-center gap-1 p-2 rounded-md transition-colors",
                                isActive ? "text-green-600 dark:text-green-400" : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                            )}>
                                <Icon className="h-6 w-6" />
                                <span className="text-xs font-medium">{label}</span>
                            </Link>
                        </li>
                    )
                })}
            </ul>
        </nav>
    )
}
