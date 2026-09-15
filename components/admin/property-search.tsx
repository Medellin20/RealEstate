'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';

export function PropertySearch({ search }: { search: string }) {
  const router = useRouter();
  const [value, setValue] = useState(search);
  const [pending, startTransition] = useTransition();
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const input = useRef<HTMLInputElement>(null);
  const submitted = useRef(search);

  useEffect(() => {
    setValue((current) => current === submitted.current ? search : current);
  }, [search]);

  useEffect(() => () => clearTimeout(timer.current), []);

  function navigate(next: string) {
    submitted.current = next;
    const params = new URLSearchParams();
    if (next.trim()) params.set('search', next.trim());
    startTransition(() => {
      router.replace(`/admin/appartements${params.size ? `?${params}` : ''}`, { scroll: false });
    });
  }

  function update(next: string) {
    setValue(next);
    clearTimeout(timer.current);
    if (!next.trim()) navigate(next);
    else timer.current = setTimeout(() => navigate(next), 250);
  }

  return (
    <form role="search" className="mb-5 w-full" onSubmit={(event) => {
      event.preventDefault();
      clearTimeout(timer.current);
      navigate(value);
    }}>
      <div className="relative">
        <Search aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
        <Input ref={input} type="text" name="search" value={value}
          onChange={(event) => update(event.target.value)}
          aria-label="Rechercher un appartement" aria-describedby="property-search-help"
          placeholder="Rechercher un appartement…" autoComplete="off" className="pl-10 pr-20" />
        <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
          {pending && <Loader2 aria-label="Recherche en cours" className="h-4 w-4 animate-spin text-ink-400" />}
          {value && <button type="button" aria-label="Effacer la recherche"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-500 hover:bg-sand-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink-700"
            onClick={() => { update(''); input.current?.focus(); }}>
            <X aria-hidden="true" className="h-4 w-4" />
          </button>}
        </div>
      </div>
      <p id="property-search-help" className="mt-2 text-xs text-ink-500">
        Titre, ville, quartier, adresse, code postal, identifiant ou prix.
      </p>
    </form>
  );
}
