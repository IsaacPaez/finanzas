import { redirect } from 'next/navigation';

export default function ProtectedPage() {
  // Redirigir a dashboard u otra página por defecto
  redirect('/dashboard');
}