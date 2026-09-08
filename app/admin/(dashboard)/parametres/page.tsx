import type { Metadata } from 'next';
import { getSiteUrl } from '@/lib/utils/site-url';
import { Settings, ShieldCheck, ClipboardCheck, Globe } from 'lucide-react';

export const metadata: Metadata = { title: 'Instellingen' };

export default function AdminParametresPage() {
  const siteUrl = getSiteUrl();

  return (
    <div>
      <h1 className="mb-6 flex items-center gap-2 text-2xl font-extrabold text-ink-900">
        <Settings className="h-6 w-6 text-canal-600" />
        Instellingen
      </h1>

      <div className="max-w-2xl space-y-5">
        <div className="rounded-2xl border border-ink-100 bg-white p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-canal-600" />
            <h2 className="font-bold text-ink-900">Beheerdersauthenticatie</h2>
          </div>
          <p className="mt-2 text-sm text-ink-500">
            De toegang tot de beheeromgeving wordt beschermd door een wachtwoord in de variabele
            d’environnement <code className="rounded bg-sand-200 px-1 py-0.5 text-xs">ADMIN_PASSWORD</code>.
            De sessiecookie wordt ondertekend met{' '}
            <code className="rounded bg-sand-200 px-1 py-0.5 text-xs">ADMIN_SESSION_SECRET</code>{' '}
            en verloopt na 8 uur. Aanmeldpogingen zijn beperkt tot 5 per periode van 15 minuten
            per IP-adres.
          </p>
        </div>

        <div className="rounded-2xl border border-ink-100 bg-white p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <ClipboardCheck className="h-5 w-5 text-canal-600" />
            <h2 className="font-bold text-ink-900">Aanvragen verwerken</h2>
          </div>
          <p className="mt-2 text-sm text-ink-500">
            Bezichtigings- en reserveringsaanvragen worden zonder betaling geregistreerd. Het team
            beoordeelt ze in de beheeromgeving en organiseert de volgende stappen handmatig.
          </p>
        </div>

        <div className="rounded-2xl border border-ink-100 bg-white p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <Globe className="h-5 w-5 text-canal-600" />
            <h2 className="font-bold text-ink-900">URL van de site</h2>
          </div>
          <p className="mt-2 text-sm text-ink-500">
            Geconfigureerde publieke URL:{' '}
            <code className="rounded bg-sand-200 px-1 py-0.5 text-xs">{siteUrl}</code>
          </p>
          <p className="mt-1 text-xs text-ink-400">
            Deze waarde wordt gebruikt voor SEO en bevestigingslinks. Wijzig{' '}
            <code className="rounded bg-sand-200 px-1 py-0.5 text-xs">NEXT_PUBLIC_site_URL</code>{' '}
            in <code>.env.local</code>.
          </p>
        </div>
      </div>
    </div>
  );
}
