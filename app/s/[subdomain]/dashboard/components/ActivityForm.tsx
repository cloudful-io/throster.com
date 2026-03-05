'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Calendar,
    Clock,
    MapPin,
    DollarSign,
    Users
} from 'lucide-react';
import { saveActivityAction } from '@/app/actions';
import { ActivityContext } from '@/lib/tenant';

export default function ActivityForm({
    tenantId,
    initialData,
    onSuccess,
    onCancel
}: {
    tenantId: string;
    initialData?: ActivityContext;
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
            const result = await saveActivityAction(formData);
            if (result.success) {
                if (onSuccess) onSuccess();
            } else {
                setError(result.error || 'Failed to save activity.');
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
                <Label htmlFor="name">Activity Name</Label>
                <Input
                    id="name"
                    name="name"
                    defaultValue={initialData?.name}
                    placeholder="e.g. Winter Concert, Sports Day"
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                    id="description"
                    name="description"
                    defaultValue={initialData?.description || ''}
                    placeholder="Tell us about the activity..."
                    className="min-h-[100px]"
                />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="date" className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Date
                    </Label>
                    <Input
                        id="date"
                        name="date"
                        type="date"
                        defaultValue={initialData?.date || ''}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="time" className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Time
                    </Label>
                    <Input
                        id="time"
                        name="time"
                        placeholder="e.g. 10:00 AM - 2:00 PM"
                        defaultValue={initialData?.time || ''}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="location" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Location
                </Label>
                <Input
                    id="location"
                    name="location"
                    defaultValue={initialData?.location || ''}
                    placeholder="e.g. School Hall, Football Field"
                />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="feeCents" className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Participation Fee (Cents)
                    </Label>
                    <Input
                        id="feeCents"
                        name="feeCents"
                        type="number"
                        defaultValue={initialData?.feeCents || 0}
                        placeholder="Total in cents (e.g. 1000 for $10.00)"
                    />
                    <p className="text-[10px] text-muted-foreground">Enter amount in cents. $10.00 = 1000.</p>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="maxParticipants" className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Max Participants
                    </Label>
                    <Input
                        id="maxParticipants"
                        name="maxParticipants"
                        type="number"
                        defaultValue={initialData?.maxParticipants || ''}
                        placeholder="e.g. 50 (leave empty for unlimited)"
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
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : (initialData ? "Update Activity" : "Create Activity")}
                </Button>
            </div>
        </form>
    );
}
