"use client";

import useBiconomy from "@/hooks/useBiconomy";
import ERC20AirdropABI from "@/lib/abi/ERC20Airdrop";
import { ERC20AirdropAddress, SepoliaEtherScanUrl } from "@/lib/constant";
import { PaymasterMode, SponsorUserOperationDto } from "@biconomy/paymaster";
import { Button, Divider, Link, Stack, Text, useToast } from "@chakra-ui/react";
import { usePrivy } from "@privy-io/react-auth";
import { useQuery } from "@tanstack/react-query";
import React, { useCallback, useState } from "react";
import {
  createPublicClient,
  encodeFunctionData,
  formatEther,
  http,
  parseEther,
} from "viem";
import { sepolia } from "viem/chains";

const TokenBox = () => {
  const toast = useToast();
  const { user } = usePrivy();
  const { smartAccount, smartAccountAddress } = useBiconomy();
  const [isLoading, setIsLoading] = useState(false);

  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(),
  });

  const readBalanceOf = useCallback(async () => {
    try {
      const data = await publicClient.readContract({
        address: ERC20AirdropAddress,
        abi: ERC20AirdropABI,
        functionName: "balanceOf",
        args: [smartAccountAddress as `0x${string}`],
      });

      return data;
    } catch (error) {
      console.error(error);
    }
  }, [publicClient]);

  const readAirdropReceived = useCallback(async () => {
    try {
      const data = await publicClient.readContract({
        address: ERC20AirdropAddress,
        abi: ERC20AirdropABI,
        functionName: "airdropRecieved",
        args: [smartAccountAddress as `0x${string}`],
      });

      return data;
    } catch (error) {
      console.error(error);
    }
  }, [publicClient]);

  const { data: balanceOf } = useQuery({
    queryKey: ["balanceOf", smartAccountAddress],
    queryFn: readBalanceOf,
    refetchInterval: 3000, // 3 seconds
  });

  const { data: airdropReceived } = useQuery({
    queryKey: ["airdropReceived", smartAccountAddress],
    queryFn: readAirdropReceived,
    refetchInterval: 3000, // 3 seconds
  });

  const handleAirdrop = useCallback(async () => {
    if (!smartAccount || !smartAccountAddress) {
      toast({
        title: "Smart Account not found",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }

    try {
      setIsLoading(true);

      const data = encodeFunctionData({
        abi: ERC20AirdropABI,
        functionName: "airdrop",
      });

      const tx = {
        to: ERC20AirdropAddress,
        data,
      };

      const airdropOpResponse = await smartAccount?.sendTransaction(tx, {
        paymasterServiceData: { mode: PaymasterMode.SPONSORED },
      });

      const { transactionHash } = await airdropOpResponse?.waitForTxHash()!;

      if (!transactionHash) {
        throw new Error("Transaction hash not found");
      }

      toast({
        title: "Airdropping tokens",
        description: `https://sepolia.etherscan.io/tx/${transactionHash}`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error airdropping tokens",

        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  }, [smartAccount, smartAccountAddress]);

  return (
    <Stack bg="gray.100" p={4} spacing={4} borderRadius="md">
      <Text fontWeight="bold">User Address</Text>
      <Link
        href={`${SepoliaEtherScanUrl}/address/${user?.wallet?.address}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        {user?.wallet?.address}
      </Link>
      <Divider />
      <Text fontWeight="bold">Smart Account Address</Text>
      <Link
        href={`${SepoliaEtherScanUrl}/address/${smartAccountAddress}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        {smartAccountAddress}
      </Link>
      <Text fontWeight="bold">Smart Account Balance</Text>
      <Text>{formatEther(balanceOf || BigInt(0))} ADT</Text>
      <Divider />
      <Button
        onClick={handleAirdrop}
        colorScheme="blue"
        isLoading={isLoading}
        isDisabled={airdropReceived}
      >
        Airdrop
      </Button>
    </Stack>
  );
};

export default TokenBox;
