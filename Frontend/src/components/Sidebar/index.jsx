import React, { useState, useEffect } from 'react';
import LiveHelpIcon from '@mui/icons-material/LiveHelp';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import SearchIcon from '@mui/icons-material/Search';
import Tooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';
import { Link as NavLink, useRouteMatch, useLocation } from 'react-router-dom';
import ListItemIcon from '@mui/material/ListItemIcon';
import PolicyIcon from '@mui/icons-material/Policy';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import LogoutIcon from '@mui/icons-material/Logout';
import geneIcon from 'assets/gene.png';
import styles from './sidebar.module.css';
import ProfileService from 'shared/services/Profile.service';

function indexIcon(index) {
  switch (index) {
    case 0:
      return (
        <img
          alt="gene-icon"
          src={geneIcon}
          className={styles.geneIcon}
        />
      );
    case 1:
      return (<AccountBalanceIcon className={styles.coloredIcon} />);
    case 2:
      return (<SearchIcon className={styles.coloredIcon} />);
    case 3:
      return (<MenuBookIcon className={styles.coloredIcon} />);
    case 5:
      return (<CloudUploadIcon className={styles.coloredIcon} />);
    case 6:
      return (<AdminPanelSettingsIcon className={styles.coloredIcon} />);
    
    default:
      return (<LiveHelpIcon className={styles.coloredIcon} />);
  }
}

export default function Sidebar(props) {
  const { user, setUser } = props;
  const hasAdminPermission = user && user.isAdministrator === true;
  const hasUploadPermission = user && user.hasPermission === true;

  const commonRoutes = ['genemapper', 'community', 'search/atlases', 'documentation', 'help'];
  const commonTitles = ['Gene Mapper', 'Community', 'Search', 'Documentation', 'Help'];

  const adminRoutes = hasAdminPermission ? ['upload', 'admin'] : [];
  const adminTitles = hasAdminPermission ? ['Upload', 'Admin'] : [];

  const userRoutes = hasUploadPermission && !hasAdminPermission ? ['upload'] : [];
  const userTitles = hasUploadPermission && !hasAdminPermission ? ['Upload'] : [];

  const routes = [...commonRoutes, ...adminRoutes, ...userRoutes];
  const titles = [...commonTitles, ...adminTitles, ...userTitles];
  
  
  const { url } = useRouteMatch();
  const location = useLocation();
  const path = location.pathname;
  const [checkPathActive, setCheckPathActive] = useState('/');
  const pathRegex = new RegExp('.*\/sequencer\/(\\w+)(?=\/|)', 'g');

  useEffect(() => {
    const result = pathRegex.exec(path);
    if (result) {
      setCheckPathActive(result[1]);
    }
  }, [path]);

  return (
    <Box>
      <Box className={styles.sidebarNav}>
        <Box className={styles.sidebarWrap}>
          <Box sx={{
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '97vh', marginTop: '2vh',
          }}
          >
            <Box className={styles.iconList}>
              {routes.map((route, index) => (
                <NavLink
                  className={styles.navlink}
                  to={route!=='documentation' ? `${url}/${route}` : path}
                  onClick={route==='documentation' ? ()=>window.open("https://archmap-docu.readthedocs.io/") : ()=>{}}
                  key={route.toString()}
                >
                  <Tooltip
                    title={titles[index]}
                    placement="right"
                    componentsProps={{
                      tooltip: {
                        sx: {
                          bgcolor: '#5676E4',
                        },
                      },
                    }}
                  >
                    <Box
                      className={styles.navbarItemContainer}
                      sx={{ background: checkPathActive === route ? '#5676E5' : '#184060' }}
                    >
                      <ListItemIcon className={styles.listItemIcon}>
                        {indexIcon(index)}
                      </ListItemIcon>
                    </Box>
                  </Tooltip>
                </NavLink>
              ))}
            </Box>
            <Box>
              {/* <NavLink
                to="/legalnotice"
                className={styles.navlinkIcon}
                style={{ display: "block", marginBottom: "1em" }}
              >
                <Tooltip
                  title="legalnotice"
                  placement="right"
                  componentsProps={{
                    tooltip: {
                      sx: {
                        bgcolor: '#5676E4',
                      },
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <ListItemIcon sx={{ justifyContent: "center" }}>
                      <PolicyIcon sx={{ color: "white" }} />
                    </ListItemIcon>
                  </Box>
                </Tooltip>
              </NavLink> */}

              <NavLink
                to="/"
                onClick={() => {
                  setUser(null);
                  ProfileService.clearProfileCache();
                  localStorage.removeItem('user');
                  localStorage.removeItem('jwt');
                }}
                className={styles.navlinkIcon}
                style={{ marginBottom: '1em' }}
              >
                <Tooltip
                  title="Logout"
                  placement="right"
                  componentsProps={{
                    tooltip: {
                      sx: {
                        bgcolor: '#5676E4',
                      },
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginBottom: "1em"
                    }}
                  >
                    <ListItemIcon sx={{ justifyContent: 'center' }}>
                      <LogoutIcon sx={{ color: 'white' }} />
                    </ListItemIcon>
                  </Box>
                </Tooltip>
              </NavLink>
            </Box>
          </Box >
        </Box >
      </Box >
    </Box>
  );
}
