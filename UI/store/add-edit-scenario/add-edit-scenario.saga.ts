import { call, getContext, put, select, takeLatest } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { trackException } from 'app-insights/appInsightsTracking';
import { ExceptionType } from 'app/enums/Common';
import { httpClientError, httpSuccess } from 'app/services/serviceHelpers';
import { MarginToolService } from 'app/services/MarginToolServices/margin-tool-service';
import {
  manuallyDecrementPromiseCounter,
  manuallyIncrementPromiseCounter,
  manuallyResetPromiseCounter,
  trackPromise,
} from 'react-promise-tracker';
import {
  GetGSAcalculatedValuesPayload,
  IAddScenarioRequestPayload,
} from '@AMIEWEB/MarginTool/Components/PayPackage/AddScenario/model';
import { globalActions } from 'app/ApplicationRoot/Global.redux';
import { scenarioActions } from './add-edit-scenario.redux';
import { formatTypeAheadOptions } from '../../helper';
import {
  selectBookingPeriod,
  selectMarginToolDetailsData,
  selectSearchPlacement,
  selectSelectedScenario,
  selectShiftDetails,
} from './add-edit-scenario.selector';
import { selectUser } from 'oidc/user.selectors';
import {
  findMarginDetailByBookingPeriodId,
  updatedMarginToolDetails,
} from '@AMIEWEB/MarginTool/Components/PayPackage/AddScenario/helper';
import {
  IMarginUpdateResponse,
  IMarginUpdateResponseErrorTargetTypes,
  IMarginUpdateResponseErrorTypes,
} from '@AMIEWEB/MarginTool/Components/PayPackage/models/AddScenarioModal';
import {
  IDeleteMarginToolDetailsPayload,
  IDeleteScenarioDetailsPayload,
  StatusTransitionModalType,
} from '../pay-package-status/pay-package-status.model';
import i18next from 'i18next';
import { PromiseTrackerKeys } from 'app/constants/PromiseTrackerKeys';
import { createPayloadMarginTool } from '@AMIEWEB/MarginTool/marginToolSavePayload';
import { IAssignmentForm } from '@AMIEWEB/MarginTool/Components/Assignments/models/IAssignmentSplitForm';
import { selectEditTimeOffs } from '../assignment/assignment.selector';
import { getFormattedTimeOff } from '@AMIEWEB/MarginTool/Components/Assignments/RequestedTimeOff/EditCellRender/helper';
import { payPackageStatusActions } from '../pay-package-status/pay-package-status.redux';
import { IBannerAction } from 'app/models/Global/Global';
import { getDefaultShiftData, getDetailsByScenarioId, getSplitsDetails } from '@AMIEWEB/MarginTool/helper';
import { PayPackageOptions } from '@AMIEWEB/MarginTool/enum';

const TrackScenarioNavigationTreeData = (fn, ...args) =>
  trackPromise(fn(...args), PromiseTrackerKeys.marginTool.scenarioNavigationData);
const TrackSaveAddScenarioData = (fn, ...args) => trackPromise(fn(...args), 'save-add-scenario-modal');
const TrackUpsetScenarioData = (fn, ...args) => trackPromise(fn(...args), 'upsert-scenario-modal');
const TrackScenarioGSACalculateData = (fn, ...args) =>
  trackPromise(fn(...args), PromiseTrackerKeys.marginTool.gsaCalculateFetchData);
const TrackGetAddScenarioDetailsData = (fn, ...args) =>
  trackPromise(fn(...args), PromiseTrackerKeys.marginTool.getAddScenarioDetailsFetchData);
const TrackGetAddScenarioExtensionDetailsData = (fn, ...args) =>
  trackPromise(fn(...args), PromiseTrackerKeys.marginTool.getAddScenarioExtensionDetailsFetchData);
export const TrackSaveScenario = (fn, ...args) => trackPromise(fn(...args), PromiseTrackerKeys.marginTool.saveScenario);

export function* requestAddScenarioModalDetails(
  action: PayloadAction<{ placementId: number; bookingPeriodId?: number | null; isExtensionFlow: boolean }>,
) {
  try {
    yield put(scenarioActions.setScenarioCreateUpdateResponse(null));
    yield put(globalActions.closeBanner());

    const marginToolService: MarginToolService = yield getContext('marginToolService');
    const { placementId, bookingPeriodId, isExtensionFlow } = action.payload;

    const response = yield call(
      TrackGetAddScenarioDetailsData,
      marginToolService.getMarginToolAddScenarioDetailsData,
      placementId, // Pass placementId
      bookingPeriodId, // Pass bookingPeriodId (can be undefined or null)
      isExtensionFlow, // Pass isExtensionFlow
    );

    if (httpSuccess(response.status)) {
      yield put(scenarioActions.setAddScenarioData(response?.data));
      const addScenario = response?.data;
      const selectionValue = addScenario;
      const shiftDetails = yield select(selectShiftDetails);
      const defaultShiftData = getDefaultShiftData(
        shiftDetails, // Access shiftDetailsData from state
        selectionValue, // Access selectionValue from state
        PayPackageOptions.AddScenario, // Use 'addScenario' as the fixed modal name
      );
      const modelData = {
        extensionOfPriorPlacementID:
          addScenario?.isInExtension && addScenario?.isExtensionFromPriorPlacementId
            ? addScenario?.extensionOfPriorPlacementId?.toString()
            : null,
        notes: '',
        startDate: addScenario?.startDate,
        endDate: addScenario?.endDate,
        duration: addScenario?.duration ?? '',
        isInExtension: addScenario?.isInExtension,
        tla: addScenario?.tla,
        scenarioName: addScenario?.scenarioName,
        shiftDescription: addScenario?.shiftDescription,
        shiftId: addScenario?.shiftId,
        shift: defaultShiftData,
        hoursPerWeek: defaultShiftData?.object?.hoursPerWeek,
        hoursPerShift: defaultShiftData?.object?.hoursPerShift,
        splitsList: [
          {
            startDate: addScenario?.startDate,
            endDate: addScenario?.endDate,
            shift: defaultShiftData,
            hoursPerWeek: defaultShiftData?.object?.hoursPerWeek,
            hoursPerShift: defaultShiftData?.object?.hoursPerShift,
          },
        ],
      };
      yield put(scenarioActions.setAddEditScenarioModelData(modelData));
      yield put(
        scenarioActions.setScenarioModal({
          modalStatus: true,
          modalName: PayPackageOptions.AddScenario,
        }),
      );
    } else {
      yield put(
        globalActions.setSnackBar({
          message: i18next.t('global.apiResponseError'),
          severity: 'error',
        }),
      );
    }
    manuallyResetPromiseCounter(PromiseTrackerKeys.marginTool.getAddScenarioDetailsFetchData);
    manuallyResetPromiseCounter(PromiseTrackerKeys.marginTool.gsaCalculateFetchData);
  } catch (error) {
    manuallyResetPromiseCounter(PromiseTrackerKeys.marginTool.gsaCalculateFetchData);
    manuallyResetPromiseCounter(PromiseTrackerKeys.marginTool.getAddScenarioDetailsFetchData);
    trackException({
      exception: error,
      properties: {
        name: ExceptionType.APIRequestError,
        functionName: 'requestAddScenarioModalDetails',
        area: 'src/store/redux-store/margin-tool/marginTool.saga.ts',
      },
    });
  }
}

export function* requestAddExtensionModalDetails(action: PayloadAction<{ placementId: number }>) {
  try {
    yield put(scenarioActions.setScenarioCreateUpdateResponse(null));
    yield put(globalActions.closeBanner());
    const marginToolService: MarginToolService = yield getContext('marginToolService');
    const response = yield call(
      TrackGetAddScenarioExtensionDetailsData,
      marginToolService.getMarginToolAddExtentionDetailsData,
      action.payload.placementId,
    );
    if (httpSuccess(response.status)) {
      yield put(scenarioActions.setAddExtentionData(response?.data));
      const addExtension = response?.data;
      const selectionValue = addExtension;
      const shiftDetails = yield select(selectShiftDetails);
      const defaultShiftData = getDefaultShiftData(
        shiftDetails, // Access shiftDetailsData from state
        selectionValue, // Access selectionValue from state
        PayPackageOptions.AddExtension, // Use 'AddExtension' as the fixed modal name
      );
      const modelData = {
        extensionOfPriorPlacementID: addExtension?.placementId?.toString(),
        notes: addExtension?.notes,
        startDate: addExtension?.startDate,
        endDate: addExtension?.endDate,
        duration: addExtension?.duration ?? '',
        isInExtension: addExtension?.isInExtension,
        tla: addExtension?.tla,
        scenarioName: 'Scenario 1', // Static scenario name
        shiftDescription: addExtension?.shiftDescription,
        shiftId: addExtension?.shiftId,
        shift: defaultShiftData,
        hoursPerWeek: addExtension?.hoursPerWeek,
        hoursPerShift: addExtension?.hoursPerShift,
        splitsList: [
          {
            startDate: addExtension?.startDate,
            endDate: addExtension?.endDate,
            shift: defaultShiftData,
            hoursPerWeek: defaultShiftData?.object?.hoursPerWeek,
            hoursPerShift: defaultShiftData?.object?.hoursPerShift,
          },
        ],
      };
      yield put(scenarioActions.setAddEditScenarioModelData(modelData));
      yield put(
        scenarioActions.setScenarioModal({
          modalStatus: true,
          modalName: PayPackageOptions.AddExtension,
        }),
      );
    } else {
      yield put(
        globalActions.setSnackBar({
          message: i18next.t('global.apiResponseError'),
          severity: 'error',
        }),
      );
    }
    manuallyResetPromiseCounter(PromiseTrackerKeys.marginTool.getAddScenarioExtensionDetailsFetchData);
    manuallyResetPromiseCounter(PromiseTrackerKeys.marginTool.gsaCalculateFetchData);
  } catch (error) {
    manuallyResetPromiseCounter(PromiseTrackerKeys.marginTool.getAddScenarioExtensionDetailsFetchData);
    manuallyResetPromiseCounter(PromiseTrackerKeys.marginTool.gsaCalculateFetchData);
    trackException({
      exception: error,
      properties: {
        name: ExceptionType.APIRequestError,
        functionName: 'requestAddExtentionModalDetails',
        area: 'src/store/redux-store/margin-tool/slices/add-edit-scenario/add-edit-scenario.saga.ts',
      },
    });
  }
}

export function* openMarginToolEditDetails(action: PayloadAction) {
  const selectedScenario = yield select(selectSelectedScenario);
  const marginToolDetails = yield select(selectMarginToolDetailsData);
  const bookingPeriodDetails = yield select(selectBookingPeriod);
  if (selectedScenario) {
    const selectedMarginToolDetails = selectedScenario?.scenarioId
      ? getDetailsByScenarioId(marginToolDetails, selectedScenario?.scenarioId)
      : null;
    const shiftDetails = yield select(selectShiftDetails);
    const defaultEditScenarioDetails = selectedScenario?.splits[0];
    const defaultShiftData = getDefaultShiftData(
      shiftDetails, // Access shiftDetailsData from state
      defaultEditScenarioDetails, // Access selectionValue from state
      PayPackageOptions.editScenario, // Use 'AddExtension' as the fixed modal name
    );

    const modelData = {
      extensionOfPriorPlacementID: selectedMarginToolDetails?.isExtensionOfPriorPlacement
        ? selectedMarginToolDetails?.extensionOfPriorPlacementId?.toString()
        : '',
      notes: selectedScenario?.notes ?? '',
      startDate: bookingPeriodDetails?.bookingPeriodStartDate?.toLocaleString('en-US', {
        timeZone: 'America/Los_Angeles',
      }),
      endDate: bookingPeriodDetails?.bookingPeriodEndDate?.toLocaleString('en-US', {
        timeZone: 'America/Los_Angeles',
      }),
      duration: bookingPeriodDetails?.bookingPeriodDuration ?? '',
      isInExtension: selectedMarginToolDetails?.isExtensionOfPriorPlacement,
      tla: selectedScenario?.tla,
      scenarioName: selectedScenario?.scenarioName,
      shiftDescription: defaultShiftData?.object?.shiftDescription,
      shiftId: defaultShiftData?.object?.shiftId,
      shift: defaultShiftData,
      hoursPerWeek: defaultShiftData?.object?.hoursPerWeek,
      hoursPerShift: defaultShiftData?.object?.hoursPerShift,
      splitsList: getSplitsDetails(selectedScenario?.splits, shiftDetails),
    };
    yield put(scenarioActions.setAddEditScenarioModelData(modelData));
    yield put(scenarioActions.setCurrentEditScenarioDetails(modelData));
    yield put(
      scenarioActions.setScenarioModal({
        modalStatus: true,
        modalName: PayPackageOptions.editScenario,
      }),
    );
  }
}

export function* fetchMarginToolDetails(
  action: PayloadAction<{
    placementId: number;
    isDataUpdateFlow?: boolean | false | null;
    scenarioId?: number | null;
  }>,
) {
  try {
    const marginToolService: MarginToolService = yield getContext('marginToolService');
    const response = yield call(
      TrackScenarioNavigationTreeData,
      marginToolService.getMarginToolDetails,
      action.payload.placementId,
    );
    if (httpSuccess(response.status)) {
      const data = response?.data;
      const selectedPlacement = yield select(selectSearchPlacement);
      const selectedMarginToolDetails = yield select(selectMarginToolDetailsData);
      const selectedScenarioExisting = yield select(selectSelectedScenario);
      const updatedDetails = updatedMarginToolDetails(
        data,
        selectedMarginToolDetails,
        selectedPlacement,
        selectedScenarioExisting,
        action.payload.scenarioId,
      );
      yield put(scenarioActions.setMarginDetailResponse(updatedDetails));
      const selectedScenario = updatedDetails
        ?.map(item => item?.scenarios?.find(scenario => scenario.isDefaultScenario))
        ?.filter(Boolean)[0];
      yield put(scenarioActions.setScenario(selectedScenario));
      if (selectedScenario) {
        const selectedBookingPeriod = updatedDetails?.find(item => item.scenarios.includes(selectedScenario));
        // To-do@Vipin - use one setter for setTreeViewBookingPeriod and render the placementId and bookingPeriodId conditionally
        if (selectedBookingPeriod) {
          yield put(scenarioActions.setBookingPeriod(selectedBookingPeriod));
          yield put(
            scenarioActions.setTreeViewBookingPeriod({
              placementId: selectedBookingPeriod.placementId,
              bookingPeriodId: selectedBookingPeriod.bookingPeriodId,
            }),
          );
        } else {
          yield put(
            scenarioActions.setTreeViewBookingPeriod({
              placementId: action.payload.placementId,
              bookingPeriodId: null,
            }),
          );
        }
      } else {
        yield put(
          scenarioActions.setTreeViewBookingPeriod({
            placementId: action.payload.placementId,
            bookingPeriodId: null,
          }),
        );
      }
      yield put(scenarioActions.getGSAcalculatedValues({ autoSave: action.payload.isDataUpdateFlow ?? false }));
      if (action.payload.isDataUpdateFlow) {
        yield put(scenarioActions.setFeatchScenarioCalculate(true));
      }
    } else if (httpClientError(response.status)) {
      yield put(
        globalActions.setSnackBar({
          message: response?.data,
          severity: 'error',
        }),
      );
    } else {
      yield put(
        globalActions.setSnackBar({
          message: i18next.t('global.apiResponseError'),
          severity: 'error',
        }),
      );
      throw new Error(i18next.t('global.apiResponseError'));
    }
    yield put(scenarioActions.setPageLoadStatus(true));
  } catch (error) {
    yield put(scenarioActions.setPageLoadStatus(true));
    trackException({
      exception: error,
      properties: {
        name: ExceptionType.APIRequestError,
        functionName: 'fetchMarginToolDetails',
        area: 'src/store/redux-store/margin-tool/slices/add-edit-scenario/add-edit-scenario.saga.ts',
      },
    });
  }
}

export function* fetchShiftData() {
  try {
    const marginToolService: MarginToolService = yield getContext('marginToolService');
    const response = yield call(marginToolService.getShiftData);
    if (httpSuccess(response.status)) {
      yield put(scenarioActions.setShiftDetailsData(formatTypeAheadOptions(response?.data)));
    }
  } catch (error) {
    trackException({
      exception: error,
      properties: {
        name: ExceptionType.APIRequestError,
        functionName: 'fetchShiftData',
        area: 'src/store/redux-store/margin-tool/marginTool.saga.ts',
      },
    });
  }
}

export function* postAddScenarioData(action: PayloadAction<IAddScenarioRequestPayload>) {
  try {
    yield put(scenarioActions.setScenarioCreateUpdateResponse(null));
    yield put(globalActions.closeBanner());
    const marginToolService: MarginToolService = yield getContext('marginToolService');
    const response = yield call(TrackSaveAddScenarioData, marginToolService.postAddScenarioModal, action.payload);
    const scenarioResponse: IMarginUpdateResponse = response?.data;
    if (scenarioResponse) {
      scenarioResponse.target = IMarginUpdateResponseErrorTargetTypes.Model;
    }
    yield put(scenarioActions.setScenarioCreateUpdateResponse(scenarioResponse));
    if (httpSuccess(response.status)) {
      if (!scenarioResponse?.inError) {
        yield put(
          globalActions.setSnackBar({
            message: scenarioResponse?.message,
            severity: 'success',
          }),
        );

        yield put(
          scenarioActions.getMarginToolDetails({
            placementId: Number(action.payload.placementId),
            isDataUpdateFlow: true,
            scenarioId: scenarioResponse?.scenarioId,
          }),
        );

        yield put(
          scenarioActions.setScenarioModal({
            modalName: '',
            modalStatus: false,
          }),
        );

        yield put(scenarioActions.setAddScenarioData(null));
        yield put(scenarioActions.setAddExtentionData(null));
        yield put(scenarioActions.setDeletedScenarioSplits([]));
      } else {
        if (scenarioResponse?.errorType === IMarginUpdateResponseErrorTypes.BaseDetailsModifiedError) {
          yield put(scenarioActions.setIsOrderIdModifiedStatus(true));
          yield put(scenarioActions.setShowOrderIdModifiedDialogStatus(true));
        } else if (
          scenarioResponse?.errorType === IMarginUpdateResponseErrorTypes.Generic ||
          scenarioResponse?.errorType === IMarginUpdateResponseErrorTypes.ScenarioNameError
        ) {
          yield put(
            globalActions.setSnackBar({
              message: scenarioResponse?.message,
              severity: 'error',
            }),
          );
        }
      }
    } else {
      yield put(
        globalActions.setSnackBar({
          message: i18next.t('global.apiResponseError'),
          severity: 'error',
        }),
      );
    }
  } catch (error) {
    yield put(
      globalActions.setSnackBar({
        message: i18next.t('global.apiResponseError'),
        severity: 'error',
      }),
    );
    trackException({
      exception: error,
      properties: {
        name: ExceptionType.APIRequestError,
        functionName: 'postAddScenarioData',
        area: 'src/store/redux-store/margin-tool/marginTool.saga.ts',
      },
    });
  }
}

export function* updateScenarioData(action: PayloadAction<IAddScenarioRequestPayload>) {
  try {
    yield put(scenarioActions.setScenarioCreateUpdateResponse(null));
    yield put(globalActions.closeBanner());
    const marginToolService: MarginToolService = yield getContext('marginToolService');
    const response = yield call(TrackUpsetScenarioData, marginToolService.upsertScenarioDetails, action.payload);
    const scenarioResponse: IMarginUpdateResponse = response?.data;
    if (scenarioResponse) {
      scenarioResponse.target = IMarginUpdateResponseErrorTargetTypes.Model;
    }
    yield put(scenarioActions.setScenarioCreateUpdateResponse(scenarioResponse));
    if (httpSuccess(response.status)) {
      //http 200
      if (!scenarioResponse?.inError) {
        //no error
        yield put(
          globalActions.setSnackBar({
            message: scenarioResponse?.message,
            severity: 'success',
          }),
        );
        yield put(
          scenarioActions.getMarginToolDetails({
            placementId: Number(action.payload.placementId),
            isDataUpdateFlow: true,
          }),
        );
        yield put(
          scenarioActions.setScenarioModal({
            modalName: '',
            modalStatus: false,
          }),
        );

        yield put(scenarioActions.setAddScenarioData(null));
        yield put(scenarioActions.setAddExtentionData(null));
        yield put(scenarioActions.setDeletedScenarioSplits([]));
      } else {
        if (scenarioResponse?.errorType === IMarginUpdateResponseErrorTypes.BaseDetailsModifiedError) {
          yield put(scenarioActions.setIsOrderIdModifiedStatus(true));
          yield put(scenarioActions.setShowOrderIdModifiedDialogStatus(true));
        } else if (
          scenarioResponse?.errorType === IMarginUpdateResponseErrorTypes.Generic ||
          scenarioResponse?.errorType === IMarginUpdateResponseErrorTypes.ScenarioNameError
        ) {
          yield put(
            globalActions.setSnackBar({
              message: scenarioResponse?.message,
              severity: 'error',
            }),
          );
        }
      }
    } else {
      //http 400+
      yield put(
        globalActions.setSnackBar({
          message: i18next.t('common.failedLoad'),
          severity: 'error',
        }),
      );
    }
  } catch (error) {
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
        functionName: 'updateScenarioData',
        area: 'src/store/redux-store/margin-tool/marginTool.saga.ts',
      },
    });
  }
}

export function* deleteSingleScenario(action: PayloadAction<IDeleteScenarioDetailsPayload>) {
  try {
    yield put(scenarioActions.setScenarioCreateUpdateResponse(null));
    yield put(globalActions.closeBanner());
    const marginToolService: MarginToolService = yield getContext('marginToolService');
    const response = yield call(marginToolService.deleteSingleScenario, action.payload);
    const scenarioResponse: IMarginUpdateResponse = response?.data;
    if (scenarioResponse) {
      scenarioResponse.target = IMarginUpdateResponseErrorTargetTypes.View;
    }
    yield put(scenarioActions.setScenarioCreateUpdateResponse(scenarioResponse));
    if (httpSuccess(response.status)) {
      if (!scenarioResponse?.inError) {
        yield put(
          globalActions.setSnackBar({
            message: scenarioResponse?.message,
            severity: 'success',
          }),
        );
        // Fetch the updated margin tool details after successful deletion
        const selectedScenario = yield select(selectSelectedScenario);
        const treeViewData = yield select(selectMarginToolDetailsData);
        const { scenarioId } = selectedScenario;

        const updatedTreeViewData = treeViewData.map(bookingPeriod => {
          if (bookingPeriod.bookingPeriodId === selectedScenario.bookingPeriodId) {
            // Filter out the scenario with the specified scenarioId
            const updatedScenarios = bookingPeriod.scenarios.filter(scenario => scenario.scenarioId !== scenarioId);

            // If no scenarios are left, set bookingPeriodId to null
            if (updatedScenarios.length === 0) {
              return {
                ...bookingPeriod,
                bookingPeriodId: null,
                scenarios: [], // Ensure scenarios is an empty array
              };
            }

            // Otherwise, return the booking period with the updated scenarios
            return {
              ...bookingPeriod,
              scenarios: updatedScenarios,
            };
          }

          // Return the booking period as-is if bookingPeriodId does not match
          return bookingPeriod;
        });

        yield put(scenarioActions.setMarginDetailResponse(updatedTreeViewData));

        //yield call({ type: 'fetchMarginToolDetails', payload: { placementId: selectedScenario.placementId } });
        yield put(scenarioActions.getMarginToolDetails({ placementId: selectedScenario.placementId }));
        /*const treeData = yield select(selectTreeViewData);
        const updatedTreeData = getUpdatedTreeData(action.payload.scenarioId, treeData);
        //yield put(scenarioActions.setScenarioTreeData(updatedTreeData));
        yield put(scenarioActions.setMarginDetailResponse(updatedTreeData));
        if (!updatedTreeData?.length) {
          yield put(scenarioActions.setScenario(null));
          yield put(scenarioActions.setBookingPeriod(null));
        }*/
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
          yield put(
            globalActions.setSnackBar({
              message: scenarioResponse?.message || i18next.t('common.failedLoad'),
              severity: 'error',
            }),
          );
        }
      }
    } else {
      yield put(
        globalActions.setSnackBar({
          message: i18next.t('common.failedLoad'),
          severity: 'error',
        }),
      );
    }
  } catch (error) {
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
        functionName: 'deleteSingleScenario',
        area: 'src/store/redux-store/margin-tool/marginTool.saga.ts',
      },
    });
  }
}

