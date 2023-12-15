import {
  Box,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  Dialog,
  Grid,
  LinearProgress,
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
import { MULTIPART_UPLOAD_STATUS } from "shared/utils/common/constants";
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import { green } from "@mui/material/colors";



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

function UploadStatus({ uploadId, uploadProgress }) {
  const progress = uploadProgress[uploadId];

  if (!progress) {
    return <Typography variant="caption">No upload in progress</Typography>;
  }

  switch (progress.status) {
    case MULTIPART_UPLOAD_STATUS.IDLE:
      return <Typography variant="caption">Idle</Typography>;

    case MULTIPART_UPLOAD_STATUS.UPLOADING || MULTIPART_UPLOAD_STATUS.UPLOAD_PROGRESS:
      return (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <LinearProgress variant="determinate" value={calculateProgressValue(progress)} />
          <Typography variant="caption" sx={{ ml: 1 }}>Uploading...</Typography>
        </Box>
      );

    case MULTIPART_UPLOAD_STATUS.COMPLETE:
      return <Typography variant="caption">Upload Complete</Typography>;

    case MULTIPART_UPLOAD_STATUS.ERROR:
      return <Typography variant="caption" color="error">Error in Upload</Typography>;

    // Add more cases as needed for different statuses
    default:
      return <Typography variant="caption">Unknown Status</Typography>;
  }
}

function calculateProgressValue(progress) {
  // Assuming 'uploaded' and 'chunks' are numbers indicating progress
  console.log("progress in calculateProgressValue", progress)
  if(progress.uploaded && progress.chunks){
    return (progress.uploaded / progress.chunks) * 100;
  }else{
    return 0;
  }
  
}


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
  const [ uploadProgress, setUploadProgress] = useUploadProgress();
  

  

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
          flexDirection: "column",
          alignItems: "flex-start",
          paddingLeft: "100px",
          paddingTop: "3rem",
          paddingRight: "3rem",
          paddingBottom: "1rem",
          gap: "1rem",
          overflow: "hidden",
          transition: "padding-left 0.3s ease",
        }}
      >
        <Typography variant="h5" gutterBottom>
          Upload Progress
        </Typography>
        {Object.entries(uploadProgress).map(([uploadId, progress]) => (
          <Card key={uploadId} sx={{ width: '100%', mb: 2 }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                Status: {progress.status}
                {progress.status === MULTIPART_UPLOAD_STATUS.COMPLETE && (
                  <CheckCircleIcon sx={{ color: green[500], ml: 1 }} />
                )}
              </Typography>
              <Typography variant="body2">
                Key Path: {progress.keyPath}
              </Typography>
              <Typography variant="body2">
                Upload File Type: {progress.uploadFileType}
              </Typography>
              <Typography variant="body2">
                File Name: {progress.fileName}
              </Typography>


              {/* Displaying the progress or success icon */}
              {progress.status === MULTIPART_UPLOAD_STATUS.UPLOADING || 
              progress.status === MULTIPART_UPLOAD_STATUS.UPLOAD_FINISHING || 
              progress.status === MULTIPART_UPLOAD_STATUS.UPLOAD_PROGRESS ? (
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <LinearProgress
                    variant="determinate"
                    value={calculateProgressValue(progress)}
                    sx={{ flexGrow: 1, mr: 1 }}
                  />
                  <Typography variant="caption">
                    {calculateProgressValue(progress).toFixed(2)}%
                  </Typography>
                </Box>
              ) : progress.status === MULTIPART_UPLOAD_STATUS.SUCCESS ? (
                <Box sx={{ display: 'flex', alignItems: 'center', color: green[500] }}>
                  <CheckCircleIcon />
                  <Typography variant="caption" sx={{ ml: 1 }}>
                    Upload Successful
                  </Typography>
                </Box>
              ) : null}
            </CardContent>
          </Card>
        ))}

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
