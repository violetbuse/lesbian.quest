import { Box, Heading, Text, Button, VStack, HStack, Badge, useToast } from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';

interface Adventure {
  id: string;
  title: string;
  description: string;
  authorId: string;
  isPublished: boolean;
  createdAt: string;
}

interface Scene {
  id: string;
  adventureId: string;
  title: string;
  content: string;
  isStartScene: boolean;
}

export default function AdventureDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isSignedIn } = useAuth();
  const toast = useToast();

  const { data: adventure, isLoading: isLoadingAdventure } = useQuery<Adventure>({
    queryKey: ['adventure', id],
    queryFn: async () => {
      const response = await axios.get(`/api/adventures/${id}`);
      return response.data;
    },
  });

  const { data: startScene, isLoading: isLoadingScene } = useQuery<Scene>({
    queryKey: ['startScene', id],
    queryFn: async () => {
      const response = await axios.get(`/api/scenes/adventure/${id}/start`);
      return response.data;
    },
    enabled: !!adventure,
  });

  const startAdventureMutation = useMutation({
    mutationFn: async () => {
      const response = await axios.post(`/api/progress/${id}/start`);
      return response.data;
    },
    onSuccess: () => {
      navigate(`/adventures/${id}/play/${startScene?.id}`);
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to start adventure. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  });

  if (isLoadingAdventure || isLoadingScene) {
    return <Text>Loading...</Text>;
  }

  if (!adventure) {
    return <Text>Adventure not found</Text>;
  }

  return (
    <Box maxW="800px" mx="auto">
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading mb={4}>{adventure.title}</Heading>
          <HStack spacing={4} mb={4}>
            <Badge colorScheme={adventure.isPublished ? 'green' : 'yellow'}>
              {adventure.isPublished ? 'Published' : 'Draft'}
            </Badge>
            <Text color="gray.500">
              Created {new Date(adventure.createdAt).toLocaleDateString()}
            </Text>
          </HStack>
          <Text fontSize="lg">{adventure.description}</Text>
        </Box>

        {isSignedIn ? (
          <Button
            size="lg"
            colorScheme="purple"
            onClick={() => startAdventureMutation.mutate()}
            isLoading={startAdventureMutation.isPending}
          >
            Start Adventure
          </Button>
        ) : (
          <Button
            size="lg"
            colorScheme="purple"
            onClick={() => navigate('/sign-in')}
          >
            Sign In to Start Adventure
          </Button>
        )}
      </VStack>
    </Box>
  );
} 