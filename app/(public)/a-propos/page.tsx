import type { Metadata } from 'next';
import { ShieldCheck, MapPinned, Users, Clock } from 'lucide-react';
import { FadeIn } from '@/components/ui/fade-in';
import { SectionHeading } from '@/components/ui/section-heading';

export const metadata: Metadata = {
  title: 'Over ons',
  description: 'Real Estate NL is gespecialiseerd in de verhuur van appartementen in Nederland.',
};

const VALUES = [
  {
    icon: ShieldCheck,
    title: 'Vertrouwen',
    description: 'Elke advertentie wordt vóór publicatie door ons team gecontroleerd.',
  },
  {
    icon: MapPinned,
    title: 'Expertise locale',
    description: 'Uitgebreide kennis van de wijken van Amsterdam, Rotterdam, Utrecht en daarbuiten.',
  },
  {
    icon: Users,
    title: 'Accompagnement',
    description: 'Persoonlijke begeleiding van de zoektocht tot aan de verhuizing.',
  },
  {
    icon: Clock,
    title: 'Snelheid',
    description: 'Snelle reacties, zodat u geen geschikte woning misloopt.',
  },
];

export default function AProposPage() {
  return (
    <div>
      <section className="relative overflow-hidden bg-ink-950 py-20 sm:py-28">
        <div className="container-app relative">
          <FadeIn>
            <span className="text-eyebrow uppercase text-sand-300">Ons agentschap</span>
            <h1 className="mt-3 max-w-2xl text-display-md font-extrabold text-white sm:text-display-lg">
              Uw betrouwbare partner voor huren in Nederland
            </h1>
            <p className="mt-4 max-w-xl text-sand-200">
              Real Estate NL begeleidt particulieren, professionals en expats bij het vinden
              van een huurwoning in heel Nederland.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="container-app max-w-3xl">
          <FadeIn>
            <SectionHeading
              eyebrow="Onze missie"
              title="Appartementen huren in Nederland eenvoudig maken"
            />
            <p className="mt-4 leading-relaxed text-ink-500">
              De Nederlandse huurmarkt kan complex zijn, vooral voor nieuwkomers. Real Estate NL
              is opgericht om een duidelijk en transparant traject te bieden: gecontroleerde
              advertenties, een gestructureerd bezichtigingsproces en een zorgvuldige opvolging
              van elk reserveringsdossier, van de eerste aanvraag tot de sleuteloverdracht.
            </p>
            <p className="mt-4 leading-relaxed text-ink-500">
              We werken samen met eigenaren en beheerders in de belangrijkste steden van het land —
              Amsterdam, Rotterdam, Utrecht, Eindhoven, Den Haag en Groningen — om een selectie
              woningen aan te bieden die bij elk huurdersprofiel passen.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="border-t border-ink-100 bg-white py-16 sm:py-20">
        <div className="container-app">
          <FadeIn>
            <SectionHeading eyebrow="Onze waarden" title="Wat ons dagelijks leidt" align="center" className="mx-auto" />
          </FadeIn>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((value, i) => (
              <FadeIn key={value.title} delay={i * 0.06}>
                <div className="rounded-2xl border border-ink-100 bg-white p-6 text-center shadow-soft">
                  <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-canal-50 text-canal-700">
                    <value.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-bold text-ink-900">{value.title}</h3>
                  <p className="mt-1.5 text-sm text-ink-500">{value.description}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
