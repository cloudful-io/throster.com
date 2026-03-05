import { getTenantBySubdomain, getUserProfile, getTenantFundraising, FundraisingContext } from '@/lib/tenant';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Heart,
    Plus,
    Target,
    TrendingUp,
    Calendar,
    MoreVertical,
    Gift
} from 'lucide-react';
import Link from 'next/link';
import CreateFundraisingButton from '../components/CreateFundraisingButton';
import { cn } from '@/lib/utils';

export default async function FundraisingDashboardPage({
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

    const campaigns = await getTenantFundraising(tenant.id);

    const totalRaised = campaigns.reduce((acc, c) => acc + c.amountRaisedCents, 0);
    const totalGoal = campaigns.reduce((acc, c) => acc + c.goalCents, 0);

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Fundraising</h1>
                    <p className="text-muted-foreground mt-1">
                        Track campaign progress and manage school donations.
                    </p>
                </div>
                {(profile.role === 'owner' || profile.role === 'admin') && (
                    <CreateFundraisingButton tenantId={tenant.id} />
                )}
            </div>

            {/* Fundraising Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-rose-500/5 border-rose-500/10">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold uppercase tracking-wider text-rose-600">Total Funds Raised</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-rose-600">${(totalRaised / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Cumulative Goal</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black">${(totalGoal / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Active Campaigns</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black">{campaigns.length}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Campaign List */}
            <div className="space-y-6">
                <h2 className="text-xl font-bold">Campaigns</h2>

                {campaigns.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed rounded-2xl bg-muted/30">
                        <Gift className="h-16 w-16 text-muted-foreground/20 mb-4" />
                        <h3 className="text-xl font-bold">No campaigns launched yet</h3>
                        <p className="text-muted-foreground mt-2 max-w-xs">
                            Start a new fundraising drive to support school projects.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {campaigns.map((campaign) => {
                            const percent = campaign.goalCents > 0
                                ? Math.min(100, (campaign.amountRaisedCents / campaign.goalCents) * 100)
                                : 0;

                            return (
                                <Card key={campaign.id} className="group overflow-hidden border-2 hover:border-rose-200 transition-all">
                                    <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x">
                                        <div className="flex-1 p-6 space-y-4">
                                            <div className="flex items-start justify-between">
                                                <div className="space-y-1">
                                                    <h3 className="text-xl font-bold group-hover:text-rose-600 transition-colors">{campaign.title}</h3>
                                                    <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium uppercase tracking-wider">
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="h-3 w-3" />
                                                            {campaign.startDate ? new Date(campaign.startDate).toLocaleDateString() : 'TBD'}
                                                            {campaign.endDate && ` — ${new Date(campaign.endDate).toLocaleDateString()}`}
                                                        </span>
                                                    </div>
                                                </div>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </div>

                                            <p className="text-sm text-muted-foreground line-clamp-2 italic">
                                                {campaign.description || "No description provided for this campaign."}
                                            </p>

                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm font-bold">
                                                    <span>Progress</span>
                                                    <span>{percent.toFixed(1)}%</span>
                                                </div>
                                                <div className="h-3 bg-muted rounded-full overflow-hidden border">
                                                    <div
                                                        className={cn(
                                                            "h-full transition-all duration-1000",
                                                            percent >= 100 ? "bg-green-500" : "bg-rose-500"
                                                        )}
                                                        style={{ width: `${percent}%` }}
                                                    />
                                                </div>
                                                <div className="flex justify-between text-[10px] uppercase font-black tracking-widest text-muted-foreground">
                                                    <span>Raised: ${(campaign.amountRaisedCents / 100).toLocaleString()}</span>
                                                    <span>Goal: ${(campaign.goalCents / 100).toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="md:w-64 bg-slate-50 dark:bg-slate-900/50 p-6 flex flex-col justify-center items-center text-center space-y-4">
                                            <div className="h-12 w-12 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                                                <TrendingUp className="h-6 w-6 text-rose-600" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-muted-foreground uppercase tracking-tighter">Current Status</div>
                                                <div className="text-lg font-black">{percent >= 100 ? "Goal Met!" : "Actively Raising"}</div>
                                            </div>
                                            <Button variant="outline" className="w-full h-10 font-bold border-rose-200 hover:bg-rose-50 text-rose-600 group">
                                                View Page
                                                <Plus className="h-4 w-4 ml-2 group-hover:rotate-90 transition-transform" />
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
