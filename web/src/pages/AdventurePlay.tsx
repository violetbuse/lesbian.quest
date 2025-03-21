import { Box, Heading, Text, VStack, Button, useToast, Progress } from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';

interface Scene {
  id: string;
  adventureId: string;
  title: string;
  content: string;
  isStartScene: boolean;
}

interface Choice {
  id: string;
  sceneId: string;
  text: string;
  nextSceneId: string;
}

interface Progress {
  currentSceneId: string;
  completedScenes: string[];
}

export default function AdventurePlay() {
  const { id, sceneId } = useParams<{ id: string; sceneId: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const { data: progress, isLoading: isLoadingProgress } = useQuery<Progress>({
    queryKey: ['progress', id],
    queryFn: async () => {
      const response = await axios.get(`/api/progress/${id}`);
      return response.data;
    },
  });

  const { data: scene, isLoading: isLoadingScene } = useQuery<Scene>({
    queryKey: ['scene', sceneId],
    queryFn: async () => {
      const response = await axios.get(`/api/scenes/${sceneId}`);
      return response.data;
    },
  });

  const { data: choices, isLoading: isLoadingChoices } = useQuery<Choice[]>({
    queryKey: ['choices', sceneId],
    queryFn: async () => {
      const response = await axios.get(`/api/choices/scene/${sceneId}`);
      return response.data;
    },
    enabled: !!scene,
  });

  const makeChoiceMutation = useMutation({
    mutationFn: async (choiceId: string) => {
      const response = await axios.post(`/api/progress/${id}/choice`, { choiceId });
      return response.data;
    },
    onSuccess: (data) => {
      if (data.nextSceneId) {
        navigate(`/adventures/${id}/play/${data.nextSceneId}`);
      } else {
        navigate(`/adventures/${id}/complete`);
      }
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to make choice. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  });

  if (isLoadingScene || isLoadingChoices || isLoadingProgress) {
    return <Text>Loading...</Text>;
  }

  if (!scene) {
    return <Text>Scene not found</Text>;
  }

  const progressPercentage = progress
    ? (progress.completedScenes.length / (progress.completedScenes.length + 1)) * 100
    : 0;

  return (
    <Box maxW="800px" mx="auto">
      <VStack spacing={8} align="stretch">
        <Box>
          <Progress value={progressPercentage} colorScheme="purple" mb={4} />
          <Heading mb={4}>{scene.title}</Heading>
          <Text fontSize="lg" whiteSpace="pre-wrap">
            {scene.content}
          </Text>
        </Box>

        <VStack spacing={4} align="stretch">
          {choices?.map((choice) => (
            <Button
              key={choice.id}
              size="lg"
              variant="outline"
              onClick={() => makeChoiceMutation.mutate(choice.id)}
              isLoading={makeChoiceMutation.isPending}
            >
              {choice.text}
            </Button>
          ))}
        </VStack>
      </VStack>
    </Box>
  );
} 