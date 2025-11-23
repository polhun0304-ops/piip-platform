import React from 'react';
import AboutPage from './AboutPage';
import { Dialog, DialogContent, Box, Button } from '@mui/material';

interface PIIPPlatformIntroDialogProps {
  open: boolean;
  onClose: () => void;
}

const PIIPPlatformIntroDialog: React.FC<PIIPPlatformIntroDialogProps> = ({ open, onClose }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth scroll="paper">
      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ position: 'relative', minHeight: 600 }}>
          <AboutPage />
          <Box sx={{ textAlign: 'center', mt: 4, mb: 2 }}>
            <Button variant="contained" color="primary" onClick={onClose} sx={{ mt: 4 }}>
              되돌아가기
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default PIIPPlatformIntroDialog;
