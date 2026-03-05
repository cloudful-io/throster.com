'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog';
import { Calendar, Save } from 'lucide-react';
import { saveAcademicYearAction } from '@/app/actions';
import { useRouter } from 'next/navigation';

export default function AcademicYearForm({
    tenantId,
    initialData,
    open,
    onOpenChange
}: {
    tenantId: string;
    initialData?: any;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const data = {
            id: initialData?.id,
            name: formData.get('name'),
            startDate: formData.get('startDate'),
            endDate: formData.get('endDate'),
        };

        try {
            const result = await saveAcademicYearAction(tenantId, data);
            if (result.success) {
                onOpenChange(false);
                router.refresh();
            } else {
                setError(result.error || 'Failed to save academic year.');
            }
        } catch (err) {
            setError('An unexpected error occurred.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] border-2">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black flex items-center gap-2">
                            <Calendar className="h-6 w-6 text-primary" />
                            {initialData ? 'Edit Academic Year' : 'Add Academic Year'}
                        </DialogTitle>
                        <DialogDescription className="font-medium">
                            Define the start and end dates for your school season.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-6 py-6">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="font-bold">Year Name</Label>
                            <Input
                                id="name"
                                name="name"
                                defaultValue={initialData?.name || ''}
                                placeholder="e.g. 2025-2026"
                                required
                                className="border-2 focus-visible:ring-0"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="startDate" className="font-bold">Start Date</Label>
                                <Input
                                    id="startDate"
                                    name="startDate"
                                    type="date"
                                    defaultValue={initialData?.startDate || ''}
                                    required
                                    className="border-2 focus-visible:ring-0"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="endDate" className="font-bold">End Date</Label>
                                <Input
                                    id="endDate"
                                    name="endDate"
                                    type="date"
                                    defaultValue={initialData?.endDate || ''}
                                    required
                                    className="border-2 focus-visible:ring-0"
                                />
                            </div>
                        </div>

                        {error && (
                            <p className="text-sm font-bold text-destructive italic bg-destructive/10 p-3 rounded-lg border-2 border-destructive">
                                {error}
                            </p>
                        )}
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={isSubmitting} className="w-full font-black h-12">
                            <Save className="h-4 w-4 mr-2" />
                            {isSubmitting ? 'Saving...' : 'Save Academic Year'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
