import {
  Box,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  Dialog,
  Grid,
  Typography,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import AddAtlasForm from "components/AddAtlasForm";
import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import {  useUploadProgress } from "shared/context/UploadProgressContext";
import { useAuth } from "shared/context/authContext";
import AtlasService from "shared/services/Atlas.service";
import ClassifierService from "shared/services/Classifier.service";
import ModelService from "shared/services/Model.service";



const { default: CustomButton } = require("components/CustomButton");

const styles = {
  root: {
    flexGrow: 1,
  },
  gridForCard: {
    margin: 10,
    cursor: "pointer",
  },
};

const useStyles = makeStyles(styles);

const filterByUploadedPerson = (atlases, user) => {
  const filteredAtlases = atlases.filter((atlas) => {
    if (user.isAdministrator === true) {
      return true;
    }
    return atlas.uploadedBy === user._id;
  });
  return filteredAtlases;
};

const AtlasUpload = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [atlases, setAtlases] = useState([]);
  const [user, setUser] = useAuth();
  const classes = useStyles();
  const navigate = useHistory();
  const [modelResult, setModelResult] = useState([]);
  const [classifierResult, setClassifierResult] = useState([]);
  const [uploadProgressBarValue, setUploadProgressBarValue] = useState(0);
  const { uploadProgress, setProgress} = useUploadProgress();
  

  

  if (user.hasPermission === false) {
    navigate.push("/gene-mapper");
  }

  const handleModalClose = () => {
    setIsAddModalOpen(false);
  };

  useEffect(() => {
    const fetchAtlases = async () => {
      setIsLoading(true);
      const atlasResults = await AtlasService.getAtlases();
      const filteredAtlas = filterByUploadedPerson(atlasResults, user);
      const modelResult  = await ModelService.getModels();
      const classifierResult = await ClassifierService.getClassifiers();
      setModelResult(modelResult);
      setClassifierResult(classifierResult);
      setAtlases(filteredAtlas);
      console.log("atlases", atlasResults);

      // applyAtlasFilters(atlasResults);
      setIsLoading(false);
    };
    fetchAtlases();
  }, []);

  useEffect(() => {
    console.log('Updated uploadProgress', uploadProgress);
  }, [uploadProgress]);

  return (
    
    <>
      {/* {A heading which says My Atlases} */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "start",
          alignItems: "center",
          paddingTop: "3rem",
        }}
      >
        <Grid container justifyContent="center">
          <Grid item>
            <Typography variant="h4" component="h2" gutterBottom>
              My Atlases
            </Typography>
          </Grid>
        </Grid>
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "start",
          alignItems: "center",
          paddingTop: "3rem",
        }}
      >
        <Grid container justifyContent="center">
          <Grid item>
            <CustomButton
              onClick={() => {
                setIsAddModalOpen(true);
              }}
            >
              {" "}
              Upload Atlas
            </CustomButton>
          </Grid>
        </Grid>
      </Box>

      {atlases && atlases.length === 0 && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "start",
            alignItems: "center",
            paddingTop: "3rem",
          }}
        >
          <Grid container justifyContent="center">
            <Grid item>
              <Typography variant="h4" component="h2" gutterBottom>
                No Atlases Uploaded
              </Typography>
            </Grid>
          </Grid>
        </Box>
      )}

      <Grid
        container
        spacing={2}
        justify="center"
        marginLeft={10}
        paddingTop={2}
        marginRight={25}
      >
        {atlases &&
          atlases.map((atlas) => (
            
            <Grid className={classes.gridForCard} item key={atlas._id}>
              <Card
                onClick={() => {
                  console.log("Clicked");
                }}
              >
                <CardMedia
                  style={{ height: 0, paddingTop: "56.25%" }}
                  image={atlas.previewPictureURL}
                  title={atlas.name}
                />
                <CardContent>
                  <Typography gutterBottom variant="h5" component="h2">
                    {atlas.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    component="p"
                  >
                    {atlas.name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" component="p">
                    Status: {
                      atlas.atlasUploadId 
                        ? (uploadProgress[atlas.atlasUploadId] 
                            ? uploadProgress[atlas.atlasUploadId].status 
                            : 'Pending Upload') 
                        : 'No Upload ID' 
                    }
                  </Typography>

                </CardContent>
              </Card>
            </Grid>
          ))}
      </Grid>
      <Dialog
        className={classes.root}
        open={isAddModalOpen}
        fullWidth
        maxWidth="md"
        onClose={handleModalClose}
      >
      
        <AddAtlasForm
          setIsAddModalOpen={setIsAddModalOpen}
          setIsLoading={setIsLoading}
          user={user}
          isLoading={isLoading}
          modelsList= {modelResult}
          classifiersList= {classifierResult}
        />
      </Dialog>
    </>
    

  );
};
export default AtlasUpload;
