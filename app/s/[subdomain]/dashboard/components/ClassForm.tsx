'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
    SchoolClassContext,
    UserContext
} from '@/lib/tenant';
import { saveClassAction } from '@/app/actions';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';

type FormState = {
    success?: boolean;
    error?: string;
    classId?: string;
};

export default function ClassForm({
    initialData,
    teachers,
    tenantId,
    onCancel
}: {
    initialData?: SchoolClassContext;
    teachers: UserContext[];
    tenantId: string;
    onCancel: () => void;
}) {
    const [state, formAction] = useActionState<FormState, FormData>(
        saveClassAction,
        {}
    );

    return (
        <form action={formAction} className="space-y-6">
            <input type="hidden" name="tenantId" value={tenantId} />
            {initialData?.id && <input type="hidden" name="id" value={initialData.id} />}

            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="name">Class Name</Label>
                    <Input
                        id="name"
                        name="name"
                        defaultValue={initialData?.name}
                        placeholder="e.g. Mandarin Level 1"
                        required
                    />
                </div>

                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="description">Description</Label>
                    <textarea
                        id="description"
                        name="description"
                        defaultValue={initialData?.description || ''}
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="What will students learn in this class?"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="teacherId">Teacher</Label>
                    <select
                        id="teacherId"
                        name="teacherId"
                        defaultValue={initialData?.teacherId || ''}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                        <option value="">Select a teacher</option>
                        {teachers.map(t => (
                            <option key={t.id} value={t.id}>
                                {t.firstName} {t.lastName} ({t.role})
                            </option>
                        ))}
                    </select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="maxStudents">Max Students</Label>
                    <Input
                        id="maxStudents"
                        name="maxStudents"
                        type="number"
                        defaultValue={initialData?.maxStudents || 20}
                        min={1}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="feeCents">Tuition Fee ($)</Label>
                    <Input
                        id="feeCents"
                        name="feeCents"
                        type="number"
                        defaultValue={initialData ? initialData.feeCents / 100 : 150}
                        step="0.01"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="day">Day</Label>
                    <select
                        id="day"
                        name="day"
                        defaultValue={initialData?.schedule?.day || 'Saturday'}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                        <option value="Monday">Monday</option>
                        <option value="Tuesday">Tuesday</option>
                        <option value="Wednesday">Wednesday</option>
                        <option value="Thursday">Thursday</option>
                        <option value="Friday">Friday</option>
                        <option value="Saturday">Saturday</option>
                        <option value="Sunday">Sunday</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="time">Time</Label>
                    <Input
                        id="time"
                        name="time"
                        defaultValue={initialData?.schedule?.time || '09:00 - 11:00'}
                        placeholder="e.g. 10:00 - 12:00"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="room">Room / Location</Label>
                    <Input
                        id="room"
                        name="room"
                        defaultValue={initialData?.schedule?.room || ''}
                        placeholder="e.g. A101"
                    />
                </div>
            </div>

            {state?.error && (
                <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                    {state.error}
                </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <SubmitButton isEdit={!!initialData} />
            </div>
        </form>
    );
}

function SubmitButton({ isEdit }: { isEdit: boolean }) {
    const { pending } = useFormStatus();

    return (
        <Button type="submit" disabled={pending}>
            {pending ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? 'Update Class' : 'Create Class')}
        </Button>
    );
}
