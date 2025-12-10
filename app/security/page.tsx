import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Timelock Security | Smart Contract Timelock & DeFi Risk Control',
  description:
    'Learn how Timelock uses smart contract timelocks, time-delay mechanisms, and governance security patterns to protect DeFi protocols, DAOs and on-chain treasuries.',
};

export default function SecurityPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10 space-y-8">
      <header className="space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight">Timelock Security Overview</h1>
        <p className="text-sm text-gray-600">
          Timelock provides smart contract timelock and DeFi security infrastructure that introduces a transparent
          time-delay mechanism for governance, protocol upgrades and treasury operations.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Why smart contract timelocks matter</h2>
        <p className="text-sm text-gray-700">
          In many DeFi protocols, high-privilege roles can upgrade contracts, change parameters or move treasury
          assets with a single transaction. Any configuration mistake, compromised admin key or malicious governance
          proposal can have an immediate and irreversible impact on users and liquidity providers.
        </p>
        <p className="text-sm text-gray-700">
          A smart contract timelock adds a mandatory delay between queuing and executing sensitive actions. This
          time-delay mechanism is a core building block for governance security and protocol upgrade protection:
          changes become visible on-chain before they execute, and all stakeholders have a window to react.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Timelock as DeFi security infrastructure</h2>
        <p className="text-sm text-gray-700">
          Timelock is designed as production-grade infrastructure for smart contract timelocks. Protocol teams and
          DAOs can use it to enforce delayed execution for upgrades, parameter changes and treasury movements across
          multiple chains. By standardizing how timelocks are configured and monitored, Timelock helps teams build a
          repeatable DeFi security process.
        </p>
        <p className="text-sm text-gray-700">
          Typical use cases include: protocol upgrade protection, DAO governance execution, treasury timelocks for
          vested tokens, and time-delayed administrative operations. In each case, the goal is the same: make high-
          impact changes observable, auditable and easier to control.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Multi-sig + timelock governance</h2>
        <p className="text-sm text-gray-700">
          Multi-sig wallets reduce single-key risk but do not address the timing of changes. By combining multi-sig
          + timelock, DeFi teams can define both who must approve an action and how long the system must wait before
          executing it. This pattern is widely adopted for governance security and protocol upgrade protection.
        </p>
        <p className="text-sm text-gray-700">
          In a typical setup, a multi-sig controls the ability to queue actions into the timelock. The timelock then
          enforces a minimum delay before those actions can be executed. This makes it significantly harder to push
          through sudden, opaque changes or rug-pull style events.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Where Timelock fits in your security stack</h2>
        <p className="text-sm text-gray-700">
          Timelock complements audits, runtime monitoring and incident response. A typical on-chain security stack
          for DeFi protocols includes: pre-deployment audits, multi-sig governance, smart contract timelocks,
          on-chain monitoring and emergency controls. Timelock focuses on the time dimension of security, making sure
          that critical operations cannot bypass review and observation.
        </p>
        <p className="text-sm text-gray-700">
          For protocol teams, DeFi project founders, smart contract developers and security auditors, Timelock adds a
          predictable, enforceable layer of time-based control that strengthens the overall security posture of the
          system.
        </p>
      </section>
    </main>
  );
}
