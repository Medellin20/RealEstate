'use client';

import Link from 'next/link';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="max-w-lg rounded-2xl border border-brick-200 bg-white p-6 text-center shadow-soft">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brick-50 text-brick-600">
          <AlertTriangle className="h-7 w-7" />
        </div>
        <h1 className="mt-4 text-xl font-extrabold text-ink-900">Deze pagina kan niet worden geladen</h1>
        <p className="mt-2 text-sm text-ink-500">
          De beheeromgeving blijft beschikbaar. U kunt rechtstreeks de bezichtigingsaanvragen openen of het opnieuw proberen.
        </p>
        {error.digest && <p className="mt-3 text-xs text-ink-400">Technische referentie: {error.digest}</p>}
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button type="button" onClick={reset}>
            <RefreshCcw className="h-4 w-4" />
            Opnieuw proberen
          </Button>
          <Link href="/admin/visites">
            <Button variant="outline" className="w-full">Bezichtigingen bekijken</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
