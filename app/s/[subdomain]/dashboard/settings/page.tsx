import { getTenantBySubdomain, getUserProfile } from '@/lib/tenant';
import { notFound, redirect } from 'next/navigation';
import {
    Settings,
    ArrowLeft,
    ShieldCheck,
    Bell,
    Globe
} from 'lucide-react';
import Link from 'next/link';
import SettingsForm from './components/SettingsForm';
import { Badge } from '@/components/ui/badge';

export default async function SettingsPage({
    params,
}: {
    params: Promise<{ subdomain: string }>;
}) {
    const { subdomain } = await params;
    const tenant = await getTenantBySubdomain(subdomain);

    if (!tenant) {
        notFound();
    }

    const profile = await getUserProfile(tenant.id);
    if (!profile || (profile.role !== 'owner' && profile.role !== 'admin')) {
        redirect(`/dashboard`);
    }

    return (
        <div className="container mx-auto px-4 py-8 space-y-10">
            <header className="space-y-1">
                <Link href={`/dashboard`} className="text-primary text-sm font-bold flex items-center gap-1 hover:underline mb-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Dashboard
                </Link>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Settings className="h-8 w-8 text-primary" />
                        <h1 className="text-3xl font-black tracking-tight">School Settings</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge className="bg-emerald-500 hover:bg-emerald-600 font-bold uppercase tracking-wider text-[10px] px-3">
                            <ShieldCheck className="h-3 w-3 mr-1" />
                            Secure Admin Access
                        </Badge>
                    </div>
                </div>
                <p className="text-muted-foreground font-medium">
                    Configure your school profile, communication preferences, and community service policies.
                </p>
            </header>

            <div className="grid gap-10 lg:grid-cols-4">
                <nav className="space-y-2 lg:col-span-1">
                    <SidebarLink icon={<Globe className="h-4 w-4" />} title="School Profile" active />
                    <SidebarLink icon={<Bell className="h-4 w-4" />} title="Notifications" disabled />
                    <SidebarLink icon={<ShieldCheck className="h-4 w-4" />} title="Security & Access" disabled />
                </nav>

                <div className="lg:col-span-3">
                    <SettingsForm
                        tenantId={tenant.id}
                        initialSettings={tenant.settings}
                    />
                </div>
            </div>
        </div>
    );
}

function SidebarLink({ icon, title, active = false, disabled = false }: { icon: React.ReactNode, title: string, active?: boolean, disabled?: boolean }) {
    if (disabled) {
        return (
            <div className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-muted-foreground cursor-not-allowed grayscale opacity-50">
                {icon}
                {title}
            </div>
        );
    }

    return (
        <div className={`flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl transition-all ${active ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'hover:bg-slate-100 text-slate-700'}`}>
            {icon}
            {title}
        </div>
    );
}
