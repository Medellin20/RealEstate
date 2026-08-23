import { AdminSidebar } from '@/components/admin/sidebar';

// Toutes les pages administrateur lisent des données privées Supabase et
// doivent être rendues à la requête, jamais prégénérées pendant le build.
export const dynamic = 'force-dynamic';

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-sand-100">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
