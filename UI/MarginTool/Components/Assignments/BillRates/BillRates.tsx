import React, { useCallback, useEffect, useRef, useState } from 'react';
import MarginToolCard from '../../../Common/MarginToolCard';
import { MarginToolCardTitle } from '../../../Common/MarginToolCardTitle';
import { Box, CircularProgress, Divider, Grid, useTheme } from 'amn-ui-core';
import { useTranslation } from 'react-i18next';
import { MarginToolCheckbox } from '@AMIEWEB/MarginTool/Common/MarginToolCheckbox';
import { useFormContext, useWatch } from 'react-hook-form';
import {
  defaultValue,
  getBillRateFieldNames,
  getDynamicPSFTValue,
  getValueAsCustomDecimal,
  getValueAsFloat,
} from './helper';
import { MarginToolCurrencyField } from '@AMIEWEB/MarginTool/Common/MarginToolCurrencyField';
import MarginToolTextField from '@AMIEWEB/MarginTool/Common/MarginToolTextField';
import { MarginDetailsResponseScenarioSplitItem } from 'store/redux-store/margin-tool/slices/add-edit-scenario/add-edit-scenario.model';
import { findInitialSplitValueBySplitId, useScenarioStatusPending } from '@AMIEWEB/MarginTool/helper';
import { billRateStyles } from './BillRateStyles';
import { CustomTooltip } from '@AMIEWEB/Common';
import { getStatusUpdateButtonDisabledTooltip } from '../../PayPackage/PayPackageHelper';
import { useIsFieldDisabledInPendingStage } from '../../PayPackage/AddScenario/helper';
import { usePeopleSoftCalculation } from '../../PeopleSoftCalculation/IPeopleSoftCalculationHelper';
import { useDebouncedTriggerCalculation, useInitialMarginDetails } from '@AMIEWEB/MarginTool/hooks';
import { selectInitialScenarioMarginDetailsResponse } from 'store/redux-store/margin-tool/slices/assignment/assignment.selector';
import { useSelector } from 'react-redux';
import {
  selectBookingPeriod,
  selectSelectedScenario,
} from 'store/redux-store/margin-tool/slices/add-edit-scenario/add-edit-scenario.selector';
import { getHelperMultiplyAmount, getHelperSumAmount, getContractChargeRateTooltip, helperTextWithInfoIcon } from './BillRateTooltips';
import { add, subtract } from 'lodash';

export const BillRates = ({
  splitIndex,
  field,
}: {
  splitIndex: number;
  field: MarginDetailsResponseScenarioSplitItem;
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { setValue } = useFormContext();
  const { classes } = billRateStyles();
  const initialScenarioResponse = useSelector(selectInitialScenarioMarginDetailsResponse);
  const bookingPeriod = useSelector(selectBookingPeriod);
  const selectedScenario = useSelector(selectSelectedScenario);
  const isFieldDisabledInPendingStageForUserRoles = useIsFieldDisabledInPendingStage();
  const isScenarioStatusPending = useScenarioStatusPending();
  const { triggerPeopleSoftCalculation } = usePeopleSoftCalculation();
  const { initiateRefreshCall } = useInitialMarginDetails();
  const { debouncedTriggerPeopleSoftCalculation } = useDebouncedTriggerCalculation();
  const [isRefreshIsInProgress, setIsRefreshIsInProgress] = useState<boolean>(false);
  const isContainerRefreshed = useRef(false);
  const billRateFieldNames = getBillRateFieldNames(splitIndex);
  const billRateContainerWatchValues = useWatch({ name: Object.values(billRateFieldNames) });

  const handleRateAndFactorFields = (name: string) => {
    if (name) {
      setValue(name, '');
    }
  };

  const handleChargeRateUpdate = e => {
    const contractRates = isContainerRefreshed.current
      ? findInitialSplitValueBySplitId(initialScenarioResponse, field?.splitId)
      : field;
    const chargeCalculation = add(
      subtract(contractRates?.contractChargeAmount ?? 0, contractRates?.contractRegularBillRate ?? 0),
      parseFloat(e?.target?.value),
    );
    setValue(billRateFieldNames.chargeRate, getValueAsFloat(chargeCalculation));
  };

  const handleFieldUpdatesAfterRefresh = useCallback((splitIndex, initialSplitValue) => {

      const billRateFields = getBillRateFieldNames(splitIndex);
      setValue(billRateFields.billRate, getValueAsFloat(initialSplitValue?.billRate), {
        shouldDirty: true,
      });
      setValue(billRateFields.vmsFee, getValueAsFloat(initialSplitValue?.vms), {
        shouldDirty: true,
      });
      setValue(billRateFields.otherFee, getValueAsFloat(initialSplitValue?.other), {
        shouldDirty: true,
      });
      setValue(billRateFields.overtimeRate, getValueAsFloat(initialSplitValue?.overtime), {
        shouldDirty: true,
      });
      setValue(billRateFields.overtimeFactor, getValueAsFloat(initialSplitValue?.billOvertimeFactor), {
        shouldDirty: true,
      });
      setValue(billRateFields.callBackRate, getValueAsFloat(initialSplitValue?.callback), {
        shouldDirty: true,
      });
      setValue(billRateFields.callBackFactor, getValueAsFloat(initialSplitValue?.billCallbackFactor), {
        shouldDirty: true,
      });
      setValue(billRateFields.doubleTimeRate, getValueAsFloat(initialSplitValue?.billDoubletimeRate), {
        shouldDirty: true,
      });
      setValue(billRateFields.doubleTimeFactor, getValueAsFloat(initialSplitValue?.billDoubletimeFactor), {
        shouldDirty: true,
      });
      setValue(billRateFields.holidayRate, getValueAsFloat(initialSplitValue?.holiday), {
        shouldDirty: true,
      });
      setValue(billRateFields.holidayFactor, getValueAsFloat(initialSplitValue?.billHolidayFactor), {
        shouldDirty: true,
      });
      setValue(billRateFields.onCallRate, getValueAsFloat(initialSplitValue?.billOnCallRate), {
        shouldDirty: true,
      });
      setValue(billRateFields.chargeRate, getValueAsFloat(initialSplitValue?.billCharge), {
        shouldDirty: true,
      });
      setValue(billRateFields.amountPerMile, getValueAsFloat(initialSplitValue?.billAmountPerMile), {
        shouldDirty: true,
      });
      setValue(billRateFields.guaranteedHours, getValueAsFloat(initialSplitValue?.billGuaranteedHours), {
        shouldDirty: true,
      });
      setValue(billRateFields.preceptorRate, getValueAsFloat(initialSplitValue?.billPreceptor), {
        shouldDirty: true,
      });
      setValue(billRateFields.orientationRate, getValueAsFloat(initialSplitValue?.orientationRate), {
        shouldDirty: true,
      });
      setValue(billRateFields.orientationFactor, getValueAsFloat(initialSplitValue?.orientationFactor), {
        shouldDirty: true,
      });
      setValue(billRateFields.orientationHours, getValueAsFloat(initialSplitValue?.orientationHours), {
        shouldDirty: true,
      });
      setValue(billRateFields.voidOrientationHours, initialSplitValue?.isVoidOrientationHours, {
        shouldDirty: true,
      });
      debouncedTriggerPeopleSoftCalculation();
      setIsRefreshIsInProgress(false);
      isContainerRefreshed.current = true
    },
    [setValue, debouncedTriggerPeopleSoftCalculation]
  );

  useEffect(() => {
    if (isRefreshIsInProgress && initialScenarioResponse) {
      const initialSplit = findInitialSplitValueBySplitId(initialScenarioResponse, field?.splitId);
      if (initialSplit) {
        handleFieldUpdatesAfterRefresh(splitIndex, initialSplit);
      }
      //setIsRefreshIsInProgress(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialScenarioResponse, isRefreshIsInProgress, splitIndex]);

  const orientationHoursDefaultValue = !selectedScenario?.tla
    ? bookingPeriod?.isScenarioExtention
      ? defaultValue
      : getValueAsFloat(field?.orientationHours)
    : getValueAsFloat(field?.orientationHours);

  return (
    <MarginToolCard
      id="billRates-card-marginToolDetailsPage"
      title={<MarginToolCardTitle title={t('marginTool.components.assignment.billRates.title')} />}
      showRefreshButton={!isRefreshIsInProgress}
      icon={<CircularProgress size={16} color="inherit" />}
      isCustomIcon={isRefreshIsInProgress}
      customBackGroundColor={theme.palette.framework.system.white}
      onRefresh={() => {
        initiateRefreshCall();
        setIsRefreshIsInProgress(true);
      }}
      children={
        <Grid>
          <Grid container item direction="row" spacing={4} sx={{ p: 2 }}>
            <Grid item xs={3}>
              <MarginToolCurrencyField
                id="marginTool-billRates-billRate-currencyField"
                label={t('marginTool.labels.billRate')}
                name={billRateFieldNames.billRate}
                disabled={!isScenarioStatusPending}
                tooltip={{ disabled: true }}
                defaultValue={getValueAsFloat(field?.billRate)}
                triggerMarginToolFormUpdates={() => triggerPeopleSoftCalculation()}
                onChange={e => handleChargeRateUpdate(e)}
              />
            </Grid>
            <Grid item xs={3}>
              <MarginToolTextField
                id="marginTool-billRates-vms-textField"
                label={t('marginTool.labels.vms')}
                name={billRateFieldNames.vmsFee}
                disabled={!isScenarioStatusPending}
                isDecimalNumber={true}
                maxNumbersAllowed={2}
                endAdornmentValue={t('marginTool.labels.percentageSymbol')}
                defaultValue={getValueAsFloat(field?.vms)}
              />
            </Grid>
            <Grid item xs={3}>
              <MarginToolTextField
                id="marginTool-billRates-other-textField"
                label={t('marginTool.labels.other')}
                name={billRateFieldNames.otherFee}
                disabled={!isScenarioStatusPending}
                isDecimalNumber={true}
                maxNumbersAllowed={2}
                endAdornmentValue={t('marginTool.labels.percentageSymbol')}
                defaultValue={getValueAsFloat(field?.other)}
              />
            </Grid>
          </Grid>
          <Grid sx={{ p: 2 }}>
            <Divider />
          </Grid>
          <Grid container direction="row" spacing={4} sx={{ p: 2 }}>
            <Grid xs={6} item container>
              <Grid item xs={5.5}>
                <MarginToolCurrencyField
                  id="marginTool-billRates-overtimeRate-textField"
                  label={t('marginTool.labels.overtimeRate')}
                  name={billRateFieldNames.overtimeRate}
                  disabled={!isScenarioStatusPending}
                  defaultValue={getValueAsFloat(field?.overtime)}
                  tooltip={{ disabled: true }}
                  onChange={() => handleRateAndFactorFields(billRateFieldNames.overtimeFactor)}
                  helperText={getHelperSumAmount(
                    billRateContainerWatchValues[billRateFieldNames.overtimeRate],
                    billRateContainerWatchValues[billRateFieldNames.billRate],
                    t,
                  )}
                  triggerMarginToolFormUpdates={() => triggerPeopleSoftCalculation()}
                />
              </Grid>
              <Grid item xs={1} alignContent={'center'}>
                <Box className={classes.middleText}>{t('marginTool.labels.or')}</Box>
              </Grid>
              <Grid item xs={5.5}>
                <MarginToolTextField
                  id="marginTool-billRates-overtimeFactor-textField"
                  label={t('marginTool.labels.overtimeFactor')}
                  name={billRateFieldNames.overtimeFactor}
                  startAdornmentValue={t('marginTool.labels.crossSymbol')}
                  disabled={!isScenarioStatusPending}
                  isDecimalNumber={true}
                  maxNumbersAllowed={3}
                  defaultValue={getValueAsFloat(field?.billOvertimeFactor)}
                  onChange={() => handleRateAndFactorFields(billRateFieldNames.overtimeRate)}
                  helperText={getHelperMultiplyAmount(
                    billRateContainerWatchValues[billRateFieldNames.overtimeFactor],
                    billRateContainerWatchValues[billRateFieldNames.billRate],
                    t,
                  )}
                  triggerMarginToolFormUpdates={() => triggerPeopleSoftCalculation()}
                />
              </Grid>
            </Grid>
            <Grid xs={6} item container>
              <Grid item xs={5.5}>
                <MarginToolCurrencyField
                  id="marginTool-billRates-callBackRate-currencyField"
                  label={t('marginTool.labels.callBackRate')}
                  name={billRateFieldNames.callBackRate}
                  disabled={!isScenarioStatusPending}
                  tooltip={{ disabled: true }}
                  defaultValue={getValueAsFloat(field?.callback)}
                  onChange={() => handleRateAndFactorFields(billRateFieldNames.callBackFactor)}
                  helperText={getHelperSumAmount(
                    billRateContainerWatchValues[billRateFieldNames.callBackRate],
                    billRateContainerWatchValues[billRateFieldNames.billRate],
                    t,
                  )}
                />
              </Grid>
              <Grid item xs={1} alignContent={'center'}>
                <Box className={classes.middleText}>{t('marginTool.labels.or')}</Box>
              </Grid>
              <Grid item xs={5.5}>
                <MarginToolTextField
                  id="marginTool-billRates-callBackFactor-textField"
                  label={t('marginTool.labels.callBackFactor')}
                  name={billRateFieldNames.callBackFactor}
                  disabled={!isScenarioStatusPending}
                  isDecimalNumber={true}
                  maxNumbersAllowed={3}
                  defaultValue={getValueAsFloat(field?.billCallBackFactor)}
                  onChange={() => handleRateAndFactorFields(billRateFieldNames.callBackRate)}
                  helperText={helperTextWithInfoIcon(
                    billRateContainerWatchValues[billRateFieldNames.callBackFactor],
                    billRateContainerWatchValues[billRateFieldNames.billRate],
                    t('marginTool.components.assignment.billRates.hoverToolTipMessage', {
                      calculationType: t('marginTool.labels.callBackFactor'),
                      calculationRate: getDynamicPSFTValue(
                        billRateContainerWatchValues[billRateFieldNames.callBackFactor],
                      ),
                    }),
                    t,
                  )}
                />
              </Grid>
            </Grid>
          </Grid>
          <Grid container item direction="row" spacing={4} sx={{ p: 2 }}>
            <Grid xs={6} item container>
              <Grid item xs={5.5}>
                <MarginToolCurrencyField
                  id="marginTool-billRates-doubleTimeRate-textField"
                  label={t('marginTool.labels.doubleTimeRate')}
                  name={billRateFieldNames.doubleTimeRate}
                  disabled={!isScenarioStatusPending}
                  tooltip={{ disabled: true }}
                  defaultValue={getValueAsFloat(field?.billDoubletimeRate)}
                  onChange={() => handleRateAndFactorFields(billRateFieldNames.doubleTimeFactor)}
                  helperText={getHelperSumAmount(
                    billRateContainerWatchValues[billRateFieldNames.doubleTimeRate],
                    billRateContainerWatchValues[billRateFieldNames.billRate],
                    t,
                  )}
                  triggerMarginToolFormUpdates={() => triggerPeopleSoftCalculation()}
                />
              </Grid>
              <Grid item xs={1} alignContent={'center'}>
                <Box className={classes.middleText}>{t('marginTool.labels.or')}</Box>
              </Grid>
              <Grid item xs={5.5}>
                <MarginToolTextField
                  id="marginTool-billRates-doubleTimeFactor-textField"
                  label={t('marginTool.labels.doubleTimeFactor')}
                  name={billRateFieldNames.doubleTimeFactor}
                  disabled={!isScenarioStatusPending}
                  startAdornmentValue={t('marginTool.labels.crossSymbol')}
                  isDecimalNumber={true}
                  maxNumbersAllowed={3}
                  defaultValue={getValueAsFloat(field?.billDoubletimeFactor)}
                  onChange={() => handleRateAndFactorFields(billRateFieldNames.doubleTimeRate)}
                  helperText={getHelperMultiplyAmount(
                    billRateContainerWatchValues[billRateFieldNames.doubleTimeFactor],
                    billRateContainerWatchValues[billRateFieldNames.billRate],
                    t,
                  )}
                  triggerMarginToolFormUpdates={() => triggerPeopleSoftCalculation()}
                />
              </Grid>
            </Grid>
            <Grid xs={6} item container>
              <Grid item xs={5.5}>
                <MarginToolCurrencyField
                  id="marginTool-billRates-holidayRate-currencyField"
                  label={t('marginTool.labels.holidayRate')}
                  name={billRateFieldNames.holidayRate}
                  disabled={!isScenarioStatusPending}
                  tooltip={{ disabled: true }}
                  defaultValue={getValueAsFloat(field?.holiday)}
                  onChange={() => handleRateAndFactorFields(billRateFieldNames.holidayFactor)}
                  helperText={getHelperSumAmount(
                    billRateContainerWatchValues[billRateFieldNames.holidayRate],
                    billRateContainerWatchValues[billRateFieldNames.billRate],
                    t,
                  )}
                />
              </Grid>
              <Grid item xs={1} alignContent={'center'}>
                <Box className={classes.middleText}>{t('marginTool.labels.or')}</Box>
              </Grid>
              <Grid item xs={5.5}>
                <MarginToolTextField
                  id="marginTool-billRates-holidayFactor-textField"
                  label={t('marginTool.labels.holidayFactor')}
                  name={billRateFieldNames.holidayFactor}
                  disabled={!isScenarioStatusPending}
                  isDecimalNumber={true}
                  maxNumbersAllowed={3}
                  defaultValue={getValueAsFloat(field?.billHolidayFactor)}
                  onChange={() => handleRateAndFactorFields(billRateFieldNames.holidayRate)}
                  helperText={helperTextWithInfoIcon(
                    billRateContainerWatchValues[billRateFieldNames.holidayFactor],
                    billRateContainerWatchValues[billRateFieldNames.billRate],
                    t('marginTool.components.assignment.billRates.hoverToolTipMessage', {
                      calculationType: t('marginTool.labels.holidayFactor'),
                      calculationRate: getDynamicPSFTValue(
                        billRateContainerWatchValues[billRateFieldNames.holidayFactor],
                      ),
                    }),
                    t,
                  )}
                />
              </Grid>
            </Grid>
          </Grid>
          <Grid sx={{ p: 2 }}>
            <Divider />
          </Grid>
          <Grid container item direction="row" spacing={4} sx={{ p: 2 }}>
            <Grid item xs={3}>
              <MarginToolCurrencyField
                id="marginTool-billRates-onCallRate-currencyField"
                label={t('marginTool.labels.onCallRate')}
                name={billRateFieldNames.onCallRate}
                disabled={!isScenarioStatusPending}
                tooltip={{ disabled: true }}
                defaultValue={getValueAsFloat(field?.billOnCallRate)}
              />
            </Grid>
            <Grid item xs={3}>
              <MarginToolCurrencyField
                id="marginTool-billRates-charge-currencyField"
                label={t('marginTool.labels.charge')}
                name={billRateFieldNames.chargeRate}
                disabled={!isScenarioStatusPending}
                tooltip={{ disabled: true }}
                defaultValue={getValueAsFloat(field?.billCharge)}
                helperText={getContractChargeRateTooltip(
                  isContainerRefreshed.current
                    ? findInitialSplitValueBySplitId(initialScenarioResponse, field?.splitId)
                    : field,
                  t,
                )}
              />
            </Grid>
            <Grid item xs={3}>
              <MarginToolTextField
                id="marginTool-billRates-amountPerMile-textField"
                label={t('marginTool.labels.amountPerMile')}
                name={billRateFieldNames.amountPerMile}
                disabled={!isScenarioStatusPending}
                isDecimalNumber={true}
                belowOne={true}
                maxDecimals={3}
                startAdornmentValue={t('currency.dollar')}
                defaultValue={getValueAsCustomDecimal(field?.billAmountPerMile, 3)}
              />
            </Grid>
            <Grid item xs={3}>
              <MarginToolTextField
                id="marginTool-billRates-guaranteedHours-textField"
                label={t('marginTool.labels.guaranteedHours')}
                name={billRateFieldNames.guaranteedHours}
                disabled={!isScenarioStatusPending}
                isDecimalNumber={true}
                maxNumbersAllowed={2}
                endAdornmentValue={t('marginTool.labels.hours')}
                defaultValue={getValueAsFloat(field?.billGuaranteedHours)}
              />
            </Grid>
          </Grid>
          <Grid container item direction="row" spacing={4} sx={{ p: 2 }}>
            <Grid item xs={3}>
              <MarginToolCurrencyField
                id="marginTool-billRates-preceptorRate-currencyField"
                label={t('marginTool.labels.preceptorRate')}
                name={billRateFieldNames.preceptorRate}
                disabled={!isScenarioStatusPending}
                tooltip={{ disabled: true }}
                defaultValue={getValueAsFloat(field?.billPreceptor)}
                helperText={getHelperSumAmount(
                  billRateContainerWatchValues[billRateFieldNames.preceptorRate],
                  billRateContainerWatchValues[billRateFieldNames.billRate],
                  t,
                )}
              />
            </Grid>
          </Grid>
          <Grid container item direction="row" spacing={4} sx={{ p: 2 }}>
            <Grid xs={6} item container>
              <Grid item xs={5.5}>
                <CustomTooltip
                  tooltipContent={
                    isFieldDisabledInPendingStageForUserRoles ? getStatusUpdateButtonDisabledTooltip() : ''
                  }
                >
                  <MarginToolCurrencyField
                    id="marginTool-billRates-orientationRate-textField"
                    label={t('marginTool.labels.orientationRate')}
                    name={billRateFieldNames.orientationRate}
                    disabled={
                      billRateContainerWatchValues[billRateFieldNames.voidOrientationHours] ||
                      !isScenarioStatusPending ||
                      isFieldDisabledInPendingStageForUserRoles
                    }
                    defaultValue={getValueAsFloat(field?.orientationRate)}
                    tooltip={{ disabled: true }}
                    onChange={() => handleRateAndFactorFields(billRateFieldNames.orientationFactor)}
                    helperText={getHelperSumAmount(
                      billRateContainerWatchValues[billRateFieldNames.orientationRate],
                      billRateContainerWatchValues[billRateFieldNames.billRate],
                      t,
                    )}
                  />
                </CustomTooltip>
              </Grid>
              <Grid item xs={1} alignContent={'center'}>
                <Box className={classes.middleText}>{t('marginTool.labels.or')}</Box>
              </Grid>
              <Grid item xs={5.5}>
                <CustomTooltip
                  tooltipContent={
                    isFieldDisabledInPendingStageForUserRoles ? getStatusUpdateButtonDisabledTooltip() : ''
                  }
                >
                  <MarginToolTextField
                    id="marginTool-billRates-orientationFactor-textField"
                    label={t('marginTool.labels.orientationFactor')}
                    name={billRateFieldNames.orientationFactor}
                    disabled={
                      billRateContainerWatchValues[billRateFieldNames.voidOrientationHours] ||
                      !isScenarioStatusPending ||
                      isFieldDisabledInPendingStageForUserRoles
                    }
                    isDecimalNumber={true}
                    maxNumbersAllowed={1}
                    startAdornmentValue={t('marginTool.labels.crossSymbol')}
                    defaultValue={getValueAsFloat(field?.orientationFactor)}
                    onChange={() => handleRateAndFactorFields(billRateFieldNames.orientationRate)}
                    helperText={getHelperMultiplyAmount(
                      billRateContainerWatchValues[billRateFieldNames.orientationFactor],
                      billRateContainerWatchValues[billRateFieldNames.billRate],
                      t,
                    )}
                  />
                </CustomTooltip>
              </Grid>
            </Grid>
            <Grid item xs={3}>
              <CustomTooltip
                tooltipContent={isFieldDisabledInPendingStageForUserRoles ? getStatusUpdateButtonDisabledTooltip() : ''}
              >
                <MarginToolTextField
                  id="marginTool-billRates-orientationHours-textField"
                  label={t('marginTool.labels.orientationHours')}
                  name={billRateFieldNames.orientationHours}
                  disabled={
                    billRateContainerWatchValues[billRateFieldNames.voidOrientationHours] ||
                    !isScenarioStatusPending ||
                    isFieldDisabledInPendingStageForUserRoles
                  }
                  isDecimalNumber={true}
                  endAdornmentValue={t('marginTool.labels.hours')}
                  defaultValue={orientationHoursDefaultValue}
                  triggerMarginToolFormUpdates={() => triggerPeopleSoftCalculation()}
                />
              </CustomTooltip>
            </Grid>
            <Grid item xs={3}>
              <CustomTooltip
                tooltipContent={isFieldDisabledInPendingStageForUserRoles ? getStatusUpdateButtonDisabledTooltip() : ''}
              >
                <MarginToolCheckbox
                  id="marginTool-billRates-voidOrientationHours-checkbox"
                  label={t('marginTool.labels.voidOrientationHours')}
                  name={billRateFieldNames.voidOrientationHours}
                  disabled={!isScenarioStatusPending || isFieldDisabledInPendingStageForUserRoles}
                  defaultChecked={field?.isVoidOrientationHours}
                  onHandleChange={() => triggerPeopleSoftCalculation()}
                />
              </CustomTooltip>
            </Grid>
          </Grid>
        </Grid>
      }
    />
  );
};

