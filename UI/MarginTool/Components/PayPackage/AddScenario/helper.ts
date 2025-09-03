import { IUser } from 'oidc/user.redux';
import { IAddScenarioForm, IAddScenarioRequestPayload, IScenarioSplit, IScenarioSplitItem } from './model';
import { PayPackageOptions } from '@AMIEWEB/MarginTool/enum';
import {
  IAddScenario,
  MarginDetailsResponse,
  MarginDetailsResponseScenario,
} from 'store/redux-store/margin-tool/slices/add-edit-scenario/add-edit-scenario.model';
import { useSelector } from 'react-redux';
import { selectSelectedScenario } from 'store/redux-store/margin-tool/slices/add-edit-scenario/add-edit-scenario.selector';
import { selectUser } from 'oidc/user.selectors';
import { PayPackageStatus } from 'store/redux-store/margin-tool/slices/pay-package-status/pay-package-status.model';
import { isCandidateContractUser, userRoles } from 'oidc/userRoles';
import { initialMarginDetailResponseState } from 'store/redux-store/margin-tool/slices/add-edit-scenario/helper/MarginDetailResponseInitialState';
import { formatDateToStartOfDay } from 'app/helpers/dateHelper';

export const createRequestPayload = (
  placementId: number | string,
  formData: IAddScenarioForm,
  user: IUser,
  modalName?: string,
  marginToolDetails?: MarginDetailsResponse[],
  bookingPeriodId?: number | null,
  isExtensionFlow?: boolean | false,
): IAddScenarioRequestPayload => {
  return {
    placementId: placementId,
    bookingPeriodId: bookingPeriodId,
    startDate: formatDateToStartOfDay(formData?.startDate),
    endDate: formatDateToStartOfDay(formData?.endDate),
    duration: formData?.duration,
    isExtensionFlow: isExtensionFlow,
    extension: formData?.isInExtension,
    extensionNumber: modalName === PayPackageOptions.AddScenario ? 1 : calculateExtentionNumber(marginToolDetails),
    extensionOfPriorPlacementID: formData?.extensionOfPriorPlacementID ? formData?.extensionOfPriorPlacementID : null,
    scenarioName: formData?.scenarioName,
    notes: formData?.notes,
    tla: formData?.tla,
    userId: user.userInfo.employeeId,
    scenarioSplitItemList: createSplitItem(formData),
  };
};

export const createUpdatePayloadRequest = (
  placementId: number | string,
  formData: IAddScenarioForm,
  currentUser: IUser,
  selectedScenario: MarginDetailsResponseScenario,
  marginToolDetails?: MarginDetailsResponse,
  deletedSplitsDetails?: IScenarioSplit[],
): IAddScenarioRequestPayload => {
  const totalSplits = formData?.splitsList?.concat(deletedSplitsDetails);
  return {
    placementId: placementId,
    bookingPeriodId: selectedScenario.bookingPeriodId,
    scenarioId: selectedScenario.scenarioId,
    startDate: formatDateToStartOfDay(formData?.startDate),
    endDate: formatDateToStartOfDay(formData?.endDate),
    duration: formData?.duration,
    isExtensionFlow: marginToolDetails?.isScenarioExtention,
    extension: formData?.isInExtension,
    extensionNumber: formData?.isInExtension ? marginToolDetails?.extensionNumber : 0,
    extensionOfPriorPlacementID: formData?.extensionOfPriorPlacementID ? formData?.extensionOfPriorPlacementID : null,
    scenarioName: formData?.scenarioName,
    notes: formData?.notes,
    tla: formData?.tla,
    userId: currentUser.userInfo.employeeId,
    timestamp: selectedScenario.timestamp,
    scenarioSplitItemList: totalSplits?.map(split => {
      return {
        splitId: split?.splitId,
        mode: split?.mode,
        endDate: formatDateToStartOfDay(split.endDate),
        hoursPerShift: split.hoursPerShift,
        hoursPerWeek: Number(split.hoursPerWeek),
        shiftId: split.shift.object.shiftId,
        startDate: formatDateToStartOfDay(split.startDate),
      };
    }),
  };
};

const createSplitItem = (formData: IAddScenarioForm): Array<IScenarioSplitItem> => {
  if (formData.splitsList?.length === 0) {
    return [];
  }
  return formData.splitsList?.map(split => {
    return {
      startDate: formatDateToStartOfDay(split.startDate),
      endDate: formatDateToStartOfDay(split.endDate),
      shiftId: split.shift.object.shiftId,
      hoursPerWeek: split.hoursPerWeek,
      hoursPerShift: split.hoursPerShift,
    };
  });
};

export const calculateExtentionNumber = (marginToolDetails: MarginDetailsResponse[]) => {
  const extentionCount = marginToolDetails?.filter(treeData => treeData?.isExtensionOfPriorPlacement)?.length;
  return extentionCount + 1;
};

/**
 * Method to get the selected margin detail parent by booking period id
 * @param marginToolDetails - Margin details response
 * @param selectedScenarioBookingPeriodId - Selected scenario booking period id
 */
export const findMarginDetailByBookingPeriodId = (
  marginToolDetails: MarginDetailsResponse[],
  selectedScenarioBookingPeriodId: number,
) => {
  const matchedItem = marginToolDetails.find(
    parentItem => parentItem.bookingPeriodId === selectedScenarioBookingPeriodId,
  );
  return matchedItem;
};

export const updateMarginDetailsResponseByScenario = (
  marginToolDetails: MarginDetailsResponse[],
  selectedScenario: MarginDetailsResponseScenario,
) => {
  const marginDetail = marginToolDetails.find(
    marginDetail => marginDetail.bookingPeriodId === selectedScenario.bookingPeriodId,
  );
  if (marginDetail) {
    const updatedScenarios = marginDetail.scenarios.map(scenario =>
      scenario.scenarioId === selectedScenario.scenarioId ? selectedScenario : scenario,
    );
    const updatedMarginDetail = {
      ...marginDetail,
      scenarios: updatedScenarios,
    };
    const updatedMarginDetailsData = marginToolDetails.map(marginDetail =>
      marginDetail.bookingPeriodId === selectedScenario.bookingPeriodId ? updatedMarginDetail : marginDetail,
    );
    return updatedMarginDetailsData;
  } else {
    return marginToolDetails;
  }
};

/**
 *  Method to determine if the extension is disabled
 * @param modalName - modal which is opened
 * @param extensionValue - value of the extension
 * @returns
 */
export const disableExtension = (modalName: string, isAssignmentScenario: boolean, scenario: IAddScenario) => {
  // const isAddScenarioFromExtensionDisabled =
  //   modalName === PayPackageOptions.AddScenario && scenario?.extensionOfPriorPlacementId && extensionValue;
  const isAddExtensionDisabled = modalName === PayPackageOptions.AddExtension;
  const isEditScenarioDisabled = modalName === PayPackageOptions.editScenario && !isAssignmentScenario;
  return isAddExtensionDisabled || isEditScenarioDisabled;
};

/**
 *  Method to determine if the extension is disabled
 * @param modalName - modal which is opened
 * @param extensionValue - value of the extension
 * @returns
 */
export const disableExtensionOfPriorPlacementID = (
  modalName: string,
  isAssignmentScenario: boolean,
  extensionValue: boolean,
  isExtensionFromPriorPlacementId: boolean,
) => {
  const isAddExtension = modalName === PayPackageOptions.AddExtension;
  const isEditScenarioDisabled = modalName === PayPackageOptions.editScenario && !isAssignmentScenario;
  // const isAddScenarioFromExtension =
  // modalName === PayPackageOptions.AddScenario && extensionValue && isExtensionFromPriorPlacementId;
  return !extensionValue || isAddExtension || isEditScenarioDisabled;
};

export const updateSplitsList = (existingSplits: IScenarioSplit[], index: number) => {
  const updatedSplits = [...existingSplits];

  if (index === 0 && updatedSplits.length > 1) {
    updatedSplits[1].startDate = updatedSplits[0].startDate;
  } else if (index === updatedSplits.length - 1 && updatedSplits.length > 1) {
    updatedSplits[updatedSplits.length - 2] = {
      ...updatedSplits[updatedSplits.length - 2],
      endDate: updatedSplits[updatedSplits.length - 1]?.endDate,
    };
  } else {
    const deletedSplit = updatedSplits[index];
    updatedSplits[index + 1] = { ...updatedSplits[index + 1], startDate: deletedSplit?.startDate };
  }
  updatedSplits.splice(index, 1);
  return updatedSplits;
};

export const useIsFieldDisabledInPendingStage = () => {
  const scenario = useSelector(selectSelectedScenario);
  const userInfo = useSelector(selectUser);
  const isScenarioStatusPending = scenario?.scenarioStatusId === PayPackageStatus.Pending;
  return (
    isScenarioStatusPending &&
    !isCandidateContractUser(userInfo?.userInfo?.roles) &&
    !userInfo?.userInfo?.roles?.includes(userRoles.recruitment_Leadership)
  );
};

export const getSelectedBookingPeriodAndLatestScenario = (selectedMarginToolDetails, bookingPeriodId) => {
  // Find the selected booking period
  const selectedBookingPeriod = selectedMarginToolDetails?.find(
    item => item.bookingPeriodId === Number.parseInt(bookingPeriodId),
  );

  // Extract scenarios and filter for valid ones
  const allScenarios = selectedBookingPeriod?.scenarios || [];
  const validScenarios = allScenarios.filter(scenario => scenario.updatedDateAt !== undefined);

  // Sort valid scenarios by updated date, descending
  const sortedScenarios = validScenarios.sort((a, b) => {
    const dateA = new Date(a.updatedDateAt).getTime();
    const dateB = new Date(b.updatedDateAt).getTime();
    return dateB - dateA;
  });

  // Get the latest scenario
  const latestScenario = sortedScenarios[0];

  // Return both selectedBookingPeriod and latestScenario
  return { selectedBookingPeriod, latestScenario };
};

export const updatedMarginDetailsWithDefaultScenario = (existingTreeViewList, selectedScenarioExisting, scenarioId) => {
  let mergedArray = existingTreeViewList;
  if (mergedArray && mergedArray.length > 0) {
    const allScenarios = mergedArray.flatMap(response => response.scenarios);
    const validScenarios = allScenarios.filter(scenario => scenario.updatedDateAt !== undefined);
    const sortedScenarios = validScenarios.sort((a, b) => {
      const dateA = new Date(a.updatedDateAt!).getTime();
      const dateB = new Date(b.updatedDateAt!).getTime();
      return dateB - dateA;
    });
    let latestScenario = sortedScenarios[0];
    let locatedScenario = false;
    if (!isNaN(scenarioId) && scenarioId > 0 && allScenarios?.length > 0) {
      const directScenario = allScenarios.filter(scenario => scenario.scenarioId === scenarioId);
      if (directScenario?.length > 0) {
        latestScenario = directScenario[0];
        locatedScenario = true;
      }
    } else if (!locatedScenario && selectedScenarioExisting?.scenarioId > 0) {
      latestScenario = selectedScenarioExisting;
    }
    let updatedMergedArray = mergedArray.map(response => {
      return {
        ...response, // Create a deep copy of the response object
        scenarios: response.scenarios.map(scenario => {
          // Create a deep copy of each scenario and update isDefaultScenario
          if (scenario && latestScenario && scenario.scenarioId === latestScenario.scenarioId) {
            return { ...scenario, isDefaultScenario: true };
          } else {
            return { ...scenario, isDefaultScenario: false };
          }
        }),
      };
    });
    mergedArray = updatedMergedArray;
    return mergedArray;
  }
  return [];
};

