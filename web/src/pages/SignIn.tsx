import { Box } from '@chakra-ui/react';
import { SignIn as ClerkSignIn } from '@clerk/clerk-react';
import { RedirectIfSignedIn } from '../components/AuthProvider';

export default function SignIn() {
  return (
    <RedirectIfSignedIn>
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minH="calc(100vh - 64px)"
      >
        <ClerkSignIn
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-up"
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
    </RedirectIfSignedIn>
  );
} 