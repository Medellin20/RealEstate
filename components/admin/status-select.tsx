'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Select } from '@/components/ui/select';
import type { ActionResult } from '@/types';

export function StatusSelect<T extends string>({
  value,
  options,
  onUpdate,
}: {
  value: T;
  options: { value: T; label: string }[];
  onUpdate: (newStatus: T) => Promise<ActionResult>;
}) {
  const router = useRouter();
  const [isRefreshing, startTransition] = React.useTransition();
  const [isSaving, setIsSaving] = React.useState(false);
  const saving = React.useRef(false);

  async function handleChange(newStatus: T) {
    if (saving.current || newStatus === value) return;
    saving.current = true;
    setIsSaving(true);
    try {
      const result = await onUpdate(newStatus);
      if (result.success) {
        toast.success(result.message);
        startTransition(() => router.refresh());
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error('Verbinding mislukt. Probeer het opnieuw.');
    } finally {
      saving.current = false;
      setIsSaving(false);
    }
  }

  return (
    <Select
      value={value}
      disabled={isSaving || isRefreshing}
      onChange={(e) => handleChange(e.target.value as T)}
      className="!h-9 w-full min-w-0 text-xs sm:w-auto sm:min-w-[10rem]"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </Select>
  );
}
