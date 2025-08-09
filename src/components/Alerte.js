import * as React from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import { Snackbar } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function Alerte({ type, message, details, open, onClose }) {
  const navigate = useNavigate();

  const handleShowMore = () => {
    if (details) {
      navigate(`/project/rhliste?nom=${details.nom}&prenom=${details.prenom}&daten=${details.daten}`);
    }
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={5000} 
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      sx={{
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        top: 10,
      }}
    >
      <Alert
        severity={type || "info"}
        onClose={onClose}
        sx={{
          width: '90%',
          maxWidth: '600px',
          display: 'flex',
          alignItems: 'center',
          fontSize: '1rem',
          padding: '12px 16px',
          boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
          borderRadius: '8px',
        }}
      >
        {message}
        {details && (
          <Button
            size="small"
            color="inherit"
            onClick={handleShowMore}
            sx={{ marginLeft: 'auto', fontWeight: 'bold' }}
          >
            Details
          </Button>
        )}
      </Alert>
    </Snackbar>
  );
}
