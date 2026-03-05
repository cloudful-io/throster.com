'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    SchoolClassContext,
    TenantContext,
    UserContext
} from '@/lib/tenant';
import {
    ChevronRight,
    ChevronLeft,
    Check,
    Calendar,
    Users,
    DollarSign,
    CreditCard
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { createRegistrationAction } from '@/app/actions';

type Step = 'student' | 'class' | 'payment';

export default function RegistrationForm({
    tenant,
    classes,
    parentProfile
}: {
    tenant: TenantContext;
    classes: SchoolClassContext[];
    parentProfile: UserContext;
}) {
    const [step, setStep] = useState<Step>('student');
    const [studentData, setStudentData] = useState({
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        grade: ''
    });
    const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const selectedClass = classes.find(c => c.id === selectedClassId);

    const nextStep = () => {
        if (step === 'student') setStep('class');
        else if (step === 'class') setStep('payment');
    };

    const prevStep = () => {
        if (step === 'class') setStep('student');
        else if (step === 'payment') setStep('class');
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('tenantId', tenant.id);
            formData.append('subdomain', tenant.subdomain);
            formData.append('parentId', parentProfile.id);
            formData.append('studentFirstName', studentData.firstName);
            formData.append('studentLastName', studentData.lastName);
            formData.append('dateOfBirth', studentData.dateOfBirth);
            formData.append('grade', studentData.grade);
            formData.append('classId', selectedClassId || '');

            const result = await createRegistrationAction(formData);

            if (result.success && result.checkoutUrl) {
                window.location.href = result.checkoutUrl;
            } else {
                setError(result.error || 'Failed to initiate registration.');
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Progress Bar */}
            <div className="flex items-center justify-between mb-8 max-w-2xl mx-auto px-4">
                {[
                    { id: 'student', label: 'Student info' },
                    { id: 'class', label: 'Select class' },
                    { id: 'payment', label: 'Payment' }
                ].map((s, i) => (
                    <div key={s.id} className="flex items-center">
                        <div className={cn(
                            "flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors",
                            step === s.id ? "bg-primary border-primary text-primary-foreground" :
                                (i < ['student', 'class', 'payment'].indexOf(step) ? "bg-primary/20 border-primary text-primary" : "border-muted text-muted-foreground font-medium")
                        )}>
                            {i < ['student', 'class', 'payment'].indexOf(step) ? <Check className="h-4 w-4" /> : i + 1}
                        </div>
                        <span className={cn(
                            "ml-2 text-sm font-medium hidden sm:inline",
                            step === s.id ? "text-primary" : "text-muted-foreground"
                        )}>
                            {s.label}
                        </span>
                        {i < 2 && <div className="mx-4 h-[2px] w-8 sm:w-16 bg-muted shrink-0" />}
                    </div>
                ))}
            </div>

            <Card className="border-2 shadow-xl overflow-hidden animate-in fade-in zoom-in duration-300">
                <CardHeader className="bg-primary/5 border-b">
                    <CardTitle className="text-2xl">
                        {step === 'student' && "Tell us about your student"}
                        {step === 'class' && "Choose a class"}
                        {step === 'payment' && "Complete your registration"}
                    </CardTitle>
                    <CardDescription>
                        {step === 'student' && "Enter the details of the child you're registering."}
                        {step === 'class' && "Select the class your student will attend this semester."}
                        {step === 'payment' && "Review your registration and proceed to secure payment."}
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-6 sm:p-8">
                    {/* Step 1: Student Details */}
                    {step === 'student' && (
                        <div className="grid gap-6 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="firstName">First Name</Label>
                                <Input
                                    id="firstName"
                                    placeholder="Enter first name"
                                    value={studentData.firstName}
                                    onChange={(e) => setStudentData({ ...studentData, firstName: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName">Last Name</Label>
                                <Input
                                    id="lastName"
                                    placeholder="Enter last name"
                                    value={studentData.lastName}
                                    onChange={(e) => setStudentData({ ...studentData, lastName: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                                <Input
                                    id="dateOfBirth"
                                    type="date"
                                    value={studentData.dateOfBirth}
                                    onChange={(e) => setStudentData({ ...studentData, dateOfBirth: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="grade">Current Grade (School)</Label>
                                <Input
                                    id="grade"
                                    placeholder="e.g. 3rd Grade"
                                    value={studentData.grade}
                                    onChange={(e) => setStudentData({ ...studentData, grade: e.target.value })}
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 2: Class Selection */}
                    {step === 'class' && (
                        <div className="grid gap-4 sm:grid-cols-2">
                            {classes.length === 0 ? (
                                <div className="sm:col-span-2 text-center py-12">
                                    <p className="text-muted-foreground font-medium">No classes are currently available for registration.</p>
                                </div>
                            ) : (
                                classes.map((cls) => (
                                    <div
                                        key={cls.id}
                                        onClick={() => setSelectedClassId(cls.id)}
                                        className={cn(
                                            "relative p-4 rounded-xl border-2 transition-all cursor-pointer hover:shadow-md",
                                            selectedClassId === cls.id
                                                ? "border-primary bg-primary/5 ring-1 ring-primary"
                                                : "border-muted hover:border-primary/30"
                                        )}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-bold text-lg">{cls.name}</h4>
                                            {selectedClassId === cls.id && <Check className="h-5 w-5 text-primary" />}
                                        </div>
                                        <p className="text-xs text-muted-foreground line-clamp-2 mb-4">{cls.description}</p>
                                        <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs font-medium text-slate-600">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="h-3.5 w-3.5" />
                                                <span>{cls.schedule?.day}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Users className="h-3.5 w-3.5" />
                                                <span>{cls.enrollmentCount} / {cls.maxStudents}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 font-bold text-primary">
                                                <DollarSign className="h-3.5 w-3.5" />
                                                <span>${(cls.feeCents / 100).toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* Step 3: Payment Summary */}
                    {step === 'payment' && selectedClass && (
                        <div className="space-y-6">
                            <div className="bg-muted px-4 py-8 rounded-xl space-y-4">
                                <h4 className="font-semibold text-center text-muted-foreground uppercase text-xs tracking-wider">Registration Summary</h4>
                                <div className="flex justify-between items-center border-b border-muted-foreground/10 pb-3">
                                    <span className="text-muted-foreground">Student</span>
                                    <span className="font-bold">{studentData.firstName} {studentData.lastName}</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-muted-foreground/10 pb-3">
                                    <span className="text-muted-foreground">Class</span>
                                    <span className="font-bold">{selectedClass.name}</span>
                                </div>
                                <div className="flex justify-between items-center pt-2">
                                    <span className="text-lg font-bold">Total Amount</span>
                                    <span className="text-2xl font-black text-primary">${(selectedClass.feeCents / 100).toFixed(2)}</span>
                                </div>
                            </div>

                            {error && (
                                <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg text-center font-medium">
                                    {error}
                                </div>
                            )}

                            <div className="flex flex-col items-center gap-4 text-center">
                                <div className="p-4 bg-primary/5 rounded-full">
                                    <CreditCard className="h-8 w-8 text-primary" />
                                </div>
                                <div>
                                    <p className="font-medium">You will be redirected to Stripe for secure payment.</p>
                                    <p className="text-xs text-muted-foreground mt-1">Your registration is not complete until payment is received.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-between gap-4 mt-8 pt-6 border-t">
                        {step !== 'student' && (
                            <Button variant="outline" onClick={prevStep} disabled={isSubmitting}>
                                <ChevronLeft className="h-4 w-4 mr-2" />
                                Previous
                            </Button>
                        )}
                        <div className="flex-1" />

                        {step === 'student' && (
                            <Button
                                onClick={nextStep}
                                disabled={!studentData.firstName || !studentData.lastName || !studentData.dateOfBirth}
                            >
                                Continue to Selection
                                <ChevronRight className="h-4 w-4 ml-2" />
                            </Button>
                        )}

                        {step === 'class' && (
                            <Button onClick={nextStep} disabled={!selectedClassId}>
                                Continue to Payment
                                <ChevronRight className="h-4 w-4 ml-2" />
                            </Button>
                        )}

                        {step === 'payment' && (
                            <Button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="px-8 shadow-lg shadow-primary/20"
                            >
                                {isSubmitting ? "Initiating..." : "Pay & Complete Registration"}
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
