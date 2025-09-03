import MarginToolCard from '@AMIEWEB/MarginTool/Common/MarginToolCard';
import React, { useCallback, useEffect, useState } from 'react';
import { MarginToolCardTitle } from '../../../Common/MarginToolCardTitle';
import { CircularProgress, Divider, Grid, useTheme } from 'amn-ui-core';
import { useTranslation } from 'react-i18next';
import { MarginToolCurrencyField } from '@AMIEWEB/MarginTool/Common/MarginToolCurrencyField';
import { MarginToolTextArea } from '@AMIEWEB/MarginTool/Common/MarginToolTextArea';
import { useFormContext } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { selectSelectedScenario } from 'store/redux-store/margin-tool/slices/add-edit-scenario/add-edit-scenario.selector';
import { PayPackageStatus } from 'store/redux-store/margin-tool/slices/pay-package-status/pay-package-status.model';
import { getValueAsFloat } from '../BillRates/helper';
import { CustomTooltip } from '@AMIEWEB/Common';
import { getStatusUpdateButtonDisabledTooltip } from '../../PayPackage/PayPackageHelper';
import { useIsFieldDisabledInPendingStage } from '../../PayPackage/AddScenario/helper';
import { MarginDetailsResponseScenarioSplitItem } from 'store/redux-store/margin-tool/slices/add-edit-scenario/add-edit-scenario.model';
import { usePeopleSoftCalculation } from '../../PeopleSoftCalculation/IPeopleSoftCalculationHelper';
import { useDebouncedTriggerCalculation, useInitialMarginDetails } from '@AMIEWEB/MarginTool/hooks';
import { selectInitialScenarioMarginDetailsResponse } from 'store/redux-store/margin-tool/slices/assignment/assignment.selector';
import { findInitialSplitValueBySplitId } from '@AMIEWEB/MarginTool/helper';
import { nonTLAHelperText } from '../AllowancesPerDiems/helper';

