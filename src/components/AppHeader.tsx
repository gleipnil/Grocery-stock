import { signout } from '@/lib/actions/auth'
import { Button } from './ui/button'
import { LogOut } from 'lucide-react'

export default function AppHeader() {
    return (
        <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-white p-4 shadow-sm dark:bg-slate-950 dark:border-slate-800">
            <h1 className="text-xl font-bold bg-gradient-to-r from-green-600 to-teal-500 bg-clip-text text-transparent">
                Stock Manager
            </h1>
            <form action={signout}>
                <Button variant="ghost" size="icon">
                    <LogOut className="h-5 w-5" />
                    <span className="sr-only">Logout</span>
                </Button>
            </form>
        </header>
    )
}
