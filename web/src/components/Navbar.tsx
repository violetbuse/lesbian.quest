import {
  Box,
  Flex,
  Link,
  Button,
  useColorModeValue,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { UserButton } from '@clerk/clerk-react';

export default function Navbar() {
  const { isSignedIn } = useAuth();
  const bgColor = useColorModeValue('white', 'gray.800');

  return (
    <Box bg={bgColor} px={4} shadow="sm">
      <Flex h={16} alignItems="center" justifyContent="space-between">
        <Flex gap={8}>
          <Link as={RouterLink} to="/" fontWeight="bold" fontSize="xl">
            lesbian.quest
          </Link>
          <Link as={RouterLink} to="/adventures">
            all adventures
          </Link>
          {isSignedIn && (
            <Link as={RouterLink} to="/create">
              Create Adventure
            </Link>
          )}
        </Flex>

        <Flex alignItems="center" gap={4}>
          {isSignedIn ? (
            <UserButton />
          ) : (
            <>
              <Button as={RouterLink} to="/sign-in" variant="ghost">
                Sign In
              </Button>
              <Button as={RouterLink} to="/sign-up" colorScheme="purple">
                Sign Up
              </Button>
            </>
          )}
        </Flex>
      </Flex>
    </Box>
  );
} 