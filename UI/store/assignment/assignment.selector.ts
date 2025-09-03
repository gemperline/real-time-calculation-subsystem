import { createSelector } from '@reduxjs/toolkit';
import { RootState } from 'types';
import { initialState } from './assignment.redux';

const selectDomain = (state: RootState) => state?.assignment || initialState;

export const selectTreeViewLookupData = createSelector([selectDomain], state => state?.treeViewData);
export const selectInsuranceStatus = createSelector([selectDomain], state => state?.insuranceStatus);
export const selectFurnitureAdjustments = createSelector([selectDomain], state => state?.furnitureAdjustments);
export const selectFurnitureEditError = createSelector([selectDomain], state => state?.furnitureAdjustmentsError);
export const selectEditTimeOffs = createSelector([selectDomain], state => state?.editTimeOffs);
export const selectTimeOffGridError = createSelector([selectDomain], state => state?.editTimeOffGridError);
export const selectPeopleSoftCalculationResult = createSelector([selectDomain], state => state?.peopleSoftResults);
export const selectInitialScenarioMarginDetailsResponse = createSelector(
  [selectDomain],
  state => state?.initialScenarioMarginDetails,
);
