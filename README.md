# Timelock UI

<p align="center">
  <strong>A modern Web3 timelock contract management platform</strong>
</p>

<p align="center">
  <a href="https://timelock.tech">Website</a> •
  <a href="https://docs.timelock.tech">Documentation</a> •
  <a href="https://scan.timelock.tech">Explorer</a> •
  <a href="https://x.com/TimelockApp">Twitter</a>
</p>

## Overview

Timelock UI is a **blockchain security platform** for managing timelock smart contracts across multiple EVM-compatible networks. It provides a user-friendly interface for deploying, importing, and managing timelock contracts, scheduling transactions, and monitoring on-chain activities.

## Features

### 🔐 Timelock Management
- **Deploy Timelocks** - Create new Compound-standard timelock contracts with customizable delay periods
- **Import Existing** - Import and manage existing timelock contracts from any supported chain
- **Multi-chain Support** - Seamlessly switch between supported EVM networks

### 📋 Transaction Management
- **Create Transactions** - Build and queue timelock-protected transactions with ABI encoding
- **Transaction Lifecycle** - Track transactions through all states (Queued, Pending, Ready, Executed, Cancelled, Expired)
- **Batch Operations** - Manage multiple transactions efficiently

### 🔔 Notifications
- **Email Alerts** - Configure email notifications for timelock events
- **Real-time Updates** - Stay informed about transaction status changes

### 📚 ABI Library
- **ABI Management** - Store and organize contract ABIs for easy reuse
- **Shared Library** - Access community-shared ABIs for common contracts

### 🌐 Ecosystem
- **Protocol Directory** - Discover DeFi protocols using timelock contracts
- **Security Insights** - View timelock adoption across the ecosystem

## Tech Stack

| Category | Technologies |
|----------|-------------|
| **Framework** | Next.js 15 (App Router, Turbopack) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS 4, Radix UI, Lucide Icons |
| **State Management** | Zustand, TanStack Query |
| **Web3** | Thirdweb SDK, ethers.js, viem |
| **Forms** | React Hook Form, Zod validation |
| **i18n** | next-intl (English, Chinese) |
| **Analytics** | Vercel Analytics, Speed Insights |

## Supported Networks

The platform supports multiple EVM-compatible networks including:

- Ethereum Mainnet
- BNB Smart Chain
- Polygon
- Arbitrum
- Optimism
- Avalanche
- Base
- And more...

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm / yarn / npm

### Installation

```bash
# Clone the repository
git clone https://github.com/timelock-labs/timelock-ui.git
cd timelock-ui

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
```

### Environment Variables

Create a `.env` file with the following variables:

```env
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your_thirdweb_client_id
```

### Development

```bash
# Start development server with Turbopack
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Lint and format code
pnpm lint
pnpm format
```

## Project Structure

```
timelock-ui/
├── app/                    # Next.js App Router pages
│   ├── abi-lib/           # ABI library management
│   ├── create-timelock/   # Deploy new timelocks
│   ├── create-transaction/# Create timelock transactions
│   ├── ecosystem/         # Protocol ecosystem
│   ├── home/              # Dashboard
│   ├── import-timelock/   # Import existing timelocks
│   ├── notify/            # Notification settings
│   ├── timelocks/         # Timelock list & details
│   └── transactions/      # Transaction management
├── components/            # Reusable UI components
│   ├── nav/              # Navigation components
│   ├── providers/        # Context providers
│   ├── ui/               # Base UI components (shadcn/ui)
│   ├── wallet/           # Wallet connection components
│   └── web3/             # Web3-specific components
├── contracts/            # Contract ABIs and bytecodes
├── hooks/                # Custom React hooks
│   ├── common/           # Common utility hooks
│   ├── crud/             # Data operation hooks
│   └── form/             # Form handling hooks
├── i18n/                 # Internationalization
│   └── local/            # Translation files (en, zh)
├── store/                # Zustand state stores
├── types/                # TypeScript type definitions
└── utils/                # Utility functions
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Links

- **Website**: [timelock.tech](https://timelock.tech)
- **Documentation**: [docs.timelock.tech](https://docs.timelock.tech)
- **Explorer**: [scan.timelock.tech](https://scan.timelock.tech)
- **Twitter**: [@TimelockApp](https://x.com/TimelockApp)
- **GitHub**: [timelock-labs](https://github.com/orgs/timelock-labs)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Built with ❤️ by <a href="https://github.com/orgs/timelock-labs">Timelock Labs</a>
</p>
