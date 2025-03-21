import { Box, Flex, Link, Button, useColorModeValue } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';

export default function Navbar() {
  const { isSignedIn, signOut } = useAuth();
  const bgColor = useColorModeValue('white', 'gray.800');

  return (
    <Box bg={bgColor} px={4} shadow="sm">
      <Flex h={16} alignItems="center" justifyContent="space-between">
        <Flex gap={8}>
          <Link as={RouterLink} to="/" fontWeight="bold" fontSize="xl">
            Lesbian.Quest
          </Link>
          <Link as={RouterLink} to="/adventures">
            Adventures
          </Link>
          {isSignedIn && (
            <Link as={RouterLink} to="/create">
              Create Adventure
            </Link>
          )}
        </Flex>
        <Flex alignItems="center" gap={4}>
          {isSignedIn ? (
            <Button onClick={() => signOut()} variant="outline">
              Sign Out
            </Button>
          ) : (
            <Button as={RouterLink} to="/sign-in" colorScheme="purple">
              Sign In
            </Button>
          )}
        </Flex>
      </Flex>
    </Box>
  );
} 