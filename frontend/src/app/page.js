import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/register'); // Redirect to the register page
}
