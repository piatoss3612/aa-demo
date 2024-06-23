# AA(Account Abstraction) Demo

[AA Demo](https://aa-demo-gules.vercel.app/)

- `Privy` for social login and embedded wallet
- `Biconomy` for account abstraction and paymaster

## Test Accounts

```
email: test-0475@privy.io
phone: +1 555 555 9802
otp: 140019
```

## Quick Start

### Install dependencies

```bash
$ cd web && yarn install
```

### .env.local file

- Create a `.env.local` file in the `web` directory and add the following content:
  - `NEXT_PUBLIC_PRIVY_APP_ID` - Privy App ID
  - `NEXT_PUBLIC_BICONOMY_BUNDLER_URL` - Biconomy Bundler URL
  - `NEXT_PUBLIC_BICONOMY_PAYMASTER_API_KEY` - Biconomy API Key

```bash
$ cp .env.local.example .env.local
```

### Start the development server

```bash
$ yarn dev
```
