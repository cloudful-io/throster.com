import { getTenantBySubdomain } from '@/lib/tenant';
import { notFound, redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Home, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { getStripeInstance } from '@/lib/stripe';

export default async function RegisterSuccessPage({
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
        redirect('/register');
    }

    // Optionally verify details of session_id here via Stripe API
    // For now, assume success if redirected here

    return (
        <div className="container max-w-2xl mx-auto py-20 px-4 text-center">
            <div className="flex justify-center mb-6">
                <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/20">
                    <CheckCircle2 className="h-16 w-16 text-green-600 dark:text-green-400" />
                </div>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight mb-4">Registration Successful!</h1>
            <p className="text-xl text-muted-foreground mb-10">
                Thank you for registering. Your student is now enrolled at {tenant.name}.
            </p>

            <Card className="border-2 shadow-lg mb-10">
                <CardHeader className="bg-muted/50 border-b pb-4">
                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">What happens next?</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4 text-left">
                    <div className="flex gap-4">
                        <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold">1</div>
                        <div>
                            <p className="font-semibold">Check your email</p>
                            <p className="text-sm text-muted-foreground">We've sent a registration confirmation and receipt to your email address.</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold">2</div>
                        <div>
                            <p className="font-semibold">Review schedule</p>
                            <p className="text-sm text-muted-foreground">Classes begin soon. You can view the full schedule on our website.</p>
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
                    <Button className="w-full flex items-center gap-2">
                        Go to Dashboard
                        <ArrowRight className="h-4 w-4" />
                    </Button>
                </Link>
            </div>
        </div>
    );
}
