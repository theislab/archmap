import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { CssBaseline } from '@mui/material';
import App from './App';
import { AuthProvider } from 'shared/context/authContext';
import { SubmissionProgressProvider } from 'shared/context/submissionProgressContext';
import LoginProvider from 'shared/context/loginContext';
import { UploadProgressProvider } from 'shared/context/UploadProgressContext';

ReactDOM.render(
  <>
    <CssBaseline />
    <AuthProvider>
      <SubmissionProgressProvider>
        <UploadProgressProvider>

          <LoginProvider>
            <App />
          </LoginProvider>
        </UploadProgressProvider>
      </SubmissionProgressProvider>
    </AuthProvider>
  </>,
  document.getElementById('root'),
);
