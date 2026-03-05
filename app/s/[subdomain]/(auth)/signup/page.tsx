'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { signupAction } from '@/app/actions';
import Link from 'next/link';

type SignupState = {
    success?: boolean;
    error?: string;
};

export default function SignupPage({
    searchParams,
}: {
    searchParams: Promise<{ tenantId?: string }>;
}) {
    const [state, action, isPending] = useActionState<SignupState, FormData>(
        signupAction,
        {}
    );

    // tenantId will be injected by the layout or passed as a search param
    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                        Join our school community.
                    </p>
                </CardHeader>
                <CardContent>
                    <form action={action} className="space-y-4">
                        <input type="hidden" name="tenantId" value="" />

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="firstName">First name</Label>
                                <Input
                                    id="firstName"
                                    name="firstName"
                                    placeholder="Jane"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName">Last name</Label>
                                <Input
                                    id="lastName"
                                    name="lastName"
                                    placeholder="Doe"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="you@example.com"
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
                            <div className="text-sm text-destructive">{state.error}</div>
                        )}

                        {state?.success && (
                            <div className="text-sm text-green-600">
                                Account created! Check your email to confirm your account.
                            </div>
                        )}

                        <Button type="submit" className="w-full" disabled={isPending}>
                            {isPending ? 'Creating account...' : 'Create account'}
                        </Button>
                    </form>

                    <p className="mt-4 text-center text-sm text-muted-foreground">
                        Already have an account?{' '}
                        <Link href="/login" className="text-primary hover:underline">
                            Log in
                        </Link>
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
