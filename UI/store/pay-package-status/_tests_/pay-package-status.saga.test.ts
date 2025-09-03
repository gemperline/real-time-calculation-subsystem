import { expectSaga } from 'redux-saga-test-plan';
import { call, getContext } from 'redux-saga/effects';
import { initiatePayPacketStatusTransition, initiateUpdatePayPackageStatus } from '../pay-package-status.saga';
import { payPackageStatusActions, payPackageStatusSliceReducer } from '../pay-package-status.redux';
import i18next from 'i18next';
import { IInitiatePayPacketStatusTransition, StatusTransitionModalType } from '../pay-package-status.model';
import { globalActions } from '../../../../../../app/ApplicationRoot/Global.redux';
import { throwError } from 'redux-saga-test-plan/providers';
import { scenarioActions } from '../../add-edit-scenario/add-edit-scenario.redux';
import { fetchMarginToolDetails } from '../../add-edit-scenario/add-edit-scenario.saga';

const mockTrackExceptionEvent = jest.fn();

jest.mock('app-insights/appInsightsTracking', () => {
  return {
    trackException: (obj: any) => {
      mockTrackExceptionEvent();
    },
  };
});

describe('pay-package-status.saga', () => {
  const payload: IInitiatePayPacketStatusTransition = {
    statusId: 1,
    type: StatusTransitionModalType.Approve,
    openModal: true,
  };
  describe('initiatePayPacketStatusTransition', () => {
    it('should handle successful status transition', () => {
      const action = {
        payload: payload,
        type: payPackageStatusActions.initiatePayPacketStatusTransition.type,
      };
      const response = { status: 200, data: [] };
      const marginToolService = {
        getlistofPayPackageStatus: jest.fn().mockResolvedValue(response),
      };

      return expectSaga(initiatePayPacketStatusTransition, action)
        .provide([
          [getContext('marginToolService'), marginToolService],
          [
            call(
              marginToolService.getlistofPayPackageStatus,
              action.payload.statusId,
              StatusTransitionModalType.Approve,
            ),
            response,
          ],
        ])
        .put(payPackageStatusActions.setPayPackageStatusTransitionModalDetails(action.payload))
        .put(payPackageStatusActions.setPayPackageStatusOptions(response.data))
        .run();
    });

    // it('should handle errors', () => {
    //   const action = {
    //     payload: payload,
    //     type: payPackageStatusActions.initiatePayPacketStatusTransition.type,
    //   };
    //   const error = new Error('Test error');

    //   return expectSaga(initiatePayPacketStatusTransition, action)
    //     .provide([
    //       [getContext('marginToolService'), {}],
    //       [
    //         call.fn(() => {
    //           throw error;
    //         }),
    //       ],
    //     ])
    //     .call(trackException, {
    //       exception: error,
    //       properties: {
    //         name: ExceptionType.APIRequestError,
    //         functionName: 'initiatePayPacketStatusTransition',
    //         area: 'src/store/redux-store/pay-package-status/pay-package-status.saga.ts',
    //       },
    //     })
    //     .run();
    // });
    it('should handle errors', async () => {
      //Arrange
      const action = {
        payload: payload,
        type: payPackageStatusActions.initiatePayPacketStatusTransition.type,
      };

      const sagaAction = expectSaga(initiatePayPacketStatusTransition, action)
        .provide([[getContext('marginToolService'), throwError(new Error('500'))]])
        .withReducer(payPackageStatusSliceReducer);

      //Act
      const result = await sagaAction.run();

      //Assert
      expect(mockTrackExceptionEvent).toHaveBeenCalled();
    });
  });

  describe('initiateUpdatePayPackageStatus', () => {
    it('should handle successful status update', () => {
      const action = {
        payload: {
          statusId: 1,
          bookingPeriodId: 2,
          placementId: 3,
          payPackageId: 4,
          userId: 5,
          openEmailModal: true,
        },
        type: payPackageStatusActions.updatePayPackageStatus.type,
      };
      const response = { status: 200 };
      const marginToolService = {
        updatePayPackageStatus: jest.fn().mockResolvedValue(response),
      };

      return expectSaga(initiateUpdatePayPackageStatus, action)
        .provide([
          [getContext('marginToolService'), marginToolService],
          [call(marginToolService.updatePayPackageStatus, expect.any(FormData)), response],
          [
            call(fetchMarginToolDetails, {
              payload: { placementId: action.payload.placementId },
              type: scenarioActions.getMarginToolDetails.type,
            }),
            undefined,
          ],
        ])
        .put(
          payPackageStatusActions.setPayPackageStatusTransitionModalDetails({
            openModal: false,
            type: StatusTransitionModalType.None,
          }),
        )
        .put(
          globalActions.setSnackBar({
            message: i18next.t('marginTool.payPackageStatus.message.statusUpdateSuccess'),
            severity: 'success',
          }),
        )
        .put(payPackageStatusActions.setRecentStatusUpdatedScenarioId(action.payload.payPackageId))
        .put(payPackageStatusActions.setStatusUpdatedEmailModalOpen(true))
        .run();
    });

    it('should handle errors', async () => {
      //Arrange
      const action = {
        payload: {
          statusId: 1,
          bookingPeriodId: 2,
          placementId: 3,
          payPackageId: 4,
          userId: 5,
          openEmailModal: true,
        },
        type: payPackageStatusActions.updatePayPackageStatus.type,
      };

      const sagaAction = expectSaga(initiateUpdatePayPackageStatus, action)
        .provide([[getContext('marginToolService'), throwError(new Error('500'))]])
        .withReducer(payPackageStatusSliceReducer);

      //Act
      const result = await sagaAction.run();

      //Assert
      expect(mockTrackExceptionEvent).toHaveBeenCalled();
    });
  });
});
