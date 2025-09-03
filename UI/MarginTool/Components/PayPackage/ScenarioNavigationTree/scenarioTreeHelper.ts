import { MarginDetailsResponse } from 'store/redux-store/margin-tool/slices/add-edit-scenario/add-edit-scenario.model';

export const fetchDefaultExpandedNodeId = (treeViewData: MarginDetailsResponse[], scenarioId: number) => {
  return treeViewData
    ?.findIndex(treeData => treeData?.scenarios?.some(scenario => scenario.scenarioId === scenarioId))
    ?.toString();
};

export const fetchExpandedNodePlacementId = (treeViewData: MarginDetailsResponse[], scenarioId: number) => {
  return treeViewData
    ?.find(treeData => treeData?.scenarios?.some(scenario => scenario.scenarioId === scenarioId))
    ?.placementId?.toString();
};

export const findScenarioById = (marginDetails: MarginDetailsResponse[], scenarioId: number) => {
  for (const detail of marginDetails) {
    const foundScenario = detail.scenarios.find(scenario => scenario.scenarioId === scenarioId);
    if (foundScenario) {
      return foundScenario; // Return the scenario if found
    }
  }
  return null; // Return null if no matching scenarioId is found
};

export const getSelectedTreeValues = (selectedScenarioId, treeViewData) => {
  const scenarioId = parseInt(selectedScenarioId, 10);
  let selectedScenario = null;
  let selectedBookingPeriod = null;
  treeViewData?.forEach(bookingPeriod => {
    bookingPeriod?.scenarios?.forEach(scenario => {
      if (scenario?.scenarioId === scenarioId) {
        selectedBookingPeriod = bookingPeriod;
        selectedScenario = scenario;
      }
    });
  });
  return { selectedBookingPeriod, selectedScenario };
};

export const getBookingPeriod = (selectedBookingPeriodIndex, treeViewData) => {
  return treeViewData[Number(selectedBookingPeriodIndex)];
};
