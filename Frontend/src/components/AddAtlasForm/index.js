import { grey, teal } from "@mui/material/colors";

const {  Button, DialogContent, Grid, Typography, TextField, CircularProgress } = require("@mui/material");
const { useState } = require("react");
const { default: axiosInstance } = require("shared/services/axiosInstance");
import { makeStyles } from "@mui/styles";
import { Select, MenuItem } from "@mui/material";
import Autocomplete from '@mui/material/Autocomplete';




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
    
    const { setIsAddModalOpen, setIsLoading, user, isLoading, modelsList, classifiersList } = props;
    const [atlasName, setAtlasName] = useState("");
    const [previewPictureURL, setPreviewPictureURL] = useState("");
    const [modalities, setModalities] = useState([]);
    const [compatibleModels, setCompatibleModels] = useState([]);
    const [numberOfCells, setNumberOfCells] = useState("");
    const [species, setSpecies] = useState("");
    const [atlasFile, setAtlasFile] = useState(null);
    const [fileName, setFileName] = useState("");
    const [url, setUrl] = useState("");
    const [fileError, setFileError] = useState("");
    const [selectedClassifier, setSelectedClassifier] = useState("");
    const [classifierFile, setClassifierFile] = useState(null);
    // State to keep track of the selected files for each model
    const [modelFiles, setModelFiles] = useState({});
    const [encoderFile, setEncoderFile] = useState(null);

    
    


  
    const classes = useStyles();



    const validateModelSelectionAndFiles = () => {
      // Check if any model is selected
      if (compatibleModels.length === 0) {
          return false; // No models selected
      }
      // Check if each selected model has an associated file
      return compatibleModels.every(model => modelFiles[model.name]);
  };

    // Function to validate classifier file uploads
    const validateClassifierFiles = () => {
      return selectedClassifier === "" || (classifierFile && encoderFile);
    };
  
    const handleFormSubmit = (e) => {
      e.preventDefault();
      setIsLoading(true);
      // Create a new FormData object

      if (!validateModelSelectionAndFiles()) {
        alert("Please upload files for all selected models.");
        setIsLoading(false);
        return;
      }

      if (!validateClassifierFiles()) {
        alert("Please upload both classifier and encoder files.");
        setIsLoading(false);
        return;
      }

      const formData = new FormData();
        
      // Append form data
      formData.append("name", atlasName);
      formData.append("previewPictureURL", previewPictureURL);
      modalities.forEach((modality) => {
        formData.append("modalities", modality);
      });
      formData.append("numberOfCells", numberOfCells);
      formData.append("species", species);
      if (atlasFile) {
        formData.append("atlasFile", atlasFile);
      }

      const modelNames = compatibleModels.map(model => model.name);
      formData.append("compatibleModels", JSON.stringify(modelNames));

  
      formData.append("atlasUrl", url);
      formData.append("userId", user._id);
      // Append compatible model files
      
      // send each model 
      compatibleModels.forEach(model => {
        // set each model file to the corresponding model name like modefile_$model_name
        const modelFile = `modelFile_${model.name}`;
        formData.append(modelFile, modelFiles[model.name]);
      });
      

      if (selectedClassifier) {
        const selectedClassifierName = selectedClassifier.name;
        formData.append("selectedClassifier", selectedClassifierName);
        if (classifierFile) {
          formData.append("classifierFile", classifierFile);
        }
        if (encoderFile) {
          formData.append("encoderFile", encoderFile);
        }
      }

      // print the formdata that is being sent to the backend
      // Display the key/value pairs
      for (var pair of formData.entries()) {
        console.log(pair[0]+ ', ' + pair[1]); 
      }

      
  
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
          setAtlasFile(null);
          setFileName("");
          setUrl("");
          setIsLoading(false);
          setIsAddModalOpen(false);
          setCompatibleModels([]);
          setModelFiles({});
          setClassifierFile(null);
          setEncoderFile(null);
          setSelectedClassifier("");
          
          setFileError("");

          alert("Atlas added successfully");
        })
        .catch((error) => {
          console.error("Error creating atlas:", error);
          setIsLoading(false);
        });
    };
    const handleUrlChange = (e) => {
      setUrl(e.target.value);
      setAtlasFile(null);
    };

    const handleEncoderFileChange = (e) => {
      if (e.target.files[0]) {
        setEncoderFile(e.target.files[0]);
      }
    };

    const handleClassifierFileChange = (e) => {
      if (e.target.files[0]) {
        setClassifierFile(e.target.files[0]);
      }
    };
    

    const handleModelFileChange = (model, event) => {
      if (event.target.files[0]) {
        setModelFiles({
          ...modelFiles,
          [model.name]: event.target.files[0]
        });
      }
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
                <Autocomplete
                  multiple
                  id="compatibleModels"
                  options={modelsList}
                  getOptionLabel={(option) => option.name}
                  value={compatibleModels}
                  onChange={(event, newValue) => {
                    setCompatibleModels(newValue);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      label="Compatible Models"
                      placeholder="Select Models"
                    />
                  )}
                  required
                />
              </Grid>
              <Grid container>
                {compatibleModels.map((model, index) => (
                  <Grid item xs={8} key={index}>
                    <Button variant="contained" component="label">
                      Upload {model.name} File
                      <input
                        type="file"
                        hidden
                        onChange={(e) => handleModelFileChange(model, e)}
                      />
                    </Button>
                    {modelFiles[model.name] && <p>File: {modelFiles[model.name].name}</p>}
                  </Grid>
                ))}
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
                <Select
                  fullWidth
                  value={selectedClassifier}
                  onChange={(e) => {
                    setSelectedClassifier(e.target.value);
                    if (e.target.value === "") {
                      setClassifierFile(null);
                      setEncoderFile(null);
                    }
                  }}
                  displayEmpty
                  inputProps={{ 'aria-label': 'Classifier Type' }}
                >
                  <MenuItem value="">
                    <em>Select Classifier Type (Optional)</em>
                  </MenuItem>
                  {classifiersList.map((classifier, index) => (
                    <MenuItem key={index} value={classifier}>
                      {classifier.name}
                    </MenuItem>
                  ))}
                </Select>
              </Grid>


              {selectedClassifier && (
                <>
                  <Grid item xs={8}>
                    <Button variant="contained" component="label">
                      Select Encoder File
                      <input
                        type="file"
                        hidden
                        onChange={handleEncoderFileChange}
                      />
                    </Button>
                  </Grid>
                  <Grid item xs={8}>
                    <Button variant="contained" component="label">
                      Select Classifier File
                      <input
                        type="file"
                        hidden
                        onChange={handleClassifierFileChange}
                      />
                    </Button>
                  </Grid>
                </>
              )}

              <Grid item xs={8}>
                {atlasFile && (
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
  
                {!atlasFile && (
                  <TextField
                    fullWidth
                    margin="dense"
                    variant="outlined"
                    label="Atlas URL to download"
                    id="url"
                    value={url}
                    onChange={handleUrlChange}
                    required={!atlasFile}
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
  
                      setAtlasFile(e.target.files[0]);
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