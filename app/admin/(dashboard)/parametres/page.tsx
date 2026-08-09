import type { Metadata } from 'next';
import { Settings, ShieldCheck, CreditCard, Globe } from 'lucide-react';

export const metadata: Metadata = { title: 'Paramètres' };

export default function AdminParametresPage() {
  const stripeConfigured = !!process.env.STRIPE_SECRET_KEY;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  return (
    <div>
      <h1 className="mb-6 flex items-center gap-2 text-2xl font-extrabold text-ink-900">
        <Settings className="h-6 w-6 text-canal-600" />
        Paramètres
      </h1>

      <div className="max-w-2xl space-y-5">
        <div className="rounded-2xl border border-ink-100 bg-white p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-canal-600" />
            <h2 className="font-bold text-ink-900">Authentification administrateur</h2>
          </div>
          <p className="mt-2 text-sm text-ink-500">
            L'accès administrateur est protégé par un mot de passe défini dans la variable
            d'environnement <code className="rounded bg-sand-200 px-1 py-0.5 text-xs">ADMIN_PASSWORD</code>.
            Le cookie de session est signé avec{' '}
            <code className="rounded bg-sand-200 px-1 py-0.5 text-xs">ADMIN_SESSION_SECRET</code>{' '}
            et expire après 8 heures. Les tentatives de connexion sont limitées à 5 par fenêtre de
            15 minutes par adresse IP.
          </p>
        </div>

        <div className="rounded-2xl border border-ink-100 bg-white p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <CreditCard className="h-5 w-5 text-canal-600" />
            <h2 className="font-bold text-ink-900">Paiement Stripe</h2>
          </div>
          <p className="mt-2 text-sm text-ink-500">
            {stripeConfigured ? (
              <span className="font-semibold text-canal-600">Stripe est configuré.</span>
            ) : (
              <span className="font-semibold text-brick-500">Stripe n'est pas configuré.</span>
            )}{' '}
            Les frais de visite sont réglés via Stripe Checkout (carte bancaire / iDEAL). Ajoutez
            vos clés Stripe dans{' '}
            <code className="rounded bg-sand-200 px-1 py-0.5 text-xs">.env.local</code> pour
            activer le paiement en ligne.
          </p>
        </div>

        <div className="rounded-2xl border border-ink-100 bg-white p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <Globe className="h-5 w-5 text-canal-600" />
            <h2 className="font-bold text-ink-900">URL du site</h2>
          </div>
          <p className="mt-2 text-sm text-ink-500">
            URL publique configurée :{' '}
            <code className="rounded bg-sand-200 px-1 py-0.5 text-xs">{siteUrl}</code>
          </p>
          <p className="mt-1 text-xs text-ink-400">
            Cette valeur est utilisée pour le SEO, les redirections Stripe et les liens dans les
            confirmations. Modifiez{' '}
            <code className="rounded bg-sand-200 px-1 py-0.5 text-xs">NEXT_PUBLIC_SITE_URL</code>{' '}
            dans <code>.env.local</code>.
          </p>
        </div>
      </div>
    </div>
  );
}
