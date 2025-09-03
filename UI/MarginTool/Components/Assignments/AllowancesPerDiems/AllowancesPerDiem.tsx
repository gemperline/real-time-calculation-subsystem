import MarginToolCard from '@AMIEWEB/MarginTool/Common/MarginToolCard';
import { CircularProgress, Grid, useTheme } from 'amn-ui-core';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MarginToolCardTitle } from '../../../Common/MarginToolCardTitle';
import { MarginToolCurrencyField } from '@AMIEWEB/MarginTool/Common/MarginToolCurrencyField';
import { MarginDetailsResponseScenarioSplitItem } from 'store/redux-store/margin-tool/slices/add-edit-scenario/add-edit-scenario.model';
import { useFormContext } from 'react-hook-form';
import {
  //handleAllowancesFieldUpdatesAfterRefresh,
  nonTLAHelperText,
  showTooltipForNonTLA,
  showTooltipForTLA,
  tlaHelperText,
} from './helper';
import { findInitialSplitValueBySplitId, useIsTLA, useScenarioStatusPending } from '@AMIEWEB/MarginTool/helper';
import { formatDollarValues } from 'app/helpers/numberHelper';
import { useSelector } from 'react-redux';
import { usePeopleSoftCalculation } from '../../PeopleSoftCalculation/IPeopleSoftCalculationHelper';
import { useDebouncedTriggerCalculation, useInitialMarginDetails } from '@AMIEWEB/MarginTool/hooks';
import { selectInitialScenarioMarginDetailsResponse } from 'store/redux-store/margin-tool/slices/assignment/assignment.selector';
import { GSAContainer } from './GSAContainer';
import { getValueAsFloat } from '../BillRates/helper';

