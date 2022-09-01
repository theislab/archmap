/* eslint-disable */

import { Circle } from "@mui/icons-material"
import { Box, Typography, Link } from "@mui/material"
import { colors } from "shared/theme/colors"
import tum from 'assets/landing-illustrations/tum-logo.png';
import rostlab from 'assets/landing-illustrations/rostlab.png';
import helmholtz from 'assets/landing-illustrations/helmholtz.png';
import Helmholtz_TheisLab_Naturecover_2021 from 'assets/landing-illustrations/Helmholtz_TheisLab_Naturecover_2021_cropped.png';
import CustomButton from "components/CustomButton";
import { useHistory } from "react-router-dom";

const WindowiOS = ({ onGetStartedClick }) => {
  const history = useHistory()

  return (
    <Box
      sx={{
        position: "relative",
        width: { xs: "90%", sm: "90%", md: "61.8%", lg: "61.8%", xl: "61.8%" },
        margin: "auto",
        color: "white",
        p: "0.7em",
        marginTop: "10%",
        marginBottom: "2em",
      }}
    >
      <Box sx={{ p: { xs: "1em 1em", sm: "1em 4em", md: "1em 4em", lg: "1em 4em", xl: "1em 4em", textAlign: 'center' }, borderWidth: "1px", borderRadius:"20px" }}>
        <Box sx={{ backdropFilter: "blur(5px)", borderRadius: '20px', textAlign: "center", padding: '10px' }}>
          <Typography fontSize={{ xs: "1.7rem", sm: "2.3rem", md: "2.1rem", lg: "3.1rem", xl: "3.1rem" }}  fontWeight="bold">
            Single-Cell Reference Mapping
          </Typography>
          <Typography fontSize="1.2rem" fontWeight="light" color="white" marginTop='10px' marginBottom='20px'>
            Reference-Based Analysis of Single-Cell Omics Data Powered by scArches
         </Typography>
        </Box>
        <Box sx={{ display: 'inline-block', padding: '30px', borderRadius: '20px', margin: "3em 2em 2em 2em" }}>
          <CustomButton onClick={() => onGetStartedClick()} type="primary">
            <Typography fontSize="17px" fontWeight="400" >
              Get started
            </Typography>
          </CustomButton>
        </Box>
        
        {/* commented out bottom part is about the partners */}
        {/* DIVIDER */}
        {/* <Box sx={{ marginTop: "3em", display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Box sx={{ height: "1px", width: { xs: "25%", sm: "37%", md: "35%", lg: "40%", xl: "40%" }, backgroundColor: "rgba(255,255,255, 0.5)" }} />
          <Typography fontSize={{ xs: "0.6em", sm: "1em", md: "1em", lg: "1em", xl: "1em" }} >Our partners</Typography>
          <Box sx={{ height: "1px", width: { xs: "25%", sm: "37%", md: "35%", lg: "40%", xl: "40%" }, backgroundColor: "rgba(255,255,255, 0.5)" }} />
        </Box> */}
      </Box>
      {/* BUTTON PLACEHOLDER UNTIL WE HAVE A BUTTON DESIGN */}
      {/* <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row", md: "row", lg: "row", xl: "row" },
          justifyContent: "center",
          alignItems: "center",
          width: "80%",
          margin: "auto",
          p: "1em 1em 2em 1em"
        }}
      > */}
        {/* <Box sx={{ margin: { xs: "2em 2em", sm: "0em", md: "0em", lg: "0em", xl: "0em" } }} >
          <img src={rostlab} alt="ROSTLAB" style={{ width: "10em", height: "auto" }} />
        </Box> */}
        {/* <Box sx={{ margin: { xs: "2em 2em", sm: "0em", md: "0em", lg: "0em", xl: "0em" } }} >
          <img src={helmholtz} alt="HELMHOLTZ" style={{ width: "10em", height: "auto" }} />
        </Box> */}
        {/* <Box sx={{ margin: { xs: "2em 2em", sm: "0em", md: "0em", lg: "0em", xl: "0em" } }} >
          <img src={tum} alt="TUM" style={{ width: "5em", height: "auto" }} />
        </Box> */}
      {/* </Box> */}
    </Box>
  )
}

export default WindowiOS