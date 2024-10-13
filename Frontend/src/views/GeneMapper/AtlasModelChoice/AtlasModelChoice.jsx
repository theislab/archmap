import {
  Grid, Typography, Stack, Alert, Box, Tooltip, Divider,
  Accordion, AccordionSummary, AccordionDetails, Button,
  Avatar
} from '@mui/material';
import AtlasCardSelect from 'components/Cards/AtlasCardSelect';
import { TabGroup } from 'components/Tab';
import { TabCard } from 'components/GeneMapper/TabCard';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { ModelCardSelect } from 'components/Cards/ModelCardSelect';
import CustomButton from 'components/CustomButton';
import scviLogo from 'assets/scvi-logo.svg';
import { colors } from 'shared/theme/colors';
import { useHistory } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import Clear from '@mui/icons-material/Clear';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import styles from '../UploadFilePage/uploadfilepage.module.css';
import { ClassifierCard } from 'components/Cards/ClassifierCard';

function AtlasModelChoice({
  setActiveStep,
  selectedAtlas, setSelectedAtlas,
  selectedModel, setSelectedModel, path,
  compatibleModels, atlases, models, scviHubAtlases,
  selectedClassifier, setSelectedClassifier, compatibleClassifiers, classifiers,
}) {
  const [showWarning, setShowWarning] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const history = useHistory();

  //for showing Skeleton when loading
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const loadData = async () => {
      try {
        // Simulate data loading delay
        await new Promise((resolve) => setTimeout(resolve, 100));
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
        setIsError(true);
      }
    };
    loadData();
  }, []);

  const handleTabChange = (newValue) => {
    setSelectedTab(newValue);
  };

  return (
    <div>
      {showWarning
        && (
          <Alert severity="error">
            Select an Atlas and a fitting Model before continuing
          </Alert>
        )}
      <Stack
        direction="column"
        divider={(<Divider className={styles.divider} orientation="horizontal" flexItem />)}
        sx={{ gap: '1.5rem' }}
      />
      <Box>
      <Typography
        variant="h5"
        sx={{
          fontWeight: 'bold',
          pb: '1em',
          mt: '1.0em',
        }}
      >
        Pick an Atlas
      </Typography>
      {/* Core Archmap Atlases */}
      <Typography variant="h6" sx={{ mb: '1.5em' }}>
        Archmap Core Atlases
      </Typography>
      <Grid container spacing={2} width="100%" overflow="auto" wrap="nowrap">
        {
          atlases && atlases.map((a) => (
            <Grid item height="330px" position="relative">
              {a.inrevision && (
                <div
                  style={{
                    position: "absolute",
                    top: "20px",      // Adjusting to be inside the card from the top
                    right: "15px",    // Adjusting to be inside the card from the right
                    backgroundColor: "rgba(255, 0, 0, 0.8)",
                    color: "white",
                    padding: "5px",
                    fontSize: "12px",
                    fontWeight: "bold",
                    borderRadius: "4px",
                    zIndex: 1,
                  }}
                >
                  In Revision
                </div>
              )}
              <AtlasCardSelect
                width="225px"
                height="97%"
                title={a.name.includes("atlas") ? a.name.replace("atlas", "") : a.name} 
                inrevision={a.inrevision}
                modalities={a.modalities}
                cellsInReference={a.numberOfCells}
                species={a.species}
                imgLink={a.previewPictureURL}
                selected={selectedAtlas.name === a.name}
                onSelect={setSelectedAtlas}
                atlasObject={a}
                isLoading={isLoading}
              />
            </Grid>
          ))
        }
      </Grid>
      <Box display="flex" alignItems="center" sx={{mt:'1.5em', mb:'0.5em'}}>
        <Typography variant="h6">scVI Hub Atlases</Typography>
        <Avatar src={scviLogo} sx={{width: 36, height: 36, marginLeft: '5px'}}/>
        
      </Box>
      <Box display="flex" sx={{mt: '1em'}}>
        {(!scviHubAtlases || scviHubAtlases.length===0) && <Alert severity="info"sx={{width: '33%'}}>No existing datasets available. </Alert>}
      </Box>
      {/* SCVI Hub Atlases */}
      {scviHubAtlases && scviHubAtlases.length>0 && (<Box>
        {isExpanded ? (
        <Box style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
          {scviHubAtlases &&
            scviHubAtlases.map((a) => (
              <TabCard
                style={{ flex: '1 0 auto', maxWidth: '33.33%', minWidth: '33.33%', padding: '8px' }}
                height="50px"
                data={{
                  text: a.name[0].toUpperCase() + a.name.substring(1),
                  isAtlas: true
                }}
                isLoading={false}
                handleOnClick={() => setSelectedAtlas(a)}
                selected={selectedAtlas && selectedAtlas.name === a.name}
              />
            ))}
        </Box>
        ) : (
          <Box style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
            {scviHubAtlases.slice(0, 3).map((a) => (
              <TabCard
                key={a.name}
                style={{ flex: '1 0 auto', maxWidth: '33.33%', minWidth: '33.33%', padding: '8px', color: 'black' }}
                height="50px"
                data={{
                  text: a.name[0].toUpperCase() + a.name.substring(1),
                  isAtlas: true
                }}
                isLoading={false}
                handleOnClick={() => setSelectedAtlas(a)}
                selected={selectedAtlas && selectedAtlas.name === a.name}
              />
            ))}
          </Box>
        )}
        <Box sx={{display: 'flex', justifyContent: 'center', pt: '1em'}}>
          <Button 
            style={{textTransform: 'none', padding: '0px'}}
            variant="text" 
            color="primary"
            onClick={()=>{setIsExpanded(!isExpanded)}}
            disableRipple
            >
            <Typography>{isExpanded ? 'Expand less' : 'Expand more'}</Typography>
            {isExpanded ? <ExpandLessIcon/> : <ExpandMoreIcon/>}
          </Button>
        </Box>
      </Box>)}
      <Box width="100%" display="flex" marginTop="10px">
        <Box id="Grid" width="50%">
          <Typography variant="h5" sx={{ fontWeight: 'bold', pb: '1em' }} marginTop="32px">
            Pick a Model
          </Typography>

          <Grid container spacing={2} direction="row" wrap="nowrap">
            {
              models && models.map((m) => (
                <Grid item height="200px">
                  <ModelCardSelect
                    width="170px"
                    height="97%"
                    title={m.name}
                    description={m.description}
                    selected={selectedModel.name === m.name}
                    onSelect={setSelectedModel}
                    modelObject={m}
                    disabled={!compatibleModels
                      || !compatibleModels.map(
                        (m) => m.toLowerCase()
                      ).includes(m.name.toLowerCase()) || compatibleModels.length === 0} 
                      isLoading={isLoading}
                      />
                </Grid>
              ))
            }
          </Grid>
          </Box>

          <Box id="Grid" width="50%" marginLeft="36px">
              <Typography variant="h5" sx={{ fontWeight: 'bold', pb: '1em' }} marginTop="32px">
                Pick a Classifier (Optional)
              </Typography>

              <Grid container spacing={2} direction="row"wrap="nowrap">
                {
              classifiers && classifiers.map((cl) => (
                <Grid item height="200px">
                  <ClassifierCard
                    width="170px"
                    height="97%"
                    title={cl.name}
                    description={cl.description}
                    selected={selectedClassifier.name === cl.name}
                    selectedClassifier={selectedClassifier}
                    onSelect={setSelectedClassifier}
                    classifierObject={cl}
                    disabled={!compatibleClassifiers
                      || !compatibleClassifiers.map( // incomptaible model
                        (cc) => cc.toLowerCase(),
                      ).includes(cl.name.toLowerCase()) 
                      || compatibleClassifiers.length === 0  
                      || selectedAtlas?.scviAtlas} // scvi atlas
                    isLoading={isLoading}
                  />
                </Grid>
              ))
            }
              </Grid>
            </Box>
        </Box>
      </Box>
      <Stack direction="row" justifyContent="space-between" sx={{ marginTop: '50px', marginBottom: '3em', marginRight: '30px'}}>
        <CustomButton type="tertiary" onClick={() => history.push(`${path}`)}>
          <Clear />
          &nbsp; Cancel
        </CustomButton>
        <Tooltip title={!selectedAtlas || !selectedModel ? 'Select an Atlas and a fitting Model before continuing' : ''} placement="top">
          <Box
            onClick={!selectedAtlas || !selectedModel ? () => setShowWarning(true) : () => { }}
          >
            <CustomButton
              type="primary"
              disabled={!selectedAtlas || !selectedModel}
              onClick={() => setActiveStep(1)}
            >
              Confirm&nbsp;
              <ArrowForwardIcon />
            </CustomButton>
          </Box>
        </Tooltip>
      </Stack>
    </div>
  );
}

export default AtlasModelChoice;
