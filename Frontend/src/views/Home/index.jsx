/* eslint-disable */

import { Box, Typography, Button, Stack, TextField, TextareaAutosize } from "@mui/material";
import UploadIcon from '@mui/icons-material/Upload';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import Navbar from "components/NavBar";
import WindowiOS from "components/WindowiOS";
import Footer from "components/Footer";
import LoginForm from 'components/LoginForm'
import RegistrationForm from 'components/RegistrationForm'
import { useState, useEffect, useRef, useContext } from "react";
import { colors } from "shared/theme/colors";
import graphic1 from 'assets/landing-illustrations/science.png';
import graphic2 from 'assets/landing-illustrations/upload.png';
import graphic3 from 'assets/landing-illustrations/processing.png';
import graphic4 from 'assets/landing-illustrations/results.png';
import Helmholtz_TheisLab_Naturecover_2021_Blur from 'assets/landing-illustrations/Helmholtz_TheisLab_Naturecover_2021_blurred.png';
import Helmholtz_TheisLab_Naturecover_2021 from 'assets/landing-illustrations/Helmholtz_TheisLab_Naturecover_2021.png';
import CustomButton from "components/CustomButton";
import Input from 'components/Input/Input'
import { Link, NavLink, useHistory, useLocation } from "react-router-dom";
import PasswordForgetForm from "components/PasswordForgetForm";
import ContactForm from 'components/ContactForm';
import { LoginContext } from "shared/context/loginContext";

