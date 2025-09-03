import { Divider, Grid } from 'amn-ui-core';
import React from 'react';
import BookingData from './BookingData';
import { ScenarioData } from './ScenarioData';
import { useAddScenarioStyles } from './AddScenario.styles';



export const AddScenario = () => {
  const { classes } = useAddScenarioStyles();
  return (
    <Grid container className={classes.container} direction="column">
      <Grid container item>
        <BookingData />
      </Grid>
      <Divider className={classes.divider} />
      <Grid container item>
        <ScenarioData />
      </Grid>
    </Grid>
  );
};
