import type { Metadata } from 'next';
import { Accordion } from '@/components/shared/accordion';
import { FadeIn } from '@/components/ui/fade-in';

export const metadata: Metadata = {
  title: 'FAQ',
  description: 'Veelgestelde vragen over bezichtigingen en reserveringen bij Real Estate NL.',
};

const CATEGORIES = [
  {
    title: 'Bezichtigingen',
    items: [
      {
        question: 'Hoe reserveer ik een bezichtiging?',
        answer:
          'Klik op de woningpagina op «Plan een bezichtiging», kies een datum en tijdstip en verstuur uw aanvraag. Ons team neemt daarna contact met u op om de afspraak te bevestigen.',
      },
      {
        question: 'Moet ik betalen om een aanvraag te versturen?',
        answer:
          'Nee. Voor het indienen van een bezichtigingsaanvraag is geen betaling of bankbewijs nodig op de website.',
      },
      {
        question: 'Kan ik de datum van mijn bezichtiging wijzigen?',
        answer:
          'Ja, neem via het contactformulier contact op met ons team en vermeld uw bezichtigingsreferentie. Wij stellen een nieuw beschikbaar tijdstip voor.',
      },
    ],
  },
  {
    title: 'Reserveringen',
    items: [
      {
        question: 'Wat gebeurt er nadat ik mijn reserveringsaanvraag heb verstuurd?',
        answer:
          'Ons team beoordeelt uw dossier (beroep, inkomen en gewenste duur), informeert u over de beslissing en regelt de volgende formaliteiten handmatig.',
      },
      {
        question: 'Welke documenten moet ik aanleveren?',
        answer:
          'Afhankelijk van de woning kunnen bij de afronding van uw dossier een identiteitsbewijs, inkomensbewijs en aanbevelingsbrief of garantstelling worden gevraagd.',
      },
    ],
  },
  {
    title: 'Termijnen',
    items: [
      {
        question: 'Wanneer ontvang ik antwoord op mijn aanvraag?',
        answer:
          'Wij beantwoorden bezichtigings- en reserveringsaanvragen doorgaans binnen 48 werkuren.',
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <div className="container-app py-14 sm:py-20">
      <FadeIn>
        <span className="text-eyebrow uppercase text-canal-600">Hulp</span>
        <h1 className="mt-2 text-display-sm font-extrabold text-ink-900 sm:text-display-md">
          Veelgestelde vragen
        </h1>
        <p className="mt-3 max-w-xl text-ink-500">
          Alles wat u moet weten over het aanvragen van een bezichtiging of reserveren van een woning.
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
