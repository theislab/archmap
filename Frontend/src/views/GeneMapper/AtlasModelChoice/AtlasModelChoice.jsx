import {
  Grid, Typography, Stack, Alert, Box, Tooltip,Divider
} from '@mui/material';
import AtlasCardSelect from 'components/Cards/AtlasCardSelect';
import { TabCard } from 'components/GeneMapper/TabCard';
import { ModelCardSelect } from 'components/Cards/ModelCardSelect';
import CustomButton from 'components/CustomButton';
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
  compatibleModels, atlases, models,
  selectedClassifier, setSelectedClassifier, compatibleClassifiers, classifiers,
}) {
  const [showWarning, setShowWarning] = useState(false);
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
      >
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

      <Grid container spacing={2} width="100%" overflow="auto" wrap="nowrap">
        {
          atlases && atlases.map((a) => (
            <Grid item height="330px">
              <AtlasCardSelect
                width="225px"
                height="97%"
                title={a.name.includes("atlas") ? a.name.replace("atlas", "") : a.name} 
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

      <Box width="100%" display="flex" marginTop="10px">
        <Box id="Grid" width="60%">
          <Typography variant="h5" sx={{ fontWeight: 'bold', pb: '1em' }} marginTop="32px">
            Pick a Model
          </Typography>

          <Grid container spacing={2} direction="row" wrap="nowrap">
            {
              models && models.map((m) => (
                <Grid item height="220px">
                  <ModelCardSelect
                    width="225px"
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

          <Box id="Grid" width="40%" marginLeft="36px">
              <Typography variant="h5" sx={{ fontWeight: 'bold', pb: '1em' }} marginTop="32px">
                Pick a Classifier for your Model
              </Typography>

              <Grid container spacing={2} direction="row" overflow="auto" wrap="nowrap" marginRight={2}>
                {
              classifiers && classifiers.map((cl) => (
                <Grid item height="145px">
                  <ClassifierCard
                    width="140px"
                    height="97%"
                    title={cl.name}
                    description={cl.description}
                    selected={selectedClassifier.name === cl.name}
                    onSelect={setSelectedClassifier}
                    classifierObject={cl}
                    disabled={!compatibleClassifiers
                      || !compatibleClassifiers.map(
                        (cc) => cc.toLowerCase(),
                      ).includes(cl.name.toLowerCase()) || compatibleClassifiers.length === 0}
                    isLoading={isLoading}
                  />
                </Grid>
              ))
            }
              </Grid>
            </Box>
        </Box>
        </Box>
      </Stack>
      <Stack direction="row" justifyContent="space-between" sx={{ marginTop: '50px', marginBottom: '3em' }}>
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
