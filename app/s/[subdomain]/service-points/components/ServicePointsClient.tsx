'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    Award,
    Calendar,
    Users,
    ArrowRight,
    HandHelping,
    Sparkles,
    Coins,
    CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { logServicePointAction, applyServicePointsAction } from '@/app/actions';
import { ServicePointDefContext, EnrollmentDetail } from '@/lib/tenant';
import { useRouter } from 'next/navigation';

export default function ServicePointsClient({
    tenantId,
    parentId,
    definitions,
    totalPoints,
    enrollments,
    pointsRate
}: {
    tenantId: string;
    parentId: string;
    definitions: ServicePointDefContext[];
    totalPoints: number;
    enrollments: EnrollmentDetail[];
    pointsRate: number;
}) {
    const [isSubmitting, setIsSubmitting] = useState<string | null>(null);
    const router = useRouter();

    const handleJoin = async (def: ServicePointDefContext) => {
        setIsSubmitting(def.id);
        const formData = new FormData();
        formData.append('definitionId', def.id);
        formData.append('participantId', parentId);
        formData.append('points', def.pointsValue.toString());

        try {
            const result = await logServicePointAction(formData);
            if (result.success) {
                router.refresh();
            } else {
                alert(result.error || 'Failed to join activity.');
            }
        } catch (err) {
            alert('An error occurred.');
        } finally {
            setIsSubmitting(null);
        }
    };

    const handleApply = async (enrollmentId: string) => {
        const points = prompt("How many points would you like to apply?", Math.min(totalPoints, 10).toString());
        if (!points) return;

        const numPoints = parseInt(points, 10);
        if (isNaN(numPoints) || numPoints <= 0 || numPoints > totalPoints) {
            alert("Please enter a valid amount of points.");
            return;
        }

        setIsSubmitting(enrollmentId);
        const formData = new FormData();
        formData.append('enrollmentId', enrollmentId);
        formData.append('parentId', parentId);
        formData.append('points', numPoints.toString());

        try {
            const result = await applyServicePointsAction(formData);
            if (result.success) {
                router.refresh();
            } else {
                alert(result.error || 'Failed to apply points.');
            }
        } catch (err) {
            alert('An error occurred.');
        } finally {
            setIsSubmitting(null);
        }
    };

    return (
        <div className="container max-w-6xl mx-auto py-12 px-4 space-y-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-indigo-600 rounded-3xl p-8 text-white shadow-xl shadow-indigo-600/20">
                <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/30 text-indigo-100 text-xs font-bold uppercase tracking-wider">
                        <Sparkles className="h-3 w-3" />
                        Community Rewards
                    </div>
                    <h1 className="text-3xl font-black tracking-tight">Your Service Points</h1>
                    <p className="text-indigo-100/80">Support our school and earn credits toward your tuition.</p>
                </div>
                <div className="flex items-center gap-6 bg-white/10 p-6 rounded-2xl border border-white/20 backdrop-blur-sm shrink-0">
                    <div className="text-center">
                        <div className="text-sm font-bold uppercase tracking-tighter text-indigo-200">Total Points</div>
                        <div className="text-4xl font-black">{totalPoints}</div>
                    </div>
                    <div className="h-10 w-px bg-white/20" />
                    <div className="text-center">
                        <div className="text-sm font-bold uppercase tracking-tighter text-indigo-200">Value</div>
                        <div className="text-4xl font-black">${((totalPoints * pointsRate) / 100).toLocaleString()}</div>
                    </div>
                </div>
            </div>

            <div className="grid gap-12 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-8">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold flex items-center gap-3">
                            <HandHelping className="h-7 w-7 text-indigo-600" />
                            Volunteer Opportunities
                        </h2>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2">
                        {definitions.length === 0 ? (
                            <div className="col-span-full py-20 bg-muted/30 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-center">
                                <HandHelping className="h-12 w-12 text-muted-foreground/20 mb-3" />
                                <h3 className="text-lg font-bold">No current opportunities</h3>
                                <p className="text-sm text-muted-foreground">Check back soon for new ways to get involved.</p>
                            </div>
                        ) : (
                            definitions.map((def) => {
                                const isFull = !!(def.maxSignups && def.participantCount >= def.maxSignups);
                                return (
                                    <Card key={def.id} className="relative overflow-hidden border-2 group hover:border-indigo-300 transition-all">
                                        <CardHeader className="pb-3">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="h-9 w-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                                    <Award className="h-5 w-5" />
                                                </div>
                                                <div className="bg-slate-100 px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest text-slate-500">
                                                    +{def.pointsValue} Points
                                                </div>
                                            </div>
                                            <CardTitle className="text-lg font-bold group-hover:text-indigo-600 transition-colors leading-tight">{def.name}</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <p className="text-xs text-muted-foreground line-clamp-3 min-h-[3rem]">
                                                {def.description || "Help support our school community through this volunteer activity."}
                                            </p>

                                            <div className="flex items-center justify-between text-[11px] font-bold">
                                                <div className="flex items-center gap-1.5 text-slate-500">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    {def.eventDate ? new Date(def.eventDate).toLocaleDateString() : 'Continuous'}
                                                </div>
                                                <div className={isFull ? "text-rose-500" : "text-indigo-600"}>
                                                    {def.participantCount}{def.maxSignups ? ` / ${def.maxSignups}` : ''} Volunteers
                                                </div>
                                            </div>

                                            <Button
                                                disabled={isFull || isSubmitting === def.id}
                                                onClick={() => handleJoin(def)}
                                                className="w-full h-10 font-bold bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/20"
                                            >
                                                {isFull ? "Fully Booked" : isSubmitting === def.id ? "Joining..." : "Sign Up to Help"}
                                                {!isFull && !isSubmitting && <ArrowRight className="h-4 w-4 ml-2" />}
                                            </Button>
                                        </CardContent>
                                    </Card>
                                );
                            })
                        )}
                    </div>
                </div>

                <div className="space-y-8">
                    <Card className="border-2 shadow-xl overflow-hidden">
                        <div className="h-2 bg-indigo-600" />
                        <CardHeader className="bg-muted/50 border-b">
                            <CardTitle className="flex items-center gap-2">
                                <Coins className="h-5 w-5 text-indigo-600" />
                                Tuition Discounts
                            </CardTitle>
                            <CardDescription>Apply earned points to tuition.</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-8 space-y-6">
                            {enrollments.length === 0 ? (
                                <p className="text-sm text-muted-foreground italic text-center py-4">
                                    No active enrollments found.
                                </p>
                            ) : (
                                <div className="space-y-6">
                                    {enrollments.map((e) => (
                                        <div key={e.id} className="space-y-3 p-4 rounded-2xl border bg-slate-50 dark:bg-slate-900/50">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="text-xs font-black uppercase tracking-tighter text-indigo-600">{e.className}</div>
                                                    <div className="font-bold">{e.studentName}</div>
                                                </div>
                                            </div>
                                            <div className="flex justify-between text-xs border-t pt-3">
                                                <span className="text-muted-foreground font-medium">Fee: ${(e.feeCents / 100).toLocaleString()}</span>
                                                <span className="font-black text-green-600">Credit: -${(e.discountCents / 100).toLocaleString()}</span>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full h-9 font-bold border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                                                onClick={() => handleApply(e.id)}
                                                disabled={totalPoints <= 0 || isSubmitting === e.id}
                                            >
                                                {isSubmitting === e.id ? "Applying..." : "Apply Points"}
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="pt-4 border-t text-center">
                                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest leading-relaxed">
                                    1 Point = ${(pointsRate / 100).toFixed(2)} Tuition Credit
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
