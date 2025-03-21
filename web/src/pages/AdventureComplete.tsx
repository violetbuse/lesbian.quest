import { Box, Heading, Text, Button, VStack, useToast } from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

interface Adventure {
  id: string;
  title: string;
  description: string;
  authorId: string;
  isPublished: boolean;
  createdAt: string;
}

export default function AdventureComplete() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const { data: adventure, isLoading } = useQuery<Adventure>({
    queryKey: ['adventure', id],
    queryFn: async () => {
      const response = await axios.get(`/api/adventures/${id}`);
      return response.data;
    },
  });

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  if (!adventure) {
    return <Text>Adventure not found</Text>;
  }

  return (
    <Box maxW="800px" mx="auto" textAlign="center">
      <VStack spacing={8}>
        <Box>
          <Heading mb={4}>Congratulations!</Heading>
          <Text fontSize="xl" mb={4}>
            You've completed {adventure.title}
          </Text>
          <Text color="gray.600">
            Thank you for playing this adventure. We hope you enjoyed the journey!
          </Text>
        </Box>

        <Button
          size="lg"
          colorScheme="purple"
          onClick={() => navigate('/adventures')}
        >
          Find More Adventures
        </Button>
      </VStack>
    </Box>
  );
} 