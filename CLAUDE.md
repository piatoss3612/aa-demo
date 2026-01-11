# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AA Demo is a Web3 application demonstrating Account Abstraction (AA) using Privy for social login/embedded wallets and Biconomy for account abstraction/paymaster functionality. The project consists of two main parts:

- **web/**: Next.js 14 frontend application with Chakra UI
- **contracts/**: Solidity smart contracts using Foundry

## Tech Stack

### Frontend (web/)

- Next.js 14 (App Router)
- React 18
- Chakra UI for styling
- Privy for authentication and embedded wallets
- Viem for Ethereum interactions
- Permissionless for AA operations
- Solana Web3.js for Solana support
- TanStack Query for data fetching

### Smart Contracts (contracts/)

- Solidity ^0.8.24
- Foundry (forge, cast)
- OpenZeppelin Contracts

## Common Commands

### Frontend Development

```bash
cd web
yarn install          # Install dependencies
yarn dev              # Start development server (localhost:3000)
yarn build            # Production build
yarn lint             # Run ESLint
```

### Smart Contract Development

```bash
cd contracts
forge build           # Compile contracts
forge test            # Run tests
forge script script/ERC20Airdrop.s.sol --rpc-url base-sepolia --account dev --sender <ADDRESS> --broadcast --verify -vvvv  # Deploy
```

## Project Structure

```
├── web/                    # Next.js frontend
│   ├── app/               # App router pages and layouts
│   ├── components/        # React components
│   │   ├── BaseSepoliaBox.tsx  # Base Sepolia chain interactions
│   │   ├── Main.tsx           # Main component
│   │   └── SolanaBox.tsx      # Solana interactions
│   └── lib/               # Utilities and constants
│       ├── abi/           # Contract ABIs
│       └── constant/      # Constants and config
├── contracts/             # Foundry smart contracts
│   ├── src/              # Contract source files
│   │   └── ERC20Airdrop.sol  # ERC20 airdrop contract
│   ├── script/           # Deployment scripts
│   └── lib/              # Dependencies (forge-std, openzeppelin)
```

## Environment Variables

Create `.env.local` in the `web/` directory with:

- `NEXT_PUBLIC_PRIVY_APP_ID` - Privy App ID
- `NEXT_PUBLIC_BICONOMY_BUNDLER_URL` - Biconomy Bundler URL
- `NEXT_PUBLIC_BICONOMY_PAYMASTER_API_KEY` - Biconomy API Key

## Deployed Contracts

| Network      | Contract     | Address                                      |
| ------------ | ------------ | -------------------------------------------- |
| Sepolia      | ERC20Airdrop | `0xf7867F6C6E1d3a77F00F911a47b5842ff3fc4516` |
| Base Sepolia | ERC20Airdrop | `0xa7Fc2E3041aD9ae62aC8762522E831D21e906ED7` |

## Key Concepts

### ERC20Airdrop Contract

- Mints 100 ADT (Airdrop Token) per claim
- Maximum 20 claims per address
- No admin functions - fully permissionless

### Account Abstraction Flow

1. User authenticates via Privy (social login, email, phone)
2. Privy creates an embedded wallet
3. Biconomy wraps the wallet with AA capabilities
4. Paymaster sponsors gas fees for users
