import HelpIcon from '@mui/icons-material/Help';
import { Grid, Typography, Stack } from "@mui/material";
import AtlasCardSelect from "components/Cards/AtlasCardSelect";
import { ModelCardSelect } from "components/Cards/ModelCardSelect";
import CustomButton from 'components/CustomButton';
import styles from "./atlasModelChoice.module.css";
import { useHistory} from 'react-router-dom';
import { useEffect, useState } from 'react';
import ProjectMock from "shared/services/mock/projects"
import atlasPng from "assets/previewImages/atlas.png"

import CancelIcon from '@mui/icons-material/Cancel';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

import ModelService from 'shared/services/Model.service';

function AtlasModelChoice({ 
    activeStep, setActiveStep, 
    selectedAtlas, setSelectedAtlas, 
    selectedModel, setSelectedModel, steps, path
}) {
    let [atlases, setAtlases] = useState([]);
    let [models, setModels] = useState([]);
    const history = useHistory();

    let headerStyle = {
        color: "#003560",
        fontSize: "1.6rem",
        fontWeight: "bold",
    }
    
    useEffect(() => {
        ProjectMock.getAtlases().then(a => {
            a.map(a => {
                //adjust numberOfCells
                let numberOfCells = a.numberOfCells;
                let dimension = ""
                if (numberOfCells > 1000000000) {
                    numberOfCells = Math.round(numberOfCells / 1000000000);
                    dimension = "B";
                } else if (numberOfCells > 1000000) {
                    numberOfCells = Math.round(numberOfCells / 1000000);
                    dimension = "M";
                } else if (numberOfCells > 1000) {
                    numberOfCells = Math.round(numberOfCells / 1000);
                    dimension = "K"
                }
                a.numberOfCells = numberOfCells + dimension;

                //adjust modalities
                if (!(typeof a.modalities === "string")) {
                    //modalities ist array of strings
                    if (a.modalities.length == 0) {
                        a.modalities = "None";
                    } else if (a.modalities.length == 1) {
                        a.modalities = a.modalities[0];
                    } else {
                        a.modalities = a.modalities[0] + ', ...';
                    }
                }
                return a;
            })
            setAtlases(a);
        });
        ProjectMock.getModels().then(m => setModels(m));
    }, []);

    return (
        <div>
            <Typography variant="h5" sx={{ fontWeight: 'bold'}}>
                Pick an Atlas 
            </Typography>

            <Grid container spacing={2} width="100%" overflow="auto" wrap="nowrap">
                {
                    atlases.map(a => 
                        <Grid item height="320px">
                            <AtlasCardSelect width="225px"
                                height="97%"
                                title={a.name}
                                modalities={a.modalities}
                                cellsInReference={a.numberOfCells}
                                species={a.species}
                                imgLink={atlasPng}
                                selected={selectedAtlas.name===a.name}
                                onSelect={setSelectedAtlas}
                                atlasObject={a}
                            />      
                        </Grid>
                    )
                }
            </Grid>
            
            <Typography variant="h5" sx={{ fontWeight: 'bold'}} marginTop="32px">
                Pick a Model
            </Typography>

            <Grid container spacing={2} width="100%" overflow="auto" wrap="nowrap">
            {
                models.map(m => 
                    <Grid item height="150px">
                    <ModelCardSelect width="225px"
                            height="97%"
                            title={m.name} 
                            description={m.description}
                            selected={selectedModel.name===m.name}
                            onSelect={setSelectedModel}
                            modelObject={m}
                    />               
                </Grid>)
            }
            </Grid>
            <Stack direction='row' justifyContent='space-between' sx={{ marginTop:'20px'}}>
                <CustomButton type='tertiary' onClick={() => history.push(`${path}`)}>
                <CancelIcon/>&nbsp; Cancel
                </CustomButton>
                <CustomButton type='primary' disabled={!selectedAtlas || !selectedModel} onClick={() => setActiveStep(1)}>
                    Confirm&nbsp;<ArrowForwardIcon/>
                </CustomButton>
            </Stack>
        </div>
    )
}

export default AtlasModelChoice