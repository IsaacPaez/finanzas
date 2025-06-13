import { redirect } from 'next/navigation'

export default function ProtectedIndexPage() {
  // Redirigir a /dashboard es la solución más común para la ruta índice protegida
  redirect('/dashboard')
}