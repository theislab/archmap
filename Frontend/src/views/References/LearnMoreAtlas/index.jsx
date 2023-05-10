import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import CustomButton from 'components/CustomButton';
import AtlasService from 'shared/services/Atlas.service';
import { useParams, useHistory, useLocation } from 'react-router-dom';
import StarIcon from '@mui/icons-material/Star';
import { colors } from 'shared/theme/colors';

export const LearnMoreAtlasComponent = ({ onClick, id, isMap = false, isSearchPage = false }) => {
  const [atlas, setAtlas] = useState(null);
  const history = useHistory();
  const path = useLocation().pathname;

  useEffect(() => {
    if (id) {
      AtlasService.getAtlasById(id)
        .then((data) => setAtlas(data))
        .catch((err) => console.log(err));
    }
  }, [id]);

  return (

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
        <Typography sx={{ fontSize: '36px', fontWeigth: 700 }}>{atlas?.name} {atlas?.rating && [...Array(atlas?.rating)].map((e, i) => <StarIcon sx={{ color: 'gold' }} />)}</Typography>
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
          {atlas?.doi ? atlas.doi : "Not available"}
        </Typography>
      </Box>
      {/* Atlas URL */}
      <Box sx={{ display: 'flex', flexDirection: 'row' }}>
        <Typography sx={{ fontSize: '16px', fontWeight: 500 }}>
          URL:
          &nbsp;
        </Typography>
        <Typography sx={{ fontSize: '16px', fontWeight: 300 }}>
          {atlas?.url ? atlas.url : "Not available"}
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
