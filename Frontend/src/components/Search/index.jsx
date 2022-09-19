import React, { useEffect, useRef, useState } from 'react';
import {
  Box, ButtonBase, Stack, Typography,
} from '@mui/material';
import { Search as SearchIcon, FilterAlt } from '@mui/icons-material';
// eslint-disable-next-line import/no-extraneous-dependencies
import { styled } from '@mui/system';
import { colors } from 'shared/theme/colors';

const SearchInput = styled('input')(({ theme }) => ({
  border: 'none',
  outline: 'none',
  fontSize: 20,
  width: '100%',
  color: theme.palette.primary.main,
}));

const FilterButton = ({ onClick }) => (
  <ButtonBase
    onClick={onClick}
    disableRipple
    sx={{
      p: '12px',
      ':hover': {
        color: 'primary.light',
      },
    }}
  >
    <FilterAlt />
    <Typography fontSize={20}>Filter</Typography>
  </ButtonBase>
);

/**
 * 
 * @param {*} filterComponent - The filter component used in the search bar.
 * @param {*} handleSearch - search handler
 * @param {string} value - the value that is being searched for.
 * @param {string} padding - padding value.
 * @param {boolean} visible - variable that decides whether the search bar is boolean or not.
 * @param {boolean} noFilterComponent - boolean variable for whether there is a filter component or not. 
 * @returns search bar component 
 */
const Search = ({ filterComponent, handleSearch, value, padding = '10px', visible = true, noFilterComponent = false }) => {

  const [active, setActive] = useState(false)
  const [filterEnabled, setFilterEnabled] = useState(false)
  const filterBox = useRef()

  useEffect(() => {
    // TODO
    /*
     * Want to achieve this effect: click outside box -> close filter
     * Problem: current solution detects clicks on other components except the filter
     *          works when clicking outside, but when you click a child component inside filter
     *          it still closes.
     */
    // const handleFilterClose = (e) => {
    //   if (filterBox.current && !filterBox.current.contains(e.target)) {
    //     // setFilterEnabled(false)
    //   }
    // }
    // window.addEventListener("click", handleFilterClose, true)
    // return () => {
    //   window.removeEventListener("click", handleFilterClose, true);
    // }
  }, [])

  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      sx={{
        position: 'relative',
        p: padding,
        border: `2px solid ${active ? colors.primary[400] : colors.primary[700]}`,
        borderRadius: '40px',
        display: visible ? 'flex' : 'none',
        height: '58px'
      }}
    >
      {/* Left part */}
      <Stack direction="row" alignItems="center" gap="5px" sx={{ marginLeft: "20px", width: "100%", paddingRight:"5px" }}>
        <SearchIcon sx={{ color: active ? "primary.light" : "primary.main" }} />
        <SearchInput onChange={(e) => handleSearch(e.target.value)} placeholder="Search" onMouseEnter={() => setActive(true)} onMouseLeave={() => setActive(false)} value={value} />
      </Stack>
      {/* Right part */}

      {noFilterComponent ? null : (
        <Stack direction="row" sx={{ marginRight: '20px' }}>
          <FilterButton onClick={() => setFilterEnabled(!filterEnabled)} />
        </Stack>
      )}
      {
        noFilterComponent || !filterEnabled ? null : (
          <Box
            ref={filterBox}
            sx={{
              position: 'absolute',
              zIndex: '20',
              top: '55px',
              right: '40px',
            }}
          >
            {filterComponent}
          </Box>
        )
      }
    </Stack>
  );
};

export default Search;
