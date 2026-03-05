'use client';

import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import ClassForm from './ClassForm';
import { SchoolClassContext, UserContext } from '@/lib/tenant';

export default function CreateClassButton({
    teachers,
    tenantId
}: {
    teachers: UserContext[];
    tenantId: string;
}) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Create New Class
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">Create New Class</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    <ClassForm
                        teachers={teachers}
                        tenantId={tenantId}
                        onCancel={() => setOpen(false)}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}
