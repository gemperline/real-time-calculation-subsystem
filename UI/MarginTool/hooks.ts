import { debounce } from 'amn-ui-core';
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { assignmentActions } from 'store/redux-store/margin-tool/slices/assignment/assignment.redux';
import { usePeopleSoftCalculation } from './Components/PeopleSoftCalculation/IPeopleSoftCalculationHelper';
import {
  selectMarginToolDetailsData,
  selectTreeViewSelectedBookingPeriod,
} from 'store/redux-store/margin-tool/slices/add-edit-scenario/add-edit-scenario.selector';
import { PackageType } from './enum';

/**
 *  Get the base/initial margin tool data
 *  initiateRefreshCall function to call the initial margin details data
 * @returns initiateRefreshCall function to call the initial margin details data
 */
export const useInitialMarginDetails = () => {
  const dispatch = useDispatch();

  // Method to call the initial margin details data
  const initiateRefreshCall = () => {
    dispatch(assignmentActions.getInitialMarginToolsData());
  };
  // Return the function so it can be used outside
  return { initiateRefreshCall };
};

/**
 *  Debounced function to trigger the people soft calculation
 *  delay the function call by 300ms - adjust the delay as needed
 *  @returns debounced function
 */
export const useDebouncedTriggerCalculation = () => {
  const { triggerPeopleSoftCalculation } = usePeopleSoftCalculation();

  // Create a debounced function and return it
  const debouncedTriggerPeopleSoftCalculation = useCallback(
    debounce(() => {
      triggerPeopleSoftCalculation();
    }, 300),
    [triggerPeopleSoftCalculation],
  );

  return { debouncedTriggerPeopleSoftCalculation };
};

/**
 * Method to determine whether the current scenario is an assignment scenario or extension scenario
 * - Scenario is considered an assignment scenario if the booking period is of type Assignment
 * - Scenario is considered an extension scenario if the booking period is of type Extension
 * @returns isFromAssignmentBookingPeriod flag
 */
export const useIsAssignmentScenario = () => {
  const treeViewData = useSelector(selectMarginToolDetailsData);
  const treeViewSelectedBookingPeriod = useSelector(selectTreeViewSelectedBookingPeriod);
  const selectedBookingPeriodTemp =
    treeViewData?.length > 0 && treeViewSelectedBookingPeriod?.bookingPeriodId > 0
      ? treeViewData?.find(x => x.bookingPeriodId === treeViewSelectedBookingPeriod?.bookingPeriodId)
      : null;
  const isFromAssignmentBookingPeriod =
    treeViewData?.length > 0 && treeViewSelectedBookingPeriod?.bookingPeriodId > 0
      ? selectedBookingPeriodTemp?.packageName === PackageType.Assignment
      : true;
  return { isFromAssignmentBookingPeriod };
};
