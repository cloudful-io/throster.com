import { getTenantBySubdomain, getUserProfile, getSchoolClasses, getTenantTeachers, SchoolClassContext, UserContext } from '@/lib/tenant';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    BookOpen,
    Plus,
    Search,
    MoreVertical,
    Users,
    Calendar,
    MapPin,
    DollarSign
} from 'lucide-react';
import Link from 'next/link';
import CreateClassButton from '../components/CreateClassButton';

export default async function ClassesPage({
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

    if (!profile || (profile.role !== 'owner' && profile.role !== 'admin' && profile.role !== 'teacher')) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                <h2 className="text-2xl font-bold">Access Denied</h2>
                <p className="text-muted-foreground mt-2">You do not have permission to manage classes.</p>
                <Link href="/dashboard">
                    <Button className="mt-4">Back to Dashboard</Button>
                </Link>
            </div>
        );
    }

    const [classes, teachers] = await Promise.all([
        getSchoolClasses(tenant.id),
        getTenantTeachers(tenant.id)
    ]);

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Class Management</h1>
                    <p className="text-muted-foreground mt-1">
                        View and manage all classes for {tenant.name}.
                    </p>
                </div>
                {(profile.role === 'owner' || profile.role === 'admin') && (
                    <CreateClassButton
                        teachers={teachers}
                        tenantId={tenant.id}
                    />
                )}
            </div>

            {/* Quick Stats / Filters */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-primary/5 border-primary/10">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-primary">Total Classes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{classes.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Enrollments</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {classes.reduce((acc: number, curr: SchoolClassContext) => acc + (curr.enrollmentCount || 0), 0)}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Student Capacity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold underline underline-offset-4 decoration-primary/30">
                            {classes.reduce((acc: number, curr: SchoolClassContext) => acc + (curr.maxStudents || 0), 0)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search and Filters Placeholder */}
            <div className="flex items-center gap-2 max-w-sm">
                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search classes..."
                        className="w-full pl-10 pr-4 py-2 rounded-md border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                </div>
            </div>

            {/* Class List */}
            {classes.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[300px] border-2 border-dashed rounded-xl bg-muted/30">
                    <BookOpen className="h-12 w-12 text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-semibold">No classes found</h3>
                    <p className="text-muted-foreground">Get started by creating your first school class.</p>
                    {(profile.role === 'owner' || profile.role === 'admin') && (
                        <Button className="mt-4 flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            Create Class
                        </Button>
                    )}
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {classes.map((cls: SchoolClassContext) => (
                        <Card key={cls.id} className="group hover:border-primary/50 transition-all hover:shadow-md">
                            <CardHeader className="flex flex-row items-start justify-between pb-2">
                                <div className="space-y-1">
                                    <CardTitle className="text-xl font-bold leading-none">{cls.name}</CardTitle>
                                    <p className="text-sm text-primary font-medium">{cls.teacherName}</p>
                                </div>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-4 pt-2">
                                <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
                                    {cls.description || "No description provided for this class."}
                                </p>

                                <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Calendar className="h-4 w-4" />
                                        <span>{cls.schedule?.day || "TBD"}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Users className="h-4 w-4" />
                                        <span>{cls.enrollmentCount} / {cls.maxStudents || "∞"}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <MapPin className="h-4 w-4" />
                                        <span>{cls.schedule?.room || "TBD"}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground font-medium text-foreground">
                                        <DollarSign className="h-4 w-4" />
                                        <span>${(cls.feeCents / 100).toFixed(2)}</span>
                                    </div>
                                </div>

                                <div className="pt-4 border-t flex items-center justify-between">
                                    <div className="flex items-center gap-1">
                                        <div className="h-2 w-24 bg-muted rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary"
                                                style={{
                                                    width: `${Math.min(100, (cls.enrollmentCount || 0) / (cls.maxStudents || 10) * 100)}%`
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <Link href={`/dashboard/classes/${cls.id}`}>
                                        <Button variant="outline" size="sm" className="h-8 px-3">
                                            View Details
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
