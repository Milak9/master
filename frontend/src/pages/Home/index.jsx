import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import { Container, Typography } from '@mui/material';
import './Home.css';

const HomePage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="homepage-container">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div className={`content ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        <Container>
          <Typography variant="h4" gutterBottom>
            Welcome to the Home Page
          </Typography>
          <Typography variant="body1">
            This is the main content area. The sidebar is fully responsive, and you can
            navigate between pages by clicking the links in the sidebar.
          </Typography>
        </Container>
      </div>
    </div>
  );
};

export default HomePage;