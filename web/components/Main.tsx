"use client";

import { Button, Stack, Text } from "@chakra-ui/react";
import { usePrivy } from "@privy-io/react-auth";
import TokenBox from "./TokenBox";

const Main = () => {
  const { ready, authenticated, login, logout } = usePrivy();

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
    >
      <Button onClick={logout} isLoading={!ready}>
        Logout
      </Button>
      <TokenBox />
    </Stack>
  );
};

export default Main;
