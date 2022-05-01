import {
  ExpandLess, ExpandMore, Visibility, VisibilityOff,
} from '@mui/icons-material';
import OpacityIcon from '@mui/icons-material/Opacity';
import {
  Box, Collapse, IconButton, ListItem, ListItemButton, Typography,
} from '@mui/material';
import React, { useState } from 'react';
import { colors } from 'shared/theme/colors';

const activatedColor = colors.primary['400'];
const deactivatedColor = colors.primary['200'];

function Category({
  title, values, colored, toggleColored, hide, show, hiddenValue,
}) {
  const [open, setOpen] = useState(false);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <ListItemButton onClick={() => setOpen(!open)} sx={{ p: 0 }}>
        <ListItem
          secondaryAction={(
            <IconButton edge="end" onClick={(e) => { toggleColored(); e.stopPropagation(); }}>
              <OpacityIcon sx={{ color: colored ? activatedColor : deactivatedColor }} />
            </IconButton>
          )}
          sx={{ pl: 1 }}
        >
          {open
            ? <ExpandLess sx={{ transform: 'rotate(180deg)' }} />
            : <ExpandMore sx={{ transform: 'rotate(-90deg)' }} />}
          <Typography sx={{ pr: 1 }}>{title}</Typography>

        </ListItem>
      </ListItemButton>
      <Collapse in={open}>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          {Object.entries(values).map(([value, color]) => (
            <Value
              title={value}
              color={color}
              key={value}
              visible={hiddenValue !== value}
              setVisible={(visible) => {
                if (visible) show();
                else hide(value);
              }}
            />
          ))}
        </Box>
      </Collapse>
    </Box>
  );
}

function Value({
  title, color, visible, setVisible,
}) {
  return (
    <Box sx={{
      display: 'flex', alignItems: 'center', pl: 3, pr: 2,
    }}
    >
      <IconButton onClick={() => { setVisible(!visible); }}>
        { visible
          ? <Visibility sx={{ color }} />
          : <VisibilityOff sx={{ color: deactivatedColor }} />}
      </IconButton>
      <Typography sx={{ flexGrow: 1 }} noWrap>{title}</Typography>
    </Box>
  );
}

/**
 *
 * @param categories An object containing available categories and their values as key-value pairs
 */
function GeneMapperCategories({
  categories, setColorMode, hide, show,
}) {
  const [coloredCategoryTitle, setColoredCategoryTitle] = useState(null);
  const [hiddenValue, setHiddenValue] = useState(null);

  return (
    <>
      { categories
        ? Object.entries(categories).map(([title, values]) => (
          <Category
            key={title}
            title={title}
            values={values}
            colored={title === coloredCategoryTitle}
            toggleColored={() => {
              setColoredCategoryTitle(title);
              setColorMode(title);
            }}
            hide={(value) => { hide(title, value); setHiddenValue(value); }}
            show={() => { show(); setHiddenValue(null); }}
            hiddenValue={hiddenValue}
          />
        ))
        : null}
    </>

  );
}

export default GeneMapperCategories;
