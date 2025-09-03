import { Divider, Grid, Skeleton } from 'amn-ui-core';
import React from 'react';

export const BillRatesSkeleton = () => (
  <Grid container>
    {/* First Row Skeleton */}
    <Grid container item direction="row" spacing={4} sx={{ p: 2 }}>
      <Grid item xs={3}>
        <Skeleton variant="rectangular" height={56} />
      </Grid>
      <Grid item xs={3}>
        <Skeleton variant="rectangular" height={56} />
      </Grid>
      <Grid item xs={3}>
        <Skeleton variant="rectangular" height={56} />
      </Grid>
    </Grid>

    {/* Divider */}
    <Grid sx={{ p: 2 }}>
      <Divider />
    </Grid>

    {/* Second Row Skeleton */}
    <Grid container direction="row" spacing={4} sx={{ p: 2 }}>
      <Grid xs={6} item container spacing={2}>
        <Grid item xs={5.5}>
          <Skeleton variant="rectangular" height={56} />
        </Grid>
        <Grid item xs={1} alignContent="center">
          <Skeleton variant="text" />
        </Grid>
        <Grid item xs={5.5}>
          <Skeleton variant="rectangular" height={56} />
        </Grid>
      </Grid>
      <Grid xs={6} item container spacing={2}>
        <Grid item xs={5.5}>
          <Skeleton variant="rectangular" height={56} />
        </Grid>
        <Grid item xs={1} alignContent="center">
          <Skeleton variant="text" />
        </Grid>
        <Grid item xs={5.5}>
          <Skeleton variant="rectangular" height={56} />
        </Grid>
      </Grid>
    </Grid>

    {/* Divider */}
    <Grid sx={{ p: 2 }}>
      <Divider />
    </Grid>

    {/* Third Row Skeleton */}
    <Grid container item direction="row" spacing={4} sx={{ p: 2 }}>
      <Grid item xs={3}>
        <Skeleton variant="rectangular" height={56} />
      </Grid>
      <Grid item xs={3}>
        <Skeleton variant="rectangular" height={56} />
      </Grid>
      <Grid item xs={3}>
        <Skeleton variant="rectangular" height={56} />
      </Grid>
      <Grid item xs={3}>
        <Skeleton variant="rectangular" height={56} />
      </Grid>
    </Grid>

    {/* Final Row Skeleton */}
    <Grid container item direction="row" spacing={4} sx={{ p: 2 }}>
      <Grid item xs={3}>
        <Skeleton variant="rectangular" height={56} />
      </Grid>
    </Grid>
  </Grid>
);
