import { getTenantBySubdomain } from '@/lib/tenant';
import { notFound, redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Home, ArrowRight, Star } from 'lucide-react';
import Link from 'next/link';

export default async function ActivitySuccessPage({
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
        redirect('/activities');
    }

    return (
        <div className="container max-w-2xl mx-auto py-20 px-4 text-center">
            <div className="flex justify-center mb-6">
                <div className="rounded-full bg-amber-100 p-3 dark:bg-amber-900/20">
                    <Star className="h-16 w-16 text-amber-600 dark:text-amber-400 fill-amber-600/10" />
                </div>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight mb-4">Signup Confirmed!</h1>
            <p className="text-xl text-muted-foreground mb-10">
                You've successfully signed up for the activity at {tenant.name}.
            </p>

            <Card className="border-2 shadow-lg mb-10 overflow-hidden">
                <div className="h-2 bg-amber-500" />
                <CardHeader className="bg-muted/50 border-b pb-4">
                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">What's Next?</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4 text-left">
                    <div className="flex gap-4">
                        <div className="h-8 w-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 font-bold">1</div>
                        <div>
                            <p className="font-semibold">Confirmation Email</p>
                            <p className="text-sm text-muted-foreground">Check your inbox for a confirmation email with all the event details.</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="h-8 w-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 font-bold">2</div>
                        <div>
                            <p className="font-semibold">Add to Calendar</p>
                            <p className="text-sm text-muted-foreground">Mark your calendar so you don't miss the event! We'll send a reminder closer to the date.</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/" className="w-full sm:w-auto">
                    <Button variant="outline" className="w-full flex items-center gap-2">
                        <Home className="h-4 w-4" />
                        Back to Home
                    </Button>
                </Link>
                <Link href="/dashboard" className="w-full sm:w-auto">
                    <Button className="w-full flex items-center gap-2 bg-amber-600 hover:bg-amber-700 shadow-lg shadow-amber-600/20">
                        Go to Dashboard
                        <ArrowRight className="h-4 w-4" />
                    </Button>
                </Link>
            </div>
        </div>
    );
}
