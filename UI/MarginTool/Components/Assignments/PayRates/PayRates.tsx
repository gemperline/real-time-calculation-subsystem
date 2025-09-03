import MarginToolCard from '@AMIEWEB/MarginTool/Common/MarginToolCard';
import { CircularProgress, Divider, Grid, useTheme } from 'amn-ui-core';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFormContext } from 'react-hook-form';
import { MarginToolCardTitle } from '../../../Common/MarginToolCardTitle';
import { MarginToolCurrencyField } from '@AMIEWEB/MarginTool/Common/MarginToolCurrencyField';
import MarginToolTextField from '@AMIEWEB/MarginTool/Common/MarginToolTextField';
import { ControlledTypeAhead } from '@AMIEWEB/Candidate/CandidateProfile/CandidateTabPanel/PreferencesTab/CustomComponents/ControlledTypeAhead';
import { useTreeLookupByCategoryName } from '../helper';
import { TreeViewLookupTypes } from '../enum';
import {
  formatTypeAheadOptions,
  getAdditionalPremiumPay,
  getHelperAmount,
  getPayChargeHelperText,
  getPayRateHelperText,
  helperTextWithInfoIcon,
} from './helper';
import { useSelector } from 'react-redux';
import { selectSelectedScenario } from 'store/redux-store/margin-tool/slices/add-edit-scenario/add-edit-scenario.selector';
import { PayPackageStatus } from 'store/redux-store/margin-tool/slices/pay-package-status/pay-package-status.model';
import { defaultValue, getValueAsFloat } from '../BillRates/helper';
import { PayRateFieldNames } from './enum';
import { getStatusUpdateButtonDisabledTooltip } from '../../PayPackage/PayPackageHelper';
import { CustomTooltip } from '@AMIEWEB/Common';
import { useIsFieldDisabledInPendingStage } from '../../PayPackage/AddScenario/helper';
import { usePeopleSoftCalculation } from '../../PeopleSoftCalculation/IPeopleSoftCalculationHelper';
import { useDebouncedTriggerCalculation, useInitialMarginDetails } from '@AMIEWEB/MarginTool/hooks';
import { selectInitialScenarioMarginDetailsResponse } from 'store/redux-store/margin-tool/slices/assignment/assignment.selector';
import { findInitialSplitValueBySplitId } from '@AMIEWEB/MarginTool/helper';
import { MarginDetailsResponseScenarioSplitItem } from 'store/redux-store/margin-tool/slices/add-edit-scenario/add-edit-scenario.model';
import { add, subtract } from 'lodash';

export const PayRates = ({
  splitIndex,
  field,
}: {
  splitIndex: number;
  field: MarginDetailsResponseScenarioSplitItem;
}) => {
  const theme = useTheme();
  const { control, register, setValue, watch } = useFormContext();
  const { t } = useTranslation();
  const scenario = useSelector(selectSelectedScenario);
  const initialScenarioResponse = useSelector(selectInitialScenarioMarginDetailsResponse);
  const { triggerPeopleSoftCalculation } = usePeopleSoftCalculation();
  const { initiateRefreshCall } = useInitialMarginDetails();
  const isScenarioStatusPending = scenario?.scenarioStatusId === PayPackageStatus.Pending;
  const splitData = scenario?.splits[splitIndex];
  const payRateOptions = useTreeLookupByCategoryName(TreeViewLookupTypes.PayRates);
  const [isRefreshIsInProgress, setRefreshIsInProgress] = useState<boolean>(false);
  const isContainerRefreshed = useRef(false);
  const { debouncedTriggerPeopleSoftCalculation } = useDebouncedTriggerCalculation();

  const additionalPremiumPayOptions = useMemo(() => {
    return Array.isArray(payRateOptions)
      ? []
      : payRateOptions?.fields.length > 0
      ? formatTypeAheadOptions(payRateOptions?.fields[0]?.items)
      : [];
  }, [payRateOptions]);

  const getPayRateAdditionalPremiumPay = getAdditionalPremiumPay(
    scenario?.assignment?.payPackageDetailsValues,
    additionalPremiumPayOptions,
  );

  const isFieldDisabledInPendingStageForUserRoles = useIsFieldDisabledInPendingStage();
  const additionalPremiumPaydefaultValue = getPayRateAdditionalPremiumPay
    ? getPayRateAdditionalPremiumPay[splitIndex]
    : additionalPremiumPayOptions[0];
  const payRateValue = watch(`assignmentSplits.${splitIndex}.payRate`);
  const overtimeFactorValue = watch(`assignmentSplits.${splitIndex}.payOvertimeFactor`);
  const callBackFactorValue = watch(`assignmentSplits.${splitIndex}.payCallBackFactor`);
  const holidayFactorValue = watch(`assignmentSplits.${splitIndex}.payHolidayFactor`);
  const doubleTimeFactorValue = watch(`assignmentSplits.${splitIndex}.payDoubletimeFactor`);
  const additionalPremiumPayValue = watch(`assignmentSplits.${splitIndex}.additionalPremiumPay`);
  const additionalPremiumPay =
    additionalPremiumPayValue?.object?.description === 'None'
      ? defaultValue
      : additionalPremiumPayValue?.object?.description?.toString();

  useEffect(() => {
    if (additionalPremiumPaydefaultValue) {
      setValue(`assignmentSplits.${splitIndex}.additionalPremiumPay`, additionalPremiumPaydefaultValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [additionalPremiumPaydefaultValue]);

  const handleAdditionalPremiumPayChange = value => {
    setValue(`assignmentSplits.${splitIndex}.additionalPremiumPay`, value);
    triggerPeopleSoftCalculation();
  };

  const handlePayChargeUpdate = e => {
    const payRollRates = isContainerRefreshed.current
      ? findInitialSplitValueBySplitId(initialScenarioResponse, field?.splitId)
      : field;
    const chargeCalculation = add(
      subtract(payRollRates?.payrollChargeAmount ?? 0, payRollRates?.payrollRegularPayRate ?? 0),
      parseFloat(e?.target?.value),
    );
    setValue(`assignmentSplits.${splitIndex}.payCharge`, getValueAsFloat(chargeCalculation));
  };
  const handleFieldUpdatesAfterRefresh = useCallback(
    (initialSplit: MarginDetailsResponseScenarioSplitItem) => {
      setValue(`assignmentSplits.${splitIndex}.payRate`, getValueAsFloat(initialSplit?.payRate), {
        shouldDirty: true,
      });
      setValue(`assignmentSplits.${splitIndex}.payOvertimeFactor`, getValueAsFloat(initialSplit?.payOvertimeFactor), {
        shouldDirty: true,
      });
      setValue(`assignmentSplits.${splitIndex}.payCallBackFactor`, getValueAsFloat(initialSplit?.payCallBackFactor), {
        shouldDirty: true,
      });
      setValue(`assignmentSplits.${splitIndex}.payHolidayFactor`, getValueAsFloat(initialSplit?.payHolidayFactor), {
        shouldDirty: true,
      });
      setValue(
        `assignmentSplits.${splitIndex}.payDoubletimeFactor`,
        getValueAsFloat(initialSplit?.payDoubletimeFactor),
        {
          shouldDirty: true,
        },
      );
      setValue(`assignmentSplits.${splitIndex}.payOnCallRate`, getValueAsFloat(initialSplit?.payOnCallRate), {
        shouldDirty: true,
      });
      setValue(`assignmentSplits.${splitIndex}.payCharge`, getValueAsFloat(initialSplit?.payCharge), {
        shouldDirty: true,
      });
      setValue(`assignmentSplits.${splitIndex}.payAmountPerMile`, getValueAsFloat(initialSplit?.payAmountPerMile), {
        shouldDirty: true,
      });
      setValue(`assignmentSplits.${splitIndex}.payGuaranteedHours`, getValueAsFloat(initialSplit?.payGuaranteedHours), {
        shouldDirty: true,
      });
      setValue(`assignmentSplits.${splitIndex}.payPreceptor`, getValueAsFloat(initialSplit?.payPreceptor), {
        shouldDirty: true,
      });
      setValue(`assignmentSplits.${splitIndex}.additionalPremiumPay`, additionalPremiumPayOptions[0], {
        shouldDirty: true,
      });
      debouncedTriggerPeopleSoftCalculation();
      setRefreshIsInProgress(false);
      isContainerRefreshed.current = true
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setValue, debouncedTriggerPeopleSoftCalculation, setRefreshIsInProgress, splitIndex],
  );

  useEffect(() => {
    if (isRefreshIsInProgress && initialScenarioResponse) {
      const initialSplit = findInitialSplitValueBySplitId(initialScenarioResponse, field?.splitId);
      if (initialSplit) handleFieldUpdatesAfterRefresh(initialSplit);
      //setRefreshIsInProgress(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialScenarioResponse, isRefreshIsInProgress, splitIndex]);

  return (
    <MarginToolCard
      id="benefits-card-marginToolDetailsPage"
      title={<MarginToolCardTitle title={t('marginTool.components.assignment.payRate.title')} />}
      showRefreshButton={!isRefreshIsInProgress}
      icon={<CircularProgress size={16} color="inherit" />}
      isCustomIcon={isRefreshIsInProgress}
      onRefresh={() => {
        initiateRefreshCall();
        setRefreshIsInProgress(true);
      }}
      customBackGroundColor={theme.palette.framework.system.white}
      children={
        <>
          <Grid item container spacing={2} sx={{ p: 2, pb: 0 }}>
            <Grid item xs={3}>
              <MarginToolCurrencyField
                id="marginTool-payRate-currencyField"
                name={`assignmentSplits.${splitIndex}.payRate`}
                label={t('marginTool.components.assignment.payRate.title')}
                tooltip={{ disabled: true }}
                defaultValue={getValueAsFloat(splitData?.payRate)}
                disabled={!isScenarioStatusPending}
                helperText={getPayRateHelperText(splitData, splitIndex, t)}
                triggerMarginToolFormUpdates={() => triggerPeopleSoftCalculation()}
                onChange={e => handlePayChargeUpdate(e)}
              />
            </Grid>
          </Grid>

          <Grid item sx={{ p: 2 }}>
            <Divider />
          </Grid>

          <Grid item container spacing={2} sx={{ pl: 2, pr: 2 }}>
            <Grid item xs={3}>
              <MarginToolTextField
                id="marginTool-payRate-overtimeFactor-textField"
                name={`assignmentSplits.${splitIndex}.payOvertimeFactor`}
                disabled={!isScenarioStatusPending}
                label={t('marginTool.labels.overtimeFactor')}
                startAdornmentValue={t('marginTool.labels.crossSymbol')}
                maxNumbersAllowed={3}
                isDecimalNumber={true}
                defaultValue={getValueAsFloat(splitData?.payOvertimeFactor)}
                helperText={getHelperAmount(PayRateFieldNames.overtimeFactor, overtimeFactorValue, payRateValue, t)}
              />
            </Grid>
            <Grid item xs={3}>
              <MarginToolTextField
                id="marginTool-payRate-callBackFactor-textField"
                name={`assignmentSplits.${splitIndex}.payCallBackFactor`}
                disabled={!isScenarioStatusPending}
                label={t('marginTool.labels.callBackFactor')}
                startAdornmentValue={t('marginTool.labels.crossSymbol')}
                maxNumbersAllowed={3}
                isDecimalNumber={true}
                defaultValue={getValueAsFloat(splitData?.payCallBackFactor)}
                helperText={helperTextWithInfoIcon(
                  PayRateFieldNames.callBackFactor,
                  callBackFactorValue,
                  payRateValue,
                  t,
                )}
              />
            </Grid>
            <Grid item xs={3}>
              <MarginToolTextField
                id="marginTool-payRate-holidayFactor-textField"
                name={`assignmentSplits.${splitIndex}.payHolidayFactor`}
                disabled={!isScenarioStatusPending}
                label={t('marginTool.labels.holidayFactor')}
                startAdornmentValue={t('marginTool.labels.crossSymbol')}
                maxNumbersAllowed={3}
                isDecimalNumber={true}
                defaultValue={getValueAsFloat(splitData?.payHolidayFactor)}
                helperText={helperTextWithInfoIcon(
                  PayRateFieldNames.holidayFactor,
                  holidayFactorValue,
                  payRateValue,
                  t,
                )}
              />
            </Grid>
            <Grid item xs={3}>
              <MarginToolTextField
                id="marginTool-payRate-doubleTimeFactor-textField"
                name={`assignmentSplits.${splitIndex}.payDoubletimeFactor`}
                disabled={!isScenarioStatusPending}
                label={t('marginTool.labels.doubleTimeFactor')}
                startAdornmentValue={t('marginTool.labels.crossSymbol')}
                maxNumbersAllowed={3}
                isDecimalNumber={true}
                defaultValue={getValueAsFloat(splitData?.payDoubletimeFactor)}
                helperText={getHelperAmount(PayRateFieldNames.doubleTimeFactor, doubleTimeFactorValue, payRateValue, t)}
              />
            </Grid>
          </Grid>

          <Grid item sx={{ p: 2 }}>
            <Divider />
          </Grid>

          <Grid item container spacing={2} sx={{ pl: 2, pr: 2 }}>
            <Grid item xs={3}>
              <MarginToolCurrencyField
                id="marginTool-payRate-onCallRate-currencyField"
                name={`assignmentSplits.${splitIndex}.payOnCallRate`}
                disabled={!isScenarioStatusPending}
                label={t('marginTool.labels.onCallRate')}
                tooltip={{ disabled: true }}
                defaultValue={getValueAsFloat(splitData?.payOnCallRate)}
              />
            </Grid>
            <Grid item xs={3}>
              <MarginToolCurrencyField
                id="marginTool-payRate-charge-currencyField"
                name={`assignmentSplits.${splitIndex}.payCharge`}
                disabled={!isScenarioStatusPending}
                label={t('marginTool.labels.charge')}
                tooltip={{ disabled: true }}
                defaultValue={getValueAsFloat(splitData?.payCharge)}
                helperText={getPayChargeHelperText(
                  isContainerRefreshed.current
                    ? findInitialSplitValueBySplitId(initialScenarioResponse, field?.splitId)
                    : field,
                )}
              />
            </Grid>
            <Grid item xs={3}>
              <MarginToolTextField
                id="marginTool-payRate-amountPerMile-currencyField"
                label={t('marginTool.labels.amountPerMile')}
                name={`assignmentSplits.${splitIndex}.payAmountPerMile`}
                disabled={!isScenarioStatusPending}
                maxNumbersAllowed={3}
                maxDecimals={3}
                startAdornmentValue={t('currency.dollar')}
                defaultValue={getValueAsFloat(splitData?.payAmountPerMile)}
                isDecimalNumber={true}
              />
            </Grid>
            <Grid item xs={3}>
              <MarginToolTextField
                id="marginTool-payRate-guaranteedHours-textField"
                name={`assignmentSplits.${splitIndex}.payGuaranteedHours`}
                disabled={!isScenarioStatusPending}
                label={t('marginTool.labels.guaranteedHours')}
                endAdornmentValue={t('marginTool.labels.hours')}
                maxNumbersAllowed={2}
                isDecimalNumber={true}
                defaultValue={getValueAsFloat(splitData?.payGuaranteedHours)}
              />
            </Grid>
          </Grid>

          <Grid item container spacing={2} sx={{ p: 2 }}>
            <Grid item xs={3}>
              <MarginToolCurrencyField
                id="marginTool-payRate-preceptor-currencyField"
                name={`assignmentSplits.${splitIndex}.payPreceptor`}
                disabled={!isScenarioStatusPending}
                label={t('marginTool.labels.preceptor')}
                tooltip={{ disabled: true }}
                defaultValue={getValueAsFloat(splitData?.payPreceptor)}
              />
            </Grid>
            <Grid item xs={3}>
              <CustomTooltip
                tooltipContent={isFieldDisabledInPendingStageForUserRoles ? getStatusUpdateButtonDisabledTooltip() : ''}
              >
                <ControlledTypeAhead
                  id="marginTool-payRate-additionalPremiumPay-dropdown"
                  name={`assignmentSplits.${splitIndex}.additionalPremiumPay`}
                  label={t('marginTool.labels.additionalPremiumPay')}
                  register={register}
                  control={control}
                  options={additionalPremiumPayOptions || []}
                  showDropdownIcon={true}
                  mandatory={false}
                  filledNormal={false}
                  disabled={!isScenarioStatusPending || isFieldDisabledInPendingStageForUserRoles}
                  defaultValue={additionalPremiumPayValue}
                  customScroll={true}
                  onChange={e => handleAdditionalPremiumPayChange(e)}
                  helperText={
                    additionalPremiumPayValue?.object?.description !== 'None'
                      ? getHelperAmount(PayRateFieldNames.additionalPremiumPay, additionalPremiumPay, payRateValue, t)
                      : undefined
                  }
                />
              </CustomTooltip>
            </Grid>
          </Grid>
        </>
      }
    />
  );
};
