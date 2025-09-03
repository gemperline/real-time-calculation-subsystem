import { RootState } from 'types';
import { initialState } from './pay-package-status.redux';
import { createSelector } from '@reduxjs/toolkit';

const selectDomain = (state: RootState) => state?.payPackageStatus || initialState;
export const selectPayPackageStatusModalDetails = createSelector(
  [selectDomain],
  state => state?.payPackageStatusTransitionModalDetails,
);
export const selectpayPackageStatusOptions = createSelector([selectDomain], state => state?.payPackageStatusOptions);
export const selectRecentStatusUpdatedScenarioId = createSelector(
  [selectDomain],
  state => state?.recentStatusUpdatedScenarioId,
);

export const selectStatusUpdatedEmailModalOpen = createSelector([selectDomain], state => state?.isEmailModalOpen);

export const selectEmailRecipientsList = createSelector([selectDomain], state => state?.emailRecipients);
