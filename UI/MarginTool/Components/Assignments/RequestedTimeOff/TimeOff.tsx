import React, { useEffect, useState } from 'react';
import MarginToolCard from '../../../Common/MarginToolCard';
import { MarginToolCardTitle } from '../../../Common/MarginToolCardTitle';
import { Grid, useTheme } from 'amn-ui-core';
import { useTranslation } from 'react-i18next';
import { TimeOffGrid } from './TimeOffGrid';
import { useInitialMarginDetails } from '@AMIEWEB/MarginTool/hooks';
import { useDispatch, useSelector } from 'react-redux';
import { selectInitialScenarioMarginDetailsResponse } from 'store/redux-store/margin-tool/slices/assignment/assignment.selector';
import { assignmentActions } from 'store/redux-store/margin-tool/slices/assignment/assignment.redux';
import { usePeopleSoftCalculation } from '../../PeopleSoftCalculation/IPeopleSoftCalculationHelper';
import { useFormContext } from 'react-hook-form';

export const RequestedTimeOff = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { initiateRefreshCall } = useInitialMarginDetails();
  const { triggerPeopleSoftCalculation } = usePeopleSoftCalculation();
  const initialScenarioResponse = useSelector(selectInitialScenarioMarginDetailsResponse);
  const dispatch = useDispatch();
  const [isRefreshInProgress, setIsRefreshInProgress] = useState<boolean>(false);
  const { register, setValue } = useFormContext();

  const handleFieldUpdatesAfterRefresh = () => {
    const updatedTimeOff = initialScenarioResponse?.assignment?.timeOffs.map((item, index) => ({
      ...item,
      id: `${index + 1}`, // @To-do-margin-tool xgrid requires id for index
    }));
    dispatch(assignmentActions.setEditTimeOffs(updatedTimeOff));
    triggerPeopleSoftCalculation(false, updatedTimeOff);
    setIsRefreshInProgress(false);
    register(`assignmentTimeOffs`);
    setValue(`assignmentTimeOffs`, updatedTimeOff, { shouldDirty: true });
  };

  /**
   * useEffect to handle field updates for travel container after refresh button is clicked
   */
  useEffect(() => {
    if (isRefreshInProgress && initialScenarioResponse) {
      handleFieldUpdatesAfterRefresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialScenarioResponse, isRefreshInProgress]);

  return (
    <MarginToolCard
      id="requestedTimeOff-card-marginToolDetailsPage"
      title={<MarginToolCardTitle title={t('marginTool.components.assignment.requestedTimeOff.title')} />}
      showRefreshButton
      onRefresh={() => {
        initiateRefreshCall();
        setIsRefreshInProgress(true);
      }}
      customBackGroundColor={theme.palette.framework.system.white}
      children={
        <Grid container padding={2}>
          <TimeOffGrid isRefreshInProgress={isRefreshInProgress} />
        </Grid>
      }
    />
  );
};
