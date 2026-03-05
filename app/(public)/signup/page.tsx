'use client';

import { useActionState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { signupSchoolAction } from '@/app/actions';
import { rootDomain } from '@/lib/utils';
import Link from 'next/link';
import { Leaf, Sprout, Sun, Flower2, TreePine } from 'lucide-react';

type SignupState = {
    success?: boolean;
    error?: string;
};

const planIcons: Record<string, any> = {
    seed: Leaf,
    grow: Sprout,
    flourish: Sun,
    bloom: Flower2,
    evergreen: TreePine,
};

const planNames: Record<string, string> = {
    seed: 'Seed (Free)',
    grow: 'Grow ($100/yr)',
    flourish: 'Flourish ($250/yr)',
    bloom: 'Bloom ($500/yr)',
    evergreen: 'Evergreen ($1,000/yr)',
};

import { Suspense } from 'react';

// Separate the form content into its own component to use useSearchParams within a Suspense boundary
function SchoolSignupPageContent() {
    const searchParams = useSearchParams();
    const preselectedPlan = searchParams.get('plan') || 'seed';
    const [selectedPlan, setSelectedPlan] = useState(preselectedPlan);
    const [subdomain, setSubdomain] = useState('');

    const [state, action, isPending] = useActionState<SignupState, FormData>(
        signupSchoolAction,
        {}
    );

    return (
        <div className="mx-auto max-w-lg">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold">Start your school on Throster</h1>
                <p className="mt-2 text-muted-foreground">
                    {selectedPlan === 'seed'
                        ? <span>The perfect plan to <span className="font-semibold text-primary">get started</span>. Free forever.</span>
                        : <span>Set up your school with a <span className="font-semibold text-primary">3-month free trial</span>.</span>}
                    <br />No credit card required.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">Create your school</CardTitle>
                </CardHeader>
                <CardContent>
                    <form action={action} className="space-y-5">
                        <input type="hidden" name="planKey" value={selectedPlan} />

                        {/* Plan Selector */}
                        <div className="space-y-2">
                            <Label>Selected plan</Label>
                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                                {Object.entries(planNames).map(([key, name]) => {
                                    const IconComp = planIcons[key];
                                    return (
                                        <button
                                            key={key}
                                            type="button"
                                            onClick={() => setSelectedPlan(key)}
                                            className={`flex flex-col items-center gap-1 rounded-md border p-3 text-xs transition-colors ${selectedPlan === key
                                                ? 'border-primary bg-primary/5 text-primary'
                                                : 'border-border hover:border-primary/40'
                                                }`}
                                        >
                                            <IconComp className="w-5 h-5" />
                                            <span className="font-medium">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                                        </button>
                                    );
                                })}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {planNames[selectedPlan]} — {selectedPlan === 'seed' ? 'Free forever' : '3-month free trial'}
                            </p>
                        </div>

                        {/* School Info */}
                        <div className="space-y-2">
                            <Label htmlFor="schoolName">School name</Label>
                            <Input
                                id="schoolName"
                                name="schoolName"
                                placeholder="Hope Chinese School"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="subdomain">Subdomain</Label>
                            <div className="flex items-center">
                                <Input
                                    id="subdomain"
                                    name="subdomain"
                                    placeholder="hope-chinese"
                                    value={subdomain}
                                    onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                                    className="rounded-r-none"
                                    required
                                />
                                <span className="bg-muted px-3 border border-l-0 border-input rounded-r-md text-muted-foreground min-h-[36px] flex items-center text-sm">
                                    .{rootDomain}
                                </span>
                            </div>
                        </div>

                        {/* Admin Account */}
                        <div className="border-t pt-4 mt-4">
                            <p className="text-sm font-medium mb-3">Your admin account</p>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">First name</Label>
                                    <Input id="firstName" name="firstName" placeholder="Jane" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Last name</Label>
                                    <Input id="lastName" name="lastName" placeholder="Doe" required />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="admin@hopechinese.org"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="At least 6 characters"
                                minLength={6}
                                required
                            />
                        </div>

                        {state?.error && (
                            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                                {state.error}
                            </div>
                        )}

                        <Button type="submit" className="w-full" disabled={isPending}>
                            {isPending
                                ? 'Creating your school...'
                                : selectedPlan === 'seed' ? 'Create school — get started' : 'Create school — start free trial'}
                        </Button>

                        <p className="text-xs text-center text-muted-foreground">
                            By creating a school, you agree to our terms of service.
                        </p>
                    </form>
                </CardContent>
            </Card>

            <p className="mt-4 text-center text-sm text-muted-foreground">
                Already have a school?{' '}
                <Link href="/" className="text-primary hover:underline">
                    Go to your subdomain
                </Link>
            </p>
        </div>
    );
}

export default function SchoolSignupPage() {
    return (
        <div className="min-h-screen bg-background py-12 px-4">
            <Suspense fallback={
                <div className="mx-auto max-w-lg text-center animate-pulse">
                    <div className="h-8 bg-muted rounded w-3/4 mx-auto mb-4"></div>
                    <div className="h-4 bg-muted rounded w-1/2 mx-auto mb-8"></div>
                    <div className="h-96 bg-card border rounded-lg"></div>
                </div>
            }>
                <SchoolSignupPageContent />
            </Suspense>
        </div>
    );
}

