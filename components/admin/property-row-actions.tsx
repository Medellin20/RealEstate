'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Pencil, Eye, EyeOff } from 'lucide-react';
import { togglePropertyPublish, deleteProperty, updatePropertyStatus } from '@/actions/admin-properties';
import { ConfirmDeleteButton } from '@/components/admin/confirm-delete-button';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
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
  const [isPending, startTransition] = React.useTransition();

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

  function handleStatusChange(newStatus: PropertyStatus) {
    startTransition(async () => {
      try {
        const result = await updatePropertyStatus(id, newStatus);
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
      <Select
        value={status}
        onChange={(e) => handleStatusChange(e.target.value as PropertyStatus)}
        disabled={isPending}
        className="!h-9 w-full min-w-0 text-xs sm:w-auto sm:min-w-[8.5rem]"
      >
        <option value="draft">Concept</option>
        <option value="available">Beschikbaar</option>
        <option value="reserved">Gereserveerd</option>
        <option value="rented">Verhuurd</option>
        <option value="unavailable">Niet beschikbaar</option>
      </Select>

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
