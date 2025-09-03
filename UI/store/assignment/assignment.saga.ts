import { call, getContext, put, select, takeLatest } from 'redux-saga/effects';
import { assignmentActions } from './assignment.redux';
import { trackException } from 'app-insights/appInsightsTracking';
import { ExceptionType } from 'app/enums/Common';
import { globalActions } from 'app/ApplicationRoot/Global.redux';
import i18next from 'i18next';
import { MarginToolService } from 'app/services/MarginToolServices/margin-tool-service';
import { httpSuccess } from 'app/services/serviceHelpers';
import { formatInsuranceTypeAheadOptions, insuranceData } from '../../helper';
import { PayloadAction } from '@reduxjs/toolkit';
import {
  IPeopleSoftCalculationResult,
  IPeopleSoftMarginDetailsRequest,
} from '@AMIEWEB/MarginTool/Components/PeopleSoftCalculation/IPeopleSoftCalculation';
import {
  selectCancelTriggeredStatus,
  selectMarginToolDetailsData,
  selectSaveTriggeredStatus,
  selectSelectedScenario,
} from '../add-edit-scenario/add-edit-scenario.selector';
import { createRequestPayloadForPeopleSoftCalculation } from '@AMIEWEB/MarginTool/Components/PeopleSoftCalculation/IPeopleSoftCalculationHelper';
import { IAssignmentForm } from '@AMIEWEB/MarginTool/Components/Assignments/models/IAssignmentSplitForm';
import { selectUser } from 'oidc/user.selectors';
import {
  findMarginDetailByBookingPeriodId,
  updateMarginDetailsResponseByScenario,
} from '@AMIEWEB/MarginTool/Components/PayPackage/AddScenario/helper';
import { scenarioActions } from '../add-edit-scenario/add-edit-scenario.redux';
import { PromiseTrackerKeys } from 'app/constants/PromiseTrackerKeys';
import { manuallyIncrementPromiseCounter, manuallyResetPromiseCounter, trackPromise } from 'react-promise-tracker';
import {
  IMarginUpdateResponse,
  IMarginUpdateResponseErrorTargetTypes,
  IMarginUpdateResponseErrorTypes,
} from '@AMIEWEB/MarginTool/Components/PayPackage/models/AddScenarioModal';
import { IMarginToolSave } from '@AMIEWEB/MarginTool/IMarginToolSave';
import { IBannerAction } from 'app/models/Global/Global';

const TrackPeopleSoftCallFlagVariation = (fn, ...args) =>
  trackPromise(fn(...args), PromiseTrackerKeys.marginTool.peopleSoftCallMarginTool);
const TrackInitialMarginToolsDataFlagVariation = (fn, ...args) =>
  trackPromise(fn(...args), PromiseTrackerKeys.marginTool.initialMarginToolsData);

export function* getTreeViewLookupData() {
  try {
    const marginToolService: MarginToolService = yield getContext('marginToolService');
    const response = yield call(marginToolService.getPicklistData);
    if (httpSuccess(response.status)) {
      yield put(assignmentActions.setTreeViewDataLookup(response.data));
    } else {
      yield put(
        globalActions.setSnackBar({
          message: i18next.t('common.failedLoad'),
          severity: 'error',
        }),
      );
    }
  } catch (error) {
    trackException({
      exception: error,
      properties: {
        name: ExceptionType.APIRequestError,
        functionName: 'getTreeViewLookupData',
        area: 'src/store/redux-store/margin-tool/slices/assignment/assignment.saga.ts',
      },
    });
  }
}

export function* fetchPickListData() {
  try {
    const marginToolService: MarginToolService = yield getContext('marginToolService');
    const response = yield call(marginToolService.getPicklistData);
    if (httpSuccess(response.status)) {
      const filteredInsuranceData = insuranceData(response?.data);
      yield put(assignmentActions.setInsuranceStatus(formatInsuranceTypeAheadOptions(filteredInsuranceData)));
    }
  } catch (error) {
    trackException({
      exception: error,
      properties: {
        name: ExceptionType.APIRequestError,
        functionName: 'fetchShiftData',
        area: 'src/store/redux-store/margin-tool/slices/assignment/assignment.saga.ts',
      },
    });
  }
}

export function* getPeopleSoftCalculation(
  action: PayloadAction<{
    formData: IAssignmentForm;
    isDataUpdateFlow?: boolean | false | null;
    formDataRaw?: IMarginToolSave | null | undefined;
  }>,
) {
  try {
    const marginToolService: MarginToolService = yield getContext('marginToolService');
    manuallyIncrementPromiseCounter(PromiseTrackerKeys.marginTool.peopleSoftCallMarginTool);
    const assignmentForm = action.payload.formData;
    const currentUser = yield select(selectUser);
    const selectedScenario = yield select(selectSelectedScenario);
    const marginDetailsData = yield select(selectMarginToolDetailsData);
    const currentMarginDetail = findMarginDetailByBookingPeriodId(marginDetailsData, selectedScenario?.bookingPeriodId);
    const requestPayload: IPeopleSoftMarginDetailsRequest = createRequestPayloadForPeopleSoftCalculation(
      assignmentForm,
      selectedScenario,
      currentUser,
      currentMarginDetail,
      selectedScenario?.timestamp,
      action.payload.isDataUpdateFlow ?? false,
    );
    const isCancelTriggered = yield select(selectCancelTriggeredStatus);
    if (isCancelTriggered) {
      manuallyResetPromiseCounter(PromiseTrackerKeys.marginTool.peopleSoftCallMarginTool);
      yield put(scenarioActions.setCancelTriggeredStatus(false));
      return;
    }
    const response = yield call(
      TrackPeopleSoftCallFlagVariation,
      marginToolService.getPeopleSoftCalculatedValues,
      requestPayload,
    );
    const scenarioResponse: IMarginUpdateResponse = response?.data;
    if (scenarioResponse) {
      scenarioResponse.target = IMarginUpdateResponseErrorTargetTypes.View;
    }
    if (isCancelTriggered) {
      manuallyResetPromiseCounter(PromiseTrackerKeys.marginTool.peopleSoftCallMarginTool);
      yield put(scenarioActions.setCancelTriggeredStatus(false));
      return;
    }
    if (httpSuccess(response.status)) {
      if (!scenarioResponse?.inError) {
        const data = scenarioResponse?.payload;
        const scenarioCalculationResponse: IPeopleSoftCalculationResult = data;
        const updatedScenario = {
          ...selectedScenario,
          grossProfit: scenarioCalculationResponse.grossProfit,
          grossMargin: scenarioCalculationResponse.grossMargin,
          revenue: scenarioCalculationResponse.revenue,
          negotiatedContributionMargin: scenarioCalculationResponse.negotiatedContributionMargin,
          timestamp: scenarioCalculationResponse.timestamp ?? selectedScenario.timestamp,
        };
        // Dispatch the updated scenario
        yield put(scenarioActions.setScenario(updatedScenario));
        const updatedMarginDetailsData = updateMarginDetailsResponseByScenario(marginDetailsData, updatedScenario);
        yield put(scenarioActions.setMarginDetailResponse(updatedMarginDetailsData));

        if (isCancelTriggered) {
          manuallyResetPromiseCounter(PromiseTrackerKeys.marginTool.peopleSoftCallMarginTool);
          yield put(scenarioActions.setCancelTriggeredStatus(false));
          return;
        }
        const isSaveTriggered = yield select(selectSaveTriggeredStatus);
        if (isSaveTriggered) {
          if (action.payload.formDataRaw) {
            const body = action.payload.formDataRaw;
            yield put(
              scenarioActions.postMarginToolDetails({
                formData: body,
                loadDetails: true,
              }),
            );
          }
        }
      } else {
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
        } else {
          const data = scenarioResponse?.payload;
          const scenarioCalculationResponse: IPeopleSoftCalculationResult = data;
          const updatedScenario = {
            ...selectedScenario,
            grossProfit: scenarioCalculationResponse.grossProfit,
            grossMargin: scenarioCalculationResponse.grossMargin,
            revenue: scenarioCalculationResponse.revenue,
            negotiatedContributionMargin: scenarioCalculationResponse.negotiatedContributionMargin,
            timestamp: scenarioCalculationResponse.timestamp ?? selectedScenario.timestamp,
          };
          // Dispatch the updated scenario
          yield put(scenarioActions.setScenario(updatedScenario));
          const updatedMarginDetailsData = updateMarginDetailsResponseByScenario(marginDetailsData, updatedScenario);
          yield put(scenarioActions.setMarginDetailResponse(updatedMarginDetailsData));
          yield put(
            globalActions.setSnackBar({
              message: scenarioResponse?.message || i18next.t('common.failedLoad'),
              severity: 'error',
            }),
          );
        }
      }
    }
    yield put(scenarioActions.setSaveTriggeredStatus(false));
    yield put(scenarioActions.setCancelTriggeredStatus(false));
    manuallyResetPromiseCounter(PromiseTrackerKeys.marginTool.peopleSoftCallMarginTool);
  } catch (error) {
    yield put(
      globalActions.setSnackBar({
        message: i18next.t('common.failedLoad'),
        severity: 'error',
      }),
    );
    yield put(scenarioActions.setSaveTriggeredStatus(false));
    yield put(scenarioActions.setCancelTriggeredStatus(false));
    manuallyResetPromiseCounter(PromiseTrackerKeys.marginTool.peopleSoftCallMarginTool);
    trackException({
      exception: error,
      properties: {
        name: ExceptionType.APIRequestError,
        functionName: 'getPeopleSoftCalculation',
        area: 'src/store/redux-store/margin-tool/slices/assignment/assignment.saga.ts',
      },
    });
  }
}

export function* fetchInitialMarginToolsData() {
  try {
    const marginToolService: MarginToolService = yield getContext('marginToolService');
    const selectedScenario = yield select(selectSelectedScenario);
    manuallyIncrementPromiseCounter(PromiseTrackerKeys.marginTool.initialMarginToolsData);
    const response = yield call(
      TrackInitialMarginToolsDataFlagVariation,
      marginToolService.getNewScenarioDefaultValues,
      selectedScenario.placementId,
      selectedScenario.scenarioId,
    );
    if (httpSuccess(response.status)) {
      yield put(assignmentActions.setInitialMarginDetailResponse(response.data));
    }
    manuallyResetPromiseCounter(PromiseTrackerKeys.marginTool.initialMarginToolsData);
  } catch (error) {
    manuallyResetPromiseCounter(PromiseTrackerKeys.marginTool.initialMarginToolsData);
    trackException({
      exception: error,
      properties: {
        name: ExceptionType.APIRequestError,
        functionName: 'fetchInitialMarginToolsData',
        area: 'src/store/redux-store/margin-tool/slices/assignment/assignment.saga.ts',
      },
    });
  }
}

export function* assignmentSaga() {
  yield takeLatest(assignmentActions.getTreeViewDataForPickList, getTreeViewLookupData);
  yield takeLatest(assignmentActions.getPickListDetails, fetchPickListData);
  yield takeLatest(assignmentActions.triggerPeopleSoftCalculation, getPeopleSoftCalculation);
  yield takeLatest(assignmentActions.getInitialMarginToolsData, fetchInitialMarginToolsData);
}
