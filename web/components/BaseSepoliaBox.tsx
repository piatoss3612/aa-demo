import { useAnalytics } from "@/hooks";
import ERC20AirdropABI from "@/lib/abi/ERC20Airdrop";
import { BaseSepoliaEtherscanUrl, ERC20AirdropAddress } from "@/lib/constant";
import {
  Button,
  Divider,
  FormControl,
  FormLabel,
  Input,
  Link,
  SimpleGrid,
  Stack,
  Text,
  useToast,
} from "@chakra-ui/react";
import {
  usePrivy,
  useMfaEnrollment,
  useFundWallet,
} from "@privy-io/react-auth";
import { useSmartWallets } from "@privy-io/react-auth/smart-wallets";
import { useQuery } from "@tanstack/react-query";
import React, { useCallback, useState } from "react";
import {
  createPublicClient,
  encodeFunctionData,
  formatEther,
  http,
} from "viem";
import { base, baseSepolia } from "viem/chains";

const BaseSepoliaBox = () => {
  const toast = useToast();
  const { user, setWalletRecovery, exportWallet } = usePrivy();
  const { showMfaEnrollmentModal } = useMfaEnrollment();
  const { fundWallet } = useFundWallet();
  const { client } = useSmartWallets();
  const [toAddress, setToAddress] = useState<`0x${string}`>("0x");
  const [amount, setAmount] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  const { heap } = useAnalytics();

  const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http(),
  });

  const readBalanceOf = useCallback(async () => {
    try {
      const data = await publicClient.readContract({
        address: ERC20AirdropAddress,
        abi: ERC20AirdropABI,
        functionName: "balanceOf",
        args: [client?.account.address as `0x${string}`],
      });

      return data;
    } catch (error) {
      console.error(error);
    }
  }, [publicClient]);

  const readAirdropReceivedCount = useCallback(async () => {
    try {
      const data = await publicClient.readContract({
        address: ERC20AirdropAddress,
        abi: ERC20AirdropABI,
        functionName: "airdropReceivedCount",
        args: [client?.account.address as `0x${string}`],
      });

      return data;
    } catch (error) {
      console.error(error);
    }
  }, [publicClient]);

  const fundSmartAccount = useCallback(async () => {
    fundWallet(client?.account.address as `0x${string}`, {
      chain: base,
      amount: "0.01",
    });
  }, [client]);

  const { data: balanceOf } = useQuery({
    queryKey: ["balanceOf", client?.account.address],
    queryFn: readBalanceOf,
    refetchInterval: 3000, // 3 seconds
    enabled: !!client?.account.address,
  });

  const { data: airdropReceivedCount } = useQuery({
    queryKey: ["airdropReceivedCount", client?.account.address],
    queryFn: readAirdropReceivedCount,
    refetchInterval: 3000, // 3 seconds
    enabled: !!client?.account.address,
  });

  const fullAirdropReceived = airdropReceivedCount === BigInt(5);

  const handleToAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setToAddress(e.target.value as `0x${string}`);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value);
  };

  const handleAirdrop = useCallback(async () => {
    if (!client) {
      toast({
        title: "Smart Account not found",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setIsLoading(true);

      const data = encodeFunctionData({
        abi: ERC20AirdropABI,
        functionName: "airdrop",
      });

      const tx = {
        to: ERC20AirdropAddress as `0x${string}`,
        data,
      };

      if (heap) {
        heap.track!("executed_airdrop", {
          user_id: user?.id,
          smart_account_address: client.account.address,
        });
      }

      const txHash = await client?.sendTransaction({
        account: client.account,
        calls: [tx],
      });

      if (!txHash) {
        throw new Error("Transaction hash not found");
      }

      if (heap) {
        heap.track!("completed_airdrop", {
          user_id: user?.id,
          smart_account_address: client.account.address,
          tx_hash: txHash,
        });
      }

      setTxHash(txHash);
    } catch (error) {
      console.error(error);

      const errorMessage =
        error instanceof Error ? error.message : String(error);

      if (heap) {
        heap.track!("failed_airdrop", {
          user_id: user?.id,
          smart_account_address: client.account.address,
          error: errorMessage,
        });
      }

      toast({
        title: "Error airdropping tokens",
        description: errorMessage,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  }, [client]);

  const handleTransfer = useCallback(async () => {
    if (!client) {
      toast({
        title: "Smart Account not found",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const data = encodeFunctionData({
        abi: ERC20AirdropABI,
        functionName: "transfer",
        args: [toAddress, BigInt(amount)],
      });

      const tx = {
        to: ERC20AirdropAddress as `0x${string}`,
        data,
      };

      if (heap) {
        heap.track!("executed_transfer", {
          user_id: user?.id,
          smart_account_address: client.account.address,
          to_address: toAddress,
          amount: amount,
        });
      }

      const txHash = await client?.sendTransaction({
        account: client.account,
        calls: [tx],
      });

      if (!txHash) {
        throw new Error("Transaction hash not found");
      }

      if (heap) {
        heap.track!("completed_transfer", {
          user_id: user?.id,
          smart_account_address: client.account.address,
          to_address: toAddress,
          amount: amount,
          tx_hash: txHash,
        });
      }

      setTxHash(txHash);
    } catch (error) {
      console.error(error);

      const errorMessage =
        error instanceof Error ? error.message : String(error);

      if (heap) {
        heap.track!("failed_transfer", {
          user_id: user?.id,
          smart_account_address: client.account.address,
          to_address: toAddress,
          amount: amount,
          error: errorMessage,
        });
      }

      toast({
        title: "Error transferring tokens",
        description: errorMessage,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  }, [client, toAddress, amount]);

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
        <Text fontWeight="bold">User Address</Text>
        <Link
          href={`${BaseSepoliaEtherscanUrl}/address/${user?.wallet?.address}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {user?.wallet?.address}
        </Link>
        <Divider />
        {client ? (
          <>
            <Text fontWeight="bold">Smart Account Address</Text>
            <Link
              href={`${BaseSepoliaEtherscanUrl}/address/${client?.account.address}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {client?.account.address}
            </Link>
            <Text fontWeight="bold">ADT Balance</Text>
            <Text>{formatEther(balanceOf || BigInt(0))} ADT</Text>
            <Button
              onClick={handleAirdrop}
              colorScheme="blue"
              isLoading={isLoading}
              isDisabled={fullAirdropReceived || !client?.account.address}
            >
              {fullAirdropReceived ? "Fully Airdropped" : "Airdrop"}
            </Button>
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
              colorScheme="blue"
              isDisabled={!client?.account.address}
            >
              Transfer
            </Button>
            {txHash && (
              <>
                <Divider />
                <Text fontWeight="bold">Transaction Hash</Text>
                <Link
                  noOfLines={1}
                  href={`${BaseSepoliaEtherscanUrl}/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {txHash}
                </Link>
              </>
            )}
          </>
        ) : (
          <Text fontWeight="bold">No Smart Account found</Text>
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
        <SimpleGrid columns={2} spacing={4} w="full">
          <Button colorScheme="blue" onClick={setWalletRecovery}>
            Set Wallet Recovery
          </Button>
          <Button colorScheme="blue" onClick={showMfaEnrollmentModal}>
            Enroll MFA
          </Button>
          <Button colorScheme="blue" onClick={exportWallet}>
            Export Wallet
          </Button>
          <Button colorScheme="blue" onClick={fundSmartAccount}>
            Fund Wallet
          </Button>
        </SimpleGrid>
      </Stack>
    </>
  );
};

export default BaseSepoliaBox;
