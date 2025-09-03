import { Box, Button, CircularProgress, Grid, Typography } from 'amn-ui-core';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePayPackageStyles } from './PayPackage.styles';
import ScenarioTreeView from './ScenarioNavigationTree/ScenarioTreeView';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectMarginToolDetailsData,
  selectOrderIdModifiedConfirmationStatus,
  selectSelectedScenario,
  selectTreeViewSelectedBookingPeriod,
} from 'store/redux-store/margin-tool/slices/add-edit-scenario/add-edit-scenario.selector';
import { PayPackageStatus } from 'store/redux-store/margin-tool/slices/pay-package-status/pay-package-status.model';
import { getAddScenarioButtonState } from './helper';
import { PayPackageOptions } from '@AMIEWEB/MarginTool/enum';
import { CustomTooltip } from 'app/components/Common/Tooltips';
import { PayPackagePIDSearch } from './PayPackagePIDSearch';
import { useParams } from 'react-router-dom';
import { MarginEntityType } from 'store/redux-store/margin-tool/slices/add-edit-scenario/add-edit-scenario.model';
import { usePromiseTracker } from 'react-promise-tracker';
import { PromiseTrackerKeys } from 'app/constants/PromiseTrackerKeys';
import { scenarioActions } from 'store/redux-store/margin-tool/slices/add-edit-scenario/add-edit-scenario.redux';
import { findMarginDetailByBookingPeriodId } from './AddScenario/helper';
import { globalActions } from 'app/ApplicationRoot/Global.redux';

export const PayPackages = () => {
  const { classes } = usePayPackageStyles();
  const params = useParams<{ entity: string; entityId: string }>();
  const treeViewData = useSelector(selectMarginToolDetailsData);
  const treeViewSelectedBookingPeriod = useSelector(selectTreeViewSelectedBookingPeriod);
  const orderIdModifiedConfirmationStatus = useSelector(selectOrderIdModifiedConfirmationStatus);
  const [hasUnVerifiedStatus, setHasUnVerifiedStatus] = useState(true);
  const [buttonDisabledStateAndMessage, setButtonDisabledStateAndMessage] = useState({ state: false, message: '' });
  const marginToolDetails = useSelector(selectMarginToolDetailsData);
  const selectedScenario = useSelector(selectSelectedScenario);
  const { t } = useTranslation();
  const dispatch = useDispatch();
  //const [, setIsModalOpen] = useContext(ModalStatusContext);

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

  const { promiseInProgress: isAddScenarioDetailsFetchData } = usePromiseTracker({
    area: PromiseTrackerKeys.marginTool.getAddScenarioDetailsFetchData,
    delay: 0,
  });

  const { promiseInProgress: isAddScenarioExtensionDetailsFetchData } = usePromiseTracker({
    area: PromiseTrackerKeys.marginTool.getAddScenarioExtensionDetailsFetchData,
    delay: 0,
  });

  const inProgress =
    flagVariationInProgress ||
    isSavingScenario ||
    isLoadDataScenario ||
    isScenarioVerification ||
    isAddScenarioDetailsFetchData ||
    isAddScenarioExtensionDetailsFetchData;

  useEffect(() => {
    const selectedBookingPeriodTemp =
      treeViewData?.length > 0 && treeViewSelectedBookingPeriod?.bookingPeriodId > 0
        ? treeViewData?.find(x => x.bookingPeriodId === treeViewSelectedBookingPeriod?.bookingPeriodId)
        : null;
    const placementIdParam =
      params.entityId && params.entity === MarginEntityType.Placement ? Number(params.entityId) : null;
    setButtonDisabledStateAndMessage(
      getAddScenarioButtonState(placementIdParam, treeViewSelectedBookingPeriod, selectedBookingPeriodTemp, t),
    );
  }, [treeViewSelectedBookingPeriod, treeViewData, t, params.entityId, params.entity]);

  useEffect(() => {
    if (treeViewData && treeViewData.length > 0) {
      const scenarios = (
        treeViewData?.length > 0 && treeViewSelectedBookingPeriod?.bookingPeriodId > 0
          ? treeViewData?.find(x => x.bookingPeriodId === treeViewSelectedBookingPeriod?.bookingPeriodId)
          : null
      )?.scenarios;
      if (scenarios && scenarios.length > 0) {
        const unVerifiedStatusList = scenarios?.filter(
          x =>
            x.scenarioStatusId === null ||
            x.scenarioStatusId === undefined ||
            x.scenarioStatusId !== PayPackageStatus.Verified,
        );
        const unVerifiedStatus = unVerifiedStatusList.length > 0 ? true : false;
        setHasUnVerifiedStatus(unVerifiedStatus);
      } else {
        setHasUnVerifiedStatus(true);
      }
    } else {
      setHasUnVerifiedStatus(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [treeViewData, treeViewSelectedBookingPeriod]);

  const openScenarioModal = modalName => {
    //setIsModalOpen(true, modalName);
    if (treeViewSelectedBookingPeriod?.placementId || (params?.entityId && params?.entity === 'placement')) {
      const placementId =
        treeViewSelectedBookingPeriod?.placementId ??
        Number(selectedScenario?.placementId ? selectedScenario?.placementId : params?.entityId);
      if (modalName === PayPackageOptions.AddScenario) {
        let extFlow = false;
        if (marginToolDetails?.length > 0 && treeViewSelectedBookingPeriod?.bookingPeriodId > 0) {
          const matchedItem = findMarginDetailByBookingPeriodId(
            marginToolDetails,
            treeViewSelectedBookingPeriod.bookingPeriodId,
          );
          extFlow = matchedItem ? matchedItem.isScenarioExtention : false;
        }
        dispatch(
          scenarioActions.getAddScenarioDetails({
            placementId: treeViewSelectedBookingPeriod.placementId ?? Number(params?.entityId),
            bookingPeriodId: treeViewSelectedBookingPeriod?.bookingPeriodId,
            isExtensionFlow: extFlow,
          }),
        );
      } else if (modalName === PayPackageOptions.AddExtension) {
        dispatch(scenarioActions.getAddExtensionDetails({ placementId: placementId }));
      }
    }
    dispatch(scenarioActions.setScenarioCreateUpdateResponse(null));
    dispatch(globalActions.closeBanner());
  };

  return (
    <>
      <Grid container item className={classes.formStyle} id="marginTool-marginToolDetailsPage-payPackagesContainer">
        <Grid item classes={{ root: classes.headerContainer }}>
          <Typography sx={{ fontWeight: 'bold' }} variant="subtitle1">
            {t('marginTool.components.payPackages')}
          </Typography>
        </Grid>
        <Grid container item classes={{ root: classes.contentContainer }}>
          <PayPackagePIDSearch />
        </Grid>
        <Grid container item className={classes.buttonGrid} spacing={2}>
          <Grid item>
            <CustomTooltip tooltipContent={buttonDisabledStateAndMessage.message}>
              <Button
                className={classes.button}
                onClick={() => {
                  if (orderIdModifiedConfirmationStatus) {
                    dispatch(scenarioActions.setShowOrderIdModifiedDialogStatus(true));
                  } else {
                    openScenarioModal(PayPackageOptions.AddScenario);
                  }
                }}
                disabled={buttonDisabledStateAndMessage.state || inProgress}
                variant="contained"
                color="primary"
                id="marginTool-marginToolDetailsPage-addScenario-button"
              >
                {t('marginTool.buttons.addScenario')}
                {isAddScenarioDetailsFetchData && (
                  <Box position={'absolute'} right={1} top={6}>
                    <CircularProgress size={12} color="inherit" />
                  </Box>
                )}
              </Button>
            </CustomTooltip>
          </Grid>
          <Grid item>
            <CustomTooltip
              standardMargin
              tooltipContent={hasUnVerifiedStatus ? t('marginTool.components.disabledduetoScenarioStatus') : ''}
            >
              <Button
                className={classes.button}
                onClick={() => {
                  if (orderIdModifiedConfirmationStatus) {
                    dispatch(scenarioActions.setShowOrderIdModifiedDialogStatus(true));
                  } else {
                    openScenarioModal(PayPackageOptions.AddExtension);
                  }
                }}
                disabled={hasUnVerifiedStatus || inProgress}
                variant="contained"
                color="primary"
                id="marginTool-marginToolDetailsPage-addExtension-button"
              >
                {t('marginTool.buttons.addExtension')}
                {isAddScenarioExtensionDetailsFetchData && (
                  <Box position={'absolute'} right={1} top={6}>
                    <CircularProgress size={12} color="inherit" />
                  </Box>
                )}
              </Button>
            </CustomTooltip>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <ScenarioTreeView />
        </Grid>
      </Grid>
    </>
  );
};
