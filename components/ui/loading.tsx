import { Spinner, Center } from "@chakra-ui/react";

export default function Loading() {
    return (
        <Center height="100vh">
            <Spinner size="xl" color="primary.500" />
        </Center>
    )
}