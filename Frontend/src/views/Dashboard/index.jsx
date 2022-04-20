import { Container, Stack, Box } from '@mui/material';
import React, { useCallback } from 'react';
import Uploader from 'components/Uploader';
import StatusQueue from 'components/StatusQueue';
import styles from './dashboard.module.css';
// import { GeneralCard } from 'components/Cards/GeneralCard';
// import { ModelCard } from 'components/Cards/ModelCard';
import AtlasCard from 'components/Cards/AtlasCard'

function Dashboard({ sidebarShown }) {
  const paddingL = useCallback(() => (sidebarShown ? '100px' : '350px'), [sidebarShown]);
  return (
    <Stack
      direction="column"
      sx={{
        paddingTop: '100px',
        paddingLeft: paddingL,
        display: 'flex',
        width: '100%',
        justifyContent: 'center',
      }}
    >
      <div className={styles.title}>
        <h1>Dashboard</h1>
      </div>

      <Stack
        className="flexContainer"
        direction="row"
      >
        <Container className={styles.fileUpload}>
          <Uploader />
        </Container>
        <Container className={styles.fileQueue}>
          <StatusQueue />
        </Container>
      </Stack>
 
      {/* <GeneralCard content="Hey"/> */}
      {/* <Box sx={{ width: "250px", height: "320px" }}> */}
      {/* <ModelCard title="Model1" description="Lorem ipsum bla bla"/> */}
      {/* <AtlasCard title="Human - PBMC" imgLink="https://img1.baidu.com/it/u=1624676498,3671459173&fm=253&fmt=auto&app=138&f=JPEG?w=667&h=500" modalities="RNA, ADT" cellsInReference="161,764" species="Human"/> */}
      {/* </Box> */}

    </Stack>
  );
}

export default Dashboard;
