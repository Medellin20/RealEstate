import type { Metadata } from 'next';
import { LegalPage } from '@/components/shared/legal-page';

export const metadata: Metadata = { title: 'Mentions légales' };

export default function MentionsLegalesPage() {
  return (
    <LegalPage title="Mentions légales" updatedAt="7 septembre 2026">
      <h2>Éditeur du site</h2>
      <p>
        Le site Real Estate NL est édité par <strong>NL Real Estate B.V.</strong>, makelaardij
        fondée en 2006, inscrite auprès de la Kamer van Koophandel sous le numéro{' '}
        <strong>KvK 34253699</strong>.
      </p>
      <p>
        Siège : Gustav Mahlerplein 64, Unit A, 1082 MA Amsterdam, Pays-Bas.<br />
        Numéro de coffre : NL02139484.
      </p>

      <h2>Hébergement</h2>
      <p>
        L’application est hébergée sur une infrastructure cloud et les données sont stockées via
        Supabase (PostgreSQL).
      </p>

      <h2>Propriété intellectuelle</h2>
      <p>
        L’ensemble des contenus présents sur ce site (textes, photographies, logo, charte graphique)
        est protégé par le droit d’auteur. Toute reproduction, même partielle, est interdite sans
        autorisation préalable.
      </p>

      <h2>Responsabilité</h2>
      <p>
        Real Estate NL s’efforce d’assurer l’exactitude des informations diffusées sur ce site mais
        ne saurait être tenue responsable des erreurs, omissions ou indisponibilités temporaires.
      </p>

      <h2>Contact</h2>
      <p>Pour toute question relative aux présentes mentions légales : contacts@realestatenl.agency</p>
    </LegalPage>
  );
}
