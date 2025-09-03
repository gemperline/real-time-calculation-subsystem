import { Box, Button, CircularProgress } from 'amn-ui-core';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectCancelTriggeredStatus,
  selectOrderIdModifiedConfirmationStatus,
  selectSaveTriggeredStatus,
  selectSelectedScenario,
} from 'store/redux-store/margin-tool/slices/add-edit-scenario/add-edit-scenario.selector';
import { useMarginToolFooterStyles } from './MarginToolFooter.Styles';
import { convertToPercentage } from '../PayPackage/helper';
import { PayPackageStatus } from 'store/redux-store/margin-tool/slices/pay-package-status/pay-package-status.model';
import { scenarioActions } from 'store/redux-store/margin-tool/slices/add-edit-scenario/add-edit-scenario.redux';
import { useFormContext } from 'react-hook-form';
import { usePromiseTracker } from 'react-promise-tracker';
import { PromiseTrackerKeys } from 'app/constants/PromiseTrackerKeys';
import MarginToolConfirmationModal from './MarginToolConfirmationModal';
import { selectTimeOffGridError } from 'store/redux-store/margin-tool/slices/assignment/assignment.selector';
import { globalActions } from 'app/ApplicationRoot/Global.redux';
import { IPayPackageCategory } from '@AMIEWEB/MarginTool/enum';
import { useFilterPayPackageValuesByCategoryId } from '../Assignments/helper';
import { getBonuses } from '../Assignments/Bonuses/helper';
import { getReimbursement } from '../Assignments/Reimbursement/helper';
import { cloneDeep } from 'lodash';
import { assignmentActions } from 'store/redux-store/margin-tool/slices/assignment/assignment.redux';

