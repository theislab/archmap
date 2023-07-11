import React, { useEffect, useState } from 'react';
import { Box, Typography, Link, Tooltip, Button, Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText } from '@mui/material';
import CustomButton from 'components/CustomButton';
import AtlasService from 'shared/services/Atlas.service';
import { useParams, useHistory, useLocation } from 'react-router-dom';
import StarIcon from '@mui/icons-material/Star';
import { colors } from 'shared/theme/colors';
import { useAuth } from 'shared/context/authContext';
import axiosInstance from 'shared/services/axiosInstance';
import EditAtlasModal from 'components/EditAtlasModal';

export const LearnMoreAtlasComponent = ({ onClick, id, isMap = false, isSearchPage = false }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [atlas, setAtlas] = useState(null);
  const history = useHistory();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const path = useLocation().pathname;
  const [user, setUser] = useAuth();


  const handleDelete = () => {
    setIsLoading(true);
    axiosInstance
      .delete(`/api/atlases/${id}`)
      .then(() => {
        setIsDeleteModalOpen(false);
        setIsLoading(false);
        history.goBack();
        alert("Atlas  deleted successfully");
      })
      .catch((error) => {
        console.error(error);
        setIsLoading(false);
      });
      setIsLoading(false);
  };
  

  useEffect(() => {
    if (id) {
      AtlasService.getAtlasById(id)
        .then((data) => setAtlas(data))
        .catch((err) => console.log(err));
    }
  }, [id]);

  return (
    <>
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
    }}
    >
      {isSearchPage && <Typography onClick={history.goBack} sx={{ cursor: "pointer", fontSize: "18px", fontWeight: 500, color: colors.neutral[800], ":hover": { color: colors.primary[500] } }}>Go Back</Typography>}
      <Box sx={{
        display: 'flex', flexDirection: 'row', width: '100%', justifyContent: 'space-between',
      }}
      >
        <Tooltip title="atlas rating, 3 stars highest" placement="bottom-end">
          <Typography sx={{ fontSize: '36px', fontWeight: 700 }}>
            {atlas?.name} {atlas?.rating && [...Array(atlas?.rating)].map((e, i) => <StarIcon sx={{ color: 'gold' }} />)}
          </Typography>
        </Tooltip>
      </Box>
      <Box>
        <Typography sx={{ fontSize: '20px', fontWeight: 600, borderBottom: '1px solid black' }}>Overview</Typography>
      </Box>
      {/* Species */}
      <Box sx={{ display: 'flex', flexDirection: 'row', paddingTop: '16px' }}>
        <Typography sx={{ fontSize: '16px', fontWeight: 500 }}>
          Species:
          &nbsp;
        </Typography>
        <Typography sx={{ fontSize: '16px', fontWeight: 300 }}>
          {atlas?.species ? atlas.species : "Not available"}
        </Typography>
      </Box>
      {/* Number of Samples/Individuals */}
      <Box sx={{ display: 'flex', flexDirection: 'row' }}>
        <Typography sx={{ fontSize: '16px', fontWeight: 500 }}>
          Number of samples/individuals:
          &nbsp;
        </Typography>
        <Typography sx={{ fontSize: '16px', fontWeight: 300 }}>
          {atlas?.samples ? atlas.samples : "Not available"}
        </Typography>
      </Box>
      {/* Number of Studies/Datasets */}
      <Box sx={{ display: 'flex', flexDirection: 'row' }}>
        <Typography sx={{ fontSize: '16px', fontWeight: 500 }}>
          Number of Studies:
          &nbsp;
        </Typography>
        <Typography sx={{ fontSize: '16px', fontWeight: 300 }}>
          {atlas?.studies ? atlas.studies : "Not available"}
        </Typography>
      </Box>
      {/* Cells in reference */}
      <Box sx={{ display: 'flex', flexDirection: 'row' }}>
        <Typography sx={{ fontSize: '16px', fontWeight: 500 }}>
          Cells in Reference:
          &nbsp;
        </Typography>
        <Typography sx={{ fontSize: '16px', fontWeight: 300 }}>
          {atlas?.numberOfCells ? atlas.numberOfCells : "Not available"}
        </Typography>
      </Box>
      {/* Modalities */}
      <Box sx={{ display: 'flex', flexDirection: 'row' }}>
        <Typography sx={{ fontSize: '16px', fontWeight: 500 }}>
          Modalities:
          &nbsp;
        </Typography>
        <Typography sx={{ fontSize: '16px', fontWeight: 300 }}>
          {atlas?.modalities ? atlas.modalities : "Not available"}
        </Typography>
      </Box>
      {/* DOI */}
      <Box sx={{ display: 'flex', flexDirection: 'row' }}>
        <Typography sx={{ fontSize: '16px', fontWeight: 500 }}>
          DOI:
          &nbsp;
        </Typography>
        <Typography sx={{ fontSize: '16px', fontWeight: 300 }}>
          {atlas?.doi ? <Link href={atlas.doi} sx={{ textDecoration: 'none' }} target="_blank" rel="noopener">{atlas.doi}</Link> : "Not available"}
        </Typography>
      </Box>
      {/* Atlas URL */}
      <Box sx={{ display: 'flex', flexDirection: 'row' }}>
        <Typography sx={{ fontSize: '16px', fontWeight: 500 }}>
          URL:
          &nbsp;
        </Typography>
        <Typography sx={{ fontSize: '16px', fontWeight: 300 }}>
          {atlas?.url ? <Link href={atlas.url} sx={{ textDecoration: 'none' }} target="_blank" rel="noopener">{atlas.url}</Link> : "Not available"}
        </Typography>
      </Box>
      {/* Atlas cell_type_key */}
      <Box sx={{ display: 'flex', flexDirection: 'row' }}>
        <Typography sx={{ fontSize: '16px', fontWeight: 500 }}>
          Atlas cell type key:
          &nbsp;
        </Typography>
        <Typography sx={{ fontSize: '16px', fontWeight: 300 }}>
          {atlas?.cell_type_key ? atlas?.cell_type_key : "Not available"}
        </Typography>
      </Box>
      {/* Atlas batch_key */}
      <Box sx={{ display: 'flex', flexDirection: 'row' }}>
        <Typography sx={{ fontSize: '16px', fontWeight: 500 }}>
          Atlas batch key:
          &nbsp;
        </Typography>
        <Typography sx={{ fontSize: '16px', fontWeight: 300 }}>
          {atlas?.atlas_batch_key ? atlas?.atlas_batch_key : "Not available"}
        </Typography>
      </Box>
      {/* Create an Edit and Delete Button */}
      {user && user.isAdministrator && 
      <Box sx={{ display: 'flex', flexDirection: 'row' }}>
        <Button sx={{ margin: '1em', padding: "1em 2em 0.5em 2em" }} type="primary"  onClick={ () => setIsEditModalOpen(true) }>Edit</Button>
        <Button sx={{ margin: '1em', padding: "1em 2em 0.5em 2em" }} type="primary" onClick={ () => setIsDeleteModalOpen(true) } >Delete</Button>
      </Box> }
      

      <Box sx={{ display: 'flex', flexDirection: 'row' }}>
        
      </Box>


      {
        isMap
        &&
        !isSearchPage
        &&
        <>
          <CustomButton sx={{ marginTop: '1em', padding: "0.5em 2em 0.5em 2em" }} type="primary" onClick={() => onClick(atlas)}>Select</CustomButton>
        </>
      }
    </Box>
    
    <EditAtlasModal atlasDetailsForm= {atlas} setAtlasDetailsForm={setAtlas} isEditModalOpen={isEditModalOpen} setIsEditModalOpen={setIsEditModalOpen}></EditAtlasModal>
    <Dialog
      open={isDeleteModalOpen}
      onClose={() => setIsDeleteModalOpen(false)}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
        <DialogTitle id="alert-dialog-title">
          {"Do you want to delete this atlas?"}
        </DialogTitle>
        <DialogContent>
        {isLoading ? <CircularProgress /> : <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this atlas?
          </DialogContentText>
        }
        </DialogContent>  
        <DialogActions>
          <Button onClick={() => setIsDeleteModalOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleDelete} autoFocus>
            Yes, Delete it!
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default function LearnMore({ handleSelect }) {
  const path = useLocation();
  const { id } = useParams();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <Box sx={{
        marginTop: '12px',
        width: '80%',
        height: '80vh'
      }}
      >
        <LearnMoreAtlasComponent id={id} isMap={true} onClick={handleSelect} isSearchPage={path.pathname.includes("search")} />
      </Box>
    </Box>
  );
}
