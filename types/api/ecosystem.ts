export interface Partner {
	id: number;
	name: string;
	description: string;
	logo_url: string;
	link: string;
}

// Ecosystem partners/sponsors from timelock-ecosystem data.json
export interface EcosystemPartner {
	name: string;
	id: string;
	type: string;
	icon: string;
	description: string;
	website?: string;
}
