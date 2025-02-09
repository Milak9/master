import React from 'react';
import { Link } from 'react-router-dom';
import { Drawer, List, ListItem, ListItemText, IconButton, Divider } from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import './Sidebar.css';  // Sidebar styles

const Sidebar = ({ isOpen, toggleSidebar }) => {
  return (
    <>
      <IconButton onClick={toggleSidebar} className="menu-icon">
        <MenuIcon />
      </IconButton>
      <Drawer
        anchor="left"
        open={isOpen}
        onClose={toggleSidebar}
        variant="temporary"
        className="sidebar"
      >
        <List>
          <ListItem button component={Link} to="/">
            <ListItemText primary="Home" />
          </ListItem>
          <Divider />
          <ListItem button component={Link} to="/about">
            <ListItemText primary="About" />
          </ListItem>
          <ListItem button component={Link} to="/services">
            <ListItemText primary="Services" />
          </ListItem>
          <ListItem button component={Link} to="/contact">
            <ListItemText primary="Contact" />
          </ListItem>
        </List>
      </Drawer>
    </>
  );
};

export default Sidebar;