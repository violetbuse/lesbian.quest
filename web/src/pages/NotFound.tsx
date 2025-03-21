import { Box, Heading, Text, Button } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

export default function NotFound() {
  return (
    <Box textAlign="center" py={20}>
      <Heading as="h1" size="2xl" mb={4}>
        404 - Page Not Found
      </Heading>
      <Text fontSize="xl" mb={8} color="gray.600">
        Oops! The page you're looking for doesn't exist.
      </Text>
      <Button as={RouterLink} to="/" size="lg" colorScheme="purple">
        Return Home
      </Button>
    </Box>
  );
} 