import React, { useCallback, useEffect, useState } from 'react';
import MarginToolCard from '../../Common/MarginToolCard';
import { MarginToolCardTitle } from '../../Common/MarginToolCardTitle';
import { CircularProgress, Grid, useTheme } from 'amn-ui-core';
import { useTranslation } from 'react-i18next';
import { ControlledTypeAhead } from '@AMIEWEB/Candidate/CandidateProfile/CandidateTabPanel/PreferencesTab/CustomComponents/ControlledTypeAhead';
import { useFormContext } from 'react-hook-form';
import { MarginToolCheckbox } from '@AMIEWEB/MarginTool/Common/MarginToolCheckbox';
import { useDispatch, useSelector } from 'react-redux';
import { assignmentActions } from 'store/redux-store/margin-tool/slices/assignment/assignment.redux';
import {
  selectInitialScenarioMarginDetailsResponse,
  selectInsuranceStatus,
} from 'store/redux-store/margin-tool/slices/assignment/assignment.selector';
import { BenefitsInsuranceStatus } from '@AMIEWEB/MarginTool/enum';
import { MarginDetailsResponseScenarioSplitItem } from 'store/redux-store/margin-tool/slices/add-edit-scenario/add-edit-scenario.model';
import { selectSelectedScenario } from 'store/redux-store/margin-tool/slices/add-edit-scenario/add-edit-scenario.selector';
import { PayPackageStatus } from 'store/redux-store/margin-tool/slices/pay-package-status/pay-package-status.model';
import { usePeopleSoftCalculation } from '../PeopleSoftCalculation/IPeopleSoftCalculationHelper';
import { useDebouncedTriggerCalculation, useInitialMarginDetails } from '@AMIEWEB/MarginTool/hooks';
import { findInitialSplitValueBySplitId } from '@AMIEWEB/MarginTool/helper';

export interface IInsurance {
  label: string;
  object: {
    id: number;
    description: string;
  };
}
const getDefaultInsurance = (healthInsuranceType: string) => {
  return {
    label: healthInsuranceType ? healthInsuranceType : '',
    object: {
      id:
        healthInsuranceType === BenefitsInsuranceStatus.accepted
          ? BenefitsInsuranceStatus.acceptedId
          : BenefitsInsuranceStatus.declinedId,
      description: healthInsuranceType ?? '',
    },
  };
};

