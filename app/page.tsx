import { redirect } from 'next/navigation';

export default async function Page() {
	// redirect root to the main home page
	redirect(`/login`);
}
