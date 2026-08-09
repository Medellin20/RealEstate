import type { Metadata } from 'next';
import { LegalPage } from '@/components/shared/legal-page';

export const metadata: Metadata = { title: 'Conditions générales' };

export default function ConditionsGeneralesPage() {
  return (
    <LegalPage title="Conditions générales d’utilisation et de vente" updatedAt="9 août 2026">
      <h2>Objet</h2>
      <p>
        Les présentes conditions générales régissent l’utilisation du site Real Estate NL et les
        services de mise en relation pour la location d’appartements aux Pays-Bas.
      </p>

      <h2>Frais de visite</h2>
      <p>
        Toute demande de visite d’un logement peut être soumise à des frais de visite, dont le
        montant est indiqué sur la fiche du logement concerné avant tout paiement. Ces frais
        couvrent l’organisation du rendez-vous et ne sont pas remboursables, sauf annulation à
        l’initiative de Real Estate NL.
      </p>

      <h2>Garantie de réservation</h2>
      <p>
        La réservation d’un logement peut être conditionnée au versement d’une garantie par virement
        bancaire, dont le montant et les coordonnées sont communiqués individuellement à chaque
        client. Cette garantie sécurise la réservation du logement dans l’attente de la signature du
        contrat de location.
      </p>

      <h2>Remboursement</h2>
      <p>
        En cas de renonciation à la location après versement de la garantie, le client peut formuler
        une demande de remboursement depuis son espace client. Cette demande est examinée et traitée
        manuellement par notre équipe ; le remboursement effectif est réalisé par virement bancaire
        selon les délais habituels de traitement.
      </p>

      <h2>Responsabilité</h2>
      <p>
        Real Estate NL agit en tant qu’intermédiaire entre locataires et propriétaires ou
        gestionnaires de biens. Le contrat de location définitif est conclu directement entre le
        locataire et le bailleur du logement concerné.
      </p>

      <h2>Droit applicable</h2>
      <p>Les présentes conditions générales sont soumises au droit néerlandais.</p>
    </LegalPage>
  );
}