export const AdditionalCosts = ({
  splitIndex,
  field,
}: {
  splitIndex: number;
  field: MarginDetailsResponseScenarioSplitItem;
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { setValue, errors, setError, clearErrors, watch } = useFormContext();
  const { triggerPeopleSoftCalculation } = usePeopleSoftCalculation();
  const { debouncedTriggerPeopleSoftCalculation } = useDebouncedTriggerCalculation();
  const scenario = useSelector(selectSelectedScenario);
  const isFieldDisabledInPendingStageForUserRoles = useIsFieldDisabledInPendingStage();
  const isScenarioStatusPending = scenario?.scenarioStatusId === PayPackageStatus.Pending;
  const splitData = scenario?.splits[splitIndex];
  const miscellaneousDescriptionError = errors?.assignmentSplits?.[splitIndex]?.miscellaneousDescription;
  const isAdditionalCostsDisabled = !isScenarioStatusPending || isFieldDisabledInPendingStageForUserRoles;
  const { initiateRefreshCall } = useInitialMarginDetails();
  const [isRefreshInProgress, setIsRefreshInProgress] = useState<boolean>(false);
  const initialScenarioResponse = useSelector(selectInitialScenarioMarginDetailsResponse);
  const cfSupervisorCosts = watch(`assignmentSplits.${splitIndex}.cfSupervisorCosts`);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e?.target?.value?.length >= 1000) {
      setValue(`assignmentSplits.${splitIndex}.miscellaneousDescription`, e?.target?.value.substring(0, 1000));
      setError(`assignmentSplits.${splitIndex}.miscellaneousDescription`, {
        message: t('marginTool.labels.maxLimitReachedTextArea'),
      });
    } else {
      setValue(`assignmentSplits.${splitIndex}.miscellaneousDescription`, e?.target?.value);
      clearErrors(`assignmentSplits.${splitIndex}.miscellaneousDescription`);
    }
  };

  const handleFieldUpdatesAfterRefresh = useCallback(
    (initialSplit: MarginDetailsResponseScenarioSplitItem) => {
      setValue(`assignmentSplits.${splitIndex}.cfSupervisorCosts`, getValueAsFloat(initialSplit?.csfSupervisorCosts), {
        shouldDirty: true,
      });
      setValue(
        `assignmentSplits.${splitIndex}.miscellaneousAmount`,
        getValueAsFloat(initialSplit?.additionalCostMiscellaneousAmount),
        { shouldDirty: true },
      );
      setValue(
        `assignmentSplits.${splitIndex}.miscellaneousDescription`,
        initialSplit?.additionalCostMiscellaneousDescription ?? '',
        { shouldDirty: true },
      );

      debouncedTriggerPeopleSoftCalculation();
      setIsRefreshInProgress(false);
    },
    [setValue, debouncedTriggerPeopleSoftCalculation, splitIndex, setIsRefreshInProgress],
  );

  useEffect(() => {
    if (isRefreshInProgress && initialScenarioResponse && !isAdditionalCostsDisabled) {
      const initialSplit = findInitialSplitValueBySplitId(initialScenarioResponse, field?.splitId);
      if (initialSplit) handleFieldUpdatesAfterRefresh(initialSplit);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialScenarioResponse, isRefreshInProgress, splitIndex]);

  return (
    <MarginToolCard
      id="marginToool-additionalCost"
      title={<MarginToolCardTitle title={t('marginTool.components.assignment.additionalCosts.title')} />}
      showRefreshButton={!isRefreshInProgress}
      icon={<CircularProgress size={16} color="inherit" />}
      isCustomIcon={isRefreshInProgress}
      onRefresh={() => {
        if (!isAdditionalCostsDisabled) {
          initiateRefreshCall();
          setIsRefreshInProgress(true);
        }
      }}
      customBackGroundColor={theme.palette.framework.system.white}
      children={
        <Grid sx={{ p: 2 }}>
          <Grid container item direction="row" spacing={4}>
            <Grid item xs={4}>
              <CustomTooltip
                tooltipContent={isFieldDisabledInPendingStageForUserRoles ? getStatusUpdateButtonDisabledTooltip() : ''}
              >
                <MarginToolCurrencyField
                  id="marginTool-additionalCost-cfsupervisorCosts-currencyField"
                  label={t('marginTool.labels.cfSupervisorCosts')}
                  name={`assignmentSplits.${splitIndex}.cfSupervisorCosts`}
                  disabled={isAdditionalCostsDisabled}
                  defaultValue={getValueAsFloat(splitData?.csfSupervisorCosts)}
                  tooltip={{ disabled: true }}
                  endAdornmentValue={t('marginTool.labels.perDay')}
                  helperText={nonTLAHelperText(cfSupervisorCosts, t)}
                  triggerMarginToolFormUpdates={() => triggerPeopleSoftCalculation()}
                />
              </CustomTooltip>
            </Grid>
          </Grid>
          <Grid sx={{ pt: 2 }}>
            <Divider />
          </Grid>
          <Grid container spacing={4} sx={{ pt: 2 }}>
            <Grid item xs={4}>
              <CustomTooltip
                tooltipContent={isFieldDisabledInPendingStageForUserRoles ? getStatusUpdateButtonDisabledTooltip() : ''}
              >
                <MarginToolCurrencyField
                  id="marginTool-additionalCost-miscellaneousAmount-currencyField"
                  label={t('marginTool.labels.miscellaneousAmount')}
                  name={`assignmentSplits.${splitIndex}.miscellaneousAmount`}
                  disabled={isAdditionalCostsDisabled}
                  defaultValue={getValueAsFloat(splitData?.additionalCostMiscellaneousAmount)}
                  tooltip={{ disabled: true }}
                  triggerMarginToolFormUpdates={() => triggerPeopleSoftCalculation()}
                />
              </CustomTooltip>
            </Grid>
          </Grid>
          <Grid container spacing={4} sx={{ pt: 2 }}>
            <Grid item xs={12}>
              <CustomTooltip
                tooltipContent={isFieldDisabledInPendingStageForUserRoles ? getStatusUpdateButtonDisabledTooltip() : ''}
                placement={'bottom-start'}
              >
                <MarginToolTextArea
                  id="marginTool-additionalCost-miscellaneousDescription-textField"
                  label={t('marginTool.labels.miscellaneousDescription')}
                  name={`assignmentSplits.${splitIndex}.miscellaneousDescription`}
                  disabled={isAdditionalCostsDisabled}
                  error={!!miscellaneousDescriptionError}
                  helperText={miscellaneousDescriptionError ? miscellaneousDescriptionError?.message : undefined}
                  defaultValue={field?.additionalCostMiscellaneousDescription}
                  handleChange={(event: React.ChangeEvent<HTMLInputElement>) => handleTextChange(event)}
                  inputProps={{ maxLength: 1000 }}
                />
              </CustomTooltip>
            </Grid>
          </Grid>
        </Grid>
      }
    />
  );
};
