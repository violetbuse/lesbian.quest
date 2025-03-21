import { Box } from '@chakra-ui/react';
import { UserProfile } from '@clerk/clerk-react';

export default function Profile() {
  return (
    <Box maxW="container.md" mx="auto" py={8}>
      <UserProfile
        appearance={{
          elements: {
            rootBox: {
              boxShadow: 'lg',
              padding: '2rem',
              borderRadius: 'lg',
              backgroundColor: 'white',
            },
          },
        }}
      />
    </Box>
  );
} 