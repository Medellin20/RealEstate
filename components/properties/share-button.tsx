'use client';

import { Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

export function ShareButton({ title }: { title: string }) {
  async function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // partage annulé par l'utilisateur — pas d'erreur à afficher
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link gekopieerd naar klembord');
    } catch {
      toast.error('Link kopiëren mislukt');
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleShare}>
      <Share2 className="h-3.5 w-3.5" />
      Delen
    </Button>
  );
}