export const Benefits = ({
  splitIndex,
  field,
  sortedAssignmentSplits = [],
}: {
  splitIndex: number;
  field: MarginDetailsResponseScenarioSplitItem;
  sortedAssignmentSplits: MarginDetailsResponseScenarioSplitItem[];
}) => {
  const theme = useTheme();
  const { control, setValue, register, watch } = useFormContext();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { triggerPeopleSoftCalculation } = usePeopleSoftCalculation();
  const selectedScenario = useSelector(selectSelectedScenario);
  const insuranceStatusOptions = useSelector(selectInsuranceStatus);
  const insurance = getDefaultInsurance(field?.healthInsuranceType);
  const selectedInsurance = watch(`assignmentSplits.${splitIndex}.insurance`);
  const initialScenarioResponse = useSelector(selectInitialScenarioMarginDetailsResponse);
  const { initiateRefreshCall } = useInitialMarginDetails();
  const { debouncedTriggerPeopleSoftCalculation } = useDebouncedTriggerCalculation();
  const [isRefreshInProgress, setIsRefreshInProgress] = useState<boolean>(false);

  useEffect(() => {
    dispatch(assignmentActions.getPickListDetails());
  }, []);

  //Method to update the insurance status and waiting period of following splits
  const handleSplitBenefitChange = ({
    value,
    currSelectedInsurance,
    currSplitIndex,
  }: {
    value: boolean;
    currSelectedInsurance: IInsurance;
    currSplitIndex: number;
  }) => {
    if (currSelectedInsurance.object.id === BenefitsInsuranceStatus.acceptedId && sortedAssignmentSplits.length > 1) {
      sortedAssignmentSplits.forEach((_: MarginDetailsResponseScenarioSplitItem, idx: number) => {
        if (idx > currSplitIndex) {
          setValue(`assignmentSplits.${idx}.insurance`, currSelectedInsurance);
          setValue(`assignmentSplits.${idx}.waitingPeriod`, value);
        }
      });
    }
  };

  const handleInsuranceChange = e => {
    setValue(`assignmentSplits.${splitIndex}.insurance`, e);
    triggerPeopleSoftCalculation();
  };

  /**
   * Method to handle field updates after refresh button is clicked
   */

  const handleFieldUpdatesAfterRefresh = useCallback((initialSplit: MarginDetailsResponseScenarioSplitItem) => {
    const defaultInsurance = getDefaultInsurance(initialSplit?.healthInsuranceType);
    setValue(`assignmentSplits.${splitIndex}.insurance`, defaultInsurance, {
      shouldDirty: true,
    });
    setValue(`assignmentSplits.${splitIndex}.waitingPeriod`, initialSplit?.isWaitingPeriodBenefit, {
      shouldDirty: true,
    });
    debouncedTriggerPeopleSoftCalculation();
    setIsRefreshInProgress(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setValue, debouncedTriggerPeopleSoftCalculation, setIsRefreshInProgress]);

  /**
   * useEffect to handle field updates for benefits container after refresh button is clicked
   */
  useEffect(() => {
      if (isRefreshInProgress && initialScenarioResponse) {
        const initialSplit = findInitialSplitValueBySplitId(initialScenarioResponse, field?.splitId);
        if (initialSplit) {
        handleFieldUpdatesAfterRefresh(initialSplit);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialScenarioResponse, isRefreshInProgress, splitIndex]);

  return (
    <MarginToolCard
      id="benefits-card-marginToolDetailsPage"
      title={<MarginToolCardTitle title={t('marginTool.components.assignment.benefits')} />}
      customBackGroundColor={theme.palette.framework.system.white}
      showRefreshButton={!isRefreshInProgress}
      icon={<CircularProgress size={16} color="inherit" />}
      isCustomIcon={isRefreshInProgress}
      onRefresh={() => {
        initiateRefreshCall();
        setIsRefreshInProgress(true);
      }}
      children={
        <Grid container spacing={4} sx={{ p: 2 }}>
            <Grid item xs={4}>
              <ControlledTypeAhead
                name={`assignmentSplits.${splitIndex}.insurance`}
                label={t('marginTool.labels.insurance')}
                register={register}
                onChange={e => handleInsuranceChange(e)}
                defaultValue={insurance}
                disabled={selectedScenario?.scenarioStatusId !== PayPackageStatus.Pending}
                control={control}
                options={insuranceStatusOptions || []}
                customScroll={true}
                id={'marginTool-benefits-insuranceDropdown'}
                showDropdownIcon={true}
              ></ControlledTypeAhead>
            </Grid>
            <Grid item sx={{ alignContent: 'center' }}>
              <MarginToolCheckbox
                name={`assignmentSplits.${splitIndex}.waitingPeriod`}
                id="marginTool-benefits-waitingPeriodCheckbox"
                defaultChecked={field?.isWaitingPeriodBenefit}
                label={t('marginTool.labels.waitingPeriod')}
                disabled={
                  !!(selectedInsurance?.object?.id === BenefitsInsuranceStatus.declinedId) ||
                  selectedScenario?.scenarioStatusId !== PayPackageStatus.Pending
                }
                onHandleChange={(waitingPeriodValue: boolean) => {
                  handleSplitBenefitChange({
                    value: waitingPeriodValue,
                    currSelectedInsurance: selectedInsurance,
                    currSplitIndex: splitIndex,
                  });
                  triggerPeopleSoftCalculation();
                }}
              />
            </Grid>
          </Grid>
      }
    />
  );
};
