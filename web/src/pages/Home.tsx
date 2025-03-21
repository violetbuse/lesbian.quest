import { Box, Heading, Text, Button, SimpleGrid, Card, CardBody, Image, Stack } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
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

export default function Home() {
  const { data: adventures, isLoading } = useQuery<Adventure[]>({
    queryKey: ['adventures'],
    queryFn: async () => {
      const response = await axios.get('/api/adventures');
      return response.data;
    },
  });

  return (
    <Box>
      <Box textAlign="center" py={20}>
        <Heading as="h1" size="2xl" mb={4}>
          Welcome to Lesbian.Quest
        </Heading>
        <Text fontSize="xl" mb={8} color="gray.600">
          Embark on exciting adventures in a world of queer storytelling
        </Text>
        <Button as={RouterLink} to="/adventures" size="lg" colorScheme="purple">
          Start Your Journey
        </Button>
      </Box>

      <Box py={12}>
        <Heading as="h2" size="xl" mb={8} textAlign="center">
          Featured Adventures
        </Heading>
        {isLoading ? (
          <Text textAlign="center">Loading adventures...</Text>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
            {adventures?.slice(0, 3).map((adventure) => (
              <Card key={adventure.id} as={RouterLink} to={`/adventures/${adventure.id}`}>
                <CardBody>
                  <Stack spacing={4}>
                    <Image
                      src={`https://picsum.photos/seed/${adventure.id}/400/200`}
                      alt={adventure.title}
                      borderRadius="md"
                      height="200px"
                      objectFit="cover"
                    />
                    <Heading size="md">{adventure.title}</Heading>
                    <Text noOfLines={2}>{adventure.description}</Text>
                  </Stack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        )}
      </Box>
    </Box>
  );
} 