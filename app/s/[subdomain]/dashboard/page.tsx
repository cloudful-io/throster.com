import { getTenantBySubdomain, getUserProfile, getTenantKPIs } from '@/lib/tenant';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import {
    Users,
    CreditCard,
    TrendingUp,
    HandHelping,
    ArrowUpRight,
    Calendar,
    Settings,
    FileText,
    School,
    GraduationCap
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default async function TenantDashboard({
    params,
}: {
    params: Promise<{ subdomain: string }>;
}) {
    const { subdomain } = await params;
    const tenant = await getTenantBySubdomain(subdomain);

    if (!tenant) {
        notFound();
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const profile = await getUserProfile(tenant.id);

    if (!profile) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
                <h1 className="text-2xl font-bold">Access Denied</h1>
                <p className="mt-2 text-muted-foreground">
                    You are not registered with {tenant.name}.
                </p>
                <a href="/" className="mt-4 text-primary hover:underline">Return to school homepage</a>
            </div>
        );
    }

    const isAdmin = profile.role === 'owner' || profile.role === 'admin';
    const kpis = isAdmin ? await getTenantKPIs(tenant.id) : null;

    return (
        <div className="container mx-auto px-4 py-10 space-y-10">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
                        <School className="h-10 w-10 text-primary" />
                        {tenant.name}
                    </h1>
                    <p className="text-muted-foreground mt-1 font-medium">
                        Welcome back, <span className="text-foreground font-bold">{profile.firstName}</span>. You are logged in as <span className="capitalize text-primary">{profile.role}</span>.
                    </p>
                </div>
                <div className="flex gap-3">
                    {isAdmin && (
                        <Link href={`/dashboard/settings`}>
                            <Button variant="outline" size="sm" className="font-bold">
                                <Settings className="h-4 w-4 mr-2" />
                                Settings
                            </Button>
                        </Link>
                    )}
                    <Link href={`/`}>
                        <Button variant="ghost" size="sm" className="font-bold">
                            View Website
                            <ArrowUpRight className="h-4 w-4 ml-2" />
                        </Button>
                    </Link>
                </div>
            </header>

            {isAdmin && kpis && (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    <Card className="border-2 shadow-sm hover:border-primary/50 transition-colors">
                        <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                            <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">Students</CardTitle>
                            <Users className="h-4 w-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-black">{kpis.totalStudents}</div>
                            <p className="text-[10px] text-muted-foreground font-bold mt-1">Total across all classes</p>
                        </CardContent>
                    </Card>
                    <Card className="border-2 shadow-sm hover:border-green-500/50 transition-colors">
                        <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                            <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">Revenue</CardTitle>
                            <CreditCard className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-black text-green-600">${(kpis.totalRevenueCents / 100).toLocaleString()}</div>
                            <p className="text-[10px] text-muted-foreground font-bold mt-1">Total school earnings</p>
                        </CardContent>
                    </Card>
                    <Card className="border-2 shadow-sm hover:border-indigo-500/50 transition-colors">
                        <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                            <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">Enrollment</CardTitle>
                            <GraduationCap className="h-4 w-4 text-indigo-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-black text-indigo-600">{kpis.activeEnrollments}</div>
                            <p className="text-[10px] text-muted-foreground font-bold mt-1">Active student places</p>
                        </CardContent>
                    </Card>
                    <Card className="border-2 shadow-sm hover:border-orange-500/50 transition-colors">
                        <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                            <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">Volunteering</CardTitle>
                            <HandHelping className="h-4 w-4 text-orange-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-black text-orange-600">{kpis.servicePointEngagement}%</div>
                            <p className="text-[10px] text-muted-foreground font-bold mt-1">Parent engagement rate</p>
                        </CardContent>
                    </Card>
                </div>
            )}

            <div className="grid gap-10 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-8">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-black tracking-tight">Management Suite</h2>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        {isAdmin ? (
                            <>
                                <DashboardLink
                                    href="/dashboard/classes"
                                    title="Classroom Management"
                                    description="Organize levels, schedules, and assigned teachers."
                                    icon={<Calendar className="h-6 w-6" />}
                                    color="bg-blue-500"
                                />
                                <DashboardLink
                                    href="/dashboard/students"
                                    title="Student Directory"
                                    description="View academic history, contacts, and notes."
                                    icon={<Users className="h-6 w-6" />}
                                    color="bg-purple-500"
                                />
                                <DashboardLink
                                    href="/dashboard/activities"
                                    title="Extra-Curriculars"
                                    description="Manage workshops, sport camps, and events."
                                    icon={<TrendingUp className="h-6 w-6" />}
                                    color="bg-green-500"
                                />
                                <DashboardLink
                                    href="/dashboard/reports"
                                    title="Detailed Reports"
                                    description="Download enrollment, financial, and point data."
                                    icon={<FileText className="h-6 w-6" />}
                                    color="bg-slate-700"
                                />
                                <DashboardLink
                                    href="/dashboard/academic-years"
                                    title="School Calendar"
                                    description="Manage academic years, start dates, and seasonality."
                                    icon={<Calendar className="h-6 w-6" />}
                                    color="bg-amber-600"
                                />
                            </>
                        ) : (
                            <>
                                <DashboardLink
                                    href="/register"
                                    title="Register Student"
                                    description="Enroll your children in upcoming classes."
                                    icon={<CreditCard className="h-6 w-6" />}
                                    color="bg-indigo-600"
                                />
                                <DashboardLink
                                    href="/service-points"
                                    title="Service & Rewards"
                                    description="View community service and apply tuition credits."
                                    icon={<HandHelping className="h-6 w-6" />}
                                    color="bg-orange-500"
                                />
                            </>
                        )}
                    </div>
                </div>

                <aside className="space-y-8">
                    <Card className="border-2 shadow-xl overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 text-white">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-xl font-black">Quick Support</CardTitle>
                            <CardDescription className="text-slate-400 font-medium leading-relaxed">
                                Need help with the platform? Our regional support team is ready to assist.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Button className="w-full font-black bg-white text-slate-950 hover:bg-slate-200">
                                Contact Support
                            </Button>
                            <p className="text-[10px] text-slate-500 text-center font-bold uppercase tracking-widest">
                                Response time: ~2 hours
                            </p>
                        </CardContent>
                    </Card>
                </aside>
            </div>
        </div>
    );
}

function DashboardLink({ href, title, description, icon, color }: { href: string, title: string, description: string, icon: React.ReactNode, color: string }) {
    return (
        <Link href={href}>
            <div className="group relative bg-card h-full border-2 rounded-2xl p-6 hover:border-primary/50 transition-all shadow-sm hover:shadow-md">
                <div className={`mb-4 inline-flex items-center justify-center p-3 rounded-xl ${color} text-white shadow-lg shadow-${color.split('-')[1]}-500/20`}>
                    {icon}
                </div>
                <h3 className="font-black text-lg group-hover:text-primary transition-colors">{title}</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                    {description}
                </p>
                <div className="mt-4 flex items-center text-xs font-black uppercase text-primary tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                    Manage Now
                    <ArrowUpRight className="h-3 w-3 ml-1" />
                </div>
            </div>
        </Link>
    );
}
