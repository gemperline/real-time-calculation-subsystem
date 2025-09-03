import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  IEmailModalType,
  IEmailRecipientModal,
  IInitiatePayPacketStatusTransition,
  IPayPackageStatus,
  IPayPackageStatusTransitionModalDetails,
  IStatusOptions,
  IUpdatePayPackageStatusPayload,
  StatusTransitionModalType,
} from './pay-package-status.model';

export const initialState: IPayPackageStatus = {
  payPackageStatusTransitionModalDetails: { openModal: false, type: StatusTransitionModalType.None },
  payPackageStatusOptions: [],
  recentStatusUpdatedScenarioId: 0,
  isEmailModalOpen: null,
  emailRecipients: null,
};

const initiatePayPacketStatusTransition = createAction<IInitiatePayPacketStatusTransition>(
  'INITIATE_PAY_PACKET_STATUS_TRANSITION',
);

const updatePayPackageStatus = createAction<IUpdatePayPackageStatusPayload>('UPDATE_PAY_PACKAGE_STATUS');

const getEmailRecipientsList = createAction<{ placementId: number }>('GET_EMAIL_RECIPIENTS_LIST');

const payPackageStatusSlice = createSlice({
  name: 'payPackageStatus',
  initialState,
  reducers: {
    setPayPackageStatusTransitionModalDetails(state, action: PayloadAction<IPayPackageStatusTransitionModalDetails>) {
      state.payPackageStatusTransitionModalDetails = action.payload;
    },
    setPayPackageStatusOptions(state, action: PayloadAction<IStatusOptions[]>) {
      state.payPackageStatusOptions = action.payload;
    },
    setRecentStatusUpdatedScenarioId(state, action: PayloadAction<number>) {
      state.recentStatusUpdatedScenarioId = action.payload;
    },
    setStatusUpdatedEmailModalOpen(state, action: PayloadAction<IEmailModalType>) {
      state.isEmailModalOpen = action.payload;
    },
    setEmailRecipients(state, action: PayloadAction<IEmailRecipientModal>) {
      state.emailRecipients = action.payload;
    },
  },
});

const { actions } = payPackageStatusSlice;

export const { name: payPackageStatusSliceKey, reducer: payPackageStatusSliceReducer } = payPackageStatusSlice;

export const payPackageStatusActions = {
  ...actions,
  initiatePayPacketStatusTransition,
  updatePayPackageStatus,
  getEmailRecipientsList,
};
