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
      const result = await togglePropertyPublish(id, !isPublished);
      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  }

  function handleStatusChange(newStatus: PropertyStatus) {
    startTransition(async () => {
      const result = await updatePropertyStatus(id, newStatus);
      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        value={status}
        onChange={(e) => handleStatusChange(e.target.value as PropertyStatus)}
        disabled={isPending}
        className="!h-9 w-auto min-w-[8.5rem] text-xs"
      >
        <option value="draft">Brouillon</option>
        <option value="available">Disponible</option>
        <option value="reserved">Réservé</option>
        <option value="rented">Loué</option>
        <option value="unavailable">Indisponible</option>
      </Select>

      <Button variant="outline" size="sm" onClick={handleTogglePublish} disabled={isPending}>
        {isPublished ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
        {isPublished ? 'Dépublier' : 'Publier'}
      </Button>

      <Link href={`/admin/appartements/${id}`}>
        <Button variant="outline" size="sm">
          <Pencil className="h-3.5 w-3.5" />
          Modifier
        </Button>
      </Link>

      <ConfirmDeleteButton
        action={() => deleteProperty(id)}
        confirmTitle="Supprimer cet appartement ?"
        confirmDescription="Cette action est irréversible et supprimera également toutes les photos associées."
      />
    </div>
  );
}