export function* cleanMarginToolDetails(action: PayloadAction<IDeleteMarginToolDetailsPayload>) {
  try {
    yield put(scenarioActions.setScenarioCreateUpdateResponse(null));
    yield put(globalActions.closeBanner());
    const marginToolService: MarginToolService = yield getContext('marginToolService');
    const response = yield call(marginToolService.deleteMarginDetails, action.payload);
    if (httpSuccess(response.status)) {
      if (response?.data) {
        yield put(scenarioActions.setShowOrderIdModifiedDialogStatus(false));
        yield put(scenarioActions.reset());
        yield put(scenarioActions.getShiftDetails());
        yield put(scenarioActions.getMarginToolDetails({ placementId: action.payload.placementId }));
        yield put(
          globalActions.setSnackBar({
            message: i18next.t('marginTool.orderIdModifiedConfirmation.commonSucessMessage'),
            severity: 'success',
          }),
        );
      } else {
        yield put(
          globalActions.setSnackBar({
            message: i18next.t('marginTool.orderIdModifiedConfirmation.commonErrorMessage'),
            severity: 'error',
          }),
        );
      }
    } else if (httpClientError(response.status)) {
      yield put(
        globalActions.setSnackBar({
          message: response?.data || i18next.t('global.apiResponseError'),
          severity: 'error',
        }),
      );
    } else {
      yield put(
        globalActions.setSnackBar({
          message: i18next.t('global.apiResponseError'),
          severity: 'error',
        }),
      );
      throw new Error(i18next.t('global.apiResponseError'));
    }
  } catch (error) {
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
        functionName: 'deleteSingleScenario',
        area: 'src/store/redux-store/margin-tool/marginTool.saga.ts',
      },
    });
  }
}

/**
 * Method to get GSA values for a selected margin detail and selected scenario booking period
 */
export function* getGSAcalculatedValues(action: PayloadAction<GetGSAcalculatedValuesPayload>) {
  try {
    yield put(scenarioActions.setScenarioCreateUpdateResponse(null));
    yield put(globalActions.closeBanner());

    const marginToolService: MarginToolService = yield getContext('marginToolService');
    const currentUser = yield select(selectUser);
    const marginDetails = yield select(selectMarginToolDetailsData);
    const selectedScenario = yield select(selectSelectedScenario);
    if (marginDetails?.length && selectedScenario?.bookingPeriodId > 0) {
      const selectedMarginDetail = findMarginDetailByBookingPeriodId(marginDetails, selectedScenario.bookingPeriodId);
      if (selectedMarginDetail) {
        const { autoSave = false } = action.payload;
        const requestPayload = {
          bookingPeriodId: selectedMarginDetail.bookingPeriodId,
          facilityId: selectedMarginDetail?.facility?.facilityId,
          startDate: selectedMarginDetail?.bookingPeriodStartDate,
          endDate: selectedMarginDetail?.bookingPeriodEndDate,
          userId: currentUser?.userInfo?.employeeId,
          autoSave,
        };
        const response = yield call(
          TrackScenarioGSACalculateData,
          marginToolService.getGSAcalculatedValues,
          requestPayload,
        );
        yield put(scenarioActions.setGSAcalculatedValues(httpSuccess(response?.status) ? response?.data : null));
      }
    }
  } catch (error) {
    trackException({
      exception: error,
      properties: {
        name: ExceptionType.APIRequestError,
        functionName: 'getGSAcalculatedValues',
        area: 'src/store/redux-store/margin-tool/marginTool.saga.ts',
      },
    });
  }
}

/**
 * MarginTool Save Scenario Saga - Save button from the footer
 */
export function* postMarginToolSaveData(
  action: PayloadAction<{
    formData: IAssignmentForm;
    loadDetails: boolean | true;
    isApprovalFlow?: boolean | false;
    resolve?: Function;
    reject?: Function;
  }>,
) {
  try {
    manuallyIncrementPromiseCounter(PromiseTrackerKeys.marginTool.saveScenario);
    // Clear previous response state
    yield put(scenarioActions.setScenarioCreateUpdateResponse(null));
    yield put(globalActions.closeBanner());

    // Get services and state
    const marginToolService: MarginToolService = yield getContext('marginToolService');
    const assignmentForm = action.payload.formData;
    const loadDetails = action.payload.loadDetails;
    const isApprovalFlow = action.payload.isApprovalFlow ?? false;
    const currentUser = yield select(selectUser);
    const selectedScenario = yield select(selectSelectedScenario);
    const editTimeOffs = yield select(selectEditTimeOffs);
    const timeOffs = getFormattedTimeOff(editTimeOffs);

    // Create payload
    const transformedPayload = createPayloadMarginTool(
      assignmentForm,
      selectedScenario,
      currentUser,
      selectedScenario?.timestamp,
      timeOffs,
      isApprovalFlow,
    );

    // Call the API
    const response = yield call(marginToolService.postMarginToolSave, transformedPayload);
    const scenarioResponse: IMarginUpdateResponse = response?.data;

    // Set additional fields if needed
    if (scenarioResponse) {
      scenarioResponse.target = IMarginUpdateResponseErrorTargetTypes.View;
    }

    // Update the state with the response
    yield put(scenarioActions.setScenarioCreateUpdateResponse(scenarioResponse));

    // Handle success and error
    if (httpSuccess(response.status)) {
      if (!scenarioResponse?.inError) {
        yield put(
          globalActions.setSnackBar({
            message: scenarioResponse?.message,
            severity: 'success',
          }),
        );

        if (loadDetails) {
          // Fetch updated margin tool details if needed
          yield call(fetchMarginToolDetails, {
            payload: {
              placementId: Number(selectedScenario?.placementId),
              isDataUpdateFlow: false,
            },
            type: scenarioActions.getMarginToolDetails.type,
          });
        }

        // Resolve the promise if it exists
        if (action.payload.resolve) {
          manuallyDecrementPromiseCounter(PromiseTrackerKeys.marginTool.saveScenario);
          action.payload.resolve({ data: scenarioResponse });
        }
      } else if (scenarioResponse?.errorType === IMarginUpdateResponseErrorTypes.BaseDetailsModifiedError) {
        yield put(scenarioActions.setIsOrderIdModifiedStatus(true));
        yield put(scenarioActions.setShowOrderIdModifiedDialogStatus(true));
      } else if (
        scenarioResponse?.errorType === IMarginUpdateResponseErrorTypes.TimeStampError ||
        scenarioResponse?.errorType === IMarginUpdateResponseErrorTypes.PerDiemError
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
        } else if (scenarioResponse?.errorType === IMarginUpdateResponseErrorTypes.PerDiemError) {
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

      // Reject the promise if it exists
      if (action.payload.reject) {
        manuallyDecrementPromiseCounter(PromiseTrackerKeys.marginTool.saveScenario);
        action.payload.reject({ error: scenarioResponse });
      }
    } else {
      manuallyDecrementPromiseCounter(PromiseTrackerKeys.marginTool.saveScenario);
      // Handle HTTP response errors
      yield put(
        globalActions.setSnackBar({
          message: i18next.t('common.failedLoad'),
          severity: 'error',
        }),
      );

      // Reject the promise if it exists
      if (action.payload.reject) {
        action.payload.reject({ error: 'HTTP error' });
      }
    }
    manuallyDecrementPromiseCounter(PromiseTrackerKeys.marginTool.saveScenario);
    yield put(scenarioActions.setSaveTriggeredStatus(false));
    yield put(scenarioActions.setCancelTriggeredStatus(false));
  } catch (error) {
    yield put(scenarioActions.setSaveTriggeredStatus(false));
    yield put(scenarioActions.setCancelTriggeredStatus(false));
    manuallyDecrementPromiseCounter(PromiseTrackerKeys.marginTool.saveScenario);
    // Handle unexpected errors
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
        functionName: 'postMarginToolSaveData',
        area: 'src/store/redux-store/margin-tool/marginTool.saga.ts',
      },
    });

    // Reject the promise if it exists
    if (action.payload.reject) {
      action.payload.reject({ error });
    }
  }
}

