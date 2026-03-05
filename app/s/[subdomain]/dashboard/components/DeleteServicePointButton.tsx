'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { deleteServicePointAction } from '@/app/actions';
import { useRouter } from 'next/navigation';

export default function DeleteServicePointButton({
    id,
    tenantId
}: {
    id: string;
    tenantId: string;
}) {
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to remove this activity?')) return;

        setIsDeleting(true);
        const formData = new FormData();
        formData.append('id', id);
        formData.append('tenantId', tenantId);

        try {
            const result = await deleteServicePointAction(formData);
            if (result.success) {
                router.refresh();
            } else {
                alert(result.error || 'Failed to delete activity.');
            }
        } catch (err) {
            alert('An error occurred.');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <Button
            variant="ghost"
            size="sm"
            className="w-full h-9 font-bold text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={handleDelete}
            disabled={isDeleting}
        >
            <Trash2 className="h-3.5 w-3.5 mr-2" />
            {isDeleting ? "Removing..." : "Remove"}
        </Button>
    );
}
