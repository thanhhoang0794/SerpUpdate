import { Box, Text } from "@chakra-ui/react";

interface ErrorMessageProps {
    message: string; 
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
    return (
        <Box paddingTop="8px">
            <Text color='#F56565' fontSize='12px'>
                {message}
            </Text>
        </Box>
    );
};

export default ErrorMessage;
