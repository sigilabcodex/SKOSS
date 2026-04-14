import { redirect } from 'next/navigation';

export default function LegacySetupRedirectPage() {
  redirect('/admin/setup');
}
