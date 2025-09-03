import { expectSaga } from 'redux-saga-test-plan';
import { assignmentSaga, getTreeViewLookupData } from '../assignment.saga';
import { call, getContext } from 'redux-saga/effects';
import { assignmentActions } from '../assignment.redux';

const mockTrackExceptionEvent = jest.fn();

jest.mock('app-insights/appInsightsTracking', () => {
  return {
    trackException: (obj: any) => {
      mockTrackExceptionEvent();
    },
  };
});
describe('should run assignment test', () => {
  it('should run assignment saga watcher function', () => {
    return expectSaga(assignmentSaga).run();
  });

  it('should get pick list data for tree view', () => {
    const action = {
      payload: {},
      type: assignmentActions.getTreeViewDataForPickList.type,
    };
    const response = {
      status: 200,
      data: [
        {
          category: 'Pay Rates',
          fields: [
            {
              field: 'Additional Premium Pay',
              items: [
                {
                  id: -1,
                  description: 'None',
                },
                {
                  id: 1,
                  description: '2.0000',
                },
                {
                  id: 2,
                  description: '2.5000',
                },
                {
                  id: 3,
                  description: '3.0000',
                },
              ],
            },
          ],
        },
      ],
    };
    const marginToolService = {
      getPicklistData: jest.fn().mockResolvedValue(response),
    };

    return expectSaga(getTreeViewLookupData)
      .provide([
        [getContext('marginToolService'), marginToolService],
        [call(marginToolService.getPicklistData), response],
      ])
      .put(assignmentActions.setTreeViewDataLookup(response.data))
      .run();
  });

  it('should not set data for pick list data for tree view when http status is 400', () => {
    const response = {
      status: 400,
      data: [],
    };
    const marginToolService = {
      getPickistData: jest.fn().mockResolvedValue(response),
    };

    return expectSaga(getTreeViewLookupData)
      .provide([
        [getContext('marginToolService'), marginToolService],
        [call(marginToolService.getPickistData), response],
      ])
      .run();
  });
});