const MarginToolFooter = ({ initialMarginToolValues }) => {
  const { t } = useTranslation();
  const selectedScenario = useSelector(selectSelectedScenario);
  const { classes } = useMarginToolFooterStyles();
  const isSaveTriggered = useSelector(selectSaveTriggeredStatus);
  const isCancelTriggered = useSelector(selectCancelTriggeredStatus);
  const reimbursementPayPackageValues = useFilterPayPackageValuesByCategoryId(IPayPackageCategory.Reimbursements);
  const bonusesPayPackageValues = useFilterPayPackageValuesByCategoryId(IPayPackageCategory.BonusType);
  const orderIdModifiedConfirmationStatus = useSelector(selectOrderIdModifiedConfirmationStatus);

  const { promiseInProgress: flagVariationInProgress } = usePromiseTracker({
    area: PromiseTrackerKeys.marginTool.peopleSoftCallMarginTool,
    delay: 0,
  });
  const { promiseInProgress: isSavingScenario } = usePromiseTracker({
    area: PromiseTrackerKeys.marginTool.saveScenario,
    delay: 0,
  });
  const { promiseInProgress: isLoadDataScenario } = usePromiseTracker({
    area: PromiseTrackerKeys.marginTool.scenarioNavigationData,
    delay: 0,
  });

  const { promiseInProgress: isScenarioVerification } = usePromiseTracker({
    area: PromiseTrackerKeys.marginTool.validateScenario,
    delay: 0,
  });

  const editTimeOffGridError = useSelector(selectTimeOffGridError);

  const [cancelModal, setCancelModalModal] = useState<boolean>(false);
  const dispatch = useDispatch();
  const {
    watch,
    reset,
    formState: { isDirty, errors },
  } = useFormContext();
  const hasErrors = Object.keys(errors).length > 0;
  const handleCancelButton = () => {
    setCancelModalModal(true);
  };
  const handleCancelModalClose = () => {
    setCancelModalModal(false);
    dispatch(scenarioActions.setCancelTriggeredStatus(false));
  };
  const handleCancelModalYes = () => {
    const savedReimbursements = getReimbursement(reimbursementPayPackageValues);
    const bonuses = getBonuses(bonusesPayPackageValues);
    const newFormData = {
      payPackage: {
        placementId: selectedScenario?.placementId,
      },
      assignmentSplits: cloneDeep(selectedScenario?.splits) || [],
      assignment: {
        travel: selectedScenario?.assignment?.travel,
        timeOffs: selectedScenario?.assignment?.timeOffs,
        reimbursementFieldArray: cloneDeep(savedReimbursements) ?? [],
        bonusesFieldArray: cloneDeep(bonuses) ?? [],
      },
    };
    reset(newFormData);
    setCancelModalModal(false);
    dispatch(scenarioActions.setCancelTriggeredStatus(false));
    dispatch(scenarioActions.setScenarioCreateUpdateResponse(null));
    dispatch(globalActions.closeBanner());
    const formData = watch();
    dispatch(
      assignmentActions.triggerPeopleSoftCalculation({
        formData,
        isDataUpdateFlow: false,
      }),
    );
  };
  const handleSaveButton = () => {
    const formData = watch();
    dispatch(
      scenarioActions.postMarginToolDetails({
        formData,
        loadDetails: true,
      }),
    );
  };

  const isPendingAndDirty =
    selectedScenario?.scenarioStatusId === PayPackageStatus.Pending && isDirty && !editTimeOffGridError;

  return (
    <>
      <Box className={classes.marginToolFooter}>
        <Box className={classes.marginToolFooterGrossMargin}>
          {t('marginTool.components.footer')}
          {flagVariationInProgress || isScenarioVerification ? (
            <Box ml={0.5}>
              <CircularProgress size={16} color="inherit" />
            </Box>
          ) : (
            ` ${convertToPercentage(selectedScenario?.grossMargin)}`
          )}
        </Box>
        <Box style={{ display: 'flex', gap: '16px' }}>
          <Button
            variant="contained"
            color="tertiary"
            className={classes.marginToolFooterButton}
            onClick={handleCancelButton}
            onMouseDown={() => {
              if (!isCancelTriggered) {
                if (orderIdModifiedConfirmationStatus) {
                  dispatch(scenarioActions.setShowOrderIdModifiedDialogStatus(true));
                } else {
                  dispatch(scenarioActions.setSaveTriggeredStatus(false));
                  dispatch(scenarioActions.setCancelTriggeredStatus(true)); // Set Save intent
                }
              }
            }}
            disabled={
              !isPendingAndDirty ||
              isSavingScenario ||
              flagVariationInProgress ||
              isLoadDataScenario ||
              isScenarioVerification
            }
          >
            {t('marginTool.buttons.cancel')}
          </Button>
          <Button
            disabled={
              !isPendingAndDirty ||
              isSavingScenario ||
              flagVariationInProgress ||
              isLoadDataScenario ||
              hasErrors ||
              isScenarioVerification
            }
            variant="contained"
            color={'primary'}
            type="submit"
            className={classes.marginToolFooterButton}
            onMouseDown={() => {
              if (!isSaveTriggered) {
                if (orderIdModifiedConfirmationStatus) {
                  dispatch(scenarioActions.setShowOrderIdModifiedDialogStatus(true));
                } else {
                  dispatch(scenarioActions.setCancelTriggeredStatus(false));
                  dispatch(scenarioActions.setSaveTriggeredStatus(true)); // Set Save intent
                }
              }
            }}
            onClick={handleSaveButton}
          >
            {t('marginTool.buttons.save')}
            {(isSavingScenario || flagVariationInProgress || isLoadDataScenario || isScenarioVerification) && (
              <Box position={'absolute'} right={8} top={11}>
                <CircularProgress size={16} color="inherit" />
              </Box>
            )}
          </Button>
        </Box>
      </Box>
      <MarginToolConfirmationModal
        open={cancelModal}
        onClose={handleCancelModalClose}
        onConfirm={handleCancelModalYes}
      />
    </>
  );
};

export default MarginToolFooter;
