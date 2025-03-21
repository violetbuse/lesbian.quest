import { Box, Heading, SimpleGrid, Card, CardBody, Image, Stack, Text, Button, Input, HStack } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useState } from 'react';

interface Adventure {
  id: string;
  title: string;
  description: string;
  authorId: string;
  isPublished: boolean;
  createdAt: string;
}

export default function Adventures() {
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: adventures, isLoading } = useQuery<Adventure[]>({
    queryKey: ['adventures'],
    queryFn: async () => {
      const response = await axios.get('/api/adventures');
      return response.data;
    },
  });

  const filteredAdventures = adventures?.filter(adventure =>
    adventure.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    adventure.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box>
      <HStack justify="space-between" mb={8}>
        <Heading>All Adventures</Heading>
        <Input
          placeholder="Search adventures..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          maxW="300px"
        />
      </HStack>

      {isLoading ? (
        <Text textAlign="center">Loading adventures...</Text>
      ) : filteredAdventures?.length === 0 ? (
        <Box textAlign="center" py={8}>
          <Text fontSize="lg" color="gray.600">
            {searchQuery ? "No adventures found matching your search" : "No adventures available yet"}
          </Text>
        </Box>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
          {filteredAdventures?.map((adventure) => (
            <Card key={adventure.id}>
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
                  <Button
                    as={RouterLink}
                    to={`/adventures/${adventure.id}`}
                    colorScheme="purple"
                  >
                    Start Adventure
                  </Button>
                </Stack>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      )}
    </Box>
  );
} 