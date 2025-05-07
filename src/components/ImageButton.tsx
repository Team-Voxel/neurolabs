import React from 'react';
import { ButtonBase, styled } from '@mui/material';

interface ImageButtonProps {
  imageUrl: string | undefined;
  title: string;
  width: string;
  height?: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
  hideUnderline?: boolean;
}

const ImageButtonBase = styled(ButtonBase)(({ theme }) => ({
  position: 'relative',
  height: '100%',
  width: '100%',
  '&:hover, &.Mui-focusVisible': {
    zIndex: 1,
    '& .MuiImageBackdrop-root': {
      opacity: 0.15,
    },
    '& .MuiImageMarked-root': {
      opacity: 0,
    },
    '& .MuiTypography-root': {
      border: '4px solid currentColor',
    },
  },
}));

const ImageSrc = styled('span')({
  position: 'absolute',
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
});

const Image = styled('span')(({ theme }) => ({
  position: 'absolute',
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: theme.palette.common.white,
}));

const ImageBackdrop = styled('span')(({ theme }) => ({
  position: 'absolute',
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
  backgroundColor: theme.palette.common.black,
  opacity: 0.4,
  transition: theme.transitions.create('opacity'),
}));

const ImageMarked = styled('span')(({ theme }) => ({
  height: 3,
  width: 18,
  backgroundColor: theme.palette.common.white,
  position: 'absolute',
  bottom: -2,
  left: 'calc(50% - 9px)',
  transition: theme.transitions.create('opacity'),
}));

const Title = styled('span')(({ theme }) => ({
  position: 'relative',
  padding: `${theme.spacing(2)} ${theme.spacing(4)} 14px`,
  fontSize: '1.25rem',
  color: theme.palette.common.white,
  fontWeight: 'bold',
}));

export const ImageButton: React.FC<ImageButtonProps> = ({
  imageUrl,
  title,
  width,
  height = '200px',
  onClick,
  disabled = false,
  className,
  style,
  hideUnderline = false,
}) => {
  return (
    <div style={{ width, height, ...style }} className={className}>
      <ImageButtonBase
        focusRipple
        onClick={onClick}
        disabled={disabled}
        onMouseDown={(e) => e.preventDefault()}
        style={{ height: '100%' }}
      >
        <ImageSrc style={{ backgroundImage: `url(${imageUrl})` }} />
        <ImageBackdrop className="MuiImageBackdrop-root" />
        <Image>
          <Title>
            {title}
            {!hideUnderline && <ImageMarked className="MuiImageMarked-root" />}
          </Title>
        </Image>
      </ImageButtonBase>
    </div>
  );
};

export default ImageButton;