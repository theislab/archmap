import { useEffect, useState } from "react";
import axiosInstance from "shared/services/axiosInstance";

const { Dialog, DialogTitle, DialogContent, TextField, DialogActions, Button } = require("@mui/material")




const EditAtlasModal = (props) => {

    const {isEditModalOpen, setIsEditModalOpen, atlasDetailsForm, setAtlasDetailsForm} = props;
    const [atlasInDialog, setAtlasInDialog] = useState({...atlasDetailsForm});
    const handleEdit = () => {
        // Implement the logic to handle the atlas details update
        // You can access the updated atlas details from the form inputs
        // and update the state or make an API request to update the data

        axiosInstance
          .put(`/api/atlases/${atlasDetailsForm._id}`, atlasInDialog)
          .then(() => {
            setIsEditModalOpen(false);
            navigate("/");
            setAtlasDetailsForm(atlasInDialog);
          })
          .catch((error) => {
            console.error(error);
          });
    
        // After the update is successful, close the modal
      };

      useEffect(() => {
        setAtlasInDialog({ ...atlasDetailsForm });
      }, [atlasDetailsForm]);
    
    return(
        <Dialog
              open={isEditModalOpen}
              onClose={() => setIsEditModalOpen(false)}
              aria-labelledby="edit-dialog-title"
              aria-describedby="edit-dialog-description"
              maxWidth="md"
              fullWidth
            >
              <DialogTitle id="edit-dialog-title">Edit Atlas</DialogTitle>
              <DialogContent dividers>
                <form onSubmit={handleEdit}>
                  <TextField
                    label="Name"
                    value={atlasInDialog?.name || ""}
                    onChange={(e) =>
                        setAtlasInDialog((prevAtlasDetails) => ({
                        ...prevAtlasDetails,
                        name: e.target.value,
                      }))
                    }
                    fullWidth
                    margin="normal"
                  />
                  <TextField
                    label="Preview Picture URL"
                    value={atlasInDialog?.previewPictureURL || ""}
                    onChange={(e) =>
                        setAtlasInDialog((prevAtlasDetails) => ({
                        ...prevAtlasDetails,
                        previewPictureURL: e.target.value,
                      }))
                    }
                    fullWidth
                    margin="normal"
                  />
                  <TextField
                    label="Modalities"
                    value={atlasInDialog?.modalities || ""}
                    onChange={(e) =>
                        setAtlasInDialog((prevAtlasDetails) => ({
                        ...prevAtlasDetails,
                        modalities: e.target.value,
                      }))
                    }
                    fullWidth
                    margin="normal"
                  />
                  <TextField
                    label="Number of Cells"
                    value={atlasInDialog?.numberOfCells || ""}
                    onChange={(e) =>
                        setAtlasInDialog((prevAtlasDetails) => ({
                        ...prevAtlasDetails,
                        numberOfCells: e.target.value,
                      }))
                    }
                    fullWidth
                    margin="normal"
                  />

                  <TextField
                    label="Species"
                    value={atlasInDialog?.species || ""}
                    onChange={(e) =>
                        setAtlasInDialog((prevAtlasDetails) => ({
                        ...prevAtlasDetails,
                        species: e.target.value,
                      }))
                    }
                    fullWidth
                    margin="normal"
                  />

                  <TextField
                    label="Compatible Models"
                    value={atlasInDialog?.compatibleModels || ""}
                    onChange={(e) =>
                        setAtlasInDialog((prevAtlasDetails) => ({
                        ...prevAtlasDetails,
                        compatibleModels: e.target.value,
                      }))
                    }
                    fullWidth
                    margin="normal"
                  />

                  {/* Add more fields for other atlas details */}
                </form>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setIsEditModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  onClick={handleEdit}
                >
                  Save
                </Button>
              </DialogActions>
            </Dialog>

    )

}

export default EditAtlasModal;