import { Box, Container, Flex } from '@chakra-ui/react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar.js';

export default function Layout() {
  return (
    <Flex direction="column" minH="100vh">
      <Navbar />
      <Container maxW="container.xl" py={8} flex={1}>
        <Outlet />
      </Container>
    </Flex>
  );
} 