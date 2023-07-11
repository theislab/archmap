import { grey, teal } from "@mui/material/colors";

const {  Button, DialogContent, Grid, Typography, TextField, CircularProgress } = require("@mui/material");
const { useState } = require("react");
const { default: axiosInstance } = require("shared/services/axiosInstance");
import { makeStyles } from "@mui/styles";





const styles = {
    padding: {
      padding: 4,
    },
    mainHeader: {
      backgroundColor: grey[100],
      padding: 20,
      alignItems: "center",
    },
    mainContent: {
      padding: 40,
    },
    primaryColor: {
      color: teal[500],
    },
    secondaryColor: {
      color: grey[700],
    },
    addAtlasButton: {
      backgroundColor: "blue", // Use the primary color from the theme
      color: "white", // Use the contrasting text color for visibility
      "&:hover": {
        backgroundColor: "darkblue", // When hovering, change to a slightly darker shade
      },
    },
  };

  const useStyles = makeStyles(styles);


  const AddAtlasForm = (props) => {
    const { setIsAddModalOpen, setIsLoading, user, isLoading } = props;
    const [atlasName, setAtlasName] = useState("");
    const [previewPictureURL, setPreviewPictureURL] = useState("");
    const [modalities, setModalities] = useState([]);
    const [compatibleModels, setCompatibleModels] = useState([]);
    const [numberOfCells, setNumberOfCells] = useState("");
    const [species, setSpecies] = useState("");
    const [file, setFile] = useState(null);
    const [fileName, setFileName] = useState("");
    const [url, setUrl] = useState("");
    const [fileError, setFileError] = useState("");
  
    const classes = useStyles();
  
    const handleFormSubmit = (e) => {
      e.preventDefault();
      setIsLoading(true);
      // Create a new FormData object
      const formData = new FormData();
        
      // Append form data
      formData.append("name", atlasName);
      formData.append("previewPictureURL", previewPictureURL);
      modalities.forEach((modality) => {
        formData.append("modalities", modality);
      });
      formData.append("numberOfCells", numberOfCells);
      formData.append("species", species);
      if (file) {
        formData.append("file", file);
      }
      compatibleModels.forEach((model) => {
        formData.append("compatibleModels", model);
      });
  
      formData.append("atlasUrl", url);
      formData.append("userId", user._id);
  
      // Make the API request to create the atlas using Axios
      axiosInstance
        .post("/atlases/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((response) => {
          // Handle the response
          console.log("Atlas created:", response.data);
  
          // Reset form fields
          setAtlasName("");
          setPreviewPictureURL("");
          setModalities([]);
          setNumberOfCells("");
          setSpecies("");
          setFile(null);
          setFileName("");
          setUrl("");
          setIsLoading(false);
          setIsAddModalOpen(false);
          alert("Atlas added successfully");
        })
        .catch((error) => {
          console.error("Error creating atlas:", error);
          setIsLoading(false);
        });
    };
    const handleUrlChange = (e) => {
      setUrl(e.target.value);
      setFile(null);
    };
    
    return (
      <>
        {isLoading ? (
          <DialogContent className={classes.padding}>
            <Grid
              container
              direction="row"
              justifyContent="center"
              alignItems="center"
              margin={5}
            >
                <CircularProgress />
            </Grid>
          </DialogContent>
        ) : (
          <form
            onSubmit={(e) => {
              handleFormSubmit(e);
            }}
          >
            <DialogContent className={classes.padding}>
            <Grid container>
            <Grid item xs={12}>
              <Grid container direction="row" className={classes.mainHeader}>
                <Grid item xs={12}>
                  <Typography className={classes.primaryColor} variant="h5">
                    Add A New Atlas here
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
  
            <Grid
              container
              direction="row"
              className={classes.mainContent}
              spacing={1}
            >
              <Grid item xs={8}>
                <TextField
                  fullWidth
                  margin="dense"
                  variant="outlined"
                  label="Atlas Name to display"
                  id="name"
                  value={atlasName}
                  onChange={(e) => {
                    setAtlasName(e.target.value);
                  }}
                  required
                />
              </Grid>
              <Grid item xs={8}>
                <TextField
                  fullWidth
                  margin="dense"
                  variant="outlined"
                  label="Preview Picture URL"
                  id="previewPictureURL"
                  value={previewPictureURL}
                  onChange={(e) => {
                    setPreviewPictureURL(e.target.value);
                  }}
                  required
                />
              </Grid>
              <Grid item xs={8}>
                <TextField
                  fullWidth
                  margin="dense"
                  variant="outlined"
                  label="Modalities (Proivde comma separated values)"
                  id="modalities"
                  value={modalities}
                  onChange={(e) => {
                    setModalities(e.target.value.split(","));
                  }}
                  required
                />
              </Grid>
              <Grid item xs={8}>
                <TextField
                  fullWidth
                  margin="dense"
                  variant="outlined"
                  label="Compatible Models(Proivde comma separated values)"
                  id="compatibleModels"
                  value={compatibleModels}
                  onChange={(e) => {
                    setCompatibleModels(e.target.value.split(","));
                  }}
                  required
                />
              </Grid>
              <Grid item xs={8}>
                <TextField
                  fullWidth
                  margin="dense"
                  variant="outlined"
                  label="Number of Cells"
                  id="numberOfCells"
                  value={numberOfCells}
                  onChange={(e) => {
                    setNumberOfCells(e.target.value);
                  }}
                  required
                />
              </Grid>
              <Grid item xs={8}>
                <TextField
                  fullWidth
                  margin="dense"
                  variant="outlined"
                  label="Species"
                  id="species"
                  value={species}
                  onChange={(e) => {
                    setSpecies(e.target.value);
                  }}
                  required
                />
              </Grid>
              <Grid item xs={8}>
                {file && (
                  <TextField
                    fullWidth
                    margin="dense"
                    variant="outlined"
                    label="Uploaded file"
                    value={fileName}
                    InputProps={{
                      readOnly: true,
                    }}
                  />
                )}
  
                {!file && (
                  <TextField
                    fullWidth
                    margin="dense"
                    variant="outlined"
                    label="Atlas URL to download"
                    id="url"
                    value={url}
                    onChange={handleUrlChange}
                    required={!file}
                  />
                )}
              </Grid>
              <Grid item xs={8}>
                <Button variant="contained" component="label">
                  <input
                    type="file"
                    onChange={(e) => {
                      if (!e.target.files || e.target.files.length === 0) {
                        // you can display the error to the user
                        console.error("Select a file");
                        setFileError("Select a file");
                        return;
                      }
  
                      setFile(e.target.files[0]);
                      const { name } = e.target.files[0];
                      setFileName(name);
                      setFileError("");
                      setUrl("");
                    }}
                    accept=".h5ad"
                    required={url.trim() === ""}
                  />
                  Select Atlas
                </Button>
  
                {/* {fileError.trim() === "" && (
                      <Typography color="error">{fileError.trim()}</Typography>
                    )}
                    <Typography variant="body1" component="p">
                      {fileName && <p>Uploaded file is : {fileName} </p>}
                    </Typography> */}
              </Grid>
  
              <Grid item xs={12}>
                <Grid container direction="row" spacing={1}>
                  <Grid item xs={4}>
                    <Button onClick={() => setIsAddModalOpen(false)}>
                      Cancel
                    </Button>
                  </Grid>
                  <Grid item xs={4}>
                    {user.hasPermission ? (
                      <Button
                        type="submit"
                        className={classes.addAtlasButton} // Apply the custom style
                      >
                        Add Atlas
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        disabled
                        className={classes.addAtlasButton} // Apply the custom style
                      >
                        Add Atlas
                      </Button>
                    )}
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
            </DialogContent>
          </form>
        )}
      </>
    );
  };

  export default AddAtlasForm;