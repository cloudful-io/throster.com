'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Award } from 'lucide-react';
import ServicePointForm from './ServicePointForm';

export default function CreateServicePointButton({
    tenantId
}: {
    tenantId: string;
}) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20">
                    <Award className="h-4 w-4" />
                    New Activity
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-indigo-950 dark:text-indigo-100 uppercase tracking-tight">Define Service Activity</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    <ServicePointForm
                        tenantId={tenantId}
                        onSuccess={() => setOpen(false)}
                        onCancel={() => setOpen(false)}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}
