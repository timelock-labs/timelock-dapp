import EcosystemSearchHeader from './components/Header';
import PartnersGrid from './components/PartnersGrid';
import type { EcosystemPartner } from '@/types/api';

const DATA_URL = 'https://raw.githubusercontent.com/timelock-labs/timelock-ecosystem/refs/heads/main/data.json';
const ICON_BASE = 'https://raw.githubusercontent.com/timelock-labs/timelock-ecosystem/refs/heads/main';

interface RawEcosystemItem {
	name: string;
	id: string;
	type: string;
	icon: string;
	description: string;
	website?: string;
}

async function fetchEcosystemData(): Promise<{ sponsors: EcosystemPartner[]; partners: EcosystemPartner[] }> {
	const res = await fetch(DATA_URL, {
		next: { revalidate: 300 },
	});

	if (!res.ok) {
		return { sponsors: [], partners: [] };
	}

	const data = (await res.json()) as RawEcosystemItem[];
	const items: EcosystemPartner[] = data.map(item => ({
		name: item.name,
		id: item.id,
		type: item.type,
		description: item.description,
		website: item.website,
		icon: `${ICON_BASE}${item.icon.startsWith('/') ? item.icon : `/${item.icon}`}`,
	}));

	const sponsors = items.filter(item => item.type === 'sponsors');
	const partners = items.filter(item => item.type === 'partners' || item.type === 'partner');

	return { sponsors, partners };
}

const EcosystemPage = async () => {
	const { sponsors, partners } = await fetchEcosystemData();

	return (
		<div>
			<div className='mx-auto flex flex-col space-y-8 pt-4'>
				<EcosystemSearchHeader />
				<PartnersGrid sponsors={sponsors} partners={partners} isLoading={false} />
			</div>
			<section className="hidden" aria-hidden="true">
				<h1>Timelock Ecosystem: Protocols, Partners and Integrations</h1>
				<p>
					The Timelock ecosystem brings together DeFi protocols, infrastructure providers and security partners that
					use smart contract timelocks to strengthen governance security and protocol upgrade protection.
				</p>
				<p>
					By integrating timelock contracts into their architecture, ecosystem partners adopt best practices for time-
					delayed execution, multi-sig + timelock governance and on-chain risk control. This directory helps teams
					discover who is using Timelock and how timelock-based security is applied across the DeFi stack.
				</p>
			</section>
		</div>
	);
};

export default EcosystemPage;
