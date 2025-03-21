import { Box } from '@chakra-ui/react';
import { SignUp as ClerkSignUp } from '@clerk/clerk-react';
import { RedirectIfSignedIn } from '../components/AuthProvider';

export default function SignUp() {
  return (
    <RedirectIfSignedIn>
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minH="calc(100vh - 64px)"
      >
        <ClerkSignUp
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
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