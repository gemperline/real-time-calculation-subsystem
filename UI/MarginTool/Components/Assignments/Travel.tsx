import React, { useCallback, useEffect, useState } from 'react';
import MarginToolCard from 'app/components/MarginTool/Common/MarginToolCard';
import { MarginToolCardTitle } from '@AMIEWEB/MarginTool/Common/MarginToolCardTitle';
import { CircularProgress, Grid, useTheme } from 'amn-ui-core';
import { useTranslation } from 'react-i18next';
import { MarginToolCurrencyField } from 'app/components/MarginTool/Common/MarginToolCurrencyField';
import { useSelector } from 'react-redux';
import { Typography } from 'amn-ui-core';
import {
  selectBookingPeriod,
  selectSelectedScenario,
} from 'store/redux-store/margin-tool/slices/add-edit-scenario/add-edit-scenario.selector';
import { isNullOrUndefined } from 'app/helpers/objectHelpers';
import { getInputValueAsCurrency } from '@AMIEWEB/MarginTool/helper';
import { PayPackageStatus } from 'store/redux-store/margin-tool/slices/pay-package-status/pay-package-status.model';
import { usePeopleSoftCalculation } from '../PeopleSoftCalculation/IPeopleSoftCalculationHelper';
import { useDebouncedTriggerCalculation, useInitialMarginDetails } from '@AMIEWEB/MarginTool/hooks';
import { selectInitialScenarioMarginDetailsResponse } from 'store/redux-store/margin-tool/slices/assignment/assignment.selector';
import { useFormContext } from 'react-hook-form';

export const Travel = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const selectedScenario = useSelector(selectSelectedScenario);
  const bookingPeriod = useSelector(selectBookingPeriod);
  //const [tooltipText, setTooltipText] = useState<string | null>(null);
  const { triggerPeopleSoftCalculation } = usePeopleSoftCalculation();
  const { initiateRefreshCall } = useInitialMarginDetails();
  const { debouncedTriggerPeopleSoftCalculation } = useDebouncedTriggerCalculation();
  const { setValue } = useFormContext();
  const [isRefreshInProgress, setIsRefreshInProgress] = useState<boolean>(false);
  const initialScenarioResponse = useSelector(selectInitialScenarioMarginDetailsResponse);
  
  const determineTooltipText = useCallback(
    () => {
        if (selectedScenario?.tla) {
            return t('marginTool.tooltip.disabledReasonTLA');
        } else if (bookingPeriod?.isScenarioExtention) {
            return t('marginTool.tooltip.disabledReasonExtension');
        } else {
            return t('marginTool.tooltip.disabledReasonNotExtension');
        }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [bookingPeriod?.isScenarioExtention, selectedScenario?.tla] // Dependencies added here
);

  /**
   * Method to handle field updates after refresh button is clicked
   */
  const handleFieldUpdatesAfterRefresh = useCallback(() => {
    const travelFields = initialScenarioResponse?.assignment?.travel;
    setValue(`assignment.travel.arrivingTravel`, getInputValueAsCurrency(travelFields?.arrivingTravel), {
      shouldDirty: true,
    });
    setValue(`assignment.travel.endingTravel`, getInputValueAsCurrency(travelFields?.endingTravel), {
      shouldDirty: true,
    });
    setValue(`assignment.travel.interimTravel`, getInputValueAsCurrency(travelFields?.interimTravel), {
      shouldDirty: true,
    });
    setValue(`assignment.travel.amnFlight`, travelFields?.amnFlight ?? '', {
      shouldDirty: true,
    });
    setValue(`assignment.travel.amnRentalCar`, travelFields?.amnRentalCar ?? '', {
      shouldDirty: true,
    });
    debouncedTriggerPeopleSoftCalculation();
    setIsRefreshInProgress(false);
  }, [initialScenarioResponse, setValue, debouncedTriggerPeopleSoftCalculation, setIsRefreshInProgress]);

  /**
   * useEffect to handle field updates for travel container after refresh button is clicked
   */
  useEffect(() => {
    if (isRefreshInProgress && initialScenarioResponse) {
      handleFieldUpdatesAfterRefresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialScenarioResponse, isRefreshInProgress]);
  
  const tooltipText = determineTooltipText();

  return (
    <MarginToolCard
      id="travel-card-marginToolDetailsPage"
      title={<MarginToolCardTitle title={t('marginTool.components.assignment.travel')} />}
      customBackGroundColor={theme.palette.framework.system.white}
      showRefreshButton={!isRefreshInProgress}
      icon={<CircularProgress size={16} color="inherit" />}
      isCustomIcon={isRefreshInProgress}
      onRefresh={() => {
        initiateRefreshCall();
        setIsRefreshInProgress(true);
      }}
      children={
        <Grid container spacing={2} sx={{ p: 2 }} direction="column">
            <Grid container item>
              <Typography
                component="span"
                variant="subtitle1"
                sx={{ color: theme.palette.components.typography.color, fontWeight: 700 }}
              >
                {t('marginTool.components.travelReimbursement')}
              </Typography>
            </Grid>
            <Grid container item spacing={4}>
              <Grid item xs={4}>
                <MarginToolCurrencyField
                  name={`assignment.travel.arrivingTravel`}
                  id="marginTool-travel-arrivingTravel-currencyField"
                  disabled={
                    selectedScenario?.scenarioStatusId !== PayPackageStatus.Pending ||
                    (bookingPeriod?.isScenarioExtention && !selectedScenario?.tla) ||
                    selectedScenario?.tla
                  }
                  label={t('marginTool.labels.arrivingTravel')}
                  helperText={
                    !(bookingPeriod?.isScenarioExtention && !selectedScenario?.tla)
                      ? !isNullOrUndefined(selectedScenario?.assignment.travel?.arrivalAmountPerMile)
                        ? `(${t(
                            'marginTool.helperText.amountPerMile',
                          )} $${selectedScenario?.assignment.travel?.arrivalAmountPerMile.toFixed(2)})`
                        : null
                      : null
                  }
                  tooltip={{
                    disabled: !(bookingPeriod?.isScenarioExtention || selectedScenario?.tla),
                    tooltipText: tooltipText,
                  }}
                  defaultValue={
                    !(bookingPeriod?.isScenarioExtention && !selectedScenario?.tla)
                      ? getInputValueAsCurrency(selectedScenario?.assignment.travel?.arrivingTravel)
                      : null
                  }
                  triggerMarginToolFormUpdates={() => triggerPeopleSoftCalculation()}
                />
              </Grid>
              <Grid item xs={4}>
                <MarginToolCurrencyField
                  name={`assignment.travel.endingTravel`}
                  id="marginTool-travel-endingTravel-currencyField"
                  disabled={
                    selectedScenario?.scenarioStatusId !== PayPackageStatus.Pending ||
                    (bookingPeriod?.isScenarioExtention && !selectedScenario?.tla) ||
                    selectedScenario?.tla
                  }
                  label={t('marginTool.labels.endingTravel')}
                  helperText={
                    !(bookingPeriod?.isScenarioExtention && !selectedScenario?.tla)
                      ? !isNullOrUndefined(selectedScenario?.assignment.travel?.endingAmountPerMile)
                        ? `(${t(
                            'marginTool.helperText.amountPerMile',
                          )} $${selectedScenario?.assignment.travel?.endingAmountPerMile.toFixed(2)})`
                        : null
                      : null
                  }
                  tooltip={{
                    tooltipText: tooltipText,
                    disabled: !(bookingPeriod?.isScenarioExtention || selectedScenario?.tla),
                  }}
                  defaultValue={
                    !(bookingPeriod?.isScenarioExtention && !selectedScenario?.tla)
                      ? getInputValueAsCurrency(selectedScenario?.assignment.travel?.endingTravel)
                      : null
                  }
                  triggerMarginToolFormUpdates={() => triggerPeopleSoftCalculation()}
                />
              </Grid>
              <Grid item xs={4}>
                <MarginToolCurrencyField
                  name={`assignment.travel.interimTravel`}
                  id="marginTool-travel-interimTravel-currencyField"
                  disabled={
                    selectedScenario?.scenarioStatusId !== PayPackageStatus.Pending ||
                    (!bookingPeriod?.isScenarioExtention && !selectedScenario?.tla) ||
                    selectedScenario?.tla
                  }
                  label={t('marginTool.labels.interimTravel')}
                  helperText={
                    !(!bookingPeriod?.isScenarioExtention && !selectedScenario?.tla)
                      ? !isNullOrUndefined(selectedScenario?.assignment.travel?.interimAmountPerMile)
                        ? `(${t(
                            'marginTool.helperText.amountPerMile',
                          )} $${selectedScenario?.assignment.travel?.interimAmountPerMile.toFixed(2)})`
                        : null
                      : null
                  }
                  tooltip={{
                    tooltipText: tooltipText,
                    disabled: !(!bookingPeriod?.isScenarioExtention || selectedScenario?.tla),
                  }}
                  defaultValue={
                    !(!bookingPeriod?.isScenarioExtention && !selectedScenario?.tla)
                      ? getInputValueAsCurrency(selectedScenario?.assignment.travel?.interimTravel)
                      : null
                  }
                  triggerMarginToolFormUpdates={() => triggerPeopleSoftCalculation()}
                />
              </Grid>
            </Grid>
            <Grid container item>
              <Typography
                component="span"
                variant="subtitle1"
                sx={{ color: theme.palette.components.typography.color, fontWeight: 700 }}
              >
                {t('marginTool.components.amnTravel')}
              </Typography>
            </Grid>
            <Grid container item spacing={4}>
              <Grid item xs={4}>
                <MarginToolCurrencyField
                  label={t('marginTool.labels.amnFlight')}
                  id="marginTool-travel-amnFlight-currencyField"
                  name={`assignment.travel.amnFlight`}
                  disabled={!!selectedScenario?.tla || selectedScenario?.scenarioStatusId !== PayPackageStatus.Pending}
                  tooltip={{
                    tooltipText: tooltipText,
                    disabled: !selectedScenario?.tla || !tooltipText,
                  }}
                  defaultValue={selectedScenario?.assignment.travel?.amnFlight}
                  triggerMarginToolFormUpdates={() => triggerPeopleSoftCalculation()}
                />
              </Grid>
              <Grid item xs={4}>
                <MarginToolCurrencyField
                  label={t('marginTool.labels.amnRentalCar')}
                  id="marginTool-travel-amnRentalCare-currencyField"
                  name={`assignment.travel.amnRentalCar`}
                  disabled={!!selectedScenario?.tla || selectedScenario?.scenarioStatusId !== PayPackageStatus.Pending}
                  tooltip={{
                    tooltipText: tooltipText,
                    disabled: !selectedScenario?.tla || !tooltipText,
                  }}
                  defaultValue={selectedScenario?.assignment.travel?.amnRentalCar}
                  triggerMarginToolFormUpdates={() => triggerPeopleSoftCalculation()}
                />
              </Grid>
            </Grid>
          </Grid>

      }
    />
  );
};