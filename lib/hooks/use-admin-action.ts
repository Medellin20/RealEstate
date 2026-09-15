'use client';

import { useRef, useState } from 'react';
import { toast } from 'sonner';

/** Keep controls locked for the entire request, including on React 18. */
export function useAdminAction() {
  const busy = useRef(false);
  const [isSaving, setIsSaving] = useState(false);

  async function run(action: () => Promise<void>) {
    if (busy.current) return;
    busy.current = true;
    setIsSaving(true);
    try {
      await action();
    } catch {
      toast.error('Verbinding mislukt. Probeer het opnieuw.');
    } finally {
      busy.current = false;
      setIsSaving(false);
    }
  }

  return [isSaving, run] as const;
}
