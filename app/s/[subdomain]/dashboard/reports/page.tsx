import { getTenantBySubdomain, getUserProfile, getEnrollmentReport, getFinancialReport, getServicePointReport } from '@/lib/tenant';
import { notFound, redirect } from 'next/navigation';
import {
    FileText,
    Download,
    ArrowLeft,
    GraduationCap,
    DollarSign,
    HandHelping,
    Search,
    Filter
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';

export default async function ReportsPage({
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

    // Fetch all reports in parallel
    const [enrollments, financials, servicePoints] = await Promise.all([
        getEnrollmentReport(tenant.id),
        getFinancialReport(tenant.id),
        getServicePointReport(tenant.id)
    ]);

    return (
        <div className="container mx-auto px-4 py-8 space-y-8">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                    <Link href={`/dashboard`} className="text-primary text-sm font-bold flex items-center gap-1 hover:underline mb-2">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
                        <FileText className="h-8 w-8 text-primary" />
                        School Reports
                    </h1>
                    <p className="text-muted-foreground font-medium">
                        Detailed insights into your school&apos;s academic and financial performance.
                    </p>
                </div>
                <Button className="font-black bg-slate-900 border-2 border-slate-900 hover:bg-slate-800 transition-all">
                    <Download className="h-4 w-4 mr-2" />
                    Export All Data (CSV)
                </Button>
            </header>

            <Tabs defaultValue="enrollment" className="w-full">
                <TabsList className="bg-slate-100 p-1 rounded-xl h-14 border-2">
                    <TabsTrigger value="enrollment" className="rounded-lg font-black data-[state=active]:bg-white data-[state=active]:shadow-sm px-6 h-full">
                        <GraduationCap className="h-4 w-4 mr-2" />
                        Enrollment
                    </TabsTrigger>
                    <TabsTrigger value="financial" className="rounded-lg font-black data-[state=active]:bg-white data-[state=active]:shadow-sm px-6 h-full">
                        <DollarSign className="h-4 w-4 mr-2" />
                        Financial
                    </TabsTrigger>
                    <TabsTrigger value="service" className="rounded-lg font-black data-[state=active]:bg-white data-[state=active]:shadow-sm px-6 h-full">
                        <HandHelping className="h-4 w-4 mr-2" />
                        Service Points
                    </TabsTrigger>
                </TabsList>

                {/* Enrollment Report */}
                <TabsContent value="enrollment" className="mt-6">
                    <Card className="border-2 shadow-sm">
                        <CardHeader>
                            <CardTitle>Enrollment Breakdown</CardTitle>
                            <CardDescription>All students and their currently active class enrollments.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-xl border overflow-hidden">
                                <Table>
                                    <TableHeader className="bg-slate-50">
                                        <TableRow>
                                            <TableHead className="font-bold text-slate-900">Student Name</TableHead>
                                            <TableHead className="font-bold text-slate-900">Class Assigned</TableHead>
                                            <TableHead className="font-bold text-slate-900">Enrolled Date</TableHead>
                                            <TableHead className="font-bold text-slate-900 text-right">Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {enrollments.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center py-10 text-muted-foreground font-medium">No enrollments found.</TableCell>
                                            </TableRow>
                                        ) : (
                                            enrollments.map((e) => (
                                                <TableRow key={e.id}>
                                                    <TableCell className="font-bold">{e.studentName}</TableCell>
                                                    <TableCell>{e.className}</TableCell>
                                                    <TableCell>{new Date(e.enrolledAt).toLocaleDateString('en-US', { dateStyle: 'medium' })}</TableCell>
                                                    <TableCell className="text-right">
                                                        <Badge variant={e.status === 'active' ? 'default' : 'secondary'} className="font-black uppercase text-[10px]">
                                                            {e.status}
                                                        </Badge>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Financial Report */}
                <TabsContent value="financial" className="mt-6">
                    <Card className="border-2 shadow-sm">
                        <CardHeader>
                            <CardTitle>Revenue Analytics</CardTitle>
                            <CardDescription>Comprehensive log of all school financial transactions.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-xl border overflow-hidden">
                                <Table>
                                    <TableHeader className="bg-slate-50">
                                        <TableRow>
                                            <TableHead className="font-bold text-slate-900">Date</TableHead>
                                            <TableHead className="font-bold text-slate-900">Description</TableHead>
                                            <TableHead className="font-bold text-slate-900">Category</TableHead>
                                            <TableHead className="font-bold text-slate-900 text-right">Amount</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {financials.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center py-10 text-muted-foreground font-medium">No financial transactions recorded.</TableCell>
                                            </TableRow>
                                        ) : (
                                            financials.map((f) => (
                                                <TableRow key={f.id}>
                                                    <TableCell>{new Date(f.date).toLocaleDateString('en-US', { dateStyle: 'medium' })}</TableCell>
                                                    <TableCell className="font-medium">{f.description}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className="font-bold uppercase text-[10px]">
                                                            {f.type}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right font-black text-green-700">
                                                        +${(f.amountCents / 100).toLocaleString()}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                        {financials.length > 0 && (
                                            <TableRow className="bg-slate-100 font-black">
                                                <TableCell colSpan={3} className="text-right">Total School Revenue:</TableCell>
                                                <TableCell className="text-right text-green-700">
                                                    ${(financials.reduce((acc, curr) => acc + curr.amountCents, 0) / 100).toLocaleString()}
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Service Points Report */}
                <TabsContent value="service" className="mt-6">
                    <Card className="border-2 shadow-sm">
                        <CardHeader>
                            <CardTitle>Engagement & Points</CardTitle>
                            <CardDescription>Community volunteering leaderboard and balance management.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-xl border overflow-hidden">
                                <Table>
                                    <TableHeader className="bg-slate-50">
                                        <TableRow>
                                            <TableHead className="font-bold text-slate-900">Participant</TableHead>
                                            <TableHead className="font-bold text-slate-900">Role</TableHead>
                                            <TableHead className="font-bold text-slate-900 text-right">Earned</TableHead>
                                            <TableHead className="font-bold text-slate-900 text-right">Applied</TableHead>
                                            <TableHead className="font-bold text-slate-900 text-right text-indigo-700">Net Balance</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {servicePoints.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center py-10 text-muted-foreground font-medium">No service points activity found.</TableCell>
                                            </TableRow>
                                        ) : (
                                            servicePoints.map((s) => (
                                                <TableRow key={s.id}>
                                                    <TableCell className="font-bold">{s.participantName}</TableCell>
                                                    <TableCell className="capitalize">{s.role}</TableCell>
                                                    <TableCell className="text-right font-medium">{s.pointsEarned.toLocaleString()}</TableCell>
                                                    <TableCell className="text-right font-medium text-destructive">-{s.pointsApplied.toLocaleString()}</TableCell>
                                                    <TableCell className="text-right font-black text-indigo-700">
                                                        {s.netBalance.toLocaleString()}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
