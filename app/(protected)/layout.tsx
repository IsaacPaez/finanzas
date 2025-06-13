'use client';

import Sidebar from '@/components/Sidebar';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="hidden md:block">
        <Sidebar />
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}

// Añade esto si quieres que el layout redirija cuando se accede directamente a /
export function Layout({ children }: { children: React.ReactNode }) {
  // Si es necesario, agrega lógica para redirigir cuando la ruta es exactamente /app/(protected)

  return <div>{children}</div>;
}
