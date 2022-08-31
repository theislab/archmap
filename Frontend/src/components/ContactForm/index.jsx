import { Box, Typography, Button, Stack, TextField, TextareaAutosize, Snackbar, Alert } from "@mui/material";
import { useState, useRef } from "react";
import CustomButton from "components/CustomButton";
import Input from 'components/Input/Input';
import emailjs from '@emailjs/browser';
import { SERVICE_ID, TEMPLATE_ID, PUBLIC_KEY } from '../../shared/utils/common/constants';
import ContactUsService from "shared/services/ContactUs.service";

export default function ContactForm() {

  const [data, setData] = useState({ email: "", firstName: "", lastName: "", subject: "", message: "" })
  const [error, setError] = useState({ email: false, firstName: false, lastName: false, subject: false, message: false })
  const [snackbar, setSnackbar] = useState({ open: false, type: "error" });
  
  // submit email handler
  const sendEmail = () => {
    // check errors and set them
    let ok = true;
    const newError = { ...error }
    for (const type in data) {
      if (data[type] === "") {
        newError[type] = true
        ok = false
      }
    };
    setError(newError);

    // send data(the whole form's content) as email
    emailjs.send(SERVICE_ID, TEMPLATE_ID, data, PUBLIC_KEY)
      .then((response) => {
        console.log(`email sent successfully status: ${response}`)
        // "email sent succssfully" snackbar
        setSnackbar({open: true, type: "success"});
        // reset form values
        setData({ email: "", firstName: "", lastName: "", subject: "", message: "" });
      }, (error) => {
        console.log(`error occurred: ${error}`)
        setSnackbar({open: true, type: "error"});
      });
  }

  const onChange = (type) =>
    (event) => {
      setData({ ...data, [type]: event.target.value })
    }

  const onFocus = (type) =>
    () => {
      setError({ ...error, [type]: false })
    }

  const onBlur = (type) =>
    () => {
      if (data[type] === "") setError({ ...error, [type]: true })
      else setError({ ...error, [type]: false })
    }

  const onClick = () => {
    let ok = true
    const newError = { ...error }
    for (const type in data) {
      if (data[type] === "") {
        newError[type] = true
        ok = false
      }
    }
    setError(newError)
    setData({ email: "", firstName: "", lastName: "", subject: "", message: "" })

    ContactUsService.postContactForm(data)
  }

  return (
    <>
      <Box sx={{
      width: "100%",
      margin: "2em 0 0em 0",
      padding: "2em 0em",
      boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.10), 0px 0px 1px rgba(0, 0, 0, 0.20)",
      borderRadius: "10px"
    }}>
      <Stack sx={{ width: "80%", margin: "auto" }} direction="column" spacing={4}>
        <Stack direction="row" justifyContent="space-between" spacing={2}>
          <Input value={data.email} isRequired label="Email" errorHandler={error.email} helperText={error.email ? "Email cannot be empty!" : ""} onChangeEvent={onChange("email")} onBlurEvent={onBlur("email")} onFocusEvent={onFocus("email")} />
          <Input value={data.firstName} isRequired label="First Name" errorHandler={error.firstName} helperText={error.firstName ? "First Name cannot be empty!" : ""} onChangeEvent={onChange("firstName")} onBlurEvent={onBlur("firstName")} onFocusEvent={onFocus("firstName")} />
          <Input value={data.lastName} isRequired label="Last Name" errorHandler={error.lastName} helperText={error.lastName ? "Last Name cannot be empty!" : ""} onChangeEvent={onChange("lastName")} onBlurEvent={onBlur("lastName")} onFocusEvent={onFocus("lastName")} />
        </Stack>
        <Input value={data.subject} isRequired label="Subject" maxLength={100} errorHandler={error.subject} helperText={error.subject ? "Subject cannot be empty!" : ""} onChangeEvent={onChange("subject")} onBlurEvent={onBlur("subject")} onFocusEvent={onFocus("subject")} />
        <Input value={data.message} isRequired label="Message" multiline maxLength={1000} errorHandler={error.message} helperText={error.message ? "Message cannot be empty!" : ""} onChangeEvent={onChange("message")} onBlurEvent={onBlur("message")} onFocusEvent={onFocus("message")} />
        <Box sx={{ display: "flex", flexDirection: "row", justifyContent: "center" }}>
          <CustomButton onClick={sendEmail}>Send</CustomButton>
        </Box>
      </Stack>
    </Box>
    {/* Snackbar after email being sent */}
    <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={()=>setSnackbar({...snackbar, open: false})}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        >
        <Alert onClose={()=>setSnackbar({...snackbar, open: false})} severity={snackbar.type} sx={{ width: '100%' }}>
        {snackbar.type === "success" ? 'Email sent succesfully!' : 'Error occurred. Please send again!'}
        </Alert>
      </Snackbar> 
    </>
  )
}