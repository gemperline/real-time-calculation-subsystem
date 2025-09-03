import { expectSaga } from 'redux-saga-test-plan';
import { call, getContext } from 'redux-saga/effects';
import {
  deleteSingleScenario,
  fetchMarginToolDetails,
  fetchShiftData,
  postAddScenarioData,
  requestAddExtensionModalDetails,
  requestAddScenarioModalDetails,
  scenarioSaga,
} from '../add-edit-scenario.saga';
import { scenarioActions } from '../add-edit-scenario.redux';
import { globalActions } from '../../../../../../app/ApplicationRoot/Global.redux';
import i18next from 'i18next';
import { throwError } from 'redux-saga-test-plan/providers';
import { marginDetailsTestData } from './mock-data/MarginDetails';
import { formatTypeAheadOptions } from '../../../helper';
import { MarginDetailsResponse } from '../add-edit-scenario.model';

const mockTrackExceptionEvent = jest.fn();

jest.mock('app-insights/appInsightsTracking', () => {
  return {
    trackException: (obj: any) => {
      mockTrackExceptionEvent();
    },
  };
});
describe('add-edit-scenario.saga', () => {
  it('should run scenario saga', () => {
    return expectSaga(scenarioSaga).run();
  });

  it('should request add scenario modal details', () => {
    const action = {
      payload: {
        placementId: 3,
        isExtensionFlow: false, // or true, depending on your test case
      },
      type: scenarioActions.getAddScenarioDetails.type,
    };
    const response = {
      status: 200,
      data: {
        placementId: 12345,
        placementActivityTypeId: 6789,
        placementStatusId: 3,
        placementStatus: 'Active',
        isInExtension: true,
        extensionStatusId: 2,
        extensionStatus: 'Extended',
        startDate: '2024-10-01',
        endDate: '2025-03-31',
        duration: 182,
        tla: true,
        shiftId: 1,
        shiftDescription: 'Day Shift',
        placementStartDate: '2024-10-01',
        placementEndDate: '2025-03-31',
        placementDuration: 182,
        scenarioName: 'Scenario A',
        notes: 'This is a test scenario for placement extension.',
      },
    };
    const marginToolService = {
      getMarginToolAddScenarioDetailsData: jest.fn().mockResolvedValue(response),
    };

    return expectSaga(requestAddScenarioModalDetails, action)
      .provide([
        [getContext('marginToolService'), marginToolService],
        [call(marginToolService.getMarginToolAddScenarioDetailsData, action.payload.placementId), response],
      ])

      .put(scenarioActions.setAddScenarioData(response.data))
      .run();
  });

  it('should not set data when http status is 500', () => {
    const action = {
      payload: {
        placementId: 3,
        isExtensionFlow: false, // or true, depending on your test case
      },
      type: scenarioActions.getAddScenarioDetails.type,
    };
    const response = {
      status: 500,
      data: {},
    };
    const marginToolService = {
      getMarginToolAddScenarioDetailsData: jest.fn().mockResolvedValue(response),
    };

    return expectSaga(requestAddScenarioModalDetails, action)
      .provide([
        [getContext('marginToolService'), marginToolService],
        [call(marginToolService.getMarginToolAddScenarioDetailsData, action.payload.placementId), response],
      ])
      .run();
  });

  it('should handle errors when the request add scenario API fails', () => {
    const action = {
      payload: {
        placementId: 3,
        isExtensionFlow: false, // or true, depending on your test case
      },
      type: scenarioActions.getAddScenarioDetails.type,
    };
    // Mock the service to throw an error
    const marginToolService = {
      getMarginToolAddScenarioDetailsData: jest.fn().mockRejectedValue(new Error('Request failed')),
    };

    return expectSaga(requestAddScenarioModalDetails, action)
      .provide([
        [getContext('marginToolService'), marginToolService],
        [
          call(marginToolService.getMarginToolAddScenarioDetailsData, action.payload.placementId),
          throwError(new Error('Request failed')),
        ],
      ])
      .run()
      .then(() => {
        expect(mockTrackExceptionEvent).toHaveBeenCalled();
      });
  });

  it('should fetch shift lookup data', () => {
    const shiftTestData = [
      {
        object: {
          shiftId: 1,
          shiftDescription: 'Day Shift',
          startTime: '08:00',
          endTime: '16:00',
          duration: 8,
        },
        label: 'Day Shift (08:00 - 16:00)',
      },
      {
        object: {
          shiftId: 2,
          shiftDescription: 'Night Shift',
          startTime: '20:00',
          endTime: '04:00',
          duration: 8,
        },
        label: 'Night Shift (20:00 - 04:00)',
      },
    ];
    const response = {
      status: 200,
      data: shiftTestData,
    };
    const marginToolService = {
      getShiftData: jest.fn().mockResolvedValue(response),
    };

    return expectSaga(fetchShiftData)
      .provide([
        [getContext('marginToolService'), marginToolService],
        [call(marginToolService.getShiftData), response],
      ])

      .put(scenarioActions.setShiftDetailsData(formatTypeAheadOptions(response.data)))
      .run();
  });

  it('should not set data to store when status code is 500 for shifts', () => {
    const response = {
      status: 500,
      data: [],
    };
    const marginToolService = {
      getShiftData: jest.fn().mockResolvedValue(response),
    };

    return expectSaga(fetchShiftData)
      .provide([
        [getContext('marginToolService'), marginToolService],
        [call(marginToolService.getShiftData), response],
      ])
      .run();
  });

  it('should handle errors when the request shift details fails', () => {
    // Mock the service to throw an error
    const marginToolService = {
      getShiftData: jest.fn().mockRejectedValue(new Error('Request failed')),
    };

    return expectSaga(fetchShiftData)
      .provide([
        [getContext('marginToolService'), marginToolService],
        [call(marginToolService.getShiftData), throwError(new Error('Request failed'))],
      ])
      .run()
      .then(() => {
        expect(mockTrackExceptionEvent).toHaveBeenCalled();
      });
  });

  it('should get margin tool details from API', () => {
    const action = {
      payload: {
        placementId: 3,
      },
      type: scenarioActions.getMarginToolDetails.type,
    };
    const response = {
      status: 200,
      data: marginDetailsTestData,
    };
    const marginToolService = {
      getMarginToolDetails: jest.fn().mockResolvedValue(response),
    };

    return expectSaga(fetchMarginToolDetails, action)
      .provide([
        [getContext('marginToolService'), marginToolService],
        [call(marginToolService.getMarginToolDetails, action.payload.placementId), response],
      ])

      .put(scenarioActions.setMarginDetailResponse(response.data as MarginDetailsResponse[]))
      .run();
  });

  it('should not set data when margin detail API status code is 400', () => {
    const action = {
      payload: {
        placementId: 3,
      },
      type: scenarioActions.getMarginToolDetails.type,
    };
    const response = {
      status: 400,
      data: marginDetailsTestData,
    };
    const marginToolService = {
      getMarginToolDetails: jest.fn().mockResolvedValue(response),
    };

    return expectSaga(fetchMarginToolDetails, action)
      .provide([
        [getContext('marginToolService'), marginToolService],
        [call(marginToolService.getMarginToolDetails, action.payload.placementId), response],
      ])
      .run();
  });

  it('should handle errors when the request shift details fails', () => {
    const action = {
      payload: {
        placementId: 3,
      },
      type: scenarioActions.getMarginToolDetails.type,
    };
    // Mock the service to throw an error
    const marginToolService = {
      getMarginToolDetails: jest.fn().mockRejectedValue(new Error('Request failed')),
    };

    return expectSaga(fetchMarginToolDetails, action)
      .provide([
        [getContext('marginToolService'), marginToolService],
        [call(marginToolService.getMarginToolDetails), throwError(new Error('Request failed'))],
      ])
      .run()
      .then(() => {
        expect(mockTrackExceptionEvent).toHaveBeenCalled();
      });
  });

  it('should post add scenario data when the save button is clicked for add extension', () => {
    const action = {
      payload: {
        placementId: 12345,
        startDate: '2024-10-01',
        endDate: '2025-03-31',
        duration: 182,
        extension: true,
        extensionNumber: 2,
        extensionOfPriorPlacementID: '54321',
        scenarioName: 'Scenario Alpha',
        notes: 'This scenario is for a placement extension.',
        tla: true,
        userId: 7890,
        scenarioSplitItemList: [
          {
            startDate: '2024-10-01',
            endDate: '2024-12-31',
            shiftID: 1,
            hoursPerWeek: 40,
            hoursPerShift: 8,
          },
          {
            startDate: '2025-01-01',
            endDate: '2025-03-31',
            shiftID: 2,
            hoursPerWeek: 36,
            hoursPerShift: 12,
          },
        ],
      },
      type: scenarioActions.postAddScenarioDetails.type,
    };
    const response = {
      status: 200,
      data: 1,
    };
    const marginToolService = {
      postAddScenarioModal: jest.fn().mockResolvedValue(response),
    };

    return expectSaga(postAddScenarioData, action)
      .provide([
        [getContext('marginToolService'), marginToolService],
        [call(marginToolService.postAddScenarioModal), response],
      ])
      .put(scenarioActions.setScenarioCreateUpdateResponse(response.data))
      .run();
  });

  it('should post add scenario data when the save button is clicked for add scenario', () => {
    const action = {
      payload: {
        placementId: 12345,
        startDate: '2024-10-01',
        endDate: '2025-03-31',
        duration: 182,
        extension: false,
        extensionNumber: 2,
        extensionOfPriorPlacementID: '54321',
        scenarioName: 'Scenario Alpha',
        notes: 'This scenario is for a placement extension.',
        tla: true,
        userId: 7890,
        scenarioSplitItemList: [
          {
            startDate: '2024-10-01',
            endDate: '2024-12-31',
            shiftID: 1,
            hoursPerWeek: 40,
            hoursPerShift: 8,
          },
          {
            startDate: '2025-01-01',
            endDate: '2025-03-31',
            shiftID: 2,
            hoursPerWeek: 36,
            hoursPerShift: 12,
          },
        ],
      },
      type: scenarioActions.postAddScenarioDetails.type,
    };
    const response = {
      status: 200,
      data: {
        inError: false,
        message: 'Scenario added successfully',
      },
    };
    const marginToolService = {
      postAddScenarioModal: jest.fn().mockResolvedValue(response),
    };

    return (
      expectSaga(postAddScenarioData, action)
        .provide([
          [getContext('marginToolService'), marginToolService],
          [call(marginToolService.postAddScenarioModal, action.payload), response],
        ])
        .put(scenarioActions.setScenarioCreateUpdateResponse(response.data))
        .put(
          globalActions.setSnackBar({
            message: response.data.message,
            severity: 'success',
          }),
        )
        .put(scenarioActions.getMarginToolDetails({ placementId: action.payload.placementId, isDataUpdateFlow: true }))
        .put(scenarioActions.setScenarioModal({ modalName: '', modalStatus: false }))
        .run()
    );
  });

  it('should throw error when the save button is clicked for extension', () => {
    const action = {
      payload: {
        placementId: 12345,
        startDate: '2024-10-01',
        endDate: '2025-03-31',
        duration: 182,
        extension: true,
        extensionNumber: 2,
        extensionOfPriorPlacementID: '54321',
        scenarioName: 'Scenario Alpha',
        notes: 'This scenario is for a placement extension.',
        tla: true,
        userId: 7890,
        scenarioSplitItemList: [
          {
            startDate: '2024-10-01',
            endDate: '2024-12-31',
            shiftID: 1,
            hoursPerWeek: 40,
            hoursPerShift: 8,
          },
          {
            startDate: '2025-01-01',
            endDate: '2025-03-31',
            shiftID: 2,
            hoursPerWeek: 36,
            hoursPerShift: 12,
          },
        ],
      },
      type: scenarioActions.postAddScenarioDetails.type,
    };
    const response = {
      status: 400,
      data: 1,
    };
    const marginToolService = {
      postAddScenarioModal: jest.fn().mockRejectedValue(new Error('Request failed')),
    };

    return expectSaga(postAddScenarioData, action)
      .provide([
        [getContext('marginToolService'), marginToolService],
        [call(marginToolService.postAddScenarioModal), response],
      ])
      .run();
  });

  it('should post add scenario data when the save button is clicked for add scenario', () => {
    const action = {
      payload: {
        placementId: 12345,
        startDate: '2024-10-01',
        endDate: '2025-03-31',
        duration: 182,
        extension: false,
        extensionNumber: 2,
        extensionOfPriorPlacementID: '54321',
        scenarioName: 'Scenario Alpha',
        notes: 'This scenario is for a placement extension.',
        tla: true,
        userId: 7890,
        scenarioSplitItemList: [
          {
            startDate: '2024-10-01',
            endDate: '2024-12-31',
            shiftID: 1,
            hoursPerWeek: 40,
            hoursPerShift: 8,
          },
          {
            startDate: '2025-01-01',
            endDate: '2025-03-31',
            shiftID: 2,
            hoursPerWeek: 36,
            hoursPerShift: 12,
          },
        ],
      },
      type: scenarioActions.postAddScenarioDetails.type,
    };
    const response = {
      status: 400,
      data: 1,
    };
    const marginToolService = {
      postAddScenarioModal: jest.fn().mockResolvedValue(response),
    };

    return expectSaga(postAddScenarioData, action)
    .provide([
      [getContext('marginToolService'), marginToolService],
      [call(marginToolService.postAddScenarioModal, action.payload), response],
    ])
    .put(
      globalActions.setSnackBar({
        message: 'Oops, something went wrong. Please try again',
        severity: 'error',
      }),
    )
    .run();
  });

  it('should get add extension details', () => {
    const action = {
      payload: {
        placementId: 12345,
      },
      type: scenarioActions.getAddExtensionDetails.type,
    };
    const response = {
      status: 200,
      data: {
        placementId: 101,
        placementActivityTypeId: 202,
        placementStatusId: 1,
        placementStatus: 'Active',
        isInExtension: true,
        extensionName: 'Scenario Extension Test',
        extensionStatusId: 3,
        extensionStatus: 'Approved',
        startDate: '2024-10-01',
        endDate: '2025-03-31',
        duration: 182,
        shiftId: 5,
        shiftDescription: 'Night Shift',
        isExtensionFromPriorPlacementId: true as true, // Must be `true` as a literal type
        extensionOfPriorPlacementId: 303,
        tla: true,
        placementStartDate: null,
        placementEndDate: null,
        placementDuration: 90,
        hoursPerShift: 12,
        hoursPerWeek: 36,
        notes: 'This extension is for an ongoing assignment with adjusted hours.',
      },
    };
    const marginToolService = {
      getMarginToolAddExtentionDetailsData: jest.fn().mockResolvedValue(response),
    };

    return expectSaga(requestAddExtensionModalDetails, action)
      .provide([
        [getContext('marginToolService'), marginToolService],
        [call(marginToolService.getMarginToolAddExtentionDetailsData), response],
      ])
      .put(scenarioActions.setAddExtentionData(response.data))
      .run();
  });

  it('should not set add extension details to store when API is returning 400', () => {
    const action = {
      payload: {
        placementId: 12345,
      },
      type: scenarioActions.getAddExtensionDetails.type,
    };
    const response = {
      status: 400,
      data: {},
    };
    const marginToolService = {
      getMarginToolAddExtentionDetailsData: jest.fn().mockResolvedValue(response),
    };

    return expectSaga(requestAddExtensionModalDetails, action)
      .provide([
        [getContext('marginToolService'), marginToolService],
        [call(marginToolService.getMarginToolAddExtentionDetailsData), response],
      ])
      .run();
  });

  it('should throw error when get add extension details API fails', () => {
    const action = {
      payload: {
        placementId: 12345,
      },
      type: scenarioActions.getAddExtensionDetails.type,
    };
    const marginToolService = {
      getMarginToolAddExtentionDetailsData: jest.fn().mockRejectedValue(new Error('Request failed')),
    };

    return expectSaga(requestAddExtensionModalDetails, action)
      .provide([
        [getContext('marginToolService'), marginToolService],
        [call(marginToolService.getMarginToolAddExtentionDetailsData), throwError(new Error('Request failed'))],
      ])
      .run();
  });

  it('should not set add extension details to store when API is returning 400', () => {
    const action = {
      payload: {
        placementId: 12345,
      },
      type: scenarioActions.getAddExtensionDetails.type,
    };
    const response = {
      status: 400,
      data: {},
    };
    const marginToolService = {
      getMarginToolAddExtentionDetailsData: jest.fn().mockResolvedValue(response),
    };

    return expectSaga(requestAddExtensionModalDetails, action)
      .provide([
        [getContext('marginToolService'), marginToolService],
        [call(marginToolService.getMarginToolAddExtentionDetailsData), response],
      ])
      .run();
  });

  it('should delete a single scenario when the delete button is clicked', () => {
    const action = {
      payload: {
        scenarioId: 12345,
      },
      type: scenarioActions.deleteSingleScenario.type,
    };
    const response = {
      status: 200,
      data: 1,
    };
    const marginToolService = {
      deleteSingleScenario: jest.fn().mockResolvedValue(response),
    };

    return expectSaga(deleteSingleScenario, action)
      .provide([
        [getContext('marginToolService'), marginToolService],
        [call(marginToolService.deleteSingleScenario), response],
      ])
      .put(
        globalActions.setSnackBar({
          message: i18next.t('marginTool.snackbar.deleteSuccess'),
          severity: 'success',
        }),
      )
      .run();
  });

  it('should show failure toast message when delete scenario failed', () => {
    const action = {
      payload: {
        scenarioId: 12345,
      },
      type: scenarioActions.deleteSingleScenario.type,
    };
    const response = {
      status: 500,
      data: 1,
    };
    const marginToolService = {
      deleteSingleScenario: jest.fn().mockResolvedValue(response),
    };

    return expectSaga(deleteSingleScenario, action)
      .provide([
        [getContext('marginToolService'), marginToolService],
        [call(marginToolService.deleteSingleScenario), response],
      ])
      .put(
        globalActions.setSnackBar({
          message: i18next.t('marginTool.snackbar.deleteFailure'),
          severity: 'error',
        }),
      )
      .run();
  });
});
