import type { MetadataRoute } from 'next';

const BASE_URL = 'https://timelock.tech';

export default function sitemap(): MetadataRoute.Sitemap {
	// 仅包含主要对外页面，不包括登录等纯功能页面
	const routes: string[] = [
		'/',
		'/home',
		'/create-transaction',
		'/timelocks',
		'/transactions',
		'/abi-lib',
		'/notify',
		'/ecosystem',
		'/import-timelock',
		'/create-timelock',
		'/security',
		'/about-timelock',
	];

	const lastModified = new Date();

	return routes.map(path => ({
		url: `${BASE_URL}${path}`,
		lastModified,
		changeFrequency: 'daily',
		priority: path === '/' || path === '/home' ? 1.0 : 0.8,
	}));
}
