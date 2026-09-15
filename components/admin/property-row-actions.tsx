'use client';

import { useAdminAction } from '@/lib/hooks/use-admin-action';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Pencil, Eye, EyeOff } from 'lucide-react';
import { togglePropertyPublish, deleteProperty, updatePropertyStatus } from '@/actions/admin-properties';
import { ConfirmDeleteButton } from '@/components/admin/confirm-delete-button';
import { Button } from '@/components/ui/button';
import { StatusSelect } from '@/components/admin/status-select';
import type { PropertyStatus } from '@/types/database';

export function PropertyRowActions({
  id,
  isPublished,
  status,
}: {
  id: string;
  isPublished: boolean;
  status: PropertyStatus;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useAdminAction();

  function handleTogglePublish() {
    startTransition(async () => {
      try {
        const result = await togglePropertyPublish(id, !isPublished);
        if (result.success) {
          toast.success(result.message);
          router.refresh();
        } else toast.error(result.message);
      } catch {
        toast.error('Verbinding mislukt. Probeer het opnieuw.');
      }
    });
  }

  return (
    <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
      <StatusSelect
        value={status}
        onUpdate={(newStatus) => updatePropertyStatus(id, newStatus)}
        options={[
          { value: 'draft', label: 'Concept' },
          { value: 'available', label: 'Beschikbaar' },
          { value: 'reserved', label: 'Gereserveerd' },
          { value: 'rented', label: 'Verhuurd' },
          { value: 'unavailable', label: 'Niet beschikbaar' },
        ]}
      />

      <Button className="w-full sm:w-auto" variant="outline" size="sm" onClick={handleTogglePublish} disabled={isPending}>
        {isPublished ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
        {isPublished ? 'Dépublier' : 'Publier'}
      </Button>

      <Link href={`/admin/appartements/${id}`} className="w-full sm:w-auto">
        <Button className="w-full" variant="outline" size="sm">
          <Pencil className="h-3.5 w-3.5" />
          Modifier
        </Button>
      </Link>

      <ConfirmDeleteButton
        action={() => deleteProperty(id)}
        confirmTitle="verwijderen cet appartement ?"
        confirmDescription="deze action is irréversible en supprimera ook alle de photos associées."
      />
    </div>
  );
}