export const AllowancesPerDiem = ({
  splitIndex,
  field,
}: {
  splitIndex: number;
  field: MarginDetailsResponseScenarioSplitItem;
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { watch, setValue } = useFormContext();
  const { triggerPeopleSoftCalculation } = usePeopleSoftCalculation();
  const { debouncedTriggerPeopleSoftCalculation } = useDebouncedTriggerCalculation();
  const isScenarioStatusPending = useScenarioStatusPending();
  const isTLASelected = useIsTLA();
  const mealPerDiem = watch(`assignmentSplits.${splitIndex}.mealPerDiem`);
  const lodgingPerDiem = watch(`assignmentSplits.${splitIndex}.lodgingPerDiem`);
  const cellPhoneStipend = watch(`assignmentSplits.${splitIndex}.cellPhoneStipend`);
  const tlaCarAllowance = watch(`assignmentSplits.${splitIndex}.tlaCarAllowance`);
  const tlaMealAllowance = watch(`assignmentSplits.${splitIndex}.tlaMealAllowance`);
  const tlaCellPhoneStipend = watch(`assignmentSplits.${splitIndex}.tlaCellPhoneStipend`);
  const tlaShiftCompletionBonus = watch(`assignmentSplits.${splitIndex}.tlaShiftCompletionBonus`);
  const isNonTlaFieldsDisabled = !isScenarioStatusPending || isTLASelected;
  const isTLAFieldsDisabled = !isScenarioStatusPending || !isTLASelected;
  const { initiateRefreshCall } = useInitialMarginDetails();
  const [isRefreshInProgress, setIsRefreshInProgress] = useState<boolean>(false);
  const initialScenarioResponse = useSelector(selectInitialScenarioMarginDetailsResponse);
  const housingType = watch(`assignmentSplits.${splitIndex}.housingType`);
  const isHousingTypeNoHousing = housingType?.object?.description === 'No Housing';

  const handleAllowancesFieldUpdatesAfterRefresh = useCallback(
    (initialSplit: MarginDetailsResponseScenarioSplitItem) => {
      if (isTLASelected) {
        setValue(`assignmentSplits.${splitIndex}.mealPerDiem`, '', {
          shouldDirty: true,
        });
        setValue(`assignmentSplits.${splitIndex}.lodgingPerDiem`, '', {
          shouldDirty: true,
        });
        setValue(`assignmentSplits.${splitIndex}.cellPhoneStipend`, '', {
          shouldDirty: true,
        });
      } else {
        setValue(`assignmentSplits.${splitIndex}.mealPerDiem`, getValueAsFloat(initialSplit?.mealPerDiem), {
          shouldDirty: true,
        });
        setValue(`assignmentSplits.${splitIndex}.lodgingPerDiem`, getValueAsFloat(initialSplit?.lodgingPerDiem), {
          shouldDirty: true,
        });
        setValue(`assignmentSplits.${splitIndex}.cellPhoneStipend`, getValueAsFloat(initialSplit?.cellPhoneStipend), {
          shouldDirty: true,
        });
      }

      if (isTLASelected) {
        setValue(`assignmentSplits.${splitIndex}.tlaCarAllowance`, getValueAsFloat(initialSplit?.tlaCarAllowance), {
          shouldDirty: true,
        });
        setValue(`assignmentSplits.${splitIndex}.tlaMealAllowance`, getValueAsFloat(initialSplit?.tlaMealAllowance), {
          shouldDirty: true,
        });
        setValue(
          `assignmentSplits.${splitIndex}.tlaShiftCompletionBonus`,
          getValueAsFloat(initialSplit?.tlaShiftCompletionBonus),
          {
            shouldDirty: true,
          },
        );
        setValue(
          `assignmentSplits.${splitIndex}.tlaCellPhoneStipend`,
          getValueAsFloat(initialSplit?.tlaCellPhoneStipend),
          {
            shouldDirty: true,
          },
        );
      } else {
        setValue(`assignmentSplits.${splitIndex}.tlaCarAllowance`, '', {
          shouldDirty: true,
        });
        setValue(`assignmentSplits.${splitIndex}.tlaMealAllowance`, '', {
          shouldDirty: true,
        });
        setValue(`assignmentSplits.${splitIndex}.tlaShiftCompletionBonus`, '', {
          shouldDirty: true,
        });
        setValue(`assignmentSplits.${splitIndex}.tlaCellPhoneStipend`, '', {
          shouldDirty: true,
        });
      }

      if(!isHousingTypeNoHousing) {
        setValue(`assignmentSplits.${splitIndex}.lodgingPerDiem`, '', {
          shouldDirty: true,
        });
      }

      debouncedTriggerPeopleSoftCalculation();
      setIsRefreshInProgress(false);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      setValue,
      getValueAsFloat,
      splitIndex,
      isTLASelected,
      debouncedTriggerPeopleSoftCalculation,
      setIsRefreshInProgress,
    ],
  );

  useEffect(() => {
    if (isRefreshInProgress && initialScenarioResponse) {
      const initialSplit = findInitialSplitValueBySplitId(initialScenarioResponse, field?.splitId);
      if (initialSplit) {
        handleAllowancesFieldUpdatesAfterRefresh(initialSplit);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialScenarioResponse, isRefreshInProgress, splitIndex]);

  return (
    <MarginToolCard
      id="allowances-per-diem-stipends-card-marginToolDetailsPage"
      title={<MarginToolCardTitle title={t('marginTool.components.assignment.allowancesPerDiemStipend.title')} />}
      showRefreshButton={!isRefreshInProgress}
      icon={<CircularProgress size={16} color="inherit" />}
      isCustomIcon={isRefreshInProgress}
      onRefresh={() => {
        initiateRefreshCall();
        setIsRefreshInProgress(true);
      }}
      customBackGroundColor={theme.palette.framework.system.white}
      children={
        <>
          <Grid container p="12px" rowGap={2}>
            <>
              <Grid container item columnGap={2}>
                <Grid item xs={2.8}>
                  <MarginToolCurrencyField
                    id="meal-per-diem-marginTool-currencyField"
                    label={t('marginTool.components.assignment.allowancesPerDiemStipend.mealPerDiem')}
                    name={`assignmentSplits.${splitIndex}.mealPerDiem`}
                    disabled={isNonTlaFieldsDisabled}
                    defaultValue={!isTLASelected ? formatDollarValues(field?.mealPerDiem) : ''}
                    tooltip={showTooltipForNonTLA(isScenarioStatusPending, isTLASelected, t)}
                    placeholder={t('marginTool.components.assignment.allowancesPerDiemStipend.mealPerDiem')}
                    endAdornmentValue={t('marginTool.labels.perDay')}
                    helperText={!isTLASelected ? nonTLAHelperText(mealPerDiem, t) : ''}
                    triggerMarginToolFormUpdates={() => triggerPeopleSoftCalculation()}
                  />
                </Grid>
                <Grid item xs={2.8}>
                  <MarginToolCurrencyField
                    id="lodging-per-diem-marginTool-currencyField"
                    label={t('marginTool.components.assignment.allowancesPerDiemStipend.lodgingPerDiem')}
                    name={`assignmentSplits.${splitIndex}.lodgingPerDiem`}
                    disabled={isNonTlaFieldsDisabled || !isHousingTypeNoHousing}
                    defaultValue={
                      isHousingTypeNoHousing && !isTLASelected ? !isTLASelected ? formatDollarValues(field?.lodgingPerDiem) : '' : null
                    }
                    tooltip={
                      !isHousingTypeNoHousing && !isTLASelected
                        ? {
                            disabled: isHousingTypeNoHousing,
                            tooltipText: t('marginTool.labels.disabledDueToHousing'),
                          }
                        : showTooltipForNonTLA(isScenarioStatusPending, isTLASelected, t)
                    }
                    placeholder={t('marginTool.components.assignment.allowancesPerDiemStipend.lodgingPerDiem')}
                    endAdornmentValue={t('marginTool.labels.perDay')}
                    helperText={
                      isHousingTypeNoHousing ? !isTLASelected && nonTLAHelperText(lodgingPerDiem, t) : undefined
                    }
                    triggerMarginToolFormUpdates={() => triggerPeopleSoftCalculation()}
                  />
                </Grid>
                <Grid item xs={2.8}>
                  <MarginToolCurrencyField
                    id="cell-phon-stipend-marginTool-currencyField"
                    label={t('marginTool.components.assignment.allowancesPerDiemStipend.cellPhoneStipend')}
                    name={`assignmentSplits.${splitIndex}.cellPhoneStipend`}
                    disabled={true}
                    defaultValue={!isTLASelected ? formatDollarValues(field?.cellPhoneStipend) : ''}
                    tooltip={{
                      disabled: !isScenarioStatusPending,
                      tooltipText: isTLASelected ? t('marginTool.labels.disabledDueToTLA') : t('alerts.cannotEdit'),
                    }}
                    placeholder={t('marginTool.components.assignment.allowancesPerDiemStipend.cellPhoneStipend')}
                    endAdornmentValue={t('marginTool.labels.perDay')}
                    helperText={!isTLASelected ? nonTLAHelperText(cellPhoneStipend, t) : ''}
                    triggerMarginToolFormUpdates={() => triggerPeopleSoftCalculation()}
                  />
                </Grid>
              </Grid>
              <Grid container item columnGap={2} id="tla-allowances-section">
                <Grid item xs={2.8}>
                  <MarginToolCurrencyField
                    id="tla-car-allowance-marginTool-currencyField"
                    label={t('marginTool.components.assignment.allowancesPerDiemStipend.tlaCarAllowance')}
                    name={`assignmentSplits.${splitIndex}.tlaCarAllowance`}
                    disabled={isTLAFieldsDisabled}
                    defaultValue={isTLASelected ? formatDollarValues(field?.tlaCarAllowance) : ''}
                    tooltip={showTooltipForTLA(isScenarioStatusPending, isTLASelected, t)}
                    placeholder={t('marginTool.components.assignment.allowancesPerDiemStipend.tlaCarAllowance')}
                    endAdornmentValue={t('marginTool.labels.perShift')}
                    helperText={
                      isTLASelected ? tlaHelperText(tlaCarAllowance, field?.hoursPerShift, field?.hoursPerWeek, t) : ''
                    }
                    triggerMarginToolFormUpdates={() => triggerPeopleSoftCalculation()}
                  />
                </Grid>
                <Grid item xs={2.8}>
                  <MarginToolCurrencyField
                    id="tla-meal-allowance-marginTool-currencyField"
                    label={t('marginTool.components.assignment.allowancesPerDiemStipend.tLAMealAllowance')}
                    name={`assignmentSplits.${splitIndex}.tlaMealAllowance`}
                    disabled={isTLAFieldsDisabled}
                    defaultValue={isTLASelected ? formatDollarValues(field?.tlaMealAllowance) : ''}
                    tooltip={showTooltipForTLA(isScenarioStatusPending, isTLASelected, t)}
                    placeholder={t('marginTool.components.assignment.allowancesPerDiemStipend.tLAMealAllowance')}
                    endAdornmentValue={t('marginTool.labels.perShift')}
                    helperText={
                      isTLASelected ? tlaHelperText(tlaMealAllowance, field?.hoursPerShift, field?.hoursPerWeek, t) : ''
                    }
                    triggerMarginToolFormUpdates={() => triggerPeopleSoftCalculation()}
                  />
                </Grid>
                <Grid item xs={2.8}>
                  <MarginToolCurrencyField
                    id="tla-shift-completion-bonus-marginTool-currencyField"
                    label={t('marginTool.components.assignment.allowancesPerDiemStipend.tLAShiftCompletionBonus')}
                    name={`assignmentSplits.${splitIndex}.tlaShiftCompletionBonus`}
                    disabled={isTLAFieldsDisabled}
                    defaultValue={isTLASelected ? formatDollarValues(field?.tlaShiftCompletionBonus) : ''}
                    tooltip={showTooltipForTLA(isScenarioStatusPending, isTLASelected, t)}
                    placeholder={t('marginTool.components.assignment.allowancesPerDiemStipend.tLAShiftCompletionBonus')}
                    helperText={
                      isTLASelected
                        ? tlaHelperText(tlaShiftCompletionBonus, field?.hoursPerShift, field?.hoursPerWeek, t)
                        : ''
                    }
                    endAdornmentValue={t('marginTool.labels.perShift')}
                    triggerMarginToolFormUpdates={() => triggerPeopleSoftCalculation()}
                  />
                </Grid>
                <Grid item xs={2.8}>
                  <MarginToolCurrencyField
                    id="tla-cell-phone-stipend-marginTool-currencyField"
                    label={t('marginTool.components.assignment.allowancesPerDiemStipend.tLACellPhoneStipend')}
                    name={`assignmentSplits.${splitIndex}.tlaCellPhoneStipend`}
                    disabled={true}
                    defaultValue={isTLASelected ? formatDollarValues(field?.tlaCellPhoneStipend) : ''}
                    placeholder={t('marginTool.components.assignment.allowancesPerDiemStipend.tLACellPhoneStipend')}
                    endAdornmentValue={t('marginTool.labels.perShift')}
                    helperText={
                      isTLASelected
                        ? tlaHelperText(tlaCellPhoneStipend, field?.hoursPerShift, field?.hoursPerWeek, t)
                        : ''
                    }
                    tooltip={{
                      disabled: !isScenarioStatusPending,
                      tooltipText: isTLASelected
                        ? t('alerts.cannotEdit')
                        : t('marginTool.labels.disabledScenarioNotTLA'),
                    }}
                    triggerMarginToolFormUpdates={() => triggerPeopleSoftCalculation()}
                  />
                </Grid>
              </Grid>
            </>
          </Grid>
          <GSAContainer field={field} />
        </>
      }
    />
  );
};
