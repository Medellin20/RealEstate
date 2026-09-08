import type { Metadata } from 'next';
import { LegalPage } from '@/components/shared/legal-page';

export const metadata: Metadata = { title: 'Juridische kennisgeving' };

export default function MentionsLegalesPage() {
  return (
    <LegalPage title="Juridische kennisgeving" updatedAt="7 september 2026">
      <h2>Website-uitgever</h2>
      <p>
        De website Real Estate NL wordt uitgegeven door <strong>NL Real Estate B.V.</strong>, makelaardij,
        opgericht in 2006 en ingeschreven bij de Kamer van Koophandel onder nummer{' '}
        <strong>KvK 34253699</strong>.
      </p>
      <p>
        Vestigingsadres: Gustav Mahlerplein 64, Unit A, 1082 MA Amsterdam, Nederland.<br />
        Kluisnummer: NL02139484.
      </p>

      <h2>Intellectueel eigendom</h2>
      <p>
        Alle inhoud op deze website (teksten, foto’s, logo en huisstijl) wordt beschermd door het
        auteursrecht. Elke reproductie, ook gedeeltelijk, is zonder voorafgaande toestemming verboden.
      </p>

      <h2>Aansprakelijkheid</h2>
      <p>
        Real Estate NL doet haar best om de juistheid van de informatie op deze website te waarborgen,
        maar kan niet aansprakelijk worden gesteld voor fouten, weglatingen of tijdelijke onbeschikbaarheid.
      </p>

      <h2>Contact</h2>
      <p>Voor vragen over deze juridische kennisgeving kunt u contact opnemen via contacts@realestatenl.agency.</p>
    </LegalPage>
  );
}
