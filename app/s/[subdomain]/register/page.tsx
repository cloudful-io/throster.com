import { getTenantBySubdomain, getUserProfile, getSchoolClasses } from '@/lib/tenant';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import RegistrationForm from './components/RegistrationForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck } from 'lucide-react';

export default async function RegisterPage({
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

    // If not logged in, redirect to login with return URL
    if (!user) {
        redirect(`/login?returnUrl=/register`);
    }

    const profile = await getUserProfile(tenant.id);

    if (!profile) {
        redirect(`/signup?tenantId=${tenant.id}`);
    }

    const classes = await getSchoolClasses(tenant.id);

    return (
        <div className="container max-w-4xl mx-auto py-12 px-4">
            <div className="space-y-6 text-center mb-10">
                <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
                    Student Registration
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    Complete the form below to register your child for classes at {tenant.name}.
                </p>
            </div>

            <div className="grid gap-8">
                <RegistrationForm
                    tenant={tenant}
                    classes={classes}
                    parentProfile={profile}
                />

                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground py-4">
                    <ShieldCheck className="h-4 w-4 text-green-500" />
                    <span>Secure payments powered by Stripe. Your data is protected.</span>
                </div>
            </div>
        </div>
    );
}
