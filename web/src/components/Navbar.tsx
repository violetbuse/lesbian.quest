import {
  Box,
  Flex,
  Link,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Avatar,
  useColorModeValue,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth, useUser } from '@clerk/clerk-react';

export default function Navbar() {
  const { isSignedIn, signOut } = useAuth();
  const { user } = useUser();
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
            <Menu>
              <MenuButton>
                <Avatar
                  size="sm"
                  name={user?.fullName || undefined}
                  src={user?.imageUrl || undefined}
                />
              </MenuButton>
              <MenuList>
                <MenuItem as={RouterLink} to="/profile">
                  Profile
                </MenuItem>
                <MenuItem as={RouterLink} to="/my-adventures">
                  My Adventures
                </MenuItem>
                <MenuItem onClick={() => signOut()}>Sign Out</MenuItem>
              </MenuList>
            </Menu>
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