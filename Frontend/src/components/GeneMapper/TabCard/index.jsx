/* eslint-disable import/prefer-default-export */
import React from 'react';
import { Box, Stack } from '@mui/material';
import Typography from '@mui/material/Typography';
import { colors } from 'shared/theme/colors';
import RectSkeleton from "components/Skeletons/RectSkeleton"

/**
 * TabCard for TabGroup Component / List of cards with select feature
 * @param width
 * @param height
 * @param data object containing information to be displayed on the card,
 * currently different for teams and demos.
 * Add property isDemo to demo datasets "data" property to visualize properly
 * @param handleOnClick executed function on card click
 * @param selected boolean parameter to indicate if a card element is selected
 * @param minimal makes the tabcard view minimal and shows only the most essential information
*/
export const TabCard = ({
  style, width, height, data, handleOnClick, selected, minimal, isLoading=true
}) => (
  (isLoading)? (
    <RectSkeleton width={width} height={height} sx={{borderRadius: '0.625rem', marginBottom: '0.67em'}} />
) :
  <Box
    onClick={handleOnClick}
    sx={{
      ...style,
      width: { width }, height: { height }, backgroundColor: 'white', borderRadius: '0.625rem', marginBottom: '0.67em', cursor: 'pointer',
    }}
  >
    <Box
      sx={selected ? {
        boxShadow: '0px 0px 2px rgba(0,0,0, 0.15)',
        p: '0.5em',
        borderRadius: '0.625rem',
        borderColor: data.isAtlas ? '#008BF5' : 'transparent',
        borderWidth: data.isAtlas ? '2px' : '0px',
        borderStyle: data.isAtlas ? 'solid' : 'none',
        backgroundColor: data.isAtlas ? 'none' : colors.primary[300],
        // color: 'white',
      }
        : {
          boxShadow: '0px 0px 2px rgba(0,0,0, 0.15)',
          p: '0.5em',
          borderRadius: '0.625rem',
          backgroundColor: 'white',
          ':hover': {
            color: colors.primary,
            ':hover': { 
              background: data.isAtlas ? "linear-gradient(#4F83CC, #01579B)" : colors.primary[300], transition: data.isAtlas ? '0.0s' : '0.4s', 
              color: 'white', opacity: data.isAtlas ? 0.95 : 100, 
              boxShadow: data.isAtlas ? 'none' : '0px 4px 6px 0px rgba(33, 37, 41, .2), 0px 0px 1px 0px rgba(33, 37, 41, .32)'},
            ':focus': { backgroundColor: colors.primary[300], transition: '0.4s', color: 'white' },
            ':disabled': { backgroundColor: '#EBEFFF', transition: '0.4s', color: colors.primary[600] },
          },
        }}
    >
      <Stack spacing={0} p="0.1em" pl="0.3em">
        <Typography fontSize={minimal ? "1em" : "p" }> 
          {data.text}
        </Typography>
        <Typography variant="caption" fontWeight="">
          { !minimal && data.isDemo ? `Demo dataset for ${data.atlas} & ${data.model}` : data.visibility}
        </Typography>
      </Stack>
    </Box>
  </Box>
);
