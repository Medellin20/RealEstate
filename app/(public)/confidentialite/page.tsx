import type { Metadata } from 'next';
import { LegalPage } from '@/components/shared/legal-page';

export const metadata: Metadata = { title: 'Privacybeleid' };

export default function ConfidentialitePage() {
  return (
    <LegalPage title="Privacybeleid" updatedAt="21 augustus 2026">
      <h2>Verzamelde gegevens</h2>
      <p>
        In het kader van uw aanvragen (bezichtiging, reservering of contact) verzamelen wij uw naam,
        voornaam, e-mailadres, telefoonnummer en, indien van toepassing, beroep, geschat maandelijks
        inkomen en aanvullende informatie die u met ons deelt.
      </p>

      <h2>Doeleinden van verwerking</h2>
      <p>
        Deze gegevens worden uitsluitend gebruikt om uw bezichtigings- en reserveringsaanvragen te
        verwerken, uw huurdersdossier op te volgen en in dit kader contact met u op te nemen.
      </p>

      <h2>Bewaren van gegevens</h2>
      <p>
        Uw gegevens worden bewaard zolang dat nodig is voor de behandeling van uw dossier en daarna
        gearchiveerd volgens de toepasselijke wettelijke verplichtingen.
      </p>

      <h2>Uw rechten</h2>
      <p>
        Volgens de Algemene Verordening Gegevensbescherming (AVG) heeft u recht op inzage, correctie
        en verwijdering van uw gegevens. Neem voor het uitoefenen van deze rechten contact op via
        contacts@realestatenl.agency.
      </p>

      <h2>Cookies</h2>
      <p>
        Deze website gebruikt alleen lokale browseropslag om uw favorieten te onthouden; er worden
        geen cookies voor advertentietracking gebruikt.
      </p>
    </LegalPage>
  );
}
