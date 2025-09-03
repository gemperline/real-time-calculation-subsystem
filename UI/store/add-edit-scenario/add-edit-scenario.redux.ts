import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  IAddExtension,
  IAddScenario,
  IMarginToolScenario,
  ITreeViewBookingPeriod,
  MarginDetailsResponse,
  MarginDetailsResponseScenario,
} from './add-edit-scenario.model';
import { ITypeAheadOption } from '@AMIEWEB/Candidate/CandidateProfile/CandidateTabPanel/PreferencesTab/CustomComponents/ControlledTypeAhead';
import {
  IAddScenarioForm,
  IAddScenarioRequestPayload,
  IScenarioSplit,
} from '@AMIEWEB/MarginTool/Components/PayPackage/AddScenario/model';
import { IGsaHousingDetailsSuymmaryResponse } from '@AMIEWEB/MarginTool/Components/PayPackage/models/PayPackage';
import { IMarginUpdateResponse } from '@AMIEWEB/MarginTool/Components/PayPackage/models/AddScenarioModal';
import {
  IDeleteMarginToolDetailsPayload,
  IDeleteScenarioDetailsPayload,
} from '../pay-package-status/pay-package-status.model';
import { IMarginToolSave } from '@AMIEWEB/MarginTool/IMarginToolSave';

export const initialState: IMarginToolScenario = {
  addScenario: {
    placementId: 0,
    placementActivityTypeId: 0,
    placementStatusId: 0,
    placementStatus: '',
    isInExtension: false,
    extensionStatusId: 0,
    extensionStatus: '',
    startDate: '',
    endDate: '',
    duration: 0,
    tla: false,
    shiftId: 0,
    shiftDescription: '',
    placementStartDate: '',
    placementEndDate: '',
    placementDuration: 0,
    scenarioName: '',
    notes: '',
  },
  createdScenarioId: 0,
  shiftDetails: [],
  addExtension: {
    placementId: 0,
    placementActivityTypeId: 0,
    placementStatusId: 0,
    placementStatus: '',
    isInExtension: true,
    extensionName: '',
    extensionStatusId: 0,
    extensionStatus: null,
    startDate: '',
    endDate: '',
    duration: 0,
    shiftId: 0,
    shiftDescription: '',
    isExtensionFromPriorPlacementId: true,
    extensionOfPriorPlacementId: 0,
    tla: false,
    placementStartDate: null,
    placementEndDate: null,
    placementDuration: 0,
    hoursPerShift: 0,
    hoursPerWeek: 37.0,
    notes: '',
  },
  marginDetails: [],
  selectedEditScenario: null,
  gsaCalculatedValues: null,
  scenarioModal: { modalStatus: false, modalName: '' },
  deletedSplits: [],
  scenarioCreateUpdateResponse: null,
  selectedMarginDetail: null,
  scenariosTreeView: null,
  shouldFeatchScenarioCalculate: false,
  isPageLoaded: false,
  isSaveTriggered: false,
  isCancelTriggered: false,
  shouldShowOrderIdModifiedDialog: false,
  addEditScenarioModelData: null,
};

const getAddScenarioDetails = createAction<{
  placementId: number;
  bookingPeriodId?: number | null;
  isExtensionFlow: boolean | false;
}>('GET_ADD_SCENARIO_DETAILS');
const getMarginToolDetails = createAction<{
  placementId: number;
  isDataUpdateFlow?: boolean | false | null;
  scenarioId?: number | null;
}>('GET_MARGIN_TOOL_DETAILS');
const setSelectedScenarioData = createAction<MarginDetailsResponseScenario>('SET_SELECTED_SCENARIO');
const getShiftDetails = createAction('GET_SHIFT_DETAILS');
const getNewScenarioDefaultValues = createAction<{ placementId: number; newScenario: MarginDetailsResponseScenario }>(
  'FETCH_SCENARIO_FORM_DATA',
);
const postAddScenarioDetails = createAction<IAddScenarioRequestPayload>('SAVE_ADD_SCENARIO_DETAILS');
const postEditScenarioDetails = createAction<IAddScenarioRequestPayload>('UPDATE_SCENARIO_DETAILS');
const postMarginToolDetails = createAction<IMarginToolSave>('SAVE_MARGIN_TOOL_DETAILS');
const postMarginToolDetailsValidate = createAction<IMarginToolSave>('VALIDATE_MARGIN_TOOL_DETAILS');

