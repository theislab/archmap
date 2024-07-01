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
import ScviAtlasService from 'shared/services/ScviAtlas.service';
import ClassifierService from 'shared/services/Classifier.service';

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
  const [scviHubAtlases, setScviHubAtlases] = useState(null);
  const steps = ['Pick Atlas and Model', 'Choose File and Project details'];
  const [atlases, setAtlases] = useState(null);
  const [models, setModels] = useState(null);
  const [classifiers, setClassifiers] = useState(null);
  const [selectedClassifier, setSelectedClassifier] = useState('');

  const handleAtlasSelection = (newAtlas) => {
    setSelectedAtlas(newAtlas);
    setSelectedModel('');
    setSelectedClassifier('');
  };
  const handleModelSelection = (newModel) => {
    setSelectedModel(newModel);
    let {batch_key, cell_type_key} = selectedAtlas
    let var_names = selectedAtlas.vars
    newModel.requirements = [
      'Ensure your data is in h5ad format',
      `The number of cells in you data should not exceed 30 000 for your chosen query. If your query is larger than this, we recommend you batch your query (make sure all cells with the same batch/study label are in the same batch), submit separate mappings, and concatenate your downloaded results.`,
      'Ensure raw expression counts are saved in .X of the query AnnData object',
      `Batch/Study information is mandatory and should be labeled as “batch”`,
      `If your query has existing cell type information, this should be labeled as “user_cell_type"`
      `Ensure ${var_names} are stored in the var_names AnnData object attribute of your query`,


    ];
    // if (newModel.name === 'scVI') {
    //   newModel.requirements.push(`If your query has existing cell type information, this should be labeled as “user_cell_type`);
    // }
    // else if (newModel.name === 'scANVI' || newModel.name === 'scPoli') {
    //   newModel.requirements.push(`Cell type information should be labeled as “${cell_type_key}”`);
    // }
    setSelectedClassifier('')
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
      if(selectedAtlas?.scviAtlas){
        updateQueryParams('atlas', selectedAtlas.name);
        updateQueryParams('model', selectedModel._id);
      }else{
        updateQueryParams('atlas', selectedAtlas._id);
        updateQueryParams('model', selectedModel._id);
        updateQueryParams('classifier', selectedClassifier._id);
      }

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
        return a;
      });
      setAtlases(a);
    });

    ModelService.getModels().then((m) => {
      m.map((model) => {
        if (model._id === modelId) {
          setSelectedModel(model);
        }
      });
      setModels(m);
    });

    ScviAtlasService.getAtlases().then((atlases) => {
      setScviHubAtlases(atlases);
    })

    ClassifierService.getClassifiers().then((cl) => {
      setClassifiers(cl)
    })

  }, []);

  useEffect(() => {
    if (atlasId && selectedAtlas && modelId && selectedModel) {
      handleStep(1);
    } else if (atlases && models && classifiers) {
      history.push({
        pathname: history.location.pathname,
        search: '',
      });
      setSelectedAtlas('');
      setSelectedModel('');
      setSelectedClassifier('');
    } else if (atlases && models) { // Push to history only if the atlas and model are chosen.
      history.push({
        pathname: history.location.pathname,
        search: '',
      });
      setSelectedAtlas('');
      setSelectedModel('');
    }
  }, [atlases, models, classifiers]);

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
              selectedClassifier={selectedClassifier}
              steps={steps}
              setSelectedAtlas={handleAtlasSelection}
              setSelectedModel={handleModelSelection}
              setSelectedClassifier={setSelectedClassifier}
              setActiveStep={handleStep}
              compatibleModels={selectedAtlas ? selectedAtlas.compatibleModels : []}
              compatibleClassifiers={selectedModel ? selectedModel.compatibleClassifiers : []}
              atlases={atlases}
              scviHubAtlases={scviHubAtlases}
              models={models}
              demos={demoDatasets}
              classifiers={classifiers}
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
              selectedClassifier={selectedClassifier}
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