export const findMostRecentScenarioCycleLogic = (
  details: MarginDetailsResponse[],
  removingPlcement: number,
): MarginDetailsResponseScenario | null => {
  if (!details || details.length === 0) return null;

  // Step 1: Find the index of the removed `placementId`
  const removingIndex = details.findIndex(detail => detail.placementId === removingPlcement);

  if (removingIndex === -1) {
    return null;
  }

  // Step 2: Define the search order
  const searchOrder = [];

  // Backward search: Add indices before the removingIndex
  for (let i = removingIndex - 1; i >= 0; i--) {
    searchOrder.push(i);
  }

  // Wrap-around search: Add indices from the end of the list to just before the removingIndex
  for (let i = details.length - 1; i > removingIndex; i--) {
    searchOrder.push(i);
  }

  // Step 3: Traverse the search order to find the first valid `placementId` (targetPid)
  let targetPid: number | null = null;

  for (const index of searchOrder) {
    const currentRecord = details[index];

    if (currentRecord && currentRecord.scenarios?.length > 0) {
      // Check if this record has scenarios with valid `updatedDateAt`
      const validScenarios = currentRecord.scenarios.filter(scenario => scenario.updatedDateAt !== undefined);

      if (validScenarios.length > 0) {
        targetPid = currentRecord.placementId; // Found the `placementId` to aggregate scenarios
        break; // Stop the loop after finding a valid `placementId`
      }
    }
  }

  if (!targetPid) {
    return null;
  }

  // Step 4: Aggregate scenarios from all occurrences of the `targetPid`
  const targetRecords = details.filter(detail => detail.placementId === targetPid);

  if (!targetRecords || targetRecords.length === 0) {
    return null;
  }

  const allScenarios = targetRecords.flatMap(record => record.scenarios || []);

  // Step 5: Filter and sort all scenarios by `updatedDateAt`
  const validScenarios = allScenarios.filter(scenario => scenario.updatedDateAt !== undefined);

  if (validScenarios.length === 0) {
    return null;
  }

  const sortedScenarios = validScenarios.sort((a, b) => {
    const dateA = new Date(a.updatedDateAt!).getTime();
    const dateB = new Date(b.updatedDateAt!).getTime();
    return dateB - dateA;
  });

  // Step 6: Return the most recent scenario
  return sortedScenarios[0];
};

export const updatedMarginToolDetails = (
  responseData,
  existingTreeViewList,
  searchPlacement,
  selectedScenarioExisting,
  scenarioId,
) => {
  let mergedArray = existingTreeViewList;
  const firstResponseIndex = mergedArray.findIndex(item => item.placementId === responseData[0]?.placementId);
  if (responseData?.length !== 0) {
    const marginDetailsX = mergedArray?.filter(item => item.placementId !== responseData[0].placementId);
    mergedArray = marginDetailsX;
  }
  if (firstResponseIndex >= 0) {
    mergedArray.splice(firstResponseIndex, 0, ...responseData);
    const allScenarios = responseData?.flatMap(response => response?.scenarios);
    const validScenarios = allScenarios?.filter(scenario => scenario?.updatedDateAt !== undefined);
    if (validScenarios?.length > 0) {
      const sortedScenarios = validScenarios.sort((a, b) => {
        const dateA = new Date(a.updatedDateAt).getTime();
        const dateB = new Date(b.updatedDateAt).getTime();
        return dateB - dateA;
      });
      if (sortedScenarios?.length > 0) {
        mergedArray = updatedMarginDetailsWithDefaultScenario(mergedArray, sortedScenarios[0], scenarioId);
      } else {
        mergedArray = updatedMarginDetailsWithDefaultScenario(mergedArray, selectedScenarioExisting, scenarioId);
      }
    } else {
      mergedArray = updatedMarginDetailsWithDefaultScenario(mergedArray, selectedScenarioExisting, scenarioId);
    }
  } else {
    mergedArray = mergedArray?.concat(responseData);
    mergedArray = updatedMarginDetailsWithDefaultScenario(mergedArray, selectedScenarioExisting, scenarioId);
  }
  if (mergedArray) {
    // Reset all isDefaultScenario flags to false by creating deep copies of the response and scenarios
    let updatedMergedArray = mergedArray;

    if (
      responseData?.length === 0 &&
      searchPlacement?.placementId > 0 &&
      !updatedMergedArray?.some(item => item.placementId === searchPlacement?.placementId)
    ) {
      const newRow = initialMarginDetailResponseState?.slice(0);
      const updatedRow = {
        ...newRow[0],
        placementId: searchPlacement?.placementId,
        candidateNameFirst: searchPlacement?.candidateFirstName,
        candidateNameLast: searchPlacement?.candidateLastName,
        bookingPeriodStartDate: new Date(),
        bookingPeriodEndDate: new Date(new Date().setHours(24)),
      };
      updatedMergedArray = [...updatedMergedArray, updatedRow];
    }

    mergedArray = updatedMergedArray;
  }

  mergedArray = mergedArray.filter(response => response.placementId > 0);

  return mergedArray; // Return if no updates were made
};
