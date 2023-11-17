import React, { useEffect, useState } from 'react';
import { Box, Link, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';
import CustomButton from 'components/CustomButton';
import { useHistory, useLocation } from 'react-router-dom/cjs/react-router-dom.min';
import { colors } from "shared/theme/colors";
import ClassifierService from 'shared/services/Classifier.service';

export const LearnMoreClassifierComponent = ({ onClick, id, isMap = false, isSearchPage = false }) => {

  const [classifier, setClassifier] = useState(null);
  const history = useHistory();

  useEffect(() => {
    if (id) {
        ClassifierService.getClassifierById(id)
        .then((data) => setClassifier(data))
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
      {isSearchPage && <Typography onClick={history.goBack} sx={{ cursor: "pointer", fontSize: "18px", fontWeight: 500,  color: colors.neutral[800], ":hover": { color: colors.primary[500] }}}>Go Back</Typography>}
      <Box sx={{
        display: 'flex', flexDirection: 'row', width: '100%', justifyContent: 'space-between',
      }}
      >
        <Typography sx={{ fontSize: '36px', fontWeigth: 700 }}>{classifier?.name}</Typography>
      </Box>
      <Box>
        <Typography sx={{ fontSize: '20px', fontWeight: 600, borderBottom: '1px solid black' }}>Overview</Typography>
      </Box>

      <Typography sx={{ width: '100%', maxWidth: '800px' }}>Description: {classifier?.description}</Typography>
      {
        // isSelect
        isMap && !isSearchPage &&
        <CustomButton sx={{ marginTop: "1em", padding: "0.5em 2em 0.5em 2em" }} type="primary" onClick={() => onClick(classifier)}>Select</CustomButton>
      }
      <Box sx={{ display: 'flex', flexDirection: 'row' }}>
        <Typography sx={{ fontSize: '16px', fontWeight: 500 }}>
          URL:
          &nbsp;
        </Typography>
        <Typography sx={{ fontSize: '16px', fontWeight: 300 }}>
          {classifier?.url ? <Link href={classifier.url} sx={{ textDecoration: 'none' }} target="_blank" rel="noopener">{classifier.url}</Link> : "Not available"}
      </Typography>
      </Box>

    </Box>
  );
}

export default function LearnMore({handleSelect}) {
  const { id } = useParams();
  const path = useLocation();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <Box sx={{
        marginTop: '12px',
        width: '80%',
        height: '80vh'
      }}
      >
        <LearnMoreClassifier id={id} isMap={true} onClick={handleSelect} isSearchPage={path.pathname.includes("search")}/>
      </Box>
    </Box>
  )
}
