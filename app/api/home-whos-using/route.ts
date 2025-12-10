import { NextResponse } from 'next/server';

const DATA_URL = 'https://raw.githubusercontent.com/timelock-labs/timelock-proj/refs/heads/main/data.json';
const ICON_BASE = 'https://raw.githubusercontent.com/timelock-labs/timelock-proj/refs/heads/main';

interface RawWhoUsingItem {
  address: string;
  icon: string;
  name: string;
  description: string;
  website: string;
  chain_id: number;
  chain_name: string;
}

export async function GET() {
  try {
    const res = await fetch(DATA_URL, {
      // 开发阶段可以改成 cache: 'no-store'
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      return NextResponse.json({ items: [] }, { status: 200 });
    }

    const data = (await res.json()) as RawWhoUsingItem[];

    // 按 address 去重
    const map = new Map<string, RawWhoUsingItem>();
    for (const item of data) {
      if (!item.address) continue;
      if (!map.has(item.address)) {
        map.set(item.address, item);
      }
    }

    const deduped = Array.from(map.values()).map(item => ({
      ...item,
      icon: `${ICON_BASE}${item.icon.startsWith('/') ? item.icon : `/${item.icon}`}`,
    }));

    return NextResponse.json({ items: deduped }, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch home who-is-using data:', error);
    return NextResponse.json({ items: [] }, { status: 200 });
  }
}
