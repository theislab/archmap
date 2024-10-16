/* eslint-disable */
import { Box, Typography, Link } from "@mui/material";
import { colors } from 'shared/theme/colors';
import CustomButton from "components/CustomButton";
import { useHistory } from "react-router-dom";

const WindowiOS = ({ onGuideClick, backgroundImageLoaded }) => {
  const history = useHistory()

  return (
    <Box
      sx={{
        width: { xs: "90%", sm: "90%", md: "61.8%", lg: "61.8%", xl: "61.8%" },
        margin: "auto",
        color: "white",
        p: "0.7em",
      }}
    >
      <Box sx={{ p: { xs: "1em 1em", sm: "1em 4em", md: "1em 4em", lg: "1em 4em", xl: "1em 4em", textAlign: 'center' }, borderWidth: "1px", borderRadius: "20px" }}>
        <Box sx={{ backdropFilter: backgroundImageLoaded ? "blur(5px)" : '', borderRadius: '20px', textAlign: "center", padding: '10px' }}>
          <Typography fontSize={{ xs: "1.7rem", sm: "2.3rem", md: "2.1rem", lg: "3.1rem", xl: "3.1rem" }} fontWeight="bold">
            Single-Cell Reference Mapping
          </Typography>
          <Typography fontSize="1.2rem" fontWeight="light" color="white" marginTop='10px' marginBottom='20px'>
            Reference-Based Analysis of Single-Cell Omics Data Powered by scArches
          </Typography>
        </Box>
        <Box sx={{ display: 'inline-block', borderRadius: '20px', margin: "3em 2em 2em 2em" }}>
          <CustomButton sx={{ margin: '10px'}} onClick={() => history.push('/genemapper')} type="primary">
            <Typography fontSize="17px" fontWeight="400" >
              Get started
            </Typography>
          </CustomButton>
          <CustomButton
            onClick={() => onGuideClick()}
            sx={{ margin: '10px' }}
            type="primary2">
            <Typography>Quick Guide</Typography>
          </CustomButton>
        </Box>

        {/* commented out part below is about the partners */}
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