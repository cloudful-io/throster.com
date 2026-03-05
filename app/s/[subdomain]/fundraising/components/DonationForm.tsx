'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Heart,
    ArrowRight,
    Gift
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { createDonationAction } from '@/app/actions';
import { FundraisingContext, TenantContext } from '@/lib/tenant';

const PRESET_AMOUNTS = [10, 25, 50, 100];

export default function DonationForm({
    tenant,
    campaign
}: {
    tenant: TenantContext;
    campaign: FundraisingContext;
}) {
    const [amount, setAmount] = useState<string>('25');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const amountCents = Math.round(parseFloat(amount) * 100);

        if (isNaN(amountCents) || amountCents <= 0) {
            setError('Please enter a valid amount.');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('tenantId', tenant.id);
            formData.append('subdomain', tenant.subdomain);
            formData.append('campaignId', campaign.id);
            formData.append('amountCents', amountCents.toString());

            const result = await createDonationAction(formData);

            if (result.success && result.checkoutUrl) {
                window.location.href = result.checkoutUrl;
            } else {
                setError(result.error || 'Failed to initiate donation.');
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-4">
                <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Select Amount</Label>
                <div className="grid grid-cols-2 gap-3">
                    {PRESET_AMOUNTS.map((val) => (
                        <Button
                            key={val}
                            type="button"
                            variant={amount === val.toString() ? "default" : "outline"}
                            className={cn(
                                "h-14 text-lg font-black transition-all",
                                amount === val.toString() ? "bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-600/20 scale-105 z-10" : "hover:border-rose-400 hover:text-rose-600"
                            )}
                            onClick={() => setAmount(val.toString())}
                        >
                            ${val}
                        </Button>
                    ))}
                </div>

                <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-muted-foreground">$</div>
                    <Input
                        type="number"
                        placeholder="Custom Amount"
                        className="h-14 pl-8 text-lg font-bold border-2 focus-visible:ring-rose-500"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                    />
                </div>
            </div>

            {error && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-xl font-medium">
                    {error}
                </div>
            )}

            <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-14 text-xl font-black bg-rose-600 hover:bg-rose-700 shadow-xl shadow-rose-600/20 group"
            >
                {isSubmitting ? "Processing..." : "Donate Now"}
                <Heart className="h-5 w-5 ml-2 fill-white group-hover:scale-125 transition-transform" />
            </Button>

            <p className="text-center text-[10px] text-muted-foreground uppercase font-black tracking-widest px-4 leading-relaxed">
                By donating, you are supporting {tenant.name}'s school community.
            </p>
        </form>
    );
}
