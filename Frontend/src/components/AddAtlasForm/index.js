import { grey, teal } from "@mui/material/colors";

const {
  Button,
  DialogContent,
  Grid,
  Typography,
  TextField,
  CircularProgress,
} = require("@mui/material");
const { useState } = require("react");
const { default: axiosInstance } = require("shared/services/axiosInstance");
import { makeStyles } from "@mui/styles";
import { Select, MenuItem } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import AtlasUploadService from "shared/services/AtlasUpload.service";
import {
  initUploadProgress,
  useUploadProgress,
} from "shared/context/UploadProgressContext";
import { uploadAtlasAndModelFiles } from "shared/services/UploadLogic";
import {
  MULTIPART_UPLOAD_STATUS,
  UPLOAD_FILE_TYPE,
} from "shared/utils/common/constants";

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
  const {
    setIsAddModalOpen,
    setIsLoading,
    user,
    isLoading,
    modelsList,
    classifiersList,
  } = props;
  const [atlasName, setAtlasName] = useState("");
  // const [inrevision, setRevisionStatus] = useState(false);
  const [previewPictureURL, setPreviewPictureURL] = useState("https://storage.googleapis.com/jst-2021-bucket-static/images_atlas/inrevision.png");
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
  const [encoderFileName, setEncoderFileName] = useState("");
  const [classifierFileName, setClassifierFileName] = useState("");

  const [uploadProgress, setUploadProgress] = useUploadProgress();

  const classes = useStyles();

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

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

    try {
      // Assuming AtlasUploadService.createAtlas is an async function
      const { atlas, models } = await AtlasUploadService.createAtlas(
        atlasName,
        previewPictureURL,
        modalities,
        numberOfCells,
        species,
        compatibleModels.map((model) => model.name),
        selectedClassifier.name,
        url,
        user._id
      );

      // Initialize atlas uploads
      if (atlasFile) {
        console.log("atlas upload path", atlas.atlasUploadPath);
        console.log(
          "atlas file, atlas upload id, atlas upload path",
          atlasFile,
          atlas.atlasUploadId,
          atlas.atlasUploadPath
        );
        handleFileUpload(
          atlasFile,
          atlas.atlasUploadId,
          atlas.atlasUploadPath,
          UPLOAD_FILE_TYPE.ATLAS
        );
      }
      if (atlas.classifierUploadId) {
        handleFileUpload(
          classifierFile,
          atlas.classifierUploadId,
          atlas.classifierUploadPath,
          UPLOAD_FILE_TYPE.CLASSIFIER
        );
        handleFileUpload(
          encoderFile,
          atlas.encoderUploadId,
          atlas.encoderUploadPath,
          UPLOAD_FILE_TYPE.ENCODER
        );
      }

      // Initialize model uploads
      models.forEach((model) => {
        if (modelFiles[model.model.name]) {
          console.log("model upload path", model.modelUploadPath);
          handleFileUpload(
            modelFiles[model.model.name],
            model.modelUploadId,
            model.modelUploadPath,
            UPLOAD_FILE_TYPE.MODEL
          );
        }
      });

      alert("File upload started successfully. Once your files are uploaded, a quality check will be conducted by the ArchMap team to make sure the atlas meets all ArchMap quidelines.");
    } catch (error) {
      console.error("Error during form submission:", error);
      axiosInstance
        .delete(`/api/atlases/${atlas._id}`)
        .then(() => {
          console.log("atlas deleted successfully");
          setIsLoading(false);
        })
        .catch((error) => {
          console.error(error);
          setIsLoading(false);
        });
      setIsLoading(false);
      // Handle any errors that occurred during submission
    } finally {
      // Reset the form and state
      setIsLoading(false);
      setAtlasName("");
      setRevisionStatus(true);
      setPreviewPictureURL("https://storage.googleapis.com/jst-2021-bucket-static/images_atlas/inrevision.png");
      setModalities([]);
      setCompatibleModels([]);
      setNumberOfCells("");
      setSpecies("");
      setAtlasFile(null);
      setFileName("");
      setUrl("");
      setFileError("");
      setSelectedClassifier("");
      setClassifierFile(null);
      setModelFiles({});
      setEncoderFile(null);

      setIsAddModalOpen(false);
    }
  };

  const handleFileUpload = async (file, uploadId, keyPath, uploadFileType) => {
    console.log("UPLOAD ID for filetype  IS ", uploadId, uploadFileType);

    // Initialize the upload progress for this uploadId
    setUploadProgress((prev) => {
      const newProgress = {
        ...prev,
        [uploadId]: initUploadProgress(
          uploadId,
          keyPath,
          uploadFileType,
          file.name
        ),
      };

      // Call the upload function here after state update
      uploadAtlasAndModelFiles(
        uploadId,
        file,
        keyPath,
        /**
         * A callback function used to update the upload progress in the parent component.
         *
         * @callback ProgressUpdateCallback
         * @param {string} uploadId - The unique identifier for the upload being updated.
         * @param {object} newProgressFields - An object containing new progress fields to be merged with the existing progress state.
         * @returns {void}
         */
        (uploadId, newProgressFields) => {
          setUploadProgress((prevProgress) => ({
            ...prevProgress,
            [uploadId]: {
              ...prevProgress[uploadId],
              ...newProgressFields,
            },
          }));
          // get all upload ids in the uploadProgress state and check if all uploads are complete
          const allUploadsComplete = Object.keys(uploadProgress).every(
            (uploadId) =>
              uploadProgress[uploadId].status ===
              MULTIPART_UPLOAD_STATUS.COMPLETE
          );
          if (allUploadsComplete) {
            // All uploads are complete, so reset the upload progress state
          }
        },
        newProgress,
        uploadFileType
      );

      return newProgress;
    });
  };

  const validateModelSelectionAndFiles = () => {
    // Check if any model is selected
    if (compatibleModels.length === 0) {
      return false; // No models selected
    }
    // Check if each selected model has an associated file
    return compatibleModels.every((model) => modelFiles[model.name]);
  };

  // Function to validate classifier file uploads
  const validateClassifierFiles = () => {
    return selectedClassifier === "" || (classifierFile && encoderFile);
  };

  const handleUrlChange = (e) => {
    setUrl(e.target.value);
    setAtlasFile(null);
  };

  const handleEncoderFileChange = (e) => {
    const encFile = e.target.files[0];
    if (encFile) {
      setEncoderFile(encFile);
      setEncoderFileName(encFile.name);
    }
  };

  const handleClassifierFileChange = (e) => {
    const classifierFile = e.target.files[0];
    if (classifierFile) {
      setClassifierFileName(classifierFile.name);
      setClassifierFile(classifierFile);
    }
  };

  const handleModelFileChange = (model, event) => {
    if (event.target.files[0]) {
      setModelFiles({
        ...modelFiles,
        [model.name]: event.target.files[0],
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
                    // required
                  />
                </Grid>
                <Grid item xs={8}>
                  <TextField
                    fullWidth
                    margin="dense"
                    variant="outlined"
                    label="Modalities (Provide comma separated values)"
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
                    options={modelsList.filter((model) => model.name !== 'scPoli')}
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
                      {modelFiles[model.name] && (
                        <p>File: {modelFiles[model.name].name}</p>
                      )}
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
                    inputProps={{ "aria-label": "Classifier Type" }}
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
                      {encoderFileName && (
                        <span style={{ marginLeft: "20px" }}>
                          Selected file is: {encoderFileName}
                        </span>
                      )}
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
                      {classifierFileName && (
                        <span style={{ marginLeft: "20px" }}>
                          Selected file is: {classifierFileName}
                        </span>
                      )}
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
                          // value={inrevision}
                          // onChange={(e) => {
                          //   setRevisionStatus(e.target.value);
                          // }}
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
