import { getTenantBySubdomain, getUserProfile, getTenantActivities, ActivityContext } from '@/lib/tenant';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Star,
    Plus,
    Calendar,
    Clock,
    MapPin,
    DollarSign,
    Users,
    MoreVertical,
    Trash
} from 'lucide-react';
import Link from 'next/link';
import CreateActivityButton from '../components/CreateActivityButton';

export default async function ActivitiesPage({
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

    const activities = await getTenantActivities(tenant.id);

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Activity Management</h1>
                    <p className="text-muted-foreground mt-1">
                        Create and manage extra-curricular activities for {tenant.name}.
                    </p>
                </div>
                {(profile.role === 'owner' || profile.role === 'admin') && (
                    <CreateActivityButton tenantId={tenant.id} />
                )}
            </div>

            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-amber-500/5 border-amber-500/10">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold uppercase tracking-wider text-amber-600">Total Activities</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black">{activities.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Total Signups</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black">
                            {activities.reduce((acc, a) => acc + (a.signupCount || 0), 0)}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Planned Revenue</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black">
                            ${(activities.reduce((acc, a) => acc + ((a.signupCount || 0) * (a.feeCents || 0)), 0) / 100).toFixed(2)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Activity List */}
            {activities.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[300px] border-2 border-dashed rounded-xl bg-muted/30">
                    <Star className="h-12 w-12 text-muted-foreground/30 mb-4" />
                    <h3 className="text-lg font-semibold">No activities found</h3>
                    <p className="text-muted-foreground">Create your first extra-curricular activity to get started.</p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {activities.map((activity) => (
                        <Card key={activity.id} className="group hover:border-primary/50 transition-all hover:shadow-md overflow-hidden">
                            <CardHeader className="flex flex-row items-start justify-between pb-2 bg-muted/30">
                                <div className="space-y-1">
                                    <CardTitle className="text-lg font-bold line-clamp-1">{activity.name}</CardTitle>
                                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                                        {activity.date ? new Date(activity.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : "Date TBD"}
                                    </p>
                                </div>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-4 pt-4">
                                <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
                                    {activity.description || "No description provided."}
                                </p>

                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Clock className="h-4 w-4 text-primary/60" />
                                        <span>{activity.time || "TBD"}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <MapPin className="h-4 w-4 text-primary/60" />
                                        <span className="truncate">{activity.location || "TBD"}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Users className="h-4 w-4 text-primary/60" />
                                        <span>{activity.signupCount} / {activity.maxParticipants || "∞"}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-foreground font-bold">
                                        <DollarSign className="h-4 w-4 text-primary" />
                                        <span>${(activity.feeCents / 100).toFixed(2)}</span>
                                    </div>
                                </div>

                                <div className="pt-4 border-t flex items-center justify-between">
                                    <div className="flex items-center gap-1.5 overflow-hidden">
                                        <div className="h-1.5 w-16 bg-muted rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-amber-500"
                                                style={{ width: `${Math.min(100, (activity.signupCount / (activity.maxParticipants || 20)) * 100)}%` }}
                                            />
                                        </div>
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase">Capacity</span>
                                    </div>
                                    <Button variant="outline" size="sm" className="h-8 text-xs px-3">
                                        Manage
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