export function* postMarginToolDetailsValidate(
  action: PayloadAction<{
    formData: IAssignmentForm;
    resolve?: Function;
    reject?: Function;
  }>,
) {
  try {
    manuallyIncrementPromiseCounter(PromiseTrackerKeys.marginTool.validateScenario);
    // Clear previous response state
    yield put(scenarioActions.setScenarioCreateUpdateResponse(null));
    yield put(globalActions.closeBanner());

    // Get services and state
    const marginToolService: MarginToolService = yield getContext('marginToolService');
    const assignmentForm = action.payload.formData;
    const isApprovalFlow = true;
    const currentUser = yield select(selectUser);
    const selectedScenario = yield select(selectSelectedScenario);
    const editTimeOffs = yield select(selectEditTimeOffs);
    const timeOffs = getFormattedTimeOff(editTimeOffs);

    // Create payload
    const transformedPayload = createPayloadMarginTool(
      assignmentForm,
      selectedScenario,
      currentUser,
      selectedScenario?.timestamp,
      timeOffs,
      isApprovalFlow,
    );

    // Call the API
    const response = yield call(marginToolService.postMarginToolValidate, transformedPayload);
    const scenarioResponse: IMarginUpdateResponse = response?.data;

    // Set additional fields if needed
    if (scenarioResponse) {
      scenarioResponse.target = IMarginUpdateResponseErrorTargetTypes.View;
    }

    // Update the state with the response
    yield put(scenarioActions.setScenarioCreateUpdateResponse(scenarioResponse));

    // Handle success and error
    if (httpSuccess(response.status)) {
      if (!scenarioResponse?.inError) {
        // Resolve the promise if it exists
        if (action.payload.resolve) {
          manuallyDecrementPromiseCounter(PromiseTrackerKeys.marginTool.validateScenario);
          action.payload.resolve({ data: scenarioResponse });
        }
      } else if (scenarioResponse?.errorType === IMarginUpdateResponseErrorTypes.BaseDetailsModifiedError) {
        yield put(scenarioActions.setIsOrderIdModifiedStatus(true));
        yield put(scenarioActions.setShowOrderIdModifiedDialogStatus(true));
      } else if (
        scenarioResponse?.errorType === IMarginUpdateResponseErrorTypes.TimeStampError ||
        scenarioResponse?.errorType === IMarginUpdateResponseErrorTypes.PerDiemError
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
        } else if (scenarioResponse?.errorType === IMarginUpdateResponseErrorTypes.PerDiemError) {
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

      // Reject the promise if it exists
      if (action.payload.reject) {
        manuallyDecrementPromiseCounter(PromiseTrackerKeys.marginTool.validateScenario);
        action.payload.reject({ error: scenarioResponse });
      }
    } else {
      manuallyDecrementPromiseCounter(PromiseTrackerKeys.marginTool.validateScenario);
      // Handle HTTP response errors
      yield put(
        globalActions.setSnackBar({
          message: i18next.t('common.failedLoad'),
          severity: 'error',
        }),
      );

      // Reject the promise if it exists
      if (action.payload.reject) {
        action.payload.reject({ error: 'HTTP error' });
      }
    }
    manuallyDecrementPromiseCounter(PromiseTrackerKeys.marginTool.validateScenario);
  } catch (error) {
    manuallyDecrementPromiseCounter(PromiseTrackerKeys.marginTool.validateScenario);
    // Handle unexpected errors
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
        functionName: 'postMarginToolDetailsValidate',
        area: 'src/store/redux-store/margin-tool/marginTool.saga.ts',
      },
    });

    // Reject the promise if it exists
    if (action.payload.reject) {
      action.payload.reject({ error });
    }
  }
}

export function* scenarioSaga() {
  yield takeLatest(scenarioActions.getAddScenarioDetails, requestAddScenarioModalDetails);
  yield takeLatest(scenarioActions.getAddExtensionDetails, requestAddExtensionModalDetails);
  yield takeLatest(scenarioActions.getMarginToolDetails, fetchMarginToolDetails);
  yield takeLatest(scenarioActions.getShiftDetails, fetchShiftData);
  yield takeLatest(scenarioActions.postAddScenarioDetails, postAddScenarioData);
  yield takeLatest(scenarioActions.postEditScenarioDetails, updateScenarioData);
  yield takeLatest(scenarioActions.postMarginToolDetails, postMarginToolSaveData);
  yield takeLatest(scenarioActions.postMarginToolDetailsValidate, postMarginToolDetailsValidate);
  yield takeLatest(scenarioActions.deleteSingleScenario, deleteSingleScenario);
  yield takeLatest(scenarioActions.getGSAcalculatedValues, getGSAcalculatedValues);
  yield takeLatest(scenarioActions.cleanMarginToolDetails, cleanMarginToolDetails);
  yield takeLatest(scenarioActions.openMarginToolEditDetails, openMarginToolEditDetails);
}
