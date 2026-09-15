import { StatusAutoRefresh } from '@/components/shared/status-auto-refresh';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <StatusAutoRefresh />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
