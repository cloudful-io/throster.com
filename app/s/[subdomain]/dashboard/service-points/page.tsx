import { getTenantBySubdomain, getUserProfile, getTenantServicePointDefs, ServicePointDefContext } from '@/lib/tenant';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Award,
    Calendar,
    Users,
    Edit3,
    CheckCircle2
} from 'lucide-react';
import CreateServicePointButton from '../components/CreateServicePointButton';
import DeleteServicePointButton from '../components/DeleteServicePointButton';
import { deleteServicePointAction } from '@/app/actions';

export default async function ServicePointDashboardPage({
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

    const definitions = await getTenantServicePointDefs(tenant.id);

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Service Points</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage community service activities and track volunteer participation.
                    </p>
                </div>
                {(profile.role === 'owner' || profile.role === 'admin') && (
                    <CreateServicePointButton tenantId={tenant.id} />
                )}
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {definitions.length === 0 ? (
                    <div className="col-span-full h-64 flex flex-col items-center justify-center border-2 border-dashed rounded-xl bg-muted/30">
                        <Award className="h-12 w-12 text-muted-foreground/20 mb-4" />
                        <h3 className="text-lg font-bold">No activities defined</h3>
                        <p className="text-sm text-muted-foreground">Start by defining community service opportunities for parents.</p>
                    </div>
                ) : (
                    definitions.map((def) => (
                        <Card key={def.id} className="group hover:border-indigo-300 transition-all shadow-sm">
                            <CardHeader className="pb-3 border-b bg-indigo-50/50 dark:bg-indigo-950/20">
                                <div className="flex justify-between items-start">
                                    <div className="h-10 w-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 mb-2">
                                        <Award className="h-6 w-6" />
                                    </div>
                                    <div className="bg-white dark:bg-slate-800 px-2 py-1 rounded-full border text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                                        {def.pointsValue} Points
                                    </div>
                                </div>
                                <CardTitle className="text-xl font-bold tracking-tight group-hover:text-indigo-600 transition-colors">{def.name}</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-5 space-y-4">
                                <p className="text-xs text-muted-foreground line-clamp-2 min-h-[2.5rem]">
                                    {def.description || "Help support our school community through this volunteer activity."}
                                </p>

                                <div className="space-y-2 border-t pt-4">
                                    <div className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-1.5 text-muted-foreground font-medium">
                                            <Calendar className="h-3.5 w-3.5" />
                                            {def.eventDate ? new Date(def.eventDate).toLocaleDateString() : 'Continuous'}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-indigo-600 font-bold">
                                            <Users className="h-3.5 w-3.5" />
                                            {def.participantCount}{def.maxSignups ? ` / ${def.maxSignups}` : ''}
                                        </div>
                                    </div>

                                    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border">
                                        <div
                                            className="h-full bg-indigo-500 transition-all duration-1000"
                                            style={{
                                                width: def.maxSignups ? `${Math.min(100, (def.participantCount / def.maxSignups) * 100)}%` : '100%'
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-2">
                                    <Button variant="outline" size="sm" className="flex-1 h-9 font-bold border-indigo-100 hover:bg-indigo-50 hover:text-indigo-600">
                                        <Edit3 className="h-3.5 w-3.5 mr-2" />
                                        Edit
                                    </Button>
                                    <DeleteServicePointButton id={def.id} tenantId={tenant.id} />
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
