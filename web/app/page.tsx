import { Box, Center } from "@chakra-ui/react";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function Home() {
  return (
    <Box display="flex" flexDirection="column" minHeight="100vh" bg="gray.300">
      <Center my="auto">
        <ConnectButton />
      </Center>
    </Box>
  );
}
