import type { Metadata } from 'next';
import { Search, CalendarClock, FileCheck2, KeyRound, Building2, PenTool } from 'lucide-react';
import { FadeIn } from '@/components/ui/fade-in';
import { SectionHeading } from '@/components/ui/section-heading';

export const metadata: Metadata = {
  title: 'Hoe werkt het',
  description: 'Ontdek de stappen om uw appartement in Nederland te vinden, bezichtigen en reserveren met Real Estate NL.',
};

const STEPS = [
  {
    icon: Search,
    title: 'Zoek een woning',
    description:
      'Filter onze catalogus op stad, budget, aantal slaapkamers en woningtype om passende advertenties te vinden.',
  },
  {
    icon: Building2,
    title: 'Kies een appartement',
    description:
      'Bekijk de foto’s, uitgebreide beschrijving, voorzieningen en globale locatie van elke woning.',
  },
  {
    icon: CalendarClock,
    title: 'reserveer een bezichtiging',
    description:
      'Kies een datum en tijdstip, vul uw gegevens in en verstuur vervolgens uw aanvraag.',
  },
  {
    icon: PenTool,
    title: 'Regel de formaliteiten',
    description:
      'Vul uw huurdersdossier aan met uw beroep, inkomen, gewenste huurperiode en aantal bewoners.',
  },
  {
    icon: FileCheck2,
    title: 'reserveer de woning',
    description:
      'Zodra ons team uw dossier heeft beoordeeld en goedgekeurd, wordt uw reserveringsaanvraag bevestigd.',
  },
  {
    icon: KeyRound,
    title: 'Verhuis',
    description: 'Na goedkeuring van uw dossier regelt het agentschap de formaliteiten en sleuteloverdracht.',
  },
];

export default function CommentCaMarchePage() {
  return (
    <div className="container-app py-14 sm:py-20">
      <FadeIn>
        <SectionHeading
          eyebrow="Ons proces"
          title="Hoe werkt het"
          description="Van de eerste zoektocht tot de sleuteloverdracht: zo verloopt uw traject met Real Estate NL."
        />
      </FadeIn>

      <div className="mt-14 space-y-8">
        {STEPS.map((step, i) => (
          <FadeIn key={step.title} delay={i * 0.05}>
            <div className="flex gap-5 sm:gap-8">
              <div className="flex flex-col items-center">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-ink-700 text-white sm:h-14 sm:w-14">
                  <step.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                {i < STEPS.length - 1 && <div className="mt-2 w-px flex-1 bg-ink-100" />}
              </div>
              <div className="pb-8">
                <span className="text-eyebrow text-canal-600">Stap {i + 1}</span>
                <h2 className="mt-1 text-lg font-bold text-ink-900 sm:text-xl">{step.title}</h2>
                <p className="mt-2 max-w-2xl leading-relaxed text-ink-500">{step.description}</p>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>
    </div>
  );
}
