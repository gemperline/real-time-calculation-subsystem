import React from 'react';
import { Grid, Skeleton } from 'amn-ui-core';
import { useScenarioHeaderStyles } from './ScenarioHeader.Styles';
import { theme } from 'styles/global-styles';

export const ScenarioDetailsLoading = () => {
  const { classes } = useScenarioHeaderStyles();

  return (
    <>
      <Grid
        item
        id="marginTool-marginToolDetailsPage-rightContainer-scenario-Header-Loading"
        className={classes.container}
      >
        <Grid item className={classes.header}>
          <Grid item className={classes.headerLeftSection}></Grid>

          <Grid item className={classes.headerRightSection}></Grid>
        </Grid>
        <>
          <Grid container spacing={2} sx={{ width: '100%', padding: theme.spacing(2) }}>
            {Array.from({ length: 5 }).map((_, index) => (
              <>
                <Grid item xs={4} key={index}>
                  <Skeleton variant="rectangular" height={30} />
                </Grid>
                <Grid item xs={4}>
                  <Skeleton variant="rectangular" height={30} />
                </Grid>
                <Grid item xs={4}>
                  <Skeleton variant="rectangular" height={30} />
                </Grid>
              </>
            ))}
          </Grid>
        </>
      </Grid>
    </>
  );
};
