import { call, getContext, put, select, takeLatest } from 'redux-saga/effects';
import {
  IInitiatePayPacketStatusTransition,
  IUpdatePayPackageStatusPayload,
  StatusTransitionModalType,
} from './pay-package-status.model';
import { PayloadAction } from '@reduxjs/toolkit';
import { payPackageStatusActions } from './pay-package-status.redux';
import { getTransitionStatusCategory } from '@AMIEWEB/MarginTool/Components/PayPackage/helper';
import { MarginToolService } from 'app/services/MarginToolServices/margin-tool-service';
import { httpSuccess } from 'app/services/serviceHelpers';
import { trackException } from 'app-insights/appInsightsTracking';
import { ExceptionType } from 'app/enums/Common';
import { manuallyResetPromiseCounter, trackPromise } from 'react-promise-tracker';
import { globalActions } from 'app/ApplicationRoot/Global.redux';
import { scenarioActions } from '../add-edit-scenario/add-edit-scenario.redux';
import { fetchMarginToolDetails } from '../add-edit-scenario/add-edit-scenario.saga';
import { IEmailType } from 'app/models/Notification/Notification';
import { notificationSelection } from 'store/redux-store/notification/notification.selector';
import { notificationDataActions } from 'store/redux-store/notification/notification.redux';
import {
  IMarginUpdateResponse,
  IMarginUpdateResponseErrorTargetTypes,
  IMarginUpdateResponseErrorTypes,
} from '@AMIEWEB/MarginTool/Components/PayPackage/models/AddScenarioModal';
import { IBannerAction } from 'app/models/Global/Global';
import i18next from 'i18next';
import { PromiseTrackerKeys } from 'app/constants/PromiseTrackerKeys';

const TrackPayPackageStatusUpdate = (fn, ...args) =>
  trackPromise(fn(...args), PromiseTrackerKeys.marginTool.updateScenarioStatus);
const TrackEmailRecipentsList = (fn, ...args) => trackPromise(fn(...args), 'get-email-receipents-list');

export function* initiatePayPacketStatusTransition(action: PayloadAction<IInitiatePayPacketStatusTransition>) {
  try {
    yield put(payPackageStatusActions.setPayPackageStatusTransitionModalDetails(action.payload));
    const statusId = action.payload.statusId;
    const category = getTransitionStatusCategory(action.payload.type);
    const marginToolService: MarginToolService = yield getContext('marginToolService');
    const response = yield call(marginToolService.getlistofPayPackageStatus, statusId, category);
    if (httpSuccess(response.status)) {
      yield put(payPackageStatusActions.setPayPackageStatusOptions(response?.data));
    }
  } catch (error) {
    trackException({
      exception: error,
      properties: {
        name: ExceptionType.APIRequestError,
        functionName: 'initiatePayPacketStatusTransition',
        area: 'src/store/redux-store/pay-package-status/pay-package-status.saga.ts',
      },
    });
  }
}

export function* initiateUpdatePayPackageStatus(action: PayloadAction<IUpdatePayPackageStatusPayload>) {
  try {
    yield put(scenarioActions.setScenarioCreateUpdateResponse(null));
    yield put(globalActions.closeBanner());

    const marginToolService: MarginToolService = yield getContext('marginToolService');
    const response = yield call(TrackPayPackageStatusUpdate, marginToolService.updatePayPackageStatus, action.payload);

    const scenarioResponse: IMarginUpdateResponse = response?.data;
    if (scenarioResponse) {
      scenarioResponse.target = IMarginUpdateResponseErrorTargetTypes.View;
    }

    yield put(scenarioActions.setScenarioCreateUpdateResponse(scenarioResponse));

    if (httpSuccess(response.status)) {
      if (!scenarioResponse?.inError) {
        yield put(
          payPackageStatusActions.setPayPackageStatusTransitionModalDetails({
            openModal: false,
            type: StatusTransitionModalType.None,
          }),
        );
        yield put(
          globalActions.setSnackBar({
            message: scenarioResponse?.message,
            severity: 'success',
          }),
        );
        yield call(fetchMarginToolDetails, {
          payload: { placementId: action.payload.placementId },
          type: scenarioActions.getMarginToolDetails.type,
        });
        yield put(payPackageStatusActions.setRecentStatusUpdatedScenarioId(action.payload.payPackageId));
        if (action.payload.openEmailModal) {
          const notificationData = yield select(notificationSelection);
          if (!notificationData.email.open && notificationData.email.minimized) {
            yield put(
              notificationDataActions.setEmailInteraction({
                open: true,
                minimized: false,
              }),
            );
            yield put(
              notificationDataActions.setSnackBarData({ channel: 'email', manual: false, changeWarning: true }),
            );
          } else {
            yield put(
              payPackageStatusActions.setStatusUpdatedEmailModalOpen({
                openEmailModal: true,
                emailType: IEmailType.Auto,
              }),
            );
          }
        }
      } else if (scenarioResponse?.errorType === IMarginUpdateResponseErrorTypes.BaseDetailsModifiedError) {
        yield put(scenarioActions.setIsOrderIdModifiedStatus(true));
        yield put(scenarioActions.setShowOrderIdModifiedDialogStatus(true));
      } else if (
        scenarioResponse?.errorType === IMarginUpdateResponseErrorTypes.TimeStampError ||
        scenarioResponse?.errorType === IMarginUpdateResponseErrorTypes.PerDiemError ||
        scenarioResponse?.errorType === IMarginUpdateResponseErrorTypes.DateError
      ) {
        yield put(
          payPackageStatusActions.setPayPackageStatusTransitionModalDetails({
            openModal: false,
            type: StatusTransitionModalType.None,
          }),
        );
        if (scenarioResponse?.errorType === IMarginUpdateResponseErrorTypes.TimeStampError) {
          yield put(
            globalActions.setBanner({
              message: scenarioResponse?.message || i18next.t('common.failedLoad'),
              severity: 'error',
              justify: 'flex-start',
              action: IBannerAction.refreshPage,
              justifyActionContent: 'flex-end',
            }),
          );
        } else if (
          scenarioResponse?.errorType === IMarginUpdateResponseErrorTypes.PerDiemError ||
          scenarioResponse?.errorType === IMarginUpdateResponseErrorTypes.DateError
        ) {
          yield put(
            globalActions.setBanner({
              message: scenarioResponse?.message || i18next.t('common.failedLoad'),
              severity: 'error',
              justify: 'flex-start',
            }),
          );
        }
      } else {
        yield put(
          globalActions.setSnackBar({
            message: scenarioResponse?.message || i18next.t('common.failedLoad'),
            severity: 'error',
          }),
        );
      }
    } else {
      //http 400+
      if (scenarioResponse?.errorType === IMarginUpdateResponseErrorTypes.DateError) {
        yield put(
          payPackageStatusActions.setPayPackageStatusTransitionModalDetails({
            openModal: false,
            type: StatusTransitionModalType.None,
          }),
        );
        yield put(
          globalActions.setBanner({
            message: scenarioResponse?.message || i18next.t('common.failedLoad'),
            severity: 'error',
            justify: 'flex-start',
          }),
        );
      } else {
        yield put(
          globalActions.setSnackBar({
            message: i18next.t('common.failedLoad'),
            severity: 'error',
          }),
        );
      }
    }
    manuallyResetPromiseCounter(PromiseTrackerKeys.marginTool.updateScenarioStatus);
  } catch (error) {
    manuallyResetPromiseCounter(PromiseTrackerKeys.marginTool.updateScenarioStatus);
    yield put(
      globalActions.setSnackBar({
        message: i18next.t('common.failedLoad'),
        severity: 'error',
      }),
    );
    trackException({
      exception: error,
      properties: {
        name: ExceptionType.APIRequestError,
        functionName: 'initiatePayPacketStatusTransition',
        area: 'src/store/redux-store/pay-package-status/pay-package-status.saga.ts',
      },
    });
  }
}
export function* getEmailRecipientsList(action: PayloadAction<{ placementId: number }>) {
  try {
    const marginToolService: MarginToolService = yield getContext('marginToolService');

    const response = yield call(
      TrackEmailRecipentsList,
      marginToolService.getPlacementEmployeesForMargin,
      action.payload.placementId,
    );
    if (httpSuccess(response.status)) {
      yield put(payPackageStatusActions.setEmailRecipients(response?.data));
    }
  } catch (error) {
    trackException({
      exception: error,
      properties: {
        name: ExceptionType.APIRequestError,
        functionName: 'getEmailRecipientsList',
        area: 'src/store/redux-store/pay-package-status/pay-package-status.saga.ts',
      },
    });
  }
}

export function* payPackageStatusSaga() {
  yield takeLatest(payPackageStatusActions.initiatePayPacketStatusTransition.type, initiatePayPacketStatusTransition);
  yield takeLatest(payPackageStatusActions.updatePayPackageStatus.type, initiateUpdatePayPackageStatus);
  yield takeLatest(payPackageStatusActions.getEmailRecipientsList.type, getEmailRecipientsList);
}
