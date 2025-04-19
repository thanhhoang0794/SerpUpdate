import { Box, VStack, Image, Text, Flex } from "@chakra-ui/react";
import Link from "next/link";

function ResetPasswordPageSuccess() {
  return (
    <VStack background="bg" shadow="md" borderRadius="2xl" padding={10} width="500px" minHeight={96}>
      <Box>
        <Image src="/image.svg" alt="Logo" width="250px" height="45px" />
      </Box>

      <VStack align="center" marginTop={10} w={"100%"}>
        <Box>
          <Image src="/iconResetPasswordPage.png" alt="Success" width="130px" height="150px" />
        </Box>
        <Flex marginTop={10} fontSize={"lg"} fontWeight="600" color="gray.600">
          Your password has been reset. Please
          <Link href="/sign-in" passHref>
            <Text fontWeight="700" paddingX={1} color="#0000EE">
              login
            </Text>
          </Link>
          again.
        </Flex>
      </VStack>
    </VStack>
  );
}

export default ResetPasswordPageSuccess;
