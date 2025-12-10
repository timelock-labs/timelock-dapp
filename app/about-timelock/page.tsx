import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'About Timelock | Smart Contract Timelock for DeFi & On-chain Governance',
  description:
    'Understand what Timelock is, how smart contract timelocks work, and why time-delay mechanisms are critical for DeFi governance, protocol upgrades and treasury security.',
};

export default function AboutTimelockPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10 space-y-8">
      <header className="space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight">About Timelock</h1>
        <p className="text-sm text-gray-600">
          Timelock is a smart contract timelock and DeFi security platform that adds a transparent delay to
          high-impact on-chain actions, giving stakeholders time to review and react.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">What is a smart contract timelock?</h2>
        <p className="text-sm text-gray-700">
          A smart contract timelock enforces a minimum delay between queuing and executing sensitive operations such
          as upgrades, parameter changes or treasury movements. During the delay window, the queued transaction is
          publicly visible on-chain, but cannot yet be executed.
        </p>
        <p className="text-sm text-gray-700">
          This time-delay mechanism is now a widely recognized best practice in DeFi security. It helps protocols and
          DAOs avoid sudden, opaque changes and gives users, integrators and auditors a fair chance to understand what
          will happen before it does.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Why Timelock exists</h2>
        <p className="text-sm text-gray-700">
          Timelock was created to make it easier for on-chain teams to adopt secure, configurable timelock patterns
          without rebuilding infrastructure from scratch. Instead of each protocol implementing its own custom
          timelock logic, Timelock offers a unified, battle-tested approach to smart contract timelocks and governance
          security.
        </p>
        <p className="text-sm text-gray-700">
          The platform focuses on production-grade reliability, cross-chain support and clear operational workflows so
          that security teams and protocol maintainers can reason about risk in a consistent way.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Typical use cases for Timelock</h2>
        <ul className="list-disc pl-6 text-sm text-gray-700 space-y-1">
          <li>Protecting proxy-based contract upgrades with a smart contract timelock.</li>
          <li>Adding time-delayed execution to DAO governance proposals.</li>
          <li>Securing treasury operations and large token transfers with a delay.</li>
          <li>Coordinating multi-sig + timelock governance processes across chains.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Who is Timelock for?</h2>
        <p className="text-sm text-gray-700">
          Timelock is built for DeFi protocols, DAO treasuries, smart contract development teams and security audit
          firms. If your system relies on upgradeable contracts, privileged parameters or treasury operations, adding
          a robust smart contract timelock is one of the most effective ways to upgrade your governance security.
        </p>
        <p className="text-sm text-gray-700">
          By standardizing how time-delayed execution works, Timelock helps teams reduce admin key risk, align with
          industry best practices and communicate a clear security posture to users and partners.
        </p>
      </section>
    </main>
  );
}
