import React, { useState } from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import CssBaseline from '@mui/material/CssBaseline';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import LiveHelpIcon from '@mui/icons-material/LiveHelp';
import Avatar from '@mui/material/Avatar';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import MapIcon from '@mui/icons-material/Map';
import TaskIcon from '@mui/icons-material/Task';
import { Typography } from '@mui/material';
import profiledefault from '../../../assets/user.png';
import logo from '../../../assets/logo.svg';

const drawerWidth = 240;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme
    .transitions
    .create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  overflowX: 'hidden',
});

const closedMixin = (theme) => ({
  transition: theme
    .transitions
    .create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  overflowX: 'hidden',
  // width: `calc(${theme.spacing(7)} + 1px)`,
  width: '120px !important',
  [
  theme
    .breakpoints
    .up('sm')
  ]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  ...(open && {
    ...openedMixin(theme),
    '& .MuiDrawer-paper': openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    '& .MuiDrawer-paper': closedMixin(theme),
  }),
}));

function indexIcon(index) {
  switch (index) {
    case 0:
      return (
        <TaskIcon sx={{ color: 'white' }} fontSize="large" />
      );
    case 1:
      return <AccountBalanceIcon sx={{ color: 'white' }} fontSize="large" />;
    case 2:
      return <MapIcon sx={{ color: 'white' }} fontSize="large" />;
    case 3:
      return <MenuBookIcon sx={{ color: 'white' }} fontSize="large" />;
    default:
      return <LiveHelpIcon sx={{ color: 'white' }} fontSize="large" />;
  }
}

export default function MiniDrawer({ user }) {
  const [open,
    setOpen] = useState(false);

  const toggleDrawer = (isOpen) => {
    setOpen(isOpen);
  };

  return (
    <Box sx={{
      display: 'flex',
    }}
    >
      <CssBaseline />
      <Drawer
        PaperProps={{
          sx: {
            backgroundColor: '#184060',
            color: 'white',
          },
        }}
        variant="permanent"
        open={open}
        onMouseOver={() => toggleDrawer(true)}
        onMouseLeave={() => toggleDrawer(false)}
        style={{
          width: '320px !important',
        }}
      >
        <DrawerHeader>
          <div
            style={{
              width: '100%',
              padding: '8px',
              marginTop: '12px',
              marginBottom: '24px',
            }}
          >
            <Avatar
              alt="logo"
              src={logo}
              style={{
                width: '57px',
                height: '57px',
                backgroundColor: 'white',
                marginLeft: 'auto',
                marginRight: 'auto',
              }}
            />
          </div>
        </DrawerHeader>
        <List style={{
          display: 'grid',
        }}
        >
          {['Projects', 'Institutions', 'Gene Mapper', 'Docs', 'Help'].map((text, index) => (
            <ListItemButton
              key={text}
              sx={{
                minHeight: 48,
                px: 2.5,
                py: 2,
                '&:hover': {
                  backgroundColor: '#01579B',
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open
                    ? 2
                    : 'auto',
                  ml: 2,
                }}
              >
                {indexIcon(index)}
              </ListItemIcon>
              <ListItemText
                primary={text}
                sx={{
                  opacity: open
                    ? 1
                    : 0,
                }}
              />
            </ListItemButton>
          ))}
        </List>
        <Box sx={{
          marginTop: 'auto',
          marginBottom: '72px',
          textAlign: 'center',
        }}
        >
          <Avatar
            alt="logo"
            src={profiledefault}
            style={{
              width: '57px',
              height: '57px',
              backgroundColor: 'white',
              border: '1px solid white',
              marginBottom: '8px',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          />
          <Typography
            sx={{
              opacity: open
                ? 1
                : 0,
            }}
          >
            {`Hi, ${user.firstName}!`}
          </Typography>
        </Box>
      </Drawer>
    </Box>
  );
}
