import { getTenantBySubdomain, getUserProfile, getTenantStudents, StudentContext } from '@/lib/tenant';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Users,
    Search,
    MoreVertical,
    UserPlus,
    Filter,
    Mail,
    Phone,
    Calendar,
    BadgeCheck,
    GraduationCap
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default async function StudentsPage({
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
        return redirect('/dashboard');
    }

    const students = await getTenantStudents(tenant.id);

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Student Management</h1>
                    <p className="text-muted-foreground mt-1">
                        View and manage all students enrolled at {tenant.name}.
                    </p>
                </div>
                {(profile.role === 'owner' || profile.role === 'admin') && (
                    <Button className="flex items-center gap-2">
                        <UserPlus className="h-4 w-4" />
                        Add New Student
                    </Button>
                )}
            </div>

            {/* Stats Dashboard */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono">Total Students</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black">{students.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono">Active Enrollments</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-primary">
                            {students.reduce((acc, s) => acc + (s.enrollments?.filter(e => e.status === 'active').length || 0), 0)}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono">Pending Payment</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-amber-500">
                            {students.reduce((acc, s) => acc + (s.enrollments?.filter(e => e.status === 'pending_payment').length || 0), 0)}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono">Unenrolled</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-muted-foreground/50">
                            {students.filter(s => !s.enrollments || s.enrollments.length === 0).length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative flex-1 w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search by name or parent..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-sm"
                    />
                </div>
                <Button variant="outline" className="flex items-center gap-2 px-4 shadow-sm h-10">
                    <Filter className="h-4 w-4" />
                    Filters
                </Button>
            </div>

            {/* Student Table */}
            <Card className="border-none shadow-xl bg-card/50 backdrop-blur-sm overflow-hidden">
                <CardContent className="p-0">
                    {students.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 text-center">
                            <Users className="h-16 w-16 text-muted-foreground/20 mb-4" />
                            <h3 className="text-xl font-bold">No students registered yet</h3>
                            <p className="text-muted-foreground mt-2 max-w-xs">
                                When parents register their children, they will appear in this list.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/30 text-muted-foreground uppercase text-[10px] tracking-widest font-black">
                                        <th className="text-left py-4 px-6">Student</th>
                                        <th className="text-left py-4 px-6">Grade</th>
                                        <th className="text-left py-4 px-6">Parent</th>
                                        <th className="text-left py-4 px-6">Enrolled Classes</th>
                                        <th className="text-right py-4 px-6">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {students.map((student: StudentContext) => (
                                        <tr key={student.id} className="group hover:bg-muted/50 transition-colors">
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-base shrink-0">
                                                        {student.firstName[0]}{student.lastName[0]}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-base">{student.firstName} {student.lastName}</span>
                                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                            <Calendar className="h-3 w-3" />
                                                            Registered {new Date(student.createdAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px] uppercase tracking-wider border">
                                                    <GraduationCap className="h-3 w-3" />
                                                    {student.grade || "None"}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 font-medium">
                                                {student.parentName}
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex flex-wrap gap-2">
                                                    {(!student.enrollments || student.enrollments.length === 0) ? (
                                                        <span className="text-muted-foreground italic text-xs">Not enrolled</span>
                                                    ) : (
                                                        student.enrollments.map((e, idx) => (
                                                            <span
                                                                key={idx}
                                                                className={cn(
                                                                    "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-tight border",
                                                                    e.status === 'active'
                                                                        ? "bg-green-50 text-green-700 border-green-200"
                                                                        : "bg-amber-50 text-amber-700 border-amber-200"
                                                                )}
                                                            >
                                                                {e.status === 'active' && <BadgeCheck className="h-3 w-3" />}
                                                                {e.className}
                                                            </span>
                                                        ))
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <Mail className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-primary">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </div>
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
    );
}
