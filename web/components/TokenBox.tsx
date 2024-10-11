"use client";

import ERC20AirdropABI from "@/lib/abi/ERC20Airdrop";
import { BaseSepoliaEtherscanUrl, ERC20AirdropAddress } from "@/lib/constant";
import { Button, Divider, Link, Stack, Text, useToast } from "@chakra-ui/react";
import { usePrivy } from "@privy-io/react-auth";
import { useSmartWallets } from "@privy-io/react-auth/smart-wallets";
import { useQuery } from "@tanstack/react-query";
import React, { useCallback, useState } from "react";
import {
  createPublicClient,
  encodeFunctionData,
  formatEther,
  http,
} from "viem";
import { baseSepolia } from "viem/chains";

const TokenBox = () => {
  const toast = useToast();
  const { user } = usePrivy();
  const smartWallet = user?.linkedAccounts.find(
    (account) => account.type === "smart_wallet"
  );
  const { client } = useSmartWallets();
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

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
        args: [smartWallet?.address as `0x${string}`],
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
        functionName: "airdropRecievedCount",
        args: [smartWallet?.address as `0x${string}`],
      });

      return data;
    } catch (error) {
      console.error(error);
    }
  }, [publicClient]);

  const { data: balanceOf } = useQuery({
    queryKey: ["balanceOf", smartWallet?.address],
    queryFn: readBalanceOf,
    refetchInterval: 3000, // 3 seconds
    enabled: !!smartWallet?.address,
  });

  const { data: airdropReceivedCount } = useQuery({
    queryKey: ["airdropReceivedCount", smartWallet?.address],
    queryFn: readAirdropReceivedCount,
    refetchInterval: 3000, // 3 seconds
    enabled: !!smartWallet?.address,
  });

  const handleAirdrop = useCallback(async () => {
    if (!smartWallet) {
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

      const txHash = await client?.sendTransaction({
        account: client.account,
        calls: [tx],
      });

      if (!txHash) {
        throw new Error("Transaction hash not found");
      }

      setTxHash(txHash);
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
  }, [smartWallet?.address]);

  return (
    <Stack bg="gray.100" p={4} spacing={4} borderRadius="md">
      <Text fontWeight="bold">User Address</Text>
      <Link
        href={`${BaseSepoliaEtherscanUrl}/address/${user?.wallet?.address}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        {user?.wallet?.address}
      </Link>
      <Divider />
      <Text fontWeight="bold">Smart Account Address</Text>
      <Link
        href={`${BaseSepoliaEtherscanUrl}/address/${smartWallet?.address}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        {smartWallet?.address}
      </Link>
      <Text fontWeight="bold">Smart Account Balance</Text>
      <Text>{formatEther(balanceOf || BigInt(0))} ADT</Text>
      {txHash && (
        <>
          <Text fontWeight="bold">Transaction Hash</Text>
          <Link
            href={`${BaseSepoliaEtherscanUrl}/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {txHash}
          </Link>
        </>
      )}
      <Divider />
      <Button
        onClick={handleAirdrop}
        colorScheme="blue"
        isLoading={isLoading}
        isDisabled={
          airdropReceivedCount === BigInt(5) || !smartWallet || !client
        }
      >
        Airdrop
      </Button>
    </Stack>
  );
};

export default TokenBox;
