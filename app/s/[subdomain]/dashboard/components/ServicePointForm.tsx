'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Award,
    Calendar,
    Users
} from 'lucide-react';
import { saveServicePointAction } from '@/app/actions';
import { ServicePointDefContext } from '@/lib/tenant';

export default function ServicePointForm({
    tenantId,
    initialData,
    onSuccess,
    onCancel
}: {
    tenantId: string;
    initialData?: ServicePointDefContext;
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
            const result = await saveServicePointAction(formData);
            if (result.success) {
                if (onSuccess) onSuccess();
            } else {
                setError(result.error || 'Failed to save definition.');
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
                    placeholder="e.g. Festival Setup, Classroom Aide"
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                    id="description"
                    name="description"
                    defaultValue={initialData?.description || ''}
                    placeholder="What will volunteers be doing?"
                    className="min-h-[100px]"
                />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="pointsValue" className="flex items-center gap-2">
                        <Award className="h-4 w-4" />
                        Points Value
                    </Label>
                    <Input
                        id="pointsValue"
                        name="pointsValue"
                        type="number"
                        defaultValue={initialData?.pointsValue || 1}
                        min="1"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="maxSignups" className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Max Participants
                    </Label>
                    <Input
                        id="maxSignups"
                        name="maxSignups"
                        type="number"
                        defaultValue={initialData?.maxSignups || ''}
                        placeholder="Unlimited"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="eventDate" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Event Date
                </Label>
                <Input
                    id="eventDate"
                    name="eventDate"
                    type="date"
                    defaultValue={initialData?.eventDate ? initialData.eventDate.split('T')[0] : ''}
                />
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
                <Button type="submit" disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                    {isSubmitting ? "Saving..." : (initialData ? "Update Activity" : "Create Activity")}
                </Button>
            </div>
        </form>
    );
}
