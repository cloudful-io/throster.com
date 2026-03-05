'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { School, Mail, Phone, Globe, DollarSign, Save } from 'lucide-react';
import { updateTenantSettingsAction } from '@/app/actions';
import { useRouter } from 'next/navigation';

export default function SettingsForm({
    tenantId,
    initialSettings
}: {
    tenantId: string;
    initialSettings: any;
}) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        setSuccess(false);

        const formData = new FormData(e.currentTarget);
        const settings = {
            contactEmail: formData.get('contactEmail'),
            contactPhone: formData.get('contactPhone'),
            websiteUrl: formData.get('websiteUrl'),
            pointConversionRate: parseInt(formData.get('pointConversionRate') as string || '100', 10),
            currency: formData.get('currency') || 'USD',
        };

        try {
            const result = await updateTenantSettingsAction(tenantId, settings);
            if (result.success) {
                setSuccess(true);
                router.refresh();
            } else {
                setError(result.error || 'Failed to update settings.');
            }
        } catch (err) {
            setError('An unexpected error occurred.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
            <Card className="border-2 shadow-sm">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <School className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-black italic">School Profile</CardTitle>
                            <CardDescription>Visual and contact information for your school.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="contactEmail" className="flex items-center gap-2 font-bold">
                                <Mail className="h-4 w-4" />
                                Support Email
                            </Label>
                            <Input
                                id="contactEmail"
                                name="contactEmail"
                                type="email"
                                defaultValue={initialSettings?.contactEmail || ''}
                                placeholder="support@school.com"
                                className="border-2 focus:ring-0"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="contactPhone" className="flex items-center gap-2 font-bold">
                                <Phone className="h-4 w-4" />
                                Support Phone
                            </Label>
                            <Input
                                id="contactPhone"
                                name="contactPhone"
                                defaultValue={initialSettings?.contactPhone || ''}
                                placeholder="+1 (555) 000-0000"
                                className="border-2 focus:ring-0"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="websiteUrl" className="flex items-center gap-2 font-bold">
                            <Globe className="h-4 w-4" />
                            Official Website
                        </Label>
                        <Input
                            id="websiteUrl"
                            name="websiteUrl"
                            defaultValue={initialSettings?.websiteUrl || ''}
                            placeholder="https://www.yourschool.com"
                            className="border-2 focus:ring-0"
                        />
                    </div>
                </CardContent>
            </Card>

            <Card className="border-2 shadow-sm">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                            <DollarSign className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-black italic">Registration & Points</CardTitle>
                            <CardDescription>Configure how tuition credits and points are calculated.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="pointConversionRate" className="flex items-center gap-2 font-bold">
                                Point Value (in cents)
                            </Label>
                            <Input
                                id="pointConversionRate"
                                name="pointConversionRate"
                                type="number"
                                defaultValue={initialSettings?.pointConversionRate || 100}
                                placeholder="100"
                                className="border-2 focus:ring-0"
                            />
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">
                                Example: 100 = 1 point is worth $1.00 credit.
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="currency" className="flex items-center gap-2 font-bold">
                                School Currency
                            </Label>
                            <Input
                                id="currency"
                                name="currency"
                                defaultValue={initialSettings?.currency || 'USD'}
                                className="border-2 focus:ring-0 uppercase"
                                disabled
                            />
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">
                                Currency is locked to your Stripe account region.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {error && (
                <div className="p-4 bg-destructive/10 border-2 border-destructive text-destructive text-sm rounded-xl font-bold italic">
                    {error}
                </div>
            )}

            {success && (
                <div className="p-4 bg-emerald-100 border-2 border-emerald-500 text-emerald-700 text-sm rounded-xl font-bold italic">
                    Settings updated successfully! Changes are now live across your school portal.
                </div>
            )}

            <div className="flex justify-end pt-4 border-t-2">
                <Button type="submit" disabled={isSubmitting} className="font-black px-8 h-12 shadow-lg shadow-primary/20">
                    <Save className="h-4 w-4 mr-2" />
                    {isSubmitting ? "Saving..." : "Save Configuration"}
                </Button>
            </div>
        </form>
    );
}
