import { redirect } from 'next/navigation';

export default function ProtectedHomePage() {
  redirect('/dashboard');
  
  // Este código nunca se ejecutará debido al redirect
  return null;
}