import { login, signup } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
    const params = await searchParams
    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 dark:bg-slate-900">
            <Card className="w-full max-w-sm">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Food Stock Manager</CardTitle>
                    <CardDescription>Login or create an account to start</CardDescription>
                </CardHeader>
                <CardContent>
                    <form className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" name="email" type="email" placeholder="m@example.com" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" name="password" type="password" required />
                        </div>
                        {params.error && (
                            <p className="text-red-500 text-sm">{params.error}</p>
                        )}
                        <div className="flex flex-col gap-2 pt-2">
                            <Button formAction={login} className="w-full">Log in</Button>
                            <Button formAction={signup} variant="ghost" className="w-full">Sign up</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
