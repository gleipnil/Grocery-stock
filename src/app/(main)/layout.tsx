import AppHeader from "@/components/AppHeader"
import BottomNav from "@/components/BottomNav"

export default function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col min-h-screen pb-24 bg-slate-50 dark:bg-slate-900">
            <AppHeader />
            <main className="flex-1 p-4 container max-w-md mx-auto">{children}</main>
            <BottomNav />
        </div>
    )
}
