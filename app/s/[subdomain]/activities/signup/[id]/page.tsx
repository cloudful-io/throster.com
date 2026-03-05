import { getTenantBySubdomain, getUserProfile, getActivityById, getParentStudents } from '@/lib/tenant';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import ActivitySignupForm from '../../components/ActivitySignupForm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    Calendar,
    Clock,
    MapPin,
    DollarSign,
    ShieldCheck,
    ChevronLeft
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function ActivitySignupPage({
    params,
}: {
    params: Promise<{ subdomain: string, id: string }>;
}) {
    const { subdomain, id: activityId } = await params;
    const tenant = await getTenantBySubdomain(subdomain);

    if (!tenant) {
        notFound();
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect(`/login?returnUrl=/activities/signup/${activityId}`);
    }

    const profile = await getUserProfile(tenant.id);
    if (!profile) {
        redirect(`/signup?tenantId=${tenant.id}`);
    }

    const [activity, students] = await Promise.all([
        getActivityById(tenant.id, activityId),
        getParentStudents(tenant.id, profile.id)
    ]);

    if (!activity) {
        notFound();
    }

    return (
        <div className="container max-w-4xl mx-auto py-12 px-4">
            <Link href="/activities" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-8 transition-colors">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back to Activities
            </Link>

            <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-8">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-extrabold tracking-tight">{activity.name} Signup</h1>
                        <p className="text-xl text-muted-foreground">Select a student and complete registration.</p>
                    </div>

                    <ActivitySignupForm
                        tenant={tenant}
                        activity={activity}
                        students={students}
                        parentProfile={profile}
                    />

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <ShieldCheck className="h-4 w-4 text-green-500" />
                        <span>All payments are processed securely via Stripe.</span>
                    </div>
                </div>

                <div className="space-y-6">
                    <Card className="border-2 shadow-lg">
                        <CardHeader className="bg-primary/5 border-b">
                            <CardTitle className="text-lg">Event Details</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <div className="flex gap-3">
                                <Calendar className="h-5 w-5 text-primary shrink-0" />
                                <div>
                                    <p className="font-bold text-sm">Date</p>
                                    <p className="text-sm text-muted-foreground">{activity.date ? new Date(activity.date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }) : "TBD"}</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <Clock className="h-5 w-5 text-primary shrink-0" />
                                <div>
                                    <p className="font-bold text-sm">Time</p>
                                    <p className="text-sm text-muted-foreground">{activity.time || "TBD"}</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <MapPin className="h-5 w-5 text-primary shrink-0" />
                                <div className="min-w-0">
                                    <p className="font-bold text-sm">Location</p>
                                    <p className="text-sm text-muted-foreground truncate">{activity.location || "TBD"}</p>
                                </div>
                            </div>
                            <div className="pt-4 border-t flex justify-between items-center">
                                <span className="font-bold">Registration Fee</span>
                                <span className="text-xl font-black text-primary">${(activity.feeCents / 100).toFixed(2)}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-muted/50 border-none">
                        <CardContent className="pt-6">
                            <h4 className="font-bold text-sm mb-2">Important Information</h4>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Please ensure you select the correct student for this activity. Signups are non-refundable after the registration deadline.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
