"use client";

import * as React from "react";
import { ChakraProvider } from "@chakra-ui/react";
import { PrivyProvider } from "@privy-io/react-auth";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { SmartWalletsProvider } from "@privy-io/react-auth/smart-wallets";
import { base, baseSepolia } from "viem/chains";
import mixpanel from "mixpanel-browser";
import posthog from "posthog-js";

const queryClient = new QueryClient();

mixpanel.init(process.env.NEXT_PUBLIC_MIXPANEL_TOKEN || "", {
  track_pageview: true,
  persistence: "cookie",
});

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_TOKEN || "", {
  api_host: "https://us.i.posthog.com",
  person_profiles: "always",
  autocapture: false,
});

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ""}
      config={{
        appearance: {
          theme: "light",
          accentColor: "#676FFF",
          logo: "https://your-logo-url",
        },
        defaultChain: baseSepolia,
        supportedChains: [base, baseSepolia],
        // Create embedded wallets for users who don't have a wallet
        embeddedWallets: {
          createOnLogin: "users-without-wallets",
        },
        fundingMethodConfig: {
          moonpay: {
            paymentMethod: "credit_debit_card",
          },
        },
      }}
    >
      <SmartWalletsProvider
        config={{
          paymasterContext: {
            mode: "SPONSORED",
            calculateGasLimits: true,
            expiryDuration: 300,
            sponsorshipInfo: {
              webhookData: {},
              smartAccountInfo: {
                name: "BICONOMY",
                version: "2.0.0",
              },
            },
          },
        }}
      >
        <ChakraProvider>
          <QueryClientProvider client={queryClient}>
            {mounted && children}
          </QueryClientProvider>
        </ChakraProvider>
      </SmartWalletsProvider>
    </PrivyProvider>
  );
}
