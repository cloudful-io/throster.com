import { getTenantBySubdomain } from '@/lib/tenant';
import { notFound, redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Home, ArrowRight, Share2 } from 'lucide-react';
import Link from 'next/link';

export default async function DonationSuccessPage({
    params,
    searchParams,
}: {
    params: Promise<{ subdomain: string }>;
    searchParams: Promise<{ session_id: string }>;
}) {
    const { subdomain } = await params;
    const { session_id } = await searchParams;
    const tenant = await getTenantBySubdomain(subdomain);

    if (!tenant) {
        notFound();
    }

    if (!session_id) {
        redirect('/fundraising');
    }

    return (
        <div className="container max-w-2xl mx-auto py-20 px-4 text-center">
            <div className="flex justify-center mb-6">
                <div className="rounded-full bg-rose-100 p-3 dark:bg-rose-900/20">
                    <Heart className="h-16 w-16 text-rose-600 dark:text-rose-400 fill-rose-600/10" />
                </div>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight mb-4">Thank You!</h1>
            <p className="text-xl text-muted-foreground mb-10">
                Your generous contribution to {tenant.name} has been received. You're making a real difference.
            </p>

            <Card className="border-2 shadow-lg mb-10 overflow-hidden text-left">
                <div className="h-2 bg-rose-500" />
                <CardHeader className="bg-muted/50 border-b pb-4">
                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground text-center">Spread the Word</CardTitle>
                </CardHeader>
                <CardContent className="pt-8 pb-8 flex flex-col items-center text-center space-y-6">
                    <p className="text-sm text-muted-foreground max-w-xs">
                        Share this campaign with your friends and family to help us reach our goal even faster!
                    </p>
                    <Button variant="outline" className="flex items-center gap-2 border-rose-200 text-rose-600">
                        <Share2 className="h-4 w-4" />
                        Share Campaign
                    </Button>
                </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/" className="w-full sm:w-auto">
                    <Button variant="outline" className="w-full flex items-center gap-2">
                        <Home className="h-4 w-4" />
                        Home
                    </Button>
                </Link>
                <Link href="/fundraising" className="w-full sm:w-auto">
                    <Button className="w-full flex items-center gap-2 bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-600/20">
                        All Campaigns
                        <ArrowRight className="h-4 w-4" />
                    </Button>
                </Link>
            </div>
        </div>
    );
}
