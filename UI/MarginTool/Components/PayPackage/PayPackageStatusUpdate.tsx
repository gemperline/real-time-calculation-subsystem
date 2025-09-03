import { GenericDialog } from '@AMIEWEB/Alerts/GenericDialog';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { selectUser } from 'oidc/user.selectors';
import { usePromiseTracker } from 'react-promise-tracker';
import { getScenarioSplits, getStatusIdForUpdate } from './helper';
import { selectPayPackageStatusModalDetails } from 'store/redux-store/margin-tool/slices/pay-package-status/pay-package-status.selector';
import {
  selectBookingPeriod,
  selectSelectedScenario,
} from 'store/redux-store/margin-tool/slices/add-edit-scenario/add-edit-scenario.selector';
import { usePayPackageStatusTransitionStyles } from './PayPackageStatusTransitionModalStyles.styles';
import { payPackageStatusActions } from 'store/redux-store/margin-tool/slices/pay-package-status/pay-package-status.redux';
import {
  IUpdatePayPackageStatusPayload,
  PayPackageStatus,
  StatusTransitionModalType,
} from 'store/redux-store/margin-tool/slices/pay-package-status/pay-package-status.model';
import { formatDateToStartOfDay } from 'app/helpers/dateHelper';
import { useFormContext } from 'react-hook-form';
import { selectTimeOffGridError } from 'store/redux-store/margin-tool/slices/assignment/assignment.selector';
import { scenarioActions } from 'store/redux-store/margin-tool/slices/add-edit-scenario/add-edit-scenario.redux';
import { PostMarginToolResult as IPostMarginToolResult } from './models/AddScenarioModal';
import { PromiseTrackerKeys } from 'app/constants/PromiseTrackerKeys';

const PayPackageStatusUpdate = () => {
  const { openModal, type } = useSelector(selectPayPackageStatusModalDetails);
  const selectedScenario = useSelector(selectSelectedScenario);
  const selectedBookingPeriod = useSelector(selectBookingPeriod);
  const { userInfo } = useSelector(selectUser);
  const editTimeOffGridError = useSelector(selectTimeOffGridError);

  const { promiseInProgress: isSavingScenario } = usePromiseTracker({
    area: PromiseTrackerKeys.marginTool.saveScenario,
    delay: 0,
  });

  const { promiseInProgress: isUpdateScenarioStatus } = usePromiseTracker({
    area: PromiseTrackerKeys.marginTool.updateScenarioStatus,
    delay: 0,
  });

  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { classes } = usePayPackageStatusTransitionStyles({ type: type });
  const { promiseInProgress: updatePayPackageStatusTracker } = usePromiseTracker({
    area: 'get-scenario-navigation-tree-data',
    delay: 0,
  });

  const {
    watch,
    formState: { isDirty },
  } = useFormContext();

  const isPendingAndDirty =
    selectedScenario?.scenarioStatusId === PayPackageStatus.Pending && isDirty && !editTimeOffGridError;

  const handleCancelAction = () => {
    dispatch(
      payPackageStatusActions.setPayPackageStatusTransitionModalDetails({
        openModal: false,
        type: StatusTransitionModalType.None,
      }),
    );
  };

  const handleSaveAction = (sendEmail: boolean) => {
    if (isPendingAndDirty && selectedScenario?.scenarioStatusId === PayPackageStatus.Pending) {
      const formData = watch();
      new Promise((resolve, reject) => {
        dispatch(
          scenarioActions.postMarginToolDetails({
            formData,
            loadDetails: false,
            isApprovalFlow: true,
            resolve,
            reject,
          }),
        );
      }).then((result: IPostMarginToolResult) => {
        const statusUpdatePayload: IUpdatePayPackageStatusPayload = {
          bookingPeriodId: selectedScenario?.bookingPeriodId,
          placementId: selectedScenario?.placementId,
          statusId: getStatusIdForUpdate(type),
          payPackageId: selectedScenario?.scenarioId,
          bookingPeriodStartDate: formatDateToStartOfDay(selectedBookingPeriod?.bookingPeriodStartDate),
          bookingPeriodEndDate: formatDateToStartOfDay(selectedBookingPeriod?.bookingPeriodEndDate),
          scenarioSplitItemList: getScenarioSplits(selectedScenario),
          userId: userInfo?.employeeId,
          timestamp: result.data.payload,
        };

        const updatedScenarioPayload = selectedScenario?.notes
          ? { ...statusUpdatePayload, notes: selectedScenario?.notes }
          : { ...statusUpdatePayload };

        dispatch(
          payPackageStatusActions.updatePayPackageStatus({ ...updatedScenarioPayload, openEmailModal: sendEmail }),
        );
      });
    } else {
      const statusUpdatePayload: IUpdatePayPackageStatusPayload = {
        bookingPeriodId: selectedScenario?.bookingPeriodId,
        placementId: selectedScenario?.placementId,
        statusId: getStatusIdForUpdate(type),
        payPackageId: selectedScenario?.scenarioId,
        bookingPeriodStartDate: formatDateToStartOfDay(selectedBookingPeriod?.bookingPeriodStartDate),
        bookingPeriodEndDate: formatDateToStartOfDay(selectedBookingPeriod?.bookingPeriodEndDate),
        scenarioSplitItemList: getScenarioSplits(selectedScenario),
        userId: userInfo?.employeeId,
        notes: selectedScenario?.notes,
        timestamp: selectedScenario?.timestamp,
      };

      dispatch(payPackageStatusActions.updatePayPackageStatus({ ...statusUpdatePayload, openEmailModal: sendEmail }));
    }
  };

  const getModalTitle = () => {
    switch (type) {
      case StatusTransitionModalType.RequestApproval:
        return t('marginTool.payPackageStatus.modalTitle.requestApproval');
      case StatusTransitionModalType.Approve:
        return t('marginTool.payPackageStatus.modalTitle.approve');
      case StatusTransitionModalType.Verify:
        return t('marginTool.payPackageStatus.modalTitle.verify');
      case StatusTransitionModalType.Reset:
        return t('marginTool.payPackageStatus.modalTitle.reset');
      default:
        return '';
    }
  };

  const getModalDescription = () => {
    switch (type) {
      case StatusTransitionModalType.RequestApproval:
        return t('marginTool.payPackageStatus.modalContent.requestApproval');
      case StatusTransitionModalType.Approve:
        return t('marginTool.payPackageStatus.modalContent.approve');
      case StatusTransitionModalType.Verify:
        return t('marginTool.payPackageStatus.modalContent.verify');
      case StatusTransitionModalType.Reset:
        return t('marginTool.payPackageStatus.modalContent.reset');
      default:
        return '';
    }
  };

  const isLoading = isSavingScenario || isUpdateScenarioStatus || updatePayPackageStatusTracker;

  return (
    <>
      <GenericDialog
        open={openModal}
        maxWidth="sm"
        className={classes.dialog}
        style={{}}
        dialogTitleProps={{ text: getModalTitle() }}
        dialogContentProps={{
          classes: { root: classes.modalDescription },
        }}
        dialogActions={[
          {
            id: 'cancelButtonId',
            text: t('marginTool.payPackageStatus.modalButtons.cancel'),
            onClick: handleCancelAction,
            variant: 'text',
            className: classes.cancelButton,
            disabled: isLoading,
          },
          {
            id: 'saveAndCloseId',
            text: t('marginTool.payPackageStatus.modalButtons.saveClose'),
            onClick: () => {
              handleSaveAction(false);
            },
            variant: 'contained',
            color: 'tertiary',
            hidden: type === StatusTransitionModalType.Verify || type === StatusTransitionModalType.Reset,
            className: classes.containedButton,
            disabled: isLoading,
          },
          {
            id: 'saveAndEmailId',
            text:
              type === StatusTransitionModalType.Verify
                ? t('marginTool.payPackageStatus.modalButtons.verify')
                : type === StatusTransitionModalType.Reset
                ? t('marginTool.payPackageStatus.modalButtons.reset')
                : t('marginTool.payPackageStatus.modalButtons.saveEmail'),
            onClick: () => {
              handleSaveAction(
                type === StatusTransitionModalType.Verify || type === StatusTransitionModalType.Reset ? false : true,
              );
            },
            variant: 'contained',
            className: classes.containedButton,
            disabled: isLoading,
          },
        ]}
      >
        {getModalDescription()}
      </GenericDialog>
    </>
  );
};

export default PayPackageStatusUpdate;
