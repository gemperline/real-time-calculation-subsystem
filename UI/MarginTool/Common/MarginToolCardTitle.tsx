import React from 'react';
import { Typography } from 'amn-ui-core';

const MarginToolCardTitle = ({
  title,
  subtitle,
  subtitle1,
  customSubtitle,
}: {
  title: string;
  subtitle?: string;
  subtitle1?: string;
  customSubtitle?: React.ReactFragment;
}) => {
  return (
    <>
      <Typography
        component="span"
        variant="subtitle1"
        sx={{ color: theme => theme.palette.components.typography.color, fontWeight: '500' }}
      >
        {title}
      </Typography>
      {subtitle && (
        <Typography
          component="span"
          variant="subtitle2"
          sx={{ color: theme => theme.palette.components.typography.color, fontWeight: 'normal' }}
        >
          {` ${subtitle}`}
        </Typography>
      )}
      {subtitle1 && (
        <Typography
          component="span"
          variant="body2"
          sx={{ color: theme => theme.palette.components.typography.color, fontWeight: 'medium' }}
        >
          {` ${subtitle1}`}
        </Typography>
      )}
      {customSubtitle && customSubtitle}
    </>
  );
};

export { MarginToolCardTitle };
