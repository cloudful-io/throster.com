import { getTenantBySubdomain, getUserProfile, getAcademicYears } from '@/lib/tenant';
import { notFound, redirect } from 'next/navigation';
import {
    Calendar,
    ArrowLeft,
    ShieldCheck
} from 'lucide-react';
import Link from 'next/link';
import AcademicYearManager from './components/AcademicYearManager';
import { Badge } from '@/components/ui/badge';

export default async function AcademicYearsPage({
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

    const academicYears = await getAcademicYears(tenant.id);

    return (
        <div className="container mx-auto px-4 py-8 space-y-10">
            <header className="space-y-1">
                <Link href={`/dashboard`} className="text-primary text-sm font-bold flex items-center gap-1 hover:underline mb-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Dashboard
                </Link>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Calendar className="h-8 w-8 text-primary" />
                        <h1 className="text-3xl font-black tracking-tight">Academic Years</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge className="bg-indigo-500 hover:bg-indigo-600 font-bold uppercase tracking-wider text-[10px] px-3">
                            <ShieldCheck className="h-3 w-3 mr-1" />
                            Calendar Authority
                        </Badge>
                    </div>
                </div>
                <p className="text-muted-foreground font-medium">
                    Manage your school seasons, active years, and enrollment periods.
                </p>
            </header>

            <AcademicYearManager
                tenantId={tenant.id}
                academicYears={academicYears}
            />
        </div>
    );
}
