'use client';

import * as React from 'react';
import { Globe2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

declare global {
  interface Window {
    google?: {
      translate: {
        TranslateElement: new (
          options: Record<string, unknown>,
          elementId: string
        ) => void;
      };
    };
    realEstateTranslateReady?: () => void;
  }
}

const GOOGLE_TRANSLATE_SCRIPT = 'https://translate.google.com/translate_a/element.js?cb=realEstateTranslateReady';

export function LanguageTranslator({ id, className }: { id: string; className?: string }) {
  const initialized = React.useRef(false);

  React.useEffect(() => {
    const hasLanguagePreference = document.cookie.split(';').some((cookie) => cookie.trim().startsWith('googtrans='));
    if (!hasLanguagePreference) {
      document.cookie = 'googtrans=/fr/nl; path=/; SameSite=Lax';
    }

    const initialize = () => {
      if (initialized.current || !window.google?.translate || !document.getElementById(id)) return;

      new window.google.translate.TranslateElement(
        {
          pageLanguage: 'fr',
          includedLanguages: 'fr,nl,en,es,it,de,pt,ar,pl',
          autoDisplay: false,
        },
        id
      );
      initialized.current = true;
    };

    window.addEventListener('real-estate-translate-ready', initialize);

    if (window.google?.translate) {
      initialize();
    } else {
      window.realEstateTranslateReady = () => {
        window.dispatchEvent(new Event('real-estate-translate-ready'));
      };

      if (!document.querySelector(`script[src="${GOOGLE_TRANSLATE_SCRIPT}"]`)) {
        const script = document.createElement('script');
        script.src = GOOGLE_TRANSLATE_SCRIPT;
        script.async = true;
        script.onerror = () => window.removeEventListener('real-estate-translate-ready', initialize);
        document.head.appendChild(script);
      }
    }

    return () => window.removeEventListener('real-estate-translate-ready', initialize);
  }, [id]);

  return (
    <div
      className={cn('language-translator inline-flex h-9 items-center gap-1.5 rounded-full bg-sand-100 px-2 text-ink-600 transition-colors hover:bg-sand-200', className)}
      aria-label="Choisir la langue du site"
    >
      <Globe2 className="h-4 w-4 shrink-0 text-canal-600" aria-hidden="true" />
      <div id={id} />
    </div>
  );
}
