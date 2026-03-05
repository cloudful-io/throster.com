import { getTenantBySubdomain, getUserProfile, getTenantActivities } from '@/lib/tenant';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Star,
    Calendar,
    Clock,
    MapPin,
    DollarSign,
    Users,
    ArrowRight,
    PartyPopper
} from 'lucide-react';
import Link from 'next/link';

export default async function ActivitiesPublicPage({
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
    const profile = user ? await getUserProfile(tenant.id) : null;

    const activities = await getTenantActivities(tenant.id);

    return (
        <div className="container max-w-6xl mx-auto py-12 px-4">
            <div className="space-y-6 text-center mb-12">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
                    <PartyPopper className="h-3 w-3" />
                    Special Events
                </div>
                <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
                    Activities & Events
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    Join our {tenant.name} community for fun and learning outside the classroom.
                </p>
            </div>

            {activities.length === 0 ? (
                <div className="text-center py-20 bg-muted/20 rounded-2xl border-2 border-dashed">
                    <Star className="h-16 w-16 text-muted-foreground/20 mx-auto mb-4" />
                    <h3 className="text-xl font-bold">No activities scheduled</h3>
                    <p className="text-muted-foreground mt-2">Check back soon for upcoming events and workshops.</p>
                </div>
            ) : (
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {activities.map((activity) => (
                        <Card key={activity.id} className="group hover:border-primary/50 transition-all hover:shadow-xl overflow-hidden flex flex-col border-2">
                            <div className="h-3 bg-primary/10 group-hover:bg-primary/20 transition-colors" />
                            <CardHeader className="pb-4">
                                <div className="flex justify-between items-start">
                                    <div className="p-2 rounded-lg bg-primary/5 text-primary mb-2">
                                        <Star className="h-5 w-5 fill-primary/20" />
                                    </div>
                                    <div className="text-2xl font-black text-primary">
                                        ${(activity.feeCents / 100).toFixed(0)}
                                    </div>
                                </div>
                                <CardTitle className="text-2xl font-bold group-hover:text-primary transition-colors">{activity.name}</CardTitle>
                                <CardDescription className="line-clamp-2">
                                    {activity.description || "Join us for this exciting school event!"}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6 flex-1 flex flex-col pb-8">
                                <div className="space-y-3 flex-1">
                                    <div className="flex items-center gap-3 text-sm font-medium text-slate-600 dark:text-slate-400">
                                        <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                                            <Calendar className="h-4 w-4" />
                                        </div>
                                        <span>{activity.date ? new Date(activity.date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }) : "Date TBD"}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm font-medium text-slate-600 dark:text-slate-400">
                                        <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                                            <Clock className="h-4 w-4" />
                                        </div>
                                        <span>{activity.time || "Time TBD"}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm font-medium text-slate-600 dark:text-slate-400">
                                        <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                                            <MapPin className="h-4 w-4" />
                                        </div>
                                        <span>{activity.location || "Online / TBD"}</span>
                                    </div>
                                </div>

                                <div className="pt-6 border-t">
                                    {profile ? (
                                        <Link href={`/activities/signup/${activity.id}`}>
                                            <Button className="w-full h-11 text-base font-bold group">
                                                Sign up Now
                                                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                            </Button>
                                        </Link>
                                    ) : (
                                        <Link href={`/login?returnUrl=/activities`}>
                                            <Button variant="outline" className="w-full h-11 text-base font-bold">
                                                Login to Sign up
                                            </Button>
                                        </Link>
                                    )}
                                    <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground font-medium uppercase tracking-tighter">
                                        <Users className="h-3 w-3" />
                                        <span>{activity.maxParticipants ? `${(activity.maxParticipants - activity.signupCount)} spots remaining` : "Registration open"}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
