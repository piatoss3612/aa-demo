import {
  BiconomySmartAccountV2,
  DEFAULT_ECDSA_OWNERSHIP_MODULE,
  DEFAULT_ENTRYPOINT_ADDRESS,
  createECDSAOwnershipValidationModule,
  createSmartAccountClient,
} from "@biconomy/account";
import { Bundler, IBundler } from "@biconomy/bundler";
import { BiconomyPaymaster, IPaymaster } from "@biconomy/paymaster";
import { ConnectedWallet, usePrivy, useWallets } from "@privy-io/react-auth";
import { createContext, useEffect, useMemo, useState } from "react";
import { sepolia } from "viem/chains";

interface BiconomyContextProps {
  smartAccount?: BiconomySmartAccountV2;
  smartAccountAddress?: string;
}

const BiconomyContext = createContext<BiconomyContextProps>({
  smartAccount: undefined,
  smartAccountAddress: undefined,
});

const BiconomyProvider = ({ children }: { children: React.ReactNode }) => {
  const [smartAccount, setSmartAccount] = useState<
    BiconomySmartAccountV2 | undefined
  >(undefined);
  const [smartAccountAddress, setSmartAccountAddress] = useState<
    string | undefined
  >(undefined);
  const { wallets } = useWallets();
  const { ready, authenticated } = usePrivy();

  const bundler: IBundler = useMemo(
    () =>
      new Bundler({
        bundlerUrl: process.env.NEXT_PUBLIC_BICONOMY_BUNDLER_URL || "",
        chainId: sepolia.id,
        entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
      }),
    []
  );

  const paymaster: IPaymaster = useMemo(
    () =>
      new BiconomyPaymaster({
        paymasterUrl: process.env.NEXT_PUBLIC_BICONOMY_PAYMASTER_URL || "",
      }),
    []
  );

  const createBiconomyAccountFromEOA = async (wallet: ConnectedWallet) => {
    try {
      await wallet.switchChain(sepolia.id);
      const provider = await wallet.getEthersProvider();
      const signer = provider.getSigner();

      const validationModule = await createECDSAOwnershipValidationModule({
        signer: signer,
        moduleAddress: DEFAULT_ECDSA_OWNERSHIP_MODULE,
      });

      const biconomySmartAccount = await createSmartAccountClient({
        signer: signer,
        bundlerUrl: process.env.NEXT_PUBLIC_BICONOMY_BUNDLER_URL || "",
        biconomyPaymasterApiKey:
          process.env.NEXT_PUBLIC_BICONOMY_PAYMASTER_API_KEY || "",
        chainId: sepolia.id,
        entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
        defaultValidationModule: validationModule,
        rpcUrl: "https://ethereum-sepolia-rpc.publicnode.com",
      });

      const address = await biconomySmartAccount.getAddress();

      setSmartAccount(biconomySmartAccount);
      setSmartAccountAddress(address);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (ready && authenticated) {
      const embeddedWallet = wallets.find(
        (wallet) => wallet.walletClientType === "privy"
      );
      if (embeddedWallet && !smartAccount) {
        createBiconomyAccountFromEOA(embeddedWallet);
      }
    }
  }, [wallets]);

  return (
    <BiconomyContext.Provider
      value={{
        smartAccount,
        smartAccountAddress,
      }}
    >
      {children}
    </BiconomyContext.Provider>
  );
};

export { BiconomyContext, BiconomyProvider };
