import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { colors } from 'shared/theme/colors';

/**
 * 
 * Input 
 * Props: Most of MUI TextField props..
 * @param {string} helperText - The helper text that is displayed under the input
 * @param {string} placeholder - Placeholder of input
 * @param {boolean} errorHandler - Error handler (true | false)
 * @param {boolean} disabledHandler - Disabled handler (true | false)
 * @param {boolean} isRequired - The input is required or not (true | false)
 * @param {string} defaultValue - Default value of input
 * @param {boolean} multiline - The Input is multiline or not. (true | false)
 * @param {function} onChangeEvent - The onChange handler function
 * @param {string} label - Label of input
 * @param {number} maxLength - Maximum length of input Default:40
 * @param {string} type - Type of input Default: 'text'
 * 
 * Example usage
 * Import Input to any component, see below examples:
 * const [name, setName] = useState('');
 * <Input isRequired onChangeEvent={setName} disabledHandler={false} />
 * <Input isRequired onChangeEvent={setName} disabledHandler={false} />
 * <Input helperText="Incorrect Output" errorHandler isRequired
 * onChangeEvent={setName} disabledHandler={false} />
 * For Multiline
 * <Input isRequired maxLength={120} multiline disabledHandler={false} />
 */
const Input = (props) => { 

  const {id,helperText, placeholder, errorHandler, disabledHandler, isRequired=false, defaultValue, value, multiline=false, onChangeEvent=null, onBlurEvent=null, onFocusEvent=null, label='Required', maxLength=50, type='text'} = props
  return (
  <Box
    component="form"
    sx={{
      '& .MuiTextField-root': { m: 1, width: '100%' },
      '& .MuiFormLabel-asterisk': { color: colors.error.main },
    }}
    noValidate
  >
    <TextField
      error={errorHandler}
      required={isRequired}
      disabled={disabledHandler}
      placeholder={placeholder}
      defaultValue={defaultValue}
      inputProps={{ maxLength }}
      multiline={multiline}
      type={type}
      value={value}
      id={id}
      rows={4}
      label={label}
      helperText={helperText}
      variant="standard"
      onChange={(e) => (onChangeEvent !== null ? onChangeEvent(e) : null)}
      onBlur={(e) => (onBlurEvent !== null ? onBlurEvent(e) : null)}
      onFocus={(e) => (onFocusEvent !== null ? onFocusEvent(e) : null)}
    />
  </Box>
)};

export default Input;
