import React, { useRef, useState, ChangeEvent } from 'react';
import { Button, Typography, Box, Paper } from '@mui/material';
import { Upload } from 'lucide-react';

interface FileUploadProps {
  // File types to accept (e.g., '.pdf,.doc,image/*')
  accept?: string;
  // Maximum file size in bytes
  maxSize?: number;
  // Callback when file is selected
  onChange?: (file: File | null) => void;
  // Custom button text
  buttonText?: string;
  // Additional CSS classes
  className?: string;
  // Whether the upload is disabled
  disabled?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  accept,
  maxSize,
  onChange,
  buttonText = 'Choose File',
  className,
  disabled = false,
}) => {
  // Reference to the hidden file input
  const fileInputRef = useRef<HTMLInputElement>(null);
  // State to store the selected file
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  // State to store error messages
  const [error, setError] = useState<string>('');

  // Handle file selection
  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    setError('');
    const file = event.target.files?.[0] || null;

    if (!file) {
      setSelectedFile(null);
      onChange?.(null);
      return;
    }

    // Validate file size if maxSize is provided
    if (maxSize && file.size > maxSize) {
      setError(`File size must be less than ${maxSize / 1000000}MB`);
      setSelectedFile(null);
      onChange?.(null);
      return;
    }

    setSelectedFile(file);
    onChange?.(file);
  };

  // Trigger file input click
  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  // Clear selected file
  const handleClear = () => {
    setSelectedFile(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onChange?.(null);
  };

  return (
    <Box className={className}>
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept={accept}
        style={{ display: 'none' }}
        disabled={disabled}
      />

      {/* Main upload button */}
      <Button
        variant="contained"
        onClick={handleButtonClick}
        startIcon={<Upload size={20} />}
        disabled={disabled}
        sx={{ mb: 2 }}
      >
        {buttonText}
      </Button>

      {/* File information display */}
      {selectedFile && (
        <Paper
          elevation={1}
          sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          <Box sx={{ overflow: 'hidden' }}>
            <Typography variant="subtitle2" color="primary">
              Selected File:
            </Typography>
            <Typography
              variant="body2"
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {selectedFile.name}
            </Typography>
          </Box>
          <Button
            variant="outlined"
            color="error"
            size="small"
            onClick={handleClear}
            disabled={disabled}
          >
            Clear
          </Button>
        </Paper>
      )}

      {/* Error message display */}
      {error && (
        <Typography color="error" variant="caption" sx={{ mt: 1, display: 'block' }}>
          {error}
        </Typography>
      )}
    </Box>
  );
};

export default FileUpload;