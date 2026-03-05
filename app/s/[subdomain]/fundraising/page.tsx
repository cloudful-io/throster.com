import { getTenantBySubdomain, getTenantFundraising, FundraisingContext } from '@/lib/tenant';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Heart,
    Target,
    TrendingUp,
    Calendar,
    ArrowRight,
    Gift,
    HandHeart
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default async function FundraisingPublicPage({
    params,
}: {
    params: Promise<{ subdomain: string }>;
}) {
    const { subdomain } = await params;
    const tenant = await getTenantBySubdomain(subdomain);

    if (!tenant) {
        notFound();
    }

    const campaigns = await getTenantFundraising(tenant.id);

    return (
        <div className="container max-w-6xl mx-auto py-12 px-4">
            <div className="space-y-6 text-center mb-16">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 text-xs font-bold uppercase tracking-wider">
                    <HandHeart className="h-3 w-3" />
                    Support Our Community
                </div>
                <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
                    Fundraising Campaigns
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    Help us build a better future for our students. Every contribution makes a difference at {tenant.name}.
                </p>
            </div>

            {campaigns.length === 0 ? (
                <div className="text-center py-20 bg-muted/20 rounded-2xl border-2 border-dashed">
                    <Gift className="h-16 w-16 text-muted-foreground/20 mx-auto mb-4" />
                    <h3 className="text-xl font-bold">No active campaigns</h3>
                    <p className="text-muted-foreground mt-2">Check back soon for new initiatives and ways to support our school.</p>
                </div>
            ) : (
                <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
                    {campaigns.map((campaign) => {
                        const percent = campaign.goalCents > 0
                            ? Math.min(100, (campaign.amountRaisedCents / campaign.goalCents) * 100)
                            : 0;

                        return (
                            <Card key={campaign.id} className="group hover:border-rose-300 transition-all hover:shadow-2xl overflow-hidden flex flex-col border-2 relative">
                                <div className="h-2 bg-rose-500/10 group-hover:bg-rose-500/20 transition-colors" />
                                <CardHeader className="pb-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="p-2 rounded-lg bg-rose-50 text-rose-600">
                                            <Heart className="h-5 w-5 fill-rose-600/10" />
                                        </div>
                                        <div className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest text-slate-500">
                                            {percent >= 100 ? "Goal Met!" : "Active"}
                                        </div>
                                    </div>
                                    <CardTitle className="text-2xl font-bold group-hover:text-rose-600 transition-colors">{campaign.title}</CardTitle>
                                    <CardDescription className="line-clamp-3 min-h-[4.5rem]">
                                        {campaign.description || "Support this important initiative for our school community."}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6 flex-1 flex flex-col pb-8 pt-0">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm font-bold">
                                            <span>Progress</span>
                                            <span className="text-rose-600">{percent.toFixed(0)}%</span>
                                        </div>
                                        <div className="h-2.5 bg-muted rounded-full overflow-hidden border">
                                            <div
                                                className="h-full bg-rose-500 transition-all duration-1000"
                                                style={{ width: `${percent}%` }}
                                            />
                                        </div>
                                        <div className="flex justify-between text-[11px] font-bold text-slate-500">
                                            <span>${(campaign.amountRaisedCents / 100).toLocaleString()} raised</span>
                                            <span>Goal: ${(campaign.goalCents / 100).toLocaleString()}</span>
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t flex flex-col gap-3">
                                        <Link href={`/fundraising/${campaign.id}`} className="w-full">
                                            <Button className="w-full h-11 text-base font-bold bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-600/20 group">
                                                Donate Now
                                                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                            </Button>
                                        </Link>
                                        {campaign.endDate && (
                                            <div className="flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground font-black uppercase tracking-tighter">
                                                <Calendar className="h-3 w-3" />
                                                Ends {new Date(campaign.endDate).toLocaleDateString()}
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
