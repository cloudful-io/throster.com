'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
    Calendar,
    Plus,
    MoreHorizontal,
    Trash2,
    CheckCircle2,
    CalendarCheck,
    Edit3
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { deleteAcademicYearAction, setActiveAcademicYearAction } from '@/app/actions';
import { useRouter } from 'next/navigation';
import AcademicYearForm from './AcademicYearForm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function AcademicYearManager({
    tenantId,
    academicYears
}: {
    tenantId: string;
    academicYears: any[];
}) {
    const [selectedYear, setSelectedYear] = useState<any>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const router = useRouter();

    const handleSetActive = async (id: string) => {
        try {
            const result = await setActiveAcademicYearAction(tenantId, id);
            if (result.success) {
                router.refresh();
            }
        } catch (err) {
            console.error('Failed to set active year:', err);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this academic year? All associated scheduled classes might be affected.')) return;

        setIsDeleting(id);
        try {
            const result = await deleteAcademicYearAction(id);
            if (result.success) {
                router.refresh();
            }
        } catch (err) {
            console.error('Failed to delete year:', err);
        } finally {
            setIsDeleting(null);
        }
    };

    const handleEdit = (year: any) => {
        setSelectedYear(year);
        setIsFormOpen(true);
    };

    const handleAdd = () => {
        setSelectedYear(null);
        setIsFormOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
                    <CalendarCheck className="h-6 w-6 text-primary" />
                    School Calendar
                </h2>
                <Button onClick={handleAdd} className="font-black bg-primary shadow-lg shadow-primary/20">
                    <Plus className="h-4 w-4 mr-2" />
                    New Academic Year
                </Button>
            </div>

            <Card className="border-2 shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50">
                        <TableRow>
                            <TableHead className="font-bold text-slate-900">Name</TableHead>
                            <TableHead className="font-bold text-slate-900">Duration</TableHead>
                            <TableHead className="font-bold text-slate-900">Status</TableHead>
                            <TableHead className="font-bold text-slate-900 text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {academicYears.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-20">
                                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                        <Calendar className="h-10 w-10 opacity-20" />
                                        <p className="font-bold">No academic years defined yet.</p>
                                        <Button variant="link" onClick={handleAdd}>Create your first season</Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            academicYears.map((ay) => (
                                <TableRow key={ay.id} className={ay.isActive ? 'bg-primary/5' : ''}>
                                    <TableCell className="font-black text-lg">{ay.name}</TableCell>
                                    <TableCell className="font-medium text-muted-foreground">
                                        {new Date(ay.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} -
                                        {new Date(ay.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                    </TableCell>
                                    <TableCell>
                                        {ay.isActive ? (
                                            <Badge className="bg-emerald-500 hover:bg-emerald-600 font-bold uppercase tracking-widest text-[10px] px-3">
                                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                                Currently Active
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="font-bold uppercase tracking-widest text-[10px] px-3">
                                                Inactive
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-56 border-2 shadow-xl">
                                                <DropdownMenuLabel className="font-black">Calendar Options</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                {!ay.isActive && (
                                                    <DropdownMenuItem onClick={() => handleSetActive(ay.id)} className="font-bold text-primary">
                                                        <CheckCircle2 className="mr-2 h-4 w-4" />
                                                        Set as Active Year
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuItem onClick={() => handleEdit(ay)} className="font-bold">
                                                    <Edit3 className="mr-2 h-4 w-4" />
                                                    Edit Dates
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    onClick={() => handleDelete(ay.id)}
                                                    className="font-bold text-destructive"
                                                    disabled={isDeleting === ay.id}
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    {isDeleting === ay.id ? 'Deleting...' : 'Delete Year'}
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Card>

            <AcademicYearForm
                tenantId={tenantId}
                initialData={selectedYear}
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
            />
        </div>
    );
}
