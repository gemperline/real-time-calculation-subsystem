import React, { useMemo } from 'react';
import { Grid, Skeleton } from 'amn-ui-core';
import { useScenarioHeaderStyles } from '../ScenarioHeader.Styles';
import { useSelector } from 'react-redux';
import { usePromiseTracker } from 'react-promise-tracker';
import {
  selectMarginToolDetailsData,
  selectSelectedScenario,
} from 'store/redux-store/margin-tool/slices/add-edit-scenario/add-edit-scenario.selector';

import { ScenarioHeaderPeopleSoft } from './ScenarioHeaderPeopleSoft';
import { ScenarioHeaderLinks } from './ScenarioHeaderLinks';
import { ScenarioHeaderAssignment } from './ScenarioHeaderAssignment';
import { IHeaderDetails } from '../helper';
import { PromiseTrackerKeys } from 'app/constants/PromiseTrackerKeys';

export const ScenarioHeaderDetails = () => {
  const headerData = useSelector(selectSelectedScenario);
  const marginToolDetails = useSelector(selectMarginToolDetailsData);
  const { classes } = useScenarioHeaderStyles();
  const { promiseInProgress: isScenarioDataLoading } = usePromiseTracker({
    area: PromiseTrackerKeys.marginTool.scenarioNavigationData,
    delay: 0,
  });
  const headerDetails: IHeaderDetails = useMemo(() => {
    if (marginToolDetails?.length > 0 && headerData?.scenarioId > 0) {
      const scenarioDetails = marginToolDetails?.find(treeData =>
        treeData?.scenarios?.find(scenario => scenario?.scenarioId === headerData?.scenarioId),
      );
      return {
        placement: {
          startDate: scenarioDetails?.placementStartDate,
          endDate: scenarioDetails?.placementEndDate,
          duration: scenarioDetails?.placementDuration,
          discipline: scenarioDetails?.discipline,
          specialty: scenarioDetails?.specialty,
          subSpecialty: scenarioDetails?.subSpecialty,
        },
        order: { orderId: scenarioDetails?.orderId, orderType: scenarioDetails?.orderType },
        facility: scenarioDetails?.facility,
        candidate: {
          name: scenarioDetails?.candidateNameFirst + ' ' + scenarioDetails?.candidateNameLast,
          candidateId: scenarioDetails?.travelerId,
        },
        assignment: {
          startDate: scenarioDetails?.bookingPeriodStartDate,
          endDate: scenarioDetails?.bookingPeriodEndDate,
          duration: scenarioDetails?.bookingPeriodDuration,
        },
        recruiter: scenarioDetails?.recruiter,
        accountManager: scenarioDetails?.accountManager,
        brandName: scenarioDetails?.brand,
        brandId: scenarioDetails?.brandId,
      };
    }
  }, [marginToolDetails, headerData?.scenarioId]);

  return (
    <>
      <Grid item className={classes.detailCard}>
        <Grid container p={2}>
          {!isScenarioDataLoading ? <ScenarioHeaderPeopleSoft headerData={headerData} /> : <SkeletonBody />}
          {!isScenarioDataLoading ? (
            <ScenarioHeaderLinks headerData={headerData} headerDetails={headerDetails} />
          ) : (
            <SkeletonBody />
          )}
          {!isScenarioDataLoading ? (
            <ScenarioHeaderAssignment headerData={headerData} headerDetails={headerDetails} />
          ) : (
            <SkeletonBody />
          )}
        </Grid>
      </Grid>
    </>
  );
};

export const SkeletonBody = () => {
  const { classes } = useScenarioHeaderStyles();
  return (
    <>
      <Skeleton variant="rectangular" className={classes.skeletonBody} />
      <Skeleton variant="rectangular" className={classes.skeletonBody} />
      <Skeleton variant="rectangular" className={classes.skeletonBody} />
      <Skeleton variant="rectangular" className={classes.skeletonBody} />
      <Skeleton variant="rectangular" className={classes.skeletonBody} />
    </>
  );
};
