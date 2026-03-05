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
import { Heart } from 'lucide-react';
import FundraisingForm from './FundraisingForm';

export default function CreateFundraisingButton({
    tenantId
}: {
    tenantId: string;
}) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white border-none shadow-lg shadow-rose-600/20">
                    <Heart className="h-4 w-4 fill-white" />
                    New Campaign
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">Launch Fundraising Campaign</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    <FundraisingForm
                        tenantId={tenantId}
                        onSuccess={() => setOpen(false)}
                        onCancel={() => setOpen(false)}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}
