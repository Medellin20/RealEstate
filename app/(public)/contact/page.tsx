import type { Metadata } from 'next';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import { ContactForm } from '@/components/forms/contact-form';
import { FadeIn } from '@/components/ui/fade-in';
import { getSiteSettings } from '@/lib/data/site-settings';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Neem contact op met het team van Real Estate NL voor vragen over het huren van een appartement in Nederland.',
};

export default async function ContactPage() {
  const { footer_phone: footerPhone } = await getSiteSettings();
  const info = [
    { icon: Mail, label: 'contacts@realestatenl.agency' },
    { icon: Phone, label: footerPhone },
    { icon: Phone, label: '+31684130011' },
    { icon: MapPin, label: 'Amsterdam, Pays-Bas' },
    { icon: Clock, label: 'Lun–Ven, 9h–18h (CET)' },
  ];

  return (
    <div className="container-app py-14 sm:py-20">
      <FadeIn>
        <span className="text-eyebrow uppercase text-canal-600">Neem contact op</span>
        <h1 className="mt-2 text-display-sm font-extrabold text-ink-900 sm:text-display-md">
          Een vraag? Schrijf ons
        </h1>
        <p className="mt-3 max-w-xl text-ink-500">
          Ons team antwoordt doorgaans binnen 48 werkuren.
        </p>
      </FadeIn>

      <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-5">
        <FadeIn delay={0.05} className="lg:col-span-3">
          <div className="rounded-2xl border border-ink-100 bg-white p-6 shadow-soft sm:p-8">
            <ContactForm />
          </div>
        </FadeIn>

        <FadeIn delay={0.1} className="lg:col-span-2">
          <div className="rounded-2xl bg-ink-950 p-6 text-white sm:p-8">
            <h2 className="text-lg font-bold">Contactgegevens</h2>
            <ul className="mt-5 space-y-4">
              {info.map((item) => (
                <li key={item.label} className="flex items-center gap-3 text-sm text-sand-200">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10">
                    <item.icon className="h-4 w-4" />
                  </span>
                  {item.label}
                </li>
              ))}
            </ul>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
