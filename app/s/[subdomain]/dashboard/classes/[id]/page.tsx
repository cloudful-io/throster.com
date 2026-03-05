import { getTenantBySubdomain, getUserProfile } from '@/lib/tenant';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    ChevronLeft,
    Edit,
    Trash2,
    Users,
    Calendar,
    MapPin,
    DollarSign,
    Info
} from 'lucide-react';
import Link from 'next/link';

export default async function ClassDetailsPage({
    params,
}: {
    params: Promise<{ subdomain: string, id: string }>;
}) {
    const { subdomain, id } = await params;
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
        return redirect('/dashboard');
    }

    // Fetch class details
    const { data: cls, error } = await supabase
        .from("school_classes")
        .select(`
            *,
            teacher:user_profiles ( first_name, last_name, id ),
            enrollments ( 
                id, 
                enrolled_at,
                student:students ( id, first_name, last_name, grade )
            )
        `)
        .eq("id", id)
        .eq("tenant_id", tenant.id)
        .single();

    if (error || !cls) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                <h2 className="text-2xl font-bold">Class Not Found</h2>
                <p className="text-muted-foreground mt-2">The class you are looking for does not exist or has been removed.</p>
                <Link href="/dashboard/classes">
                    <Button className="mt-4">Back to Classes</Button>
                </Link>
            </div>
        );
    }

    const enrollments = cls.enrollments || [];
    const teacherName = cls.teacher ? `${cls.teacher.first_name} ${cls.teacher.last_name}` : "Not assigned";

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/classes">
                    <Button variant="ghost" size="icon">
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold tracking-tight">{cls.name}</h1>
                    <p className="text-muted-foreground">Detailed view and roster for this class.</p>
                </div>
                {(profile.role === 'owner' || profile.role === 'admin') && (
                    <div className="flex items-center gap-2">
                        <Button variant="outline" className="flex items-center gap-2">
                            <Edit className="h-4 w-4" />
                            Edit
                        </Button>
                        <Button variant="destructive" size="icon">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                {/* Left Column: Details */}
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Class Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">Teacher</p>
                                <p className="text-base">{teacherName}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">Description</p>
                                <p className="text-sm leading-relaxed">{cls.description || "No description provided."}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-muted-foreground">Day</p>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Calendar className="h-4 w-4 text-primary" />
                                        <span>{cls.schedule?.day || "TBD"}</span>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-muted-foreground">Room</p>
                                    <div className="flex items-center gap-2 text-sm">
                                        <MapPin className="h-4 w-4 text-primary" />
                                        <span>{cls.schedule?.room || "TBD"}</span>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-muted-foreground">Time</p>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Info className="h-4 w-4 text-primary" />
                                        <span>{cls.schedule?.time || "TBD"}</span>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-muted-foreground">Fee</p>
                                    <div className="flex items-center gap-2 text-sm">
                                        <DollarSign className="h-4 w-4 text-primary" />
                                        <span>${(cls.fee_cents / 100).toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Enrollment Status</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Enrolled Students</span>
                                <span className="font-bold">{enrollments.length} / {cls.max_students || "∞"}</span>
                            </div>
                            <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary"
                                    style={{
                                        width: `${Math.min(100, (enrollments.length / (cls.max_students || 10)) * 100)}%`
                                    }}
                                />
                            </div>
                            <p className="text-xs text-muted-foreground italic text-center">
                                {cls.max_students && (cls.max_students - enrollments.length) > 0
                                    ? `${cls.max_students - enrollments.length} spots remaining`
                                    : "Class is currently full"}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Roster */}
                <div className="lg:col-span-2">
                    <Card className="min-h-[500px]">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Users className="h-5 w-5 text-primary" />
                                Class Roster
                            </CardTitle>
                            {enrollments.length > 0 && (
                                <Button variant="outline" size="sm">Download Roster</Button>
                            )}
                        </CardHeader>
                        <CardContent>
                            {enrollments.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-center">
                                    <Users className="h-12 w-12 text-muted-foreground/30 mb-4" />
                                    <p className="text-muted-foreground font-medium">No students enrolled yet.</p>
                                    <p className="text-sm text-muted-foreground mt-1">Enrollments will appear here once parents register.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b text-muted-foreground uppercase text-[10px] tracking-wider font-bold">
                                                <th className="text-left py-3 px-2">Student Name</th>
                                                <th className="text-left py-3 px-2">Grade</th>
                                                <th className="text-left py-3 px-2">Enrolled At</th>
                                                <th className="text-right py-3 px-2">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {enrollments.map((env: any) => (
                                                <tr key={env.id} className="border-b transition-colors hover:bg-muted/50">
                                                    <td className="py-4 px-2 font-medium">
                                                        {env.student.first_name} {env.student.last_name}
                                                    </td>
                                                    <td className="py-4 px-2 text-muted-foreground">
                                                        {env.student.grade || "N/A"}
                                                    </td>
                                                    <td className="py-4 px-2 text-muted-foreground">
                                                        {new Date(env.enrolled_at).toLocaleDateString()}
                                                    </td>
                                                    <td className="py-4 px-2 text-right">
                                                        <Button variant="ghost" size="sm">Remove</Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
