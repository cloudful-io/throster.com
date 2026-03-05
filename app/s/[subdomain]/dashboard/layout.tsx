import Link from 'next/link';
import {
    LayoutDashboard,
    BookOpen,
    Users,
    Settings,
    LogOut,
    Home,
    Star,
    Heart,
    Award
} from 'lucide-react';
import { signOutAction } from '@/app/actions';
import { Button } from '@/components/ui/button';

export default async function DashboardLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ subdomain: string }>;
}) {
    const { subdomain } = await params;

    const navItems = [
        { label: 'Overview', href: `/dashboard`, icon: LayoutDashboard },
        { label: 'Classes', href: `/dashboard/classes`, icon: BookOpen },
        { label: 'Students', href: `/dashboard/students`, icon: Users },
        { label: 'Activities', href: `/dashboard/activities`, icon: Star },
        { label: 'Fundraising', href: `/dashboard/fundraising`, icon: Heart },
        { label: 'Service Points', href: `/dashboard/service-points`, icon: Award },
        { label: 'Settings', href: `/dashboard/settings`, icon: Settings },
    ];

    return (
        <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
            {/* Sidebar */}
            <aside className="w-64 border-r bg-white dark:bg-slate-900 hidden md:flex flex-col fixed inset-y-0">
                <div className="p-6 border-b">
                    <Link href={`/`} className="flex items-center gap-2 font-bold text-xl text-primary">
                        <Home className="h-6 w-6" />
                        <span>Throster</span>
                    </Link>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center gap-3 px-3 py-2 rounded-md font-medium transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary"
                        >
                            <item.icon className="h-5 w-5" />
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t">
                    <form action={signOutAction}>
                        <Button variant="ghost" className="w-full justify-start gap-3 text-slate-600 dark:text-slate-400 hover:text-destructive">
                            <LogOut className="h-5 w-5" />
                            Log out
                        </Button>
                    </form>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:pl-64 flex flex-col">
                {/* Header (Mobile) */}
                <header className="h-16 border-b bg-white dark:bg-slate-900 md:hidden flex items-center px-4">
                    {/* Mobile menu would go here */}
                    <span className="font-bold text-primary">Throster</span>
                </header>

                <div className="flex-1 p-6 lg:p-10">
                    {children}
                </div>
            </main>
        </div>
    );
}
