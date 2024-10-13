import { SolanaDevnetFaucetUrl, SolanaExplorerUrl } from "@/lib/constant";
import {
  Button,
  Divider,
  FormControl,
  FormLabel,
  Input,
  Link,
  Stack,
  Text,
  useToast,
} from "@chakra-ui/react";
import {
  usePrivy,
  useSolanaWallets,
  WalletWithMetadata,
  ConnectedSolanaWallet,
} from "@privy-io/react-auth";
import {
  clusterApiUrl,
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { useQuery } from "@tanstack/react-query";
import React, { useCallback, useEffect, useState } from "react";

const SolanaBox = () => {
  const toast = useToast();
  const { authenticated, user } = usePrivy();
  const { wallets, createWallet, exportWallet } = useSolanaWallets();
  const [solanaWallet, setSolanaWallet] =
    useState<ConnectedSolanaWallet | null>(null);
  const [connection, setConnection] = useState<Connection | null>(null);
  const [toAddress, setToAddress] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  const wallet = user?.linkedAccounts.find(
    (account): account is WalletWithMetadata =>
      account.type === "wallet" &&
      account.walletClientType === "privy" &&
      account.chainType === "solana"
  );

  const handleToAddressChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setToAddress(event.target.value as `0x${string}`);
  };

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(event.target.value);
  };

  const getBalance = useCallback(async () => {
    if (!solanaWallet || !connection) return;

    try {
      const pk = new PublicKey(solanaWallet.address);

      const balance = await connection.getBalance(pk);

      return balance;
    } catch (error) {
      console.error(error);
      toast({
        title: "Failed to get balance",
        description: error instanceof Error ? error.message : "",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  }, [solanaWallet, connection]);

  const handleTransfer = useCallback(async () => {
    if (!solanaWallet || !connection) return;

    setIsLoading(true);

    try {
      const fromPk = new PublicKey(solanaWallet.address);
      const toPk = new PublicKey(toAddress);

      const tx = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: fromPk,
          toPubkey: toPk,
          lamports: parseInt(amount),
        })
      );

      let recentBlockhash = await connection.getLatestBlockhash();

      tx.recentBlockhash = recentBlockhash.blockhash;
      tx.feePayer = fromPk;

      const hash = await solanaWallet.sendTransaction!(tx, connection);

      setTxHash(hash);
    } catch (error) {
      console.error(error);
      toast({
        title: "Failed to transfer",
        description: error instanceof Error ? error.message : "",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  }, [solanaWallet, connection, toAddress, amount]);

  const { data: balance } = useQuery({
    queryKey: ["solana-balance", solanaWallet?.address],
    queryFn: getBalance,
    enabled: !!solanaWallet && !!connection,
    refetchInterval: 3000,
  });

  useEffect(() => {
    if (authenticated && wallets.length) {
      const solanaWallet = wallets[0];
      const connection = new Connection(clusterApiUrl("devnet"));

      setSolanaWallet(solanaWallet);
      setConnection(connection);
    }
  }, [authenticated && wallets.length]);

  return (
    <>
      <Stack
        bg="gray.100"
        p={4}
        spacing={4}
        borderRadius="md"
        minW={"480px"}
        maxW={"480px"}
        mb={4}
      >
        {!!wallet ? (
          <>
            <Text fontSize="lg" fontWeight="bold">
              User Address
            </Text>
            <Link
              href={`${SolanaExplorerUrl}/address/${wallet.address}`}
              isExternal
            >
              {wallet.address}
            </Link>
            <Text fontSize="lg" fontWeight="bold">
              Balance
            </Text>
            <Text>{balance ? balance / LAMPORTS_PER_SOL : "0"} SOL</Text>
            <Divider />
            <Text fontWeight="bold">Transfer</Text>
            <FormControl>
              <FormLabel>To Address</FormLabel>
              <Input
                type="text"
                placeholder="To Address"
                value={toAddress}
                onChange={handleToAddressChange}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Amount</FormLabel>
              <Input
                type="text"
                placeholder="Amount without decimals"
                value={amount}
                onChange={handleAmountChange}
              />
            </FormControl>
            <Button
              onClick={handleTransfer}
              isLoading={isLoading}
              isDisabled={!toAddress || !amount}
              colorScheme="blue"
            >
              Transfer
            </Button>
            <Button
              as="a"
              href={SolanaDevnetFaucetUrl}
              target="_blank"
              rel="noopener noreferrer"
              colorScheme="blue"
            >
              Faucet
            </Button>
          </>
        ) : (
          <>
            <Button colorScheme="blue" onClick={createWallet}>
              Create Wallet
            </Button>
          </>
        )}

        {txHash && (
          <>
            <Divider />
            <Text fontWeight="bold">Transaction Hash</Text>
            <Link
              noOfLines={1}
              href={`${SolanaExplorerUrl}/tx/${txHash}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {txHash}
            </Link>
          </>
        )}
      </Stack>
      <Stack
        bg="gray.100"
        p={4}
        spacing={4}
        borderRadius="md"
        align="center"
        minW={"480px"}
        maxW={"480px"}
      >
        <Text fontSize="lg" fontWeight="bold">
          Actions
        </Text>
        <Button colorScheme="blue" w="full" onClick={() => exportWallet()}>
          Export Wallet
        </Button>
      </Stack>
    </>
  );
};

export default SolanaBox;