const getAddExtensionDetails = createAction<{ placementId: number }>('GET_ADD_EXTENTION_DETAILS');
const deleteSingleScenario = createAction<IDeleteScenarioDetailsPayload>('DELETE_SINGLE_SCENARIO');
const getGSAcalculatedValues = createAction<{ autoSave?: boolean } | void>('GET_GSA_CALCULATED_VALUES');
const cleanMarginToolDetails = createAction<IDeleteMarginToolDetailsPayload>('CLEAN_MARGIN_TOOL_DETAILS');
const openMarginToolEditDetails = createAction('OPEN_EDIT_MARGIN_TOOL_DETAILS');

const scenarioSlice = createSlice({
  name: 'scenario',
  initialState,
  reducers: {
    setAddScenarioData(state, action: PayloadAction<IAddScenario>) {
      state.addScenario = action.payload;
    },
    setAddExtentionData(state, action: PayloadAction<IAddExtension>) {
      state.addExtension = action.payload;
    },
    setBookingPeriod(state, action: PayloadAction<MarginDetailsResponse>) {
      state.bookingPeriod = action.payload;
    },
    setScenario(state, action: PayloadAction<MarginDetailsResponseScenario>) {
      state.selectedScenario = action.payload;
    },
    setShiftDetailsData(state, action: PayloadAction<ITypeAheadOption[]>) {
      state.shiftDetails = action.payload;
    },
    setMarginDetailResponse(state, action: PayloadAction<MarginDetailsResponse[]>) {
      state.marginDetails = action.payload;
    },
    setCurrentEditScenarioDetails(state, action: PayloadAction<IAddScenarioForm>) {
      state.selectedEditScenario = action.payload;
    },
    setGSAcalculatedValues(state, action: PayloadAction<IGsaHousingDetailsSuymmaryResponse>) {
      state.gsaCalculatedValues = action.payload;
    },
    setScenarioModal(state, action: PayloadAction<{ modalStatus: boolean | false; modalName: string | '' }>) {
      state.scenarioModal = action.payload;
    },
    setDeletedScenarioSplits(state, action: PayloadAction<IScenarioSplit[]>) {
      state.deletedSplits = action.payload;
    },
    setScenarioCreateUpdateResponse(state, action: PayloadAction<IMarginUpdateResponse | null>) {
      state.scenarioCreateUpdateResponse = action.payload;
    },
    setSelectedMarginDetail(state, action: PayloadAction<MarginDetailsResponse>) {
      state.selectedMarginDetail = action.payload;
    },
    setScenariosTreeView(state, action: PayloadAction<MarginDetailsResponse[]>) {
      state.scenariosTreeView = action.payload;
    },
    setSelectedSearchPlacement(
      state,
      action: PayloadAction<{
        placementId: number;
        removed: boolean;
        candidateFirstName?: string;
        candidateLastName?: string;
      }>,
    ) {
      state.selectedSearchPlacement = action.payload;
    },
    setFeatchScenarioCalculate(state, action: PayloadAction<boolean | undefined | null>) {
      state.shouldFeatchScenarioCalculate = action.payload;
    },
    setTreeViewBookingPeriod(state, action: PayloadAction<ITreeViewBookingPeriod | undefined | null>) {
      state.selectedTreeViewBookingPeriod = action.payload;
    },
    setPageLoadStatus(state, action: PayloadAction<boolean>) {
      state.isPageLoaded = action.payload;
    },
    setSaveTriggeredStatus(state, action: PayloadAction<boolean>) {
      state.isSaveTriggered = action.payload;
    },
    setCancelTriggeredStatus(state, action: PayloadAction<boolean>) {
      state.isCancelTriggered = action.payload;
    },
    setIsOrderIdModifiedStatus(state, action: PayloadAction<boolean>) {
      if (state.selectedScenario) {
        state.selectedScenario.isOrderIdModified = action.payload;
      }
    },
    setShowOrderIdModifiedDialogStatus(state, action: PayloadAction<boolean>) {
      state.shouldShowOrderIdModifiedDialog = action.payload;
    },
    setAddEditScenarioModelData(state, action: PayloadAction<IAddScenarioForm | null | undefined>) {
      state.addEditScenarioModelData = action.payload;
    },
    reset() {
      return {
        ...initialState,
      };
    },
  },
});

const { actions } = scenarioSlice;

export const { name: scenarioSliceKey, reducer: scenarioReducer } = scenarioSlice;

export const scenarioActions = {
  ...actions,
  getAddScenarioDetails,
  getMarginToolDetails,
  setSelectedScenarioData,
  getShiftDetails,
  postAddScenarioDetails,
  postEditScenarioDetails,
  getNewScenarioDefaultValues,
  getAddExtensionDetails,
  deleteSingleScenario,
  getGSAcalculatedValues,
  postMarginToolDetails,
  postMarginToolDetailsValidate,
  cleanMarginToolDetails,
  openMarginToolEditDetails,
};