const Home = () => {

  const history = useHistory();
  const location = useLocation();

  const [backgroundImage, setBackgroundImage] = useState(Helmholtz_TheisLab_Naturecover_2021_Blur);

  const context = useContext(LoginContext)

  const onLoginClicked = () => {
    context.switchRegister(false)
    context.switchLogin(true)
  }

  const onSignUpClicked = () => {
    context.switchLogin(false);
    context.switchRegister(true);
  }

  // ref for the "Quick Guide" section
  const getStartedRef = useRef();

  // scroll down function to "Quick Guide" section
  const onGuideClicked = () => {
    getStartedRef.current.scrollIntoView({ behavior: "smooth" });
  }

  // here we get the ref of the contact us, in order to be able to scroll to it
  const contactUsBoxRef = useRef()
  const executeScroll = () => contactUsBoxRef.current.scrollIntoView({ behavior: "smooth" })

  useEffect(() => {
    if (location.state && location.state.contact_us) contactUsBoxRef.current.scrollIntoView();
    // check if the Quick Guide section has been redirected by another page
    if (location.state && location.state.onGuideClicked) onGuideClicked();
  }, [])

  // we store the actual height of the Navbar, since we set the Navbar's position to fixed
  // it jumps out from the document flow => the height collapse
  // we need to reset it
  const [navbarHeight, setNavbarHeight] = useState(0);

  // load background image to full resolution and set it once loaded
  useEffect(() => {
    // function for loading image
    function load(src) {
      return new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener('load', resolve);
        image.addEventListener('error', reject);
        image.src = src;
      });
    }

    /** load full-res background image */
    load(Helmholtz_TheisLab_Naturecover_2021).then(() => {
      setBackgroundImage(Helmholtz_TheisLab_Naturecover_2021);
    })
  }, []);


  return (
    <Box style={{ overflow: "hidden" }} sx={{ position: "relative" }}>
      {context.loginVisible && <LoginForm />}
      {context.registerVisible && <RegistrationForm />}
      {context.forgetVisible && <PasswordForgetForm />}
      {/* STARTING PAGE */}
      <Box sx={{
        width: window.width,
        height: '100vh',
        // bgcolor: colors.primary[800], 
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        position: "relative",
        paddingBottom: "4em",
      }}>
        {/* NAVBAR HERE */}
        {/* the Box that contains the Navbar will collapse, so we reset the height */}
        <Box sx={{ height: navbarHeight, position: "relative" }}>
          <Navbar backgroundColor="transparent" setNavbarHeight={setNavbarHeight} onLoginClicked={onLoginClicked} onSignUpClicked={onSignUpClicked} onGuideClicked={onGuideClicked} executeScroll={executeScroll} />
        </Box>
        {/* Quick Guide Intro Section */}
        <Box id="title container" width="100%" height='100%' textAlign="center" position="relative" top="30%">
          <WindowiOS backgroundImageLoaded={backgroundImage === Helmholtz_TheisLab_Naturecover_2021} onGuideClick={onGuideClicked} />
        </Box>
      </Box>
      {/* the Eclipse */}
      <Box
        sx={{
          position: "relative",
          width: "140vw",
          height: "5vw",
          left: "-20vw",
          top: "-2vw",
          borderRadius: "50%",
          zIndex: "0"
        }}
      />
      {/* CONTAINER */}
      <Box
        sx={{
          position: "relative",
          width: "100vw",
          padding: { xs: "0% 5%", sm: "0% 5%", md: "0% 15%", lg: "0% 15%", xl: "0% 15%" },
          top: "-2.5vw"
        }}
      >

        {/* INITIAL PAGE */}
        <Box ref={getStartedRef} sx={{ width: "100%", position: "relative", margin: "auto" }}>
          <Typography sx={{ textAlign: "center" }} fontSize="2em" fontWeight="bold">What We Do</Typography>
          <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row", md: "row", lg: "row", xl: "row" }, justifyContent: "space-between", alignItems: "center", width: "90%", gap: "1em", margin: "auto" }}>
            <Box sx={{ width: { xs: "100%", sm: "50%", md: "50%", lg: "50%", xl: "50%" }, backgroundColor: "transparent", borderRadius: "20px" }}>
              <img style={{ width: "100%" }} src={"https://storage.googleapis.com/jst-2021-bucket-static/retina.png"} alt="Science" />
            </Box>
            <Box sx={{ width: { xs: "100%", sm: "50%", md: "50%", lg: "50%", xl: "50%" } }}>
              <Typography fontSize="1.2em" fontWeight="bold">Single-Cell Omics Analysis</Typography>
              <Typography margin="0.5em 0 1em 0" color={colors.neutral[600]}>
                ArchMap offers single-cell omics reference mapping using <a
                  style={{
                    textDecoration: "none",
                  }} href="https://scarches.readthedocs.io/en/latest/"><Typography sx={{
                    color: colors.primary[400],
                    ':hover': { color: colors.primary[500] }
                  }} display="inline">scArches</Typography></a>.
                Check out our reference atlases or jump right in!</Typography>
              {/* Container of links to different pages */}
              <Box sx={{ display: 'flex', flexDirection: { xs: "column", sm: "row", md: "row", lg: "row", xl: "row" }, justifyContent: "space-evenly", width: "100%" }}>
                <Box id="References div" sx={{ width: "auto", margin: '1em 0 1em 0', padding: '0px 5px 0px 5px' }}>
                  <Box onClick={() => {
                    history.push('/references');
                    window.scrollTo(0, 0);
                  }}>
                    <Typography sx={{ fontWeight: "bold", color: colors.primary[400], ':hover': { color: colors.primary[500], cursor: 'pointer' } }}>References</Typography>
                  </Box>
                  <Typography color={colors.neutral[600]}>We offer multiple atlases to choose from.</Typography>
                </Box>
                <Box id="Docs div" sx={{ width: "auto", margin: '1em 0 1em 0', padding: '0px 5px 0px 5px' }}>
                  <Box>
                    <Typography sx={{ fontWeight: "bold", color: colors.primary[400], ':hover': { color: colors.primary[500], cursor: 'pointer' } }}>
                      <a
                        style={{
                          textDecoration: "none",
                          color: colors.primary[400],
                          '&:hover': { color: colors.primary[900] },
                        }} href="https://archmap-docu.readthedocs.io/">Docs
                      </a>
                    </Typography>
                  </Box>
                  <Typography color={colors.neutral[600]}>Check out the docs for more information.</Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
        {/* Quick Guide */}
        <Box sx={{
          width: "100%",
          marginTop: "5em",
          backgroundColor: colors.primary[800],
          p: "1em 1em 5em 1em",
          color: "white",
          borderRadius: "20px",
          boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)",
          position: "relative"
        }}>
          <Typography sx={{ textAlign: "center" }} fontSize="2em" fontWeight="bold">Quick Guide</Typography>

          {/* Log In or Start Uploading */}
          <Box sx={{ position: "relative", gap: "1em", display: "flex", flexDirection: { xs: "column", sm: "row", md: "row", lg: "row", xl: "row" }, justifyContent: "space-between", alignItems: "center", width: "90%", margin: "auto", padding: "5% 10% 0% 10%" }}>
            <Box sx={{ width: "100%" }}>
              <Typography sx={{ fontSize: "1.2em", textAlign: 'center', fontWeight: "bold", paddingBottom: '2%' }}>
                <Box sx={{ cursor: "pointer", display: "inline", color: colors.primary[400], ':hover': { color: colors.primary[500] } }} onClick={onSignUpClicked}>Sign Up</Box> Or Start Analyzing</Typography>
              <Typography color={colors.neutral[500]}>
                Create an account or start analyzing right away.
                By creating an account, you benefit from permanent project storage and collaboration with other labs.
              </Typography>
            </Box>
          </Box>

          {/* Selection Step */}
          <Box sx={{ position: "relative", gap: "1em", display: "flex", flexDirection: { xs: "column", sm: "row", md: "row", lg: "row", xl: "row" }, justifyContent: "space-between", alignItems: "center", width: "90%", margin: "auto", padding: "10% 10% 5% 10%" }}>
            <Box sx={{ position: "absolute", top: "calc(5% + 8px)", left: "7px", width: "2px", height: "calc(95% - 8px)", bgcolor: colors.neutral[700] }} />
            <Box sx={{ width: "16px", height: "16px", position: "absolute", top: "5%", left: "0%", borderRadius: "10px", border: "2px solid white", bgcolor: colors.primary[800] }}></Box>
            <Box sx={{ width: "30px", height: "30px", position: "absolute", top: "50%", left: "0%", transform: "translate(-7px, -15px)", bgcolor: colors.primary[800] }}>
              <UploadIcon sx={{ width: "20px", height: "20px", position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }} />
            </Box>
            <Box sx={{ width: { xs: "100%", sm: "50%", md: "50%", lg: "50%", xl: "50%" } }}>
              <Typography fontSize="1.2em" fontWeight="bold" paddingBottom='2%'>Step 1: Select Atlas and Model</Typography>
              <Typography color={colors.neutral[500]}>Start by choosing a reference atlas and one of the available pre-trained models.</Typography>
            </Box>
            <Box sx={{ width: { xs: "100%", sm: "50%", md: "50%", lg: "50%", xl: "50%" }, backgroundColor: "white", borderRadius: "20px" }}>
              <img style={{ width: "100%" }} src={graphic2} alt="Upload" />
            </Box>
          </Box>

          {/* PROCESSING */}
          <Box sx={{ position: "relative", gap: "1em", display: "flex", flexDirection: { xs: "column", sm: "row", md: "row", lg: "row", xl: "row" }, justifyContent: "space-between", alignItems: "center", width: "90%", margin: "auto", padding: "5% 10%" }}>
            <Box sx={{ position: "absolute", top: "0%", left: "7px", width: "2px", height: "100%", bgcolor: colors.neutral[700] }} />
            <Box sx={{ zIndex: "1", width: "30px", height: "30px", position: "absolute", top: "50%", left: "0%", transform: "translate(-7px, -15px)", bgcolor: colors.primary[800] }}>
              <AutorenewIcon sx={{ width: "20px", height: "20px", position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }} />
            </Box>
            <Box sx={{ width: { xs: "100%", sm: "50%", md: "50%", lg: "50%", xl: "50%" } }}>
              <Typography fontSize="1.2em" fontWeight="bold" paddingBottom='2%'>Step 2: Upload your Data</Typography>
              <Typography color={colors.neutral[500]}>After making your choice, upload your data. Afterwards, click on "Create Project" and wait for the processing to finish.</Typography>
            </Box>
            <Box sx={{ width: { xs: "100%", sm: "50%", md: "50%", lg: "50%", xl: "50%" }, backgroundColor: "white", borderRadius: "20px" }}>
              <img style={{ width: "100%" }} src={graphic3} alt="Processing" />
            </Box>
          </Box>

          {/* CHECK RESULT */}
          <Box sx={{ position: "relative", gap: "1em", display: "flex", flexDirection: { xs: "column", sm: "row", md: "row", lg: "row", xl: "row" }, justifyContent: "space-between", alignItems: "center", width: "90%", margin: "auto", padding: "5% 10% 10% 10%" }}>
            <Box sx={{ position: "absolute", top: "0%", left: "7px", width: "2px", height: "calc(95% - 8px)", bgcolor: colors.neutral[700] }} />
            <Box sx={{ zIndex: "1", width: "16px", height: "16px", position: "absolute", top: "95%", left: "0%", transform: "translate(-0%, -100%)", bgcolor: colors.primary[800] }}>
              <CheckCircleOutlineIcon sx={{ width: "16px", height: "16px", color: colors.secondary1[400] }} />
            </Box>
            <Box sx={{ zIndex: "1", width: "30px", height: "30px", position: "absolute", top: "50%", left: "0%", transform: "translate(-7px, -15px)", bgcolor: colors.primary[800] }}>
              <AssignmentIcon sx={{ width: "20px", height: "20px", position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }} />
            </Box>
            <Box sx={{ width: { xs: "100%", sm: "50%", md: "50%", lg: "50%", xl: "50%" } }}>
              <Typography fontSize="1.2em" fontWeight="bold" paddingBottom='2%'>Step 3: View Results</Typography>
              <Typography color={colors.neutral[500]}>After processing, your result will be ready. This may take some time.
                Don't worry! You can close the tab and come back later to see the results.  </Typography>
            </Box>
            <Box sx={{ width: { xs: "100%", sm: "50%", md: "50%", lg: "50%", xl: "50%" }, backgroundColor: "white", borderRadius: "20px" }}>
              <img style={{ width: "100%" }} src={graphic4} alt="Check Results" />
            </Box>
          </Box>

          {/* CALL TO ACTION */}
          <Box sx={{ position: "relative", gap: "1em", display: "flex", flexDirection: { xs: "column", sm: "row", md: "row", lg: "row", xl: "row" }, justifyContent: "space-between", alignItems: "center", width: "90%", margin: "auto", padding: "5% 10% 0% 10%" }}>
            <Box sx={{ width: "100%" }}>
              <Typography sx={{ fontSize: "1.2em", textAlign: 'center', fontWeight: "bold", paddingBottom: '2%' }}>
                Ready? <Box
                  sx={{ cursor: "pointer", display: "inline", color: colors.primary[400], ':hover': { color: colors.primary[500] }, display: 'inline' }}
                  onClick={() => {
                    history.push('/genemapper');
                    window.scrollTo(0, 0);
                  }}>
                  Start Mapping!
                </Box>
              </Typography>
            </Box>
          </Box>
        </Box>
        {/* CONTACT US */}
        <Box ref={contactUsBoxRef} sx={{ position: "relative", margin: "4em auto", position: "relative", width: "100%" }} >
          <Typography sx={{ textAlign: "center" }} fontSize="2em" fontWeight="bold">Contact Us</Typography>
          <Typography marginTop="1em" sx={{ textAlign: "center" }} fontSize="1em">Please message us in case you have any questions, feedback or collaboration-related inquiries concerning archmap.bio.</Typography>
          {/* <Box sx={{
            width: "100%",
            margin: "2em auto 0em auto",
            padding: "2em 0em",
            boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.10), 0px 0px 1px rgba(0, 0, 0, 0.20)",
            borderRadius: "10px"
          }}>
            <Stack sx={{ width: "80%", margin: "auto" }} direction="column" spacing={4}>
              <Stack direction="row" justifyContent="space-between" spacing={2}>
                <Input isRequired label="Email" />
                <Input isRequired label="First Name" />
                <Input isRequired label="Last Name" />
              </Stack>
              <Input isRequired label="Subject" maxLength={50}/>
              <Input isRequired label="Message" multiline maxLength={1000} />
              <Box sx={{ display: "flex", flexDirection: "row", justifyContent: "center" }}>
                <CustomButton>Send</CustomButton>
              </Box>
            </Stack>
          </Box> */}
          <ContactForm />
        </Box>
      </Box>

      {/* FOOTER */}
      <Footer />
    </Box>
  )
}

export default Home