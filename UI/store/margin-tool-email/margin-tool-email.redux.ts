import { createAction, createSlice } from '@reduxjs/toolkit';

const handleMarginToolEmailCreation = createAction('HANDLE_MARGIN_TOOL_EMAIL');

export interface IMarginToolEmail {}

export const initialState: IMarginToolEmail = {};

const marginToolEmailSlice = createSlice({
  name: 'marginToolEmail',
  initialState: initialState,
  reducers: {},
});

const { actions } = marginToolEmailSlice;

export const { name: marginToolEmailSliceKey, reducer: marginToolEmailReducer } = marginToolEmailSlice;

export const marginToolEmailAction = {
  ...actions,
  handleMarginToolEmailCreation,
};
