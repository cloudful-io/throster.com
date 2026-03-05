import { getTenantBySubdomain, getCampaignById } from '@/lib/tenant';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Heart,
    Target,
    Calendar,
    ShieldCheck,
    ChevronLeft,
    Gift,
    TrendingUp
} from 'lucide-react';
import Link from 'next/link';
import DonationForm from '../components/DonationForm';

export default async function CampaignDetailPage({
    params,
}: {
    params: Promise<{ subdomain: string, id: string }>;
}) {
    const { subdomain, id: campaignId } = await params;
    const tenant = await getTenantBySubdomain(subdomain);

    if (!tenant) {
        notFound();
    }

    const campaign = await getCampaignById(tenant.id, campaignId);

    if (!campaign) {
        notFound();
    }

    const percent = campaign.goalCents > 0
        ? Math.min(100, (campaign.amountRaisedCents / campaign.goalCents) * 100)
        : 0;

    return (
        <div className="container max-w-5xl mx-auto py-12 px-4">
            <Link href="/fundraising" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-8 transition-colors">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back to Campaigns
            </Link>

            <div className="grid gap-12 lg:grid-cols-5">
                <div className="lg:col-span-3 space-y-10">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 text-xs font-bold uppercase tracking-wider">
                            <Heart className="h-3 w-3 fill-rose-600/10" />
                            Active Campaign
                        </div>
                        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">{campaign.title}</h1>
                        <p className="text-xl text-muted-foreground leading-relaxed whitespace-pre-wrap">
                            {campaign.description || "Support this important initiative for our school community."}
                        </p>
                    </div>

                    <div className="space-y-6 bg-slate-50 dark:bg-slate-900/50 p-8 rounded-3xl border border-slate-200 dark:border-slate-800">
                        <div className="flex justify-between items-end mb-2">
                            <div className="space-y-1">
                                <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Amount Raised</span>
                                <div className="text-4xl font-black text-rose-600 leading-none">
                                    ${(campaign.amountRaisedCents / 100).toLocaleString()}
                                </div>
                            </div>
                            <div className="text-right space-y-1">
                                <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Our Goal</span>
                                <div className="text-2xl font-bold leading-none">
                                    ${(campaign.goalCents / 100).toLocaleString()}
                                </div>
                            </div>
                        </div>

                        <div className="h-4 bg-white dark:bg-slate-800 rounded-full overflow-hidden border-2 border-rose-100 dark:border-rose-900/30 p-0.5 shadow-inner">
                            <div
                                className="h-full bg-rose-500 rounded-full transition-all duration-1000 shadow-sm"
                                style={{ width: `${percent}%` }}
                            />
                        </div>

                        <div className="flex justify-between items-center bg-white dark:bg-slate-800/50 p-4 rounded-2xl border">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-600">
                                    <TrendingUp className="h-5 w-5" />
                                </div>
                                <span className="font-bold">Progress: {percent.toFixed(1)}%</span>
                            </div>
                            {campaign.endDate && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Calendar className="h-4 w-4" />
                                    <span>Until {new Date(campaign.endDate).toLocaleDateString()}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <Card className="border-none bg-primary/5">
                            <CardContent className="pt-6 text-center">
                                <Target className="h-10 w-10 text-primary mx-auto mb-3" />
                                <h4 className="font-bold">Specific Goal</h4>
                                <p className="text-sm text-muted-foreground mt-1">Every dollar goes directly towards {campaign.title.toLowerCase()}.</p>
                            </CardContent>
                        </Card>
                        <Card className="border-none bg-rose-500/5">
                            <CardContent className="pt-6 text-center">
                                <Gift className="h-10 w-10 text-rose-500 mx-auto mb-3" />
                                <h4 className="font-bold">Your Impact</h4>
                                <p className="text-sm text-muted-foreground mt-1">Join other parents in making a lasting difference today.</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-8">
                    <Card className="border-2 shadow-2xl sticky top-8">
                        <CardHeader className="bg-muted/50 border-b">
                            <CardTitle className="flex items-center gap-2">
                                <HandHeart className="h-5 w-5 text-rose-600" />
                                Make a Donation
                            </CardTitle>
                            <CardDescription>Support "{campaign.title}"</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-8">
                            <DonationForm
                                tenant={tenant}
                                campaign={campaign}
                            />

                            <div className="mt-8 flex items-center justify-center gap-2 text-[10px] text-muted-foreground font-bold uppercase tracking-widest text-center px-4 py-3 bg-slate-50 dark:bg-slate-900/30 rounded-xl">
                                <ShieldCheck className="h-4 w-4 text-green-500" />
                                Secure Payment via Stripe
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function HandHeart(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M11 14h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 16" />
            <path d="m7 20 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-5.4a2 2 0 0 0-3-2.6l-4.4 3.9" />
            <path d="M2 23h20" />
            <path d="M7 15h2" />
            <path d="M8 9V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v4" />
        </svg>
    )
}
