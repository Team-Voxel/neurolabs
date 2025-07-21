import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  DialogProps as MuiDialogProps
} from '@mui/material';
import { X } from 'lucide-react';

interface MaterialDialogProps extends Omit<MuiDialogProps, 'onClose'> {
  open: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title?: string;
  confirmText?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  keepMounted?: boolean;
}

const sizeMap = {
  sm: 'xs',
  md: 'sm',
  lg: 'md'
} as const;

export const MaterialDialog: React.FC<MaterialDialogProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  confirmText = 'Confirm',
  children,
  size = 'md',
  ...dialogProps
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={sizeMap[size]}
      fullWidth
      {...dialogProps}
    >
      {title && (
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          p: 2
        }}>
          {title}
          <IconButton
            onClick={onClose}
            size="small"
            sx={{ ml: 2 }}
          >
            <X size={20} />
          </IconButton>
        </DialogTitle>
      )}
      
      <DialogContent dividers sx={{ p: 3 }}>
        {children}
      </DialogContent>

      {onConfirm && (
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={onClose} variant="text" color="inherit">
            Cancel
          </Button>
          <Button onClick={onConfirm} variant="contained" color="primary">
            {confirmText}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};