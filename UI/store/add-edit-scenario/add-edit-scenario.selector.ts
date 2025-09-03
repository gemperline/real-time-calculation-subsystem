import { createSelector } from '@reduxjs/toolkit';
import { RootState } from 'types';
import { initialState } from './add-edit-scenario.redux';

const selectDomain = (state: RootState) => state?.scenario || initialState;

export const selectAddScenario = createSelector([selectDomain], state => state?.addScenario);
export const selectAddExtention = createSelector([selectDomain], state => state?.addExtension);
export const selectMarginToolDetailsData = createSelector([selectDomain], state => state?.marginDetails);
export const selectBookingPeriod = createSelector([selectDomain], state => state?.bookingPeriod);
export const selectSelectedScenario = createSelector([selectDomain], state => state?.selectedScenario);
export const selectShiftDetails = createSelector([selectDomain], state => state?.shiftDetails);
export const selectCurrentEditScenarioDetails = createSelector([selectDomain], state => state?.selectedEditScenario);
export const selectGsaDetails = createSelector([selectDomain], state => state?.gsaCalculatedValues);
export const selectScenarioModalState = createSelector([selectDomain], state => state?.scenarioModal);
export const selectDeletedSplits = createSelector([selectDomain], state => state?.deletedSplits);
export const selectScenarioCreateUpdateResponse = createSelector(
  [selectDomain],
  state => state?.scenarioCreateUpdateResponse,
);
//TODO set it on page load
export const selectedMarginDetail = createSelector([selectDomain], state => state?.selectedMarginDetail);
//export const selectScenariosTreeView = createSelector([selectDomain], state => state?.scenariosTreeView);
export const selectSearchPlacement = createSelector([selectDomain], state => state?.selectedSearchPlacement);
export const selectFeatchScenarioCalculateState = createSelector(
  [selectDomain],
  state => state?.shouldFeatchScenarioCalculate,
);
export const selectTreeViewSelectedBookingPeriod = createSelector(
  [selectDomain],
  state => state?.selectedTreeViewBookingPeriod,
);

export const selectPageLoadStatus = createSelector([selectDomain], state => state?.isPageLoaded ?? false);
export const selectSaveTriggeredStatus = createSelector([selectDomain], state => state?.isSaveTriggered ?? false);
export const selectCancelTriggeredStatus = createSelector([selectDomain], state => state?.isCancelTriggered ?? false);

export const selectOrderIdModifiedConfirmationDialogStatus = createSelector(
  [selectDomain],
  state =>
    (state?.shouldShowOrderIdModifiedDialog ?? false) &&
    ((state?.selectedScenario?.isBaseDetailsModified ?? false) ||
      (state?.selectedScenario?.isOrderIdModified ?? false) ||
      (state?.selectedScenario?.isSkillSetModified ?? false)) &&
    state?.selectedScenario?.scenarioId > 0,
);

export const selectOrderIdModifiedConfirmationStatus = createSelector(
  [selectDomain],
  state =>
    ((state?.selectedScenario?.isBaseDetailsModified ?? false) ||
      (state?.selectedScenario?.isOrderIdModified ?? false) ||
      (state?.selectedScenario?.isSkillSetModified ?? false)) &&
    state?.selectedScenario?.scenarioId > 0,
);

export const selectAddEditScenarioModelData = createSelector([selectDomain], state => state?.addEditScenarioModelData);
