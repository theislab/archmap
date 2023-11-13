import {
  Box, Container, Step, StepButton, Stepper,
} from '@mui/material';
import React, { useState, useEffect } from 'react';
import AtlasModelChoice from '../AtlasModelChoice/AtlasModelChoice';
import UploadFilePage from '../UploadFilePage';
import { useLocation, useHistory } from 'react-router-dom';
import ModelService from 'shared/services/Model.service';
import AtlasService from 'shared/services/Atlas.service';
import DemoService from 'shared/services/Demo.service';

/**
 * GeneMapperState
 * Renders the necessary step during the creation of a new project
 * @param path
 * @param loggedIn set to true when the user is logged in
 * */
function GeneMapperState({ path }) {
  const { search } = useLocation();
  const history = useHistory();
  const searchParams = new URLSearchParams(search);
  const urlParams = new URLSearchParams(searchParams);
  const filterParams = Object.fromEntries(urlParams);

  const atlasId = filterParams.atlas;
  const modelId = filterParams.model;
  const [selectedAtlas, setSelectedAtlas] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [activeStep, setActiveStep] = useState(0);
  const [selectedDemoDataset, setSelectedDemoDataset] = useState(null);
  const [demoDatasetIsSelected, setDemoDatasetIsSelected] = useState(false);
  const [demoDatasets, setDemoDatasets] = useState(null);
  const steps = ['Pick Atlas and Model', 'Choose File and Project details'];
  const [atlases, setAtlases] = useState(null);
  const [models, setModels] = useState(null);

  const handleAtlasSelection = (newAtlas) => {
    setSelectedAtlas(newAtlas);
    setSelectedModel('');
  };

  // function to update the state in the URL
  const updateQueryParams = (param, value) => {
    const params = new URLSearchParams(history.location.search);
    if (value) {
      params.set(param, value);
    } else {
      params.delete(param);
    }

    history.replace({
      pathname: history.location.pathname,
      search: params.toString(),
    });
  };

  const handleStep = (step) => {
    setActiveStep(step);
    if (step === 1 && selectedAtlas && selectedModel) {
      updateQueryParams('atlas', selectedAtlas._id);
      updateQueryParams('model', selectedModel._id);
    }
  };

  // get demo projects
  useEffect(() => {
    DemoService.getDemos().then((a) => {
      setDemoDatasets(a);
    });
  }, []);

  useEffect(() => {
    AtlasService.getAtlases().then((a) => {
      a.map((a) => {
        // adjust numberOfCells
        let { numberOfCells } = a;
        let dimension = '';
        if (numberOfCells > 1000000000) {
          numberOfCells = Math.round(numberOfCells / 1000000000);
          dimension = 'B';
        } else if (numberOfCells > 1000000) {
          numberOfCells = Math.round(numberOfCells / 1000000);
          dimension = 'M';
        } else if (numberOfCells > 1000) {
          numberOfCells = Math.round(numberOfCells / 1000);
          dimension = 'K';
        }
        a.numberOfCells = numberOfCells + dimension;

        // adjust modalities
        if (!(typeof a.modalities === 'string')) {
          // modalities ist array of strings
          if (a.modalities.length == 0) {
            a.modalities = 'None';
          } else if (a.modalities.length == 1) {
            a.modalities = a.modalities[0];
          } else {
            a.modalities = `${a.modalities[0]}, ...`;
          }
        }
        if (a._id === atlasId) {
          setSelectedAtlas(a);
        }

        a.requirements = [];
        if(a.name === 'Retina atlas'){
          a.requirements.push('If the Atlas is Retina, cell_type_key: CellType and batch_key : batch');
        }
        if(a.name === 'Fetal Immune'){
          a.requirements.push('If the Atlas is Fetal Immune, cell_type_key: celltype_annotation and batch_key : bbk');
        }
        if(a.name === 'Hypomap'){
          a.requirements.push('If the Atlas is HypoMap, cell_type_key: Author_CellType and batch_key : Batch_ID');
        }
        if(a.name === 'PBMC'){
          a.requirements.push('If the Atlas is PBMC, cell_type_key: cell_type and batch_key : sample_id');
        }
        if(a.name === 'Human lung cell atlas'){
          a.requirements.push('If the Atlas is HLCA, cell_type_key: scanvi_labels and batch_key : dataset');
        }
        if(a.name == 'Glioblastoma'){
          a.requirements.push('If the atlas is GB, cell_type_key: CellID and batch_key : author');
        }
        if(a.name == 'NSCLC'){
          a.requirements.push('If the atlas is NSCLC, cell_type_key: cell_type and batch_key : sample');
        }
        return a;
      });
      setAtlases(a);
    });



    ModelService.getModels().then((m) => {
      m.map((model) => {
        model.requirements = [
          'Ensure your data is in h5ad format',
          'Batch/study information is mandatory and should be labeled as “batch”',
          "Input label from user has to match the labels presented here"
        ];
        if (model.name === 'scVI') {
          model.requirements.push('Cell type information should be labeled as “cell_type”');
          model.requirements.push('For unlabeled cells, the value for “cell_type” should be “Unknown”');
        }
        if (model.name === 'scANVI') {
          model.requirements.push('Cell type information should be labeled as “cell_type”');
        }
        if (model.name === 'totalVI') {
          model.requirements.push('If the Atlas is PBMC, cell_type_key: cell_type and batch_key : sample_id');
        }
        if (model._id === modelId) {
          setSelectedModel(model);
        }
      });
      setModels(m);
    });
  }, []);

  useEffect(() => {
    if (atlasId && selectedAtlas && modelId && selectedModel) {
      handleStep(1);
    } else if (atlases && models) {
      history.push({
        pathname: history.location.pathname,
        search: '',
      });
      setSelectedAtlas('');
      setSelectedModel('');
    }
  }, [atlases, models]);

  return (
    <Container>
      <Box height="100%" width="500px" margin="auto" sx={{ marginTop: '1%', marginBottom: '1%' }}>
        <Stepper activeStep={activeStep}>
          {steps.map((labelText, index) => (
            <Step index={index}>
              <StepButton color="inherit" onClick={() => handleStep(index)}>
                {labelText}
              </StepButton>
            </Step>
          ))}
        </Stepper>
      </Box>
      {
        activeStep === 0
          ? (
            <AtlasModelChoice
              path={path}
              selectedAtlas={selectedAtlas}
              selectedModel={selectedModel}
              steps={steps}
              setSelectedAtlas={handleAtlasSelection}
              setSelectedModel={setSelectedModel}
              setActiveStep={handleStep}
              compatibleModels={selectedAtlas ? selectedAtlas.compatibleModels : []}
              atlases={atlases}
              models={models}
              demos={demoDatasets}
              selectedDataset={selectedDemoDataset}
              setSelectedDataset={setSelectedDemoDataset}
              datasetIsSelected={demoDatasetIsSelected}
              setDatasetIsSelected={setDemoDatasetIsSelected}
            />
          )
          : (
            <UploadFilePage
              path={path}
              selectedAtlas={selectedAtlas}
              selectedModel={selectedModel}
              setActiveStep={handleStep}
              demos={demoDatasets}
              selectedDataset={selectedDemoDataset}
              setSelectedDataset={setSelectedDemoDataset}
              datasetIsSelected={demoDatasetIsSelected}
              setDatasetIsSelected={setDemoDatasetIsSelected}
            />
          )
      }
    </Container>
  );
}

export default GeneMapperState;
