export enum SenarioSplitMode {
  ADD = 1,
  EDIT = 2,
  DELETE = 3,
}

export interface IAddScenarioForm {
  extensionOfPriorPlacementID: string | null;
  notes: string;
  startDate: string | null;
  endDate: string | null;
  duration: string | number;
  isInExtension: boolean | null;
  tla: boolean | null;
  scenarioName: string | null;
  shiftDescription: string | null;
  shiftId: number | null;
  shift: IShiftData;
  hoursPerWeek: number | null;
  hoursPerShift: number | null;
  splitsList?: Array<IScenarioSplit>;
}

export interface IShiftData {
  label: string;
  object: {
    hoursPerWeek: number | null;
    hoursPerShift: number | null;
    orderBy: number;
    rateShiftListId: number;
    shiftDescription: string;
    shiftId: number;
    shiftTypeId: number;
  };
}

export interface IAddScenarioRequestPayload {
  placementId: number | string;
  bookingPeriodId?: number | null;
  scenarioId?: number | null;
  startDate: string | null;
  endDate: string | null;
  duration: string | number;
  isExtensionFlow?: boolean | false;
  extension: boolean;
  extensionNumber: number;
  extensionOfPriorPlacementID: string | null;
  scenarioName: string | null;
  notes: string;
  tla: boolean | null;
  userId: number;
  timestamp?: string;
  scenarioSplitItemList: IScenarioSplitItem[];
}

export interface IScenarioSplitItem {
  splitId?: number;
  mode?: number;
  startDate: string;
  endDate: string;
  shiftId: number;
  hoursPerWeek: number;
  hoursPerShift: number;
}

export interface IScenarioSplit {
  splitId?: number;
  mode?: SenarioSplitMode;
  startDate: string;
  endDate: string;
  shift: IShiftData;
  hoursPerWeek: number;
  hoursPerShift: number;
}

export interface GetGSAcalculatedValuesPayload {
  autoSave?: boolean;
}
