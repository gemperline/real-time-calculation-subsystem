import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  IFurnitureAdjustmentsError,
  IPeopleSoftCalculationResult,
  IRequestTimeOff,
  ITreeLookupCategories,
} from './assignment.model';
import { ITypeAheadOption } from '@AMIEWEB/Candidate/CandidateProfile/CandidateTabPanel/PreferencesTab/CustomComponents/ControlledTypeAhead';
import { IMarginToolAssignment } from './assignment.model';
import { FurnitureCost, MarginDetailsResponseScenario } from '../add-edit-scenario/add-edit-scenario.model';
import { IAssignmentForm } from '@AMIEWEB/MarginTool/Components/Assignments/models/IAssignmentSplitForm';
import { IMarginToolSave } from '@AMIEWEB/MarginTool/IMarginToolSave';

export const initialState: IMarginToolAssignment = {
  treeViewData: [],
  insuranceStatus: [],
  furnitureAdjustments: [],
  furnitureAdjustmentsError: [],
  editTimeOffs: [],
  editTimeOffGridError: false,
  peopleSoftResults: null,
  initialScenarioMarginDetails: null,
};

const getTreeViewDataForPickList = createAction<{ placementId: number }>('GET_TREE_VIEW_DATA_FOR_PICK_LIST');
const getPickListDetails = createAction('GET_PICKLIST_DETAILS');
const triggerPeopleSoftCalculation = createAction<{
  formData: IAssignmentForm;
  isDataUpdateFlow?: boolean | false | null;
  formDataRaw?: IMarginToolSave | null | undefined;
}>('TRIGGER_PEOPLE_SOFT_CALCULATION');
const getInitialMarginToolsData = createAction('GET_INITIAL_MARGIN_TOOLS_DATA');

const assignmentSlice = createSlice({
  name: 'assignment',
  initialState,
  reducers: {
    setTreeViewDataLookup: (state, action: PayloadAction<ITreeLookupCategories[]>) => {
      state.treeViewData = action.payload;
    },
    setInsuranceStatus(state, action: PayloadAction<ITypeAheadOption[]>) {
      state.insuranceStatus = action.payload;
    },
    setFurnitureAdjustments(state, action: PayloadAction<FurnitureCost[]>) {
      state.furnitureAdjustments = action.payload;
    },
    setFurnitureEditError(state, action: PayloadAction<IFurnitureAdjustmentsError[]>) {
      state.furnitureAdjustmentsError = action.payload;
    },
    setEditTimeOffs(state, action: PayloadAction<IRequestTimeOff[]>) {
      state.editTimeOffs = action.payload;
    },
    setEditTimeOffGridError(state, action: PayloadAction<boolean>) {
      state.editTimeOffGridError = action.payload;
    },
    setPeopleSoftResults(state, action: PayloadAction<IPeopleSoftCalculationResult>) {
      state.peopleSoftResults = action.payload;
    },
    setInitialMarginDetailResponse(state, action: PayloadAction<MarginDetailsResponseScenario>) {
      state.initialScenarioMarginDetails = action.payload;
    },
  },
});

const { actions } = assignmentSlice;

export const { name: assignmentSliceKey, reducer: assignmentReducer } = assignmentSlice;

export const assignmentActions = {
  ...actions,
  getTreeViewDataForPickList,
  getPickListDetails,
  triggerPeopleSoftCalculation,
  getInitialMarginToolsData,
};
