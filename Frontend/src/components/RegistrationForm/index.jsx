import {
  Typography,
  Box,
  Grid,
  Snackbar,
  Link,
  FormControlLabel,
  Checkbox,
  Icon,
} from '@mui/material';
import React, { useCallback, useContext, useState } from 'react';
import validator from 'validator';
import { Alert } from '@mui/lab';
import { BACKEND_ADDRESS } from 'shared/utils/common/constants';
import { useAuth } from 'shared/context/authContext';
import Input from 'components/Input/Input';
import { Modal, ModalTitle } from 'components/Modal';
import CustomButton from 'components/CustomButton';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import ChromeReaderModeIcon from '@mui/icons-material/ChromeReaderMode';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import { LoginContext } from 'shared/context/loginContext';

function RegistrationForm(props) {
  const [, setUser] = useAuth();
  const [userDetails, setUserDetails] = useState({
    email: '',
    firstname: '',
    lastname: '',
    affiliation: '',
    password: '',
    passwordAgain: '',
    permissionRequested: false,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [isSnackbarVisible, setSnackbarVisible] = useState(false);
  const [checkYourEmail, setCheckYourEmail] = useState(false);
  const [privacyPolicy, setPrivacyPolicy] = useState(false);

  const [isAcceptedTermsSnackbar, setIsAcceptedTermsSnackbar] = useState(false);

  const { registerClose: onClose, registerVisible: visible, switchLogin: switchForm } = useContext(LoginContext);

  const history = useHistory();


  const handleCheckboxChange = (event) => {
    setUserDetails((prevState) => ({
      ...prevState,
      permissionRequested: event.target.checked,
    }));
  };


  const handleTextChange = useCallback(
    (e) => {
      setUserDetails((prevState) => ({
        ...prevState,
        [e.target.id]: e.target.value,
      }));
    },
    [setUserDetails],
  );

  /**
   * Function for input validation.
   * Validates every input given by user. 
   * @returns 
   */
  function validateInput() {
    let currentErrors = {};
    
    // email input validation
    if (!validator.isEmail(userDetails.email)) {
      currentErrors = {
        ...currentErrors,
        email: 'A valid e-mail is required!',
      };
    }

    // first name input validation
    if (userDetails.firstname === '') {
      currentErrors = {
        ...currentErrors,
        firstname: 'Please enter your first name!',
      };
    }

    // last name input validation
    if (userDetails.lastname === '') {
      currentErrors = {
        ...currentErrors,
        lastname: 'Please enter your last name!',
      };
    }

    // note input validation. 
    // Verificationt that the note is not "temporary user"
    // so that the user is not automatically deleted after 24 hours
    if(userDetails.note === 'temporary_user'){
      currentErrors = { ...currentErrors, note: 'Invalidn Affiliation'};
    }

    // password input validation
    if (userDetails.password === '') {
      currentErrors = { ...currentErrors, password: 'Password is required!' };
    }

    // repeat password input validation
    if (userDetails.passwordAgain !== userDetails.password) {
      currentErrors = {
        ...currentErrors,
        passwordAgain: 'The passwords must match!',
      };
    }
    setErrors(currentErrors);
    return !Object.keys(currentErrors).length;
  }

  const clearForm = useCallback(() => {
    setUserDetails({
      email: '',
      firstname: '',
      lastname: '',
      affiliation: '',
      password: '',
      passwordAgain: '',
      permissionRequested: false,
    });
    setErrors({});
    setLoading(false);
    onClose();
  }, [setUserDetails, setErrors, setLoading, props, setUser]);

  function onSuccessfulRegistration() {
    // onClose();
    setSnackbarVisible(true);
    setCheckYourEmail(true);
    setTimeout(onClose, 5000);
  }

  function onFailedRegistration(response) {
    switch (response.status) {
      case 400:
        setErrors((prevState) => ({
          ...prevState,
          response: 'Please check your input!',
        }));
        break;
      case 409:
        setErrors((prevState) => ({
          ...prevState,
          response: 'Account already exists!',
        }));
        break;
      default:
        setErrors((prevState) => ({
          ...prevState,
          response: 'Unknown error, please try again later!',
        }));
        break;
    }
  }

  const doRegistration = useCallback(() => {
    if (!validateInput()) {
      console.log(errors)
      console.log("Validation failed")
      return;
    }
    if (privacyPolicy === false) {
      setIsAcceptedTermsSnackbar(true);
      return;
    }
    setLoading(true);
    
    
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        first_name: userDetails.firstname,
        last_name: userDetails.lastname,
        email: userDetails.email,
        password: userDetails.password,
        note: userDetails.affiliation,
        permissionRequested: userDetails.permissionRequested,
      }),
    };
    fetch(`${BACKEND_ADDRESS}/register`, requestOptions).then((response) => {
      setLoading(false);
      if (response.status === 200 || response.status === 201) {
        onSuccessfulRegistration();
      } else {
        onFailedRegistration(response);
      }
      setSnackbarVisible(true);
    });

    history.push("/");
  }, [
    userDetails,
    setErrors,
    setLoading,
    props,
    setSnackbarVisible,
    setUser,
    privacyPolicy,
  ]);


  return (
    <div>
      <Modal setOpen={(o) => !o && onClose()} isOpen={visible}>
        {checkYourEmail === true ? (
          <Modal isOpen={checkYourEmail} setOpen={(o) => !o && onClose()}>
            <ModalTitle>Verify your email!</ModalTitle>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                rowGap: 2,
                padding: 2,
              }}
            >
              <Box sx={{ display: 'flex' }}>
                <MarkEmailReadIcon color="primary" />
                <Typography style={{ paddingLeft: 8 }}>
                  Registration Successful. We sent you a
                  {' '}
                  <b>confirmation email.</b>
                </Typography>
              </Box>
              <Typography>
                You can complete your registration by confirming your e-mail
                address.
              </Typography>
            </Box>
          </Modal>
        ) : (
          <>
            <ModalTitle>Register new user</ModalTitle>
            <Box sx={{ width: { md: "400px", xs: "100%" }, pr: "1em" }}>
              <Grid sx={{ width: '90%', margin: 'auto' }}>
                <Input
                  id="email"
                  type="email"
                  error={!!errors.email}
                  helperText={errors.email}
                  label="E-mail"
                  placeholder="Enter e-mail address"
                  isRequired
                  onChangeEvent={handleTextChange}
                />
                <Input
                  id="firstname"
                  type="text"
                  error={!!errors.firstname}
                  helperText={errors.firstname}
                  label="First name"
                  placeholder="Enter your first name"
                  isRequired
                  onChangeEvent={handleTextChange}
                />
                <Input
                  id="lastname"
                  type="text"
                  error={!!errors.lastname}
                  helperText={errors.lastname}
                  label="Last name"
                  placeholder="Enter your last name"
                  isRequired
                  onChangeEvent={handleTextChange}
                />
                <Input
                  id="affiliation"
                  error={!!errors.affiliation}
                  helperText={errors.affiliation}
                  label="Affiliation"
                  type="text"
                  placeholder="Enter your university, company or etc."
                  onChangeEvent={handleTextChange}
                />
                <Input
                  id="password"
                  error={!!errors.password}
                  helperText={errors.password}
                  label="Password"
                  type="password"
                  placeholder="Enter password"
                  isRequired
                  onChangeEvent={handleTextChange}
                />
                <Input
                  id="passwordAgain"
                  error={!!errors.passwordAgain}
                  helperText={errors.passwordAgain}
                  label="Password again"
                  type="password"
                  placeholder="Enter your password again"
                  isRequired
                  onChangeEvent={handleTextChange}
                />
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <FormControlLabel
                    control={(
                      <Checkbox
                        id="remember"
                        onChange={() => setPrivacyPolicy(!privacyPolicy)}
                        disableRipple
                        disableFocusRipple
                      />
                    )}
                    label="Accept terms and conditions"
                  />
                  <Box>
                    <ChromeReaderModeIcon
                      sx={{ marginTop: 0.5, '&:hover': { cursor: 'pointer' } }}
                      onClick={() => history.push('/privacy')}
                      color="primary"
                    />
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <FormControlLabel
                    control={(
                      <Checkbox
                        id="permissionRequested"
                        onChange={handleCheckboxChange}
                      />
                    )}
                    label="Request for Beta feature"
                  />
                  
                </Box>

                <Box mt={1}>
                  <CustomButton
                    type="primary"
                    sx={{ mr: 'auto', width: '100%' }}
                    onClick={doRegistration}
                    disabled={!privacyPolicy}
                  >
                    <Typography>Sign up</Typography>
                  </CustomButton>
                </Box>
                <Typography mt={1} textAlign="center">
                  Already have an account? Login
                  {' '}
                  <Link
                    href="#"
                    onClick={() => {
                      clearForm();
                      switchForm(true);
                    }}
                  >
                    here
                  </Link>
                  .
                </Typography>
              </Grid>
            </Box>
          </>
        )}
      </Modal>
      <Snackbar
        open={isAcceptedTermsSnackbar}
        autoHideDuration={10000}
        onClose={() => setIsAcceptedTermsSnackbar(false)}
      >
        <Alert
          severity="error"
          sx={{ width: '100%' }}
          onClose={() => setIsAcceptedTermsSnackbar(false)}
        >
          {errors.response
            ? errors.response
            : 'You must accept terms and conditions!'}
        </Alert>
      </Snackbar>
      {errors.response && <Snackbar
        open={isSnackbarVisible}
        autoHideDuration={10000}
        onClose={() => setSnackbarVisible(false)}
      >
        <Alert
          severity={'error'}
          sx={{ width: '100%' }}
          onClose={() => setSnackbarVisible(false)}
        >
          {errors.response}
        </Alert>
      </Snackbar>
      }
    </div>
  );
}

export default RegistrationForm;
