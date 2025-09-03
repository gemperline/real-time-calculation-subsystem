import { ITypeAheadOption } from '@AMIEWEB/Candidate/CandidateProfile/CandidateTabPanel/PreferencesTab/CustomComponents/ControlledTypeAhead';
import { FurnitureCost, MarginDetailsResponseScenario } from '../add-edit-scenario/add-edit-scenario.model';

export interface ITreeItem {
  id: number;
  description: string;
}

export interface ITreeFieldCollection {
  field: string;
  items: ITreeItem[];
}

export interface ITreeLookupCategories {
  category: string;
  fields: ITreeFieldCollection[];
}

export interface IFurnitureAdjustmentsError {
  errorCaptured: boolean;
  errorRowId: number;
}

export interface IRequestTimeOff {
  id?: string;
  timeOffId: number;
  startDate: Date | string;
  endDate: Date | string;
  days: number | string;
  hours: number | string;
  scenarioId: number;
  splitId: number;
  approvedBy: string;
}

export interface IRequestTimeOffError {
  id?: string;
  startDate?: string;
  endDate?: string;
  hours?: string;
  approvedBy?: string;
}

export interface IMarginToolAssignment {
  treeViewData: ITreeLookupCategories[];
  insuranceStatus: ITypeAheadOption[];
  furnitureAdjustments: FurnitureCost[];
  furnitureAdjustmentsError: IFurnitureAdjustmentsError[];
  editTimeOffs: IRequestTimeOff[];
  editTimeOffGridError: boolean;
  peopleSoftResults: IPeopleSoftCalculationResult;
  initialScenarioMarginDetails: MarginDetailsResponseScenario;
}

export interface IPeopleSoftCalculationResult {
  placementId: number;
  scenarioId: number;
  userId: number;
  grossProfit: number;
  grossMargin: number;
  negotiatedContributionMargin: number;
}
