import { Grid, IconButton } from 'amn-ui-core';
import React, { useState } from 'react';
import ShareDropdownIcon from 'app/assets/images/shareDropdownIcon.svg';
import { makeStyles } from 'tss-react/mui';

const useStyles = makeStyles()({
  iconButton: {
    padding: 0,
    margin: 0,
    width: '48px',
    height: '30px',
  },
  ShareDropdownIcon: {
    height:'28px',
    transition: 'filter 0.2s',
  },
  grayIcon: {
    filter: 'brightness(0) saturate(100%) invert(70%) sepia(30%) saturate(150%) hue-rotate(180deg) brightness(75%) contrast(70%) !important',
  },
  active: {
    filter:
      'brightness(0) saturate(100%) invert(44%) sepia(77%) saturate(700%) hue-rotate(190deg) brightness(105%) contrast(110%) !important',
  },
});

export const ShareDropdownIconButton = () => {
  const { classes } = useStyles();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Grid onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <IconButton className={classes.iconButton} disableRipple>
        <img
          src={ShareDropdownIcon}
          alt="ShareDropdownIcon"
          
          className={`${classes.ShareDropdownIcon} ${isHovered ? classes.active : classes.grayIcon}`}
        />
      </IconButton>
    </Grid>
  );
};
