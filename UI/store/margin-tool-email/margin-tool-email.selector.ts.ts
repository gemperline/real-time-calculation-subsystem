import { RootState } from 'types';
import { initialState } from './margin-tool-email.redux';
import { createSelector } from '@reduxjs/toolkit';

const selectDomain = (state: RootState) => state?.marginToolEmail || initialState;
