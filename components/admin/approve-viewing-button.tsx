'use client';

import * as React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { approveViewing } from '@/actions/admin-viewings';
import { Button } from '@/components/ui/button';

export function ApproveViewingButton({ viewingId }: { viewingId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();

  function handleApprove() {
    startTransition(async () => {
      try {
        const result = await approveViewing(viewingId);
        if (!result.success) {
          toast.error(result.message);
          return;
        }

        toast.success('Visite approuvée.');
        router.refresh();
      } catch {
        toast.error('Impossible d’approuver la visite. Réessayez.');
      }
    });
  }

  return (
    <Button type="button" size="sm" variant="secondary" isLoading={isPending} onClick={handleApprove}>
      <CheckCircle2 className="h-4 w-4" />
      Approuver la visite
    </Button>
  );
}
