'use client';

import * as React from 'react';
import { ChevronDown, Globe2 } from 'lucide-react';
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

      // Google injecte le <select> après l'initialisation. On mémorise
      // explicitement le choix avec un cookie valable sur tout le site.
      const container = document.getElementById(id);
      const bindLanguageSelect = () => {
        const select = container?.querySelector<HTMLSelectElement>('.goog-te-combo');
        if (!select || select.dataset.languageBound === 'true') return Boolean(select);
        select.dataset.languageBound = 'true';
        select.setAttribute('aria-label', 'Choisir la langue du site');
        select.addEventListener('change', () => {
          const language = select.value || 'fr';
          document.cookie = `googtrans=/fr/${language}; path=/; SameSite=Lax`;
        });
        return true;
      };

      if (!bindLanguageSelect() && container) {
        const observer = new MutationObserver(() => {
          if (bindLanguageSelect()) observer.disconnect();
        });
        observer.observe(container, { childList: true, subtree: true });
      }
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
      className={cn('language-translator relative inline-flex h-8 cursor-pointer items-center gap-1 rounded-full bg-sand-100 px-2 text-xs font-semibold text-ink-600 transition-colors hover:bg-sand-200', className)}
      aria-label="Choisir la langue du site"
    >
      <Globe2 className="h-3 w-3 shrink-0 text-canal-600" aria-hidden="true" />
      <span>Traduire</span>
      <ChevronDown className="h-3 w-3 shrink-0" aria-hidden="true" />
      <div id={id} className="absolute inset-0 opacity-0" />
    </div>
  );
}
