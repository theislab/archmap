import React from 'react';
import { Box, Button, Stack, Typography, Modal } from '@mui/material';
import Grid from '@mui/material/Grid';
import { GeneralCard as Card } from 'components/Cards/GeneralCard';
import styles from './atlasesGrid.module.css';
import { useState } from 'react';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';


const AtlasesScviGrid = ({
  atlases,
  handleScviHubAtlas = null, isSearchPage = false,
}) => {

  const [openModal, setOpenModal] = useState(false);
  const [selectedAtlasName, setSelectedAtlasName] = useState('');
  const [selectedAtlas, setSelectedAtlas] = useState(null)

  const handleOpenModal = (atlas) => {
    setOpenModal(true);
    setSelectedAtlasName(atlas.name);
    setSelectedAtlas(atlas);
    
    
  };
  
  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedAtlasName('');
    setSelectedAtlas(null);
    
  };

  const handleAtlasClick2 = (atlas) => {
    // Toggle the expanded state for the clicked atlas
    setExpandedAtlas((prev) => (prev === atlas.name ? null : atlas.name));
  };

  // Function to handle click and open a new page
  const handleAtlasClick = (atlas, num) => {

    console.log(`Model ID: ${atlas.modelIds[num].scviHubId}`)
    
    // for (let j = 0; j < atlas.scviHubId.length; j++) {
    //   console.log(`  Model: ${atlas.modelIds[j]}`);}
    // atlas.modelIds[1]

    const atlasLink = `https://huggingface.co/${atlas.modelIds[num].scviHubId}`; // Replace with a default link if no link exists
    window.open(atlasLink, '_blank'); // Open the link in a new tab
  };

  const getButtonName = (atlas, num) => {
    console.log(`Model: ${atlas.compatibleModels[num]}`)
    // Logic to determine button name based on atlas data
    return `${atlas.compatibleModels[num]}`;
  };

  return (
    <Box
      className={styles.atlasContainer}
      mb="2em"
      pb="1.5em"
      sx={{
        minHeight: '50vh',
      }}
    >
      <Grid container spacing={3}>
        {atlases ? atlases.map((atlas) => (
          <Grid key={atlas._id} item xs={12} sm={6} md={4} lg={3}>
            <Card width="100%">
              <Stack direction="column" height={180}>
                <Typography variant="caption" fontWeight="bold">Atlas</Typography>
                <Typography gutterBottom variant="h6" fontWeight="bold">
                  {atlas.name.includes("atlas") ? atlas.name.replace("atlas", "") : atlas.name}
                </Typography>
                <Typography
                  gutterBottom
                  variant="caption"
                  sx={{
                    overflow: '-moz-hidden-unscrollable', whiteSpace: 'nowrap', textOverflow: 'ellipsis', maxWidth: '200px',
                  }}
                >
                
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => {
                        // Your function to handle scviHub Atlas
                        handleOpenModal(atlas);
                      }}
                      sx={{
                        borderRadius: 100, width: '50%', ml: '50%', mb: '-1em', mt: '0.5em', textTransform: 'none',
                      }}
                    >
                      Learn More
                    </Button>

                    
                  
                </Typography>
              </Stack>
            </Card>
          </Grid>
        )) : <div />}
      </Grid>
        
          {/* Modal */}
        {openModal && 
        <Modal
          open={openModal}
          onClose={handleCloseModal}
          aria-labelledby="atlas-modal-title"
          aria-describedby="atlas-modal-description"
        >
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 400,
              bgcolor: 'background.paper',
              boxShadow: 24,
              p: 4,
              borderRadius: 2,
            }}
          >
            <Typography id="atlas-modal-title" variant="h6" component="h2" mb={2}>
              {`${selectedAtlasName}`}
            </Typography>
            <Typography 
              id="atlas-modal-description" 
              variant="body1" 
              component="p" 
              mb={2} 
              sx={{
                fontSize: '0.9rem', // Smaller font size
                fontWeight: 400,    // Normal weight (not bold)
              }}
            >
              {`This atlas has been integrated using the below models. Click on the relevant model to see more information on scvi-hub.`}
            </Typography>
            <Stack spacing={2}>
              <Button
                variant="outlined"
                onClick={() => handleAtlasClick(selectedAtlas, 0)}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  position: 'relative',
                  paddingRight: '30px',
                }}
              >
                {getButtonName(selectedAtlas, 0)}
                <OpenInNewIcon
                  sx={{
                    fontSize: 16,
                    color: 'text.secondary',
                    position: 'absolute',
                    bottom: 4,
                    right: 8,
                  }}
                />
              </Button>
              <Button
                variant="outlined"
                onClick={() => handleAtlasClick(selectedAtlas, 1)}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  position: 'relative',
                  paddingRight: '30px',
                }}
              >
                {getButtonName(selectedAtlas, 1)}
                <OpenInNewIcon
                  sx={{
                    fontSize: 16,
                    color: 'text.secondary',
                    position: 'absolute',
                    bottom: 4,
                    right: 8,
                  }}
                />
              </Button>
            </Stack>
          </Box>
        </Modal>
        }
    </Box>
  );
};

export default AtlasesScviGrid;
