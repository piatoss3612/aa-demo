"use client";

import {
  Button,
  Stack,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from "@chakra-ui/react";
import { usePrivy } from "@privy-io/react-auth";
import BaseSepoliaBox from "./BaseSepoliaBox";
import SolanaBox from "./SolanaBox";
import { useEffect } from "react";
import { useAnalytics } from "@/hooks";

const Main = () => {
  const { ready, authenticated, user, login, logout } = usePrivy();
  const { isLoaded, heap } = useAnalytics();

  useEffect(() => {
    if (isLoaded && heap) {
      if (user) {
        heap.identify!(user.id);
        heap.addUserProperties!({
          email: user.email,
          address: user.wallet?.address,
        });
      }
    }
  }, [isLoaded, heap, user]);

  if (!authenticated) {
    return (
      <Button onClick={login} isLoading={!ready}>
        Login
      </Button>
    );
  }

  return (
    <Stack
      spacing={4}
      direction="column"
      alignItems="center"
      justifyContent="center"
      maxW={"480px"}
      p={8}
    >
      <Button onClick={logout} isLoading={!ready} colorScheme="red">
        Logout
      </Button>
      <Tabs size="md" variant="soft-rounded" colorScheme="blue" isFitted={true}>
        <TabList>
          <Tab>Base Sepolia</Tab>
          <Tab>Solana Devnet</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <BaseSepoliaBox />
          </TabPanel>
          <TabPanel>
            <SolanaBox />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Stack>
  );
};

export default Main;
