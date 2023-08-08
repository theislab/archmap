import React from 'react';
import { Skeleton } from '@mui/material';

const RectSkeleton = ({ width, height,sx }) => (
  <Skeleton variant="rectangular" width={width} height={height} sx={sx} />
);

export default RectSkeleton;
