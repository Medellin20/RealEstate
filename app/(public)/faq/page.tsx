import type { Metadata } from 'next';
import { Accordion } from '@/components/shared/accordion';
import { FadeIn } from '@/components/ui/fade-in';

export const metadata: Metadata = {
  title: 'FAQ',
  description: 'Questions fréquentes sur les visites, réservations, garanties et remboursements chez Real Estate NL.',
};

const CATEGORIES = [
  {
    title: 'Visites',
    items: [
      {
        question: 'Comment réserver une visite ?',
        answer:
          'Depuis la fiche d’un logement, cliquez sur « Réserver une visite », choisissez une date et un créneau horaire, renseignez vos coordonnées puis réglez les frais de visite en ligne.',
      },
      {
        question: 'Les frais de visite sont-ils remboursables ?',
        answer:
          'Les frais de visite couvrent l’organisation du rendez-vous et ne sont pas remboursés en cas d’annulation de votre part. Contactez notre équipe en cas d’empêchement pour envisager un report.',
      },
      {
        question: 'Puis-je changer la date de ma visite ?',
        answer:
          'Oui, contactez notre équipe via le formulaire de contact en indiquant votre référence de visite ; nous vous proposerons un nouveau créneau disponible.',
      },
    ],
  },
  {
    title: 'Réservation',
    items: [
      {
        question: 'Que se passe-t-il après l’envoi de ma demande de réservation ?',
        answer:
          'Notre équipe examine votre dossier (profession, revenus, durée souhaitée) puis vous informe de la décision. En cas d’acceptation, vous recevez les instructions pour verser la garantie de réservation.',
      },
      {
        question: 'Quels documents dois-je fournir ?',
        answer:
          'Selon le logement, une pièce d’identité, un justificatif de revenus et une lettre de recommandation ou de garant peuvent être demandés lors de la finalisation de votre dossier.',
      },
    ],
  },
  {
    title: 'Garantie',
    items: [
      {
        question: 'Comment verser la garantie de réservation ?',
        answer:
          'Une fois votre dossier accepté, les coordonnées bancaires et le montant à verser s’affichent dans votre espace client. Effectuez le virement en indiquant impérativement la référence fournie.',
      },
      {
        question: 'Comment savoir si mon virement a bien été reçu ?',
        answer:
          'Déclarez votre virement depuis votre espace client (« J’ai effectué le virement »). Notre équipe vérifie ensuite manuellement la réception et met à jour le statut de votre dossier.',
      },
    ],
  },
  {
    title: 'Remboursement',
    items: [
      {
        question: 'Puis-je récupérer ma garantie si je renonce au logement ?',
        answer:
          'Oui, vous pouvez demander le remboursement depuis votre espace client. Votre demande est ensuite examinée et traitée manuellement par notre équipe administrative.',
      },
      {
        question: 'Sous quel délai suis-je remboursé ?',
        answer:
          'Le traitement d’une demande de remboursement prend généralement quelques jours ouvrés une fois la demande approuvée par notre équipe.',
      },
    ],
  },
  {
    title: 'Délais',
    items: [
      {
        question: 'Sous quel délai recevrai-je une réponse à ma demande ?',
        answer:
          'Nous répondons généralement aux demandes de visite et de réservation sous 48 heures ouvrées.',
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <div className="container-app py-14 sm:py-20">
      <FadeIn>
        <span className="text-eyebrow uppercase text-canal-600">Aide</span>
        <h1 className="mt-2 text-display-sm font-extrabold text-ink-900 sm:text-display-md">
          Questions fréquentes
        </h1>
        <p className="mt-3 max-w-xl text-ink-500">
          Tout ce qu’il faut savoir sur les visites, la réservation, la garantie et le remboursement.
        </p>
      </FadeIn>

      <div className="mt-12 max-w-3xl space-y-10">
        {CATEGORIES.map((category, i) => (
          <FadeIn key={category.title} delay={i * 0.05}>
            <h2 className="mb-4 text-lg font-bold text-ink-900">{category.title}</h2>
            <Accordion items={category.items} />
          </FadeIn>
        ))}
      </div>
    </div>
  );
}
