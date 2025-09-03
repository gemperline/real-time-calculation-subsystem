import React, { useEffect, useState } from 'react';
import { Box, Button, Chip, CircularProgress, Grid, Skeleton } from 'amn-ui-core';
import { useTranslation } from 'react-i18next';
import { useScenarioHeaderStyles } from './ScenarioHeader.Styles';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import { CustomTooltip } from '@AMIEWEB/Common/Tooltips';
import { useDispatch, useSelector } from 'react-redux';
import { CustomBackdrop, WhiteTooltip } from '@AMIEWEB/Common';
import { usePromiseTracker } from 'react-promise-tracker';
import {
  getPayPackageStatusChipColor,
  getPayPackageStatusChipTextColor,
  getPayPackageStatusName,
  getStatusTransitionEnabledUpdate,
} from '../PayPackage/helper';
import { selectUser } from 'oidc/user.selectors';
import {
  fetchStatusIcon,
  getPayPackageStatusTooltip,
  getStatusUpdateButtonDisabledTooltip,
} from '../PayPackage/PayPackageHelper';
import {
  selectOrderIdModifiedConfirmationStatus,
  selectSelectedScenario,
} from 'store/redux-store/margin-tool/slices/add-edit-scenario/add-edit-scenario.selector';
import { payPackageStatusActions } from 'store/redux-store/margin-tool/slices/pay-package-status/pay-package-status.redux';
import {
  PayPackageStatus,
  StatusTransitionButtons,
  StatusTransitionModalType,
} from 'store/redux-store/margin-tool/slices/pay-package-status/pay-package-status.model';
import { scenarioActions } from 'store/redux-store/margin-tool/slices/add-edit-scenario/add-edit-scenario.redux';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';
import { IEmailType } from 'app/models/Notification/Notification';
import { notificationDataActions } from 'store/redux-store/notification/notification.redux';
import { selectStatusUpdatedEmailModalOpen } from 'store/redux-store/margin-tool/slices/pay-package-status/pay-package-status.selector';
import { selectEmailData } from 'store/redux-store/notification/notification.selector';
import { ShareEmailPopper } from '../PayPackage/ShareEmailPopper';
import { ScenarioHeaderDetails } from './ScenarioHeaderDetails/ScenarioHeaderDetails';
import { DisableAppScroll } from 'app/layout/Layout';
import { marginToolEmailAction } from 'store/redux-store/margin-tool/slices/margin-tool-email/margin-tool-email.redux';
import { PromiseTrackerKeys } from 'app/constants/PromiseTrackerKeys';
import { ShareDropdownIconButton } from './ShareDropdownIcon';
import { useFormContext } from 'react-hook-form';
import { IMarginUpdateResponseErrorTypes } from '../PayPackage/models/AddScenarioModal';
import { MarginToolService } from 'app/services/MarginToolServices/margin-tool-service';
import { createPayloadMarginTool } from '@AMIEWEB/MarginTool/marginToolSavePayload';
import { getFormattedTimeOff } from '@AMIEWEB/Placement/PlacementDetails/PlacementTabPanel/ModificationsTab/ModificationsUtils';
import { selectEditTimeOffs } from 'store/redux-store/margin-tool/slices/assignment/assignment.selector';

export const ScenarioHeader = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const {
    watch,
    formState: { isValid },
  } = useFormContext();

  const isStatusUpdatedEmailModalOpen = useSelector(selectStatusUpdatedEmailModalOpen);

  const { userInfo } = useSelector(selectUser);
  const headerData = useSelector(selectSelectedScenario);
  const orderIdModifiedConfirmationStatus = useSelector(selectOrderIdModifiedConfirmationStatus);
  const emailData = useSelector(selectEmailData);
  const editTimeOffs = useSelector(selectEditTimeOffs);
  const { classes } = useScenarioHeaderStyles();
  const [isDeleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [openEmailPopper, setOpenEmailPopper] = useState<boolean>(false);
  const [isActionButtonHovered, setActionButtonHovered] = useState<{
    buttonName?: StatusTransitionButtons;
    isHovered: boolean;
  }>({ buttonName: null, isHovered: false });

  const [selectedStatusButton, setSelectedStatusButton] = useState<StatusTransitionButtons | null>(null);

  const { promiseInProgress: isScenarioDataLoading } = usePromiseTracker({
    area: 'get-scenario-navigation-tree-data',
    delay: 0,
  });

  const { promiseInProgress: fetchTemplate } = usePromiseTracker({
    area: PromiseTrackerKeys.marginTool.marginToolTemplate,
    delay: 0,
  });
  const { promiseInProgress: fetchPlacementHeader } = usePromiseTracker({
    area: PromiseTrackerKeys.marginTool.fetchplacementHeader,
    delay: 0,
  });
  const { promiseInProgress: fetchOrderDetails } = usePromiseTracker({
    area: PromiseTrackerKeys.marginTool.fetchOrderDetails,
    delay: 0,
  });
  const { promiseInProgress: fetchPlacementDocs } = usePromiseTracker({
    area: PromiseTrackerKeys.marginTool.fetchPlacementDocs,
    delay: 0,
  });
  const { promiseInProgress: fetchBillRateMod } = usePromiseTracker({
    area: PromiseTrackerKeys.marginTool.fetchBillRateMod,
    delay: 0,
  });
  const { promiseInProgress: marginToolPreview } = usePromiseTracker({
    area: PromiseTrackerKeys.marginTool.marginToolPreview,
    delay: 0,
  });

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

  const inProgress = flagVariationInProgress || isSavingScenario || isLoadDataScenario || isScenarioVerification;

  const loading =
    fetchTemplate ||
    fetchPlacementHeader ||
    fetchOrderDetails ||
    fetchPlacementDocs ||
    fetchBillRateMod ||
    marginToolPreview;

  const scenarioName = headerData?.scenarioName?.trimStart();

  const truncateTitle = (title: string, maxLength: number) => {
    return title?.length > maxLength ? `${title?.substring(0, maxLength)}...` : title;
  };
  const statusId = headerData?.scenarioStatusId;
  const statusTransitionButtonList = getStatusTransitionEnabledUpdate(statusId, userInfo?.roles ?? [], isValid);

  const handleDelete = () => {
    setDeleteConfirmOpen(false);
    dispatch(
      scenarioActions.deleteSingleScenario({
        scenarioId: headerData?.scenarioId,
        timestamp: headerData?.timestamp,
      }),
    );
  };

  const handleEmailModalOpen = (variant: string) => {
    if (!emailData?.open && emailData?.minimized) {
      dispatch(
        notificationDataActions.setEmailInteraction({
          open: true,
          minimized: false,
        }),
      );
      dispatch(notificationDataActions.setSnackBarData({ channel: 'email', manual: false, changeWarning: true }));
    } else {
      dispatch(
        payPackageStatusActions.setStatusUpdatedEmailModalOpen({
          openEmailModal: true,
          emailType: IEmailType.Manual,
          emailVariant: variant,
        }),
      );
    }
  };

  const changeStatus = statusButton => {
    if (statusButton !== StatusTransitionButtons.reset && statusButton !== StatusTransitionButtons.verify) {
      setSelectedStatusButton(statusButton);
      const formData = watch();
      new Promise((resolve, reject) => {
        dispatch(
          scenarioActions.postMarginToolDetailsValidate({
            formData,
            resolve,
            reject,
          }),
        );
      }).then(() => {
        setSelectedStatusButton(null);
        dispatch(
          payPackageStatusActions.setPayPackageStatusTransitionModalDetails({
            openModal: true,
            type:
              statusButton === StatusTransitionButtons.Approve
                ? StatusTransitionModalType.Approve
                : statusButton === StatusTransitionButtons.RequestApproval
                ? StatusTransitionModalType.RequestApproval
                : statusButton === StatusTransitionButtons.reset
                ? StatusTransitionModalType?.Reset
                : statusButton === StatusTransitionButtons.verify
                ? StatusTransitionModalType.Verify
                : StatusTransitionModalType.None,
          }),
        );
      });
    } else {
      dispatch(
        payPackageStatusActions.setPayPackageStatusTransitionModalDetails({
          openModal: true,
          type:
            statusButton === StatusTransitionButtons.Approve
              ? StatusTransitionModalType.Approve
              : statusButton === StatusTransitionButtons.RequestApproval
              ? StatusTransitionModalType.RequestApproval
              : statusButton === StatusTransitionButtons.reset
              ? StatusTransitionModalType?.Reset
              : statusButton === StatusTransitionButtons.verify
              ? StatusTransitionModalType.Verify
              : StatusTransitionModalType.None,
        }),
      );
    }
  };

  const openEmailMenu = async () => {
    const marginToolService = MarginToolService.createInstance();
    const formData = watch();
    const timeOffs = getFormattedTimeOff(editTimeOffs);
    const transformedPayload = createPayloadMarginTool(
      formData,
      headerData,
      userInfo,
      headerData?.timestamp,
      timeOffs,
      true,
    );
    const validationDetails = await marginToolService.postMarginToolValidate(transformedPayload);
    if (validationDetails?.status === 200 && !validationDetails?.data?.inError) {
      DisableAppScroll();
      setOpenEmailPopper(true);
    } else if (validationDetails?.data?.errorType === IMarginUpdateResponseErrorTypes.BaseDetailsModifiedError) {
      dispatch(scenarioActions.setIsOrderIdModifiedStatus(true));
      dispatch(scenarioActions.setShowOrderIdModifiedDialogStatus(true));
    }
  };

  useEffect(() => {
    if (isStatusUpdatedEmailModalOpen?.openEmailModal) {
      dispatch(marginToolEmailAction.handleMarginToolEmailCreation());
    }
  }, [isStatusUpdatedEmailModalOpen?.openEmailModal]);

  useEffect(() => {
    if (headerData?.placementId)
      dispatch(payPackageStatusActions.getEmailRecipientsList({ placementId: headerData?.placementId }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headerData?.placementId]);

  return (
    <>
      <CustomBackdrop open={loading} />
      <Grid item id="marginTool-marginToolDetailsPage-rightContainer-scenario-Header" className={classes.container}>
        <Grid item className={classes.header}>
          <Grid item className={classes.headerLeftSection}>
            <CustomTooltip
              arrow={false}
              hideToolTip={scenarioName?.length <= 15}
              tooltipContent={<span className={classes.headerTooltip}>{scenarioName}</span>}
            >
              <Grid item className={classes.headerTitle}>
                {!isScenarioDataLoading ? (
                  truncateTitle(scenarioName, 15)
                ) : (
                  <Skeleton variant="rectangular" width={150} />
                )}
              </Grid>
            </CustomTooltip>
            {headerData?.scenarioStatusId && (
              <>
                <Grid item>
                  <WhiteTooltip
                    classes={{ tooltip: classes.detailsTooltip, arrow: classes.arrow }}
                    title={getPayPackageStatusTooltip(statusId, headerData)}
                  >
                    <Chip
                      size={'small'}
                      style={{
                        height: '28px',
                        padding: '12px 6px',
                        margin: '3px',
                        color: getPayPackageStatusChipTextColor(statusId),
                        border: `1px solid ${getPayPackageStatusChipTextColor(statusId)}`,
                        backgroundColor: getPayPackageStatusChipColor(statusId),
                      }}
                      label={<span className={classes.statusText}>{getPayPackageStatusName(statusId)}</span>}
                    />
                  </WhiteTooltip>
                </Grid>
                {statusTransitionButtonList?.map(statusButton => {
                  return (
                    <>
                      {statusButton?.show && (
                        <Grid item key={statusButton.button}>
                          <WhiteTooltip
                            title={
                              !statusButton?.enabled && statusButton.button !== StatusTransitionButtons.RequestApproval
                                ? getStatusUpdateButtonDisabledTooltip()
                                : ''
                            }
                          >
                            <span>
                              <Button
                                className={classes.statusBtn}
                                disabled={!statusButton?.enabled || !isValid || inProgress}
                                variant="text"
                                startIcon={
                                  isScenarioVerification && selectedStatusButton === statusButton.button ? (
                                    <Box>
                                      <CircularProgress size={16} color="inherit" />
                                    </Box>
                                  ) : (
                                    fetchStatusIcon(
                                      statusButton.button,
                                      statusButton?.enabled,
                                      isActionButtonHovered,
                                      isValid,
                                    )
                                  )
                                }
                                onMouseEnter={() =>
                                  setActionButtonHovered({ buttonName: statusButton.button, isHovered: true })
                                }
                                onMouseLeave={() => setActionButtonHovered({ buttonName: null, isHovered: false })}
                                onClick={() => {
                                  if (orderIdModifiedConfirmationStatus) {
                                    dispatch(scenarioActions.setShowOrderIdModifiedDialogStatus(true));
                                  } else {
                                    changeStatus(statusButton.button);
                                  }
                                }}
                              >
                                <span className={classes.btnText}>{statusButton?.button}</span>
                              </Button>
                            </span>
                          </WhiteTooltip>
                        </Grid>
                      )}
                    </>
                  );
                })}
              </>
            )}
          </Grid>

          <Grid item className={classes.headerRightSection}>
            <div
              className={classes.shareIcon}
              onClick={() => {
                if (!inProgress) {
                  if (orderIdModifiedConfirmationStatus) {
                    dispatch(scenarioActions.setShowOrderIdModifiedDialogStatus(true));
                  } else {
                    openEmailMenu();
                  }
                }
              }}
            >
              <ShareDropdownIconButton />
            </div>
            <ShareEmailPopper
              openEmailPopper={openEmailPopper}
              handleEmailModalOpen={handleEmailModalOpen}
              setOpenEmailPopper={setOpenEmailPopper}
              disabled={!isValid}
            />

            <CustomTooltip
              tooltipContent={
                statusId === PayPackageStatus.Pending && headerData?.isMostRecentBookingPeriod
                  ? t('marginTool.header.deleteTooltip')
                  : ''
              }
            >
              <div
                className={`${classes.deleteSection} ${
                  statusId === PayPackageStatus.Pending && headerData?.isMostRecentBookingPeriod
                    ? ''
                    : classes.disabledButton
                }`}
                onClick={() => {
                  if (orderIdModifiedConfirmationStatus) {
                    dispatch(scenarioActions.setShowOrderIdModifiedDialogStatus(true));
                  } else {
                    setDeleteConfirmOpen(true);
                  }
                }}
              >
                <DeleteOutlinedIcon />
              </div>
            </CustomTooltip>
          </Grid>
        </Grid>
        <ScenarioHeaderDetails />
      </Grid>
      {isDeleteConfirmOpen && (
        <DeleteConfirmationModal
          open={isDeleteConfirmOpen}
          setDialogOpen={setDeleteConfirmOpen}
          handleProceed={handleDelete}
        />
      )}
    </>
  );
};
