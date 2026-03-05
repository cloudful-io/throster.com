'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Target,
    Calendar,
    Heart
} from 'lucide-react';
import { saveFundraisingAction } from '@/app/actions';
import { FundraisingContext } from '@/lib/tenant';

export default function FundraisingForm({
    tenantId,
    initialData,
    onSuccess,
    onCancel
}: {
    tenantId: string;
    initialData?: FundraisingContext;
    onSuccess?: () => void;
    onCancel?: () => void;
}) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        formData.append('tenantId', tenantId);
        if (initialData?.id) {
            formData.append('id', initialData.id);
        }

        try {
            const result = await saveFundraisingAction(formData);
            if (result.success) {
                if (onSuccess) onSuccess();
            } else {
                setError(result.error || 'Failed to save campaign.');
            }
        } catch (err) {
            setError('An unexpected error occurred.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="title">Campaign Title</Label>
                <Input
                    id="title"
                    name="title"
                    defaultValue={initialData?.title}
                    placeholder="e.g. New Playground Fund, Library Books"
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                    id="description"
                    name="description"
                    defaultValue={initialData?.description || ''}
                    placeholder="Describe the goal of this campaign..."
                    className="min-h-[120px]"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="goalCents" className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Target Goal (Cents)
                </Label>
                <Input
                    id="goalCents"
                    name="goalCents"
                    type="number"
                    defaultValue={initialData?.goalCents || 0}
                    placeholder="Amount in cents (e.g. 500000 for $5,000.00)"
                />
                <p className="text-[10px] text-muted-foreground">Enter amount in cents. $100.00 = 10000.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="startDate" className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Start Date
                    </Label>
                    <Input
                        id="startDate"
                        name="startDate"
                        type="date"
                        defaultValue={initialData?.startDate || ''}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="endDate" className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        End Date
                    </Label>
                    <Input
                        id="endDate"
                        name="endDate"
                        type="date"
                        defaultValue={initialData?.endDate || ''}
                    />
                </div>
            </div>

            {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-md">
                    {error}
                </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t">
                {onCancel && (
                    <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                        Cancel
                    </Button>
                )}
                <Button type="submit" disabled={isSubmitting} className="bg-rose-600 hover:bg-rose-700 text-white">
                    <Heart className="h-4 w-4 mr-2 fill-white" />
                    {isSubmitting ? "Saving..." : (initialData ? "Update Campaign" : "Launch Campaign")}
                </Button>
            </div>
        </form>
    );
}
