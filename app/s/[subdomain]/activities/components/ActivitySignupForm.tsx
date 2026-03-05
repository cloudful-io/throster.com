'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    ActivityContext,
    StudentContext,
    TenantContext,
    UserContext
} from '@/lib/tenant';
import {
    Check,
    ArrowRight,
    UserCircle2,
    PlusCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { createActivitySignupAction } from '@/app/actions';
import Link from 'next/link';

export default function ActivitySignupForm({
    tenant,
    activity,
    students,
    parentProfile
}: {
    tenant: TenantContext;
    activity: ActivityContext;
    students: StudentContext[];
    parentProfile: UserContext;
}) {
    const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        if (!selectedStudentId) return;

        setIsSubmitting(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('tenantId', tenant.id);
            formData.append('subdomain', tenant.subdomain);
            formData.append('parentId', parentProfile.id);
            formData.append('studentId', selectedStudentId);
            formData.append('activityId', activity.id);

            const result = await createActivitySignupAction(formData);

            if (result.success && result.checkoutUrl) {
                window.location.href = result.checkoutUrl;
            } else {
                setError(result.error || 'Failed to initiate signup.');
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (students.length === 0) {
        return (
            <Card className="border-2 border-dashed bg-muted/30">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <UserCircle2 className="h-12 w-12 text-muted-foreground/30 mb-4" />
                    <h3 className="text-lg font-bold">No students registered</h3>
                    <p className="text-muted-foreground mt-2 max-w-xs mb-6">
                        You need to register a student before you can sign them up for activities.
                    </p>
                    <Link href="/register">
                        <Button className="flex items-center gap-2">
                            <PlusCircle className="h-4 w-4" />
                            Register a Student
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-8">
            <div className="grid gap-4 sm:grid-cols-2">
                {students.map((student) => (
                    <div
                        key={student.id}
                        onClick={() => setSelectedStudentId(student.id)}
                        className={cn(
                            "relative p-5 rounded-2xl border-2 transition-all cursor-pointer hover:shadow-md",
                            selectedStudentId === student.id
                                ? "border-primary bg-primary/5 ring-1 ring-primary"
                                : "border-muted hover:border-primary/30"
                        )}
                    >
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    "h-10 w-10 rounded-full flex items-center justify-center font-bold",
                                    selectedStudentId === student.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                                )}>
                                    {student.firstName[0]}{student.lastName[0]}
                                </div>
                                <div>
                                    <h4 className="font-bold text-base">{student.firstName} {student.lastName}</h4>
                                    <p className="text-xs text-muted-foreground">{student.grade || "No grade specified"}</p>
                                </div>
                            </div>
                            {selectedStudentId === student.id && <Check className="h-5 w-5 text-primary" />}
                        </div>
                    </div>
                ))}
            </div>

            {error && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-xl font-medium">
                    {error}
                </div>
            )}

            <Button
                onClick={handleSubmit}
                disabled={!selectedStudentId || isSubmitting}
                className="w-full h-12 text-lg font-bold shadow-lg shadow-primary/20 group"
            >
                {isSubmitting ? "Processing..." : "Continue to Payment"}
                <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>

            <p className="text-center text-xs text-muted-foreground">
                By continuing, you agree to the activity participation terms and conditions.
            </p>
        </div>
    );
}
