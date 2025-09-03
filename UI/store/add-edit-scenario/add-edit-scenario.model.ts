import { IAddScenarioForm, IScenarioSplit } from '@AMIEWEB/MarginTool/Components/PayPackage/AddScenario/model';
import { IMarginUpdateResponse } from '@AMIEWEB/MarginTool/Components/PayPackage/models/AddScenarioModal';
import { IGsaHousingDetailsSuymmaryResponse } from '@AMIEWEB/MarginTool/Components/PayPackage/models/PayPackage';
import { ITypeAheadOption } from '@AMIEWEB/Tasks/CustomComponents/ControlledTypeAheadWithAvatar';

export interface IAddScenario {
  placementId: number;
  placementActivityTypeId: number;
  placementStatusId: number;
  placementStatus: string;
  isInExtension: boolean;
  extensionStatusId: number | null;
  extensionStatus: string;
  startDate: string;
  endDate: string;
  duration: number;
  tla: boolean;
  shiftId: number | null;
  shiftDescription: string;
  placementStartDate: string;
  placementEndDate: string;
  placementDuration: number | null;
  scenarioName: string;
  notes?: string;
  isExtensionFromPriorPlacementId?: boolean;
  extensionOfPriorPlacementId?: number;
}

export interface IAddExtension {
  placementId: number;
  placementActivityTypeId: number;
  placementStatusId: number;
  placementStatus: string;
  isInExtension: boolean;
  extensionName: string;
  extensionStatusId: number;
  extensionStatus: null | string;
  startDate: string;
  endDate: string;
  duration: number;
  shiftId: number;
  shiftDescription: string;
  isExtensionFromPriorPlacementId: true;
  extensionOfPriorPlacementId: number;
  tla: boolean;
  placementStartDate: null | string;
  placementEndDate: null | string;
  placementDuration: number;
  hoursPerShift: number;
  hoursPerWeek: number;
  notes?: string;
}

export interface ITreeViewBookingPeriod {
  placementId: number;
  bookingPeriodId: number | null;
}

export interface IMarginToolScenario {
  addScenario: IAddScenario;
  addExtension?: IAddExtension;
  marginDetails?: MarginDetailsResponse[];
  bookingPeriod?: MarginDetailsResponse;
  selectedScenario?: MarginDetailsResponseScenario;
  shiftDetails?: ITypeAheadOption[];
  createdScenarioId?: number;
  selectedEditScenario?: IAddScenarioForm;
  gsaCalculatedValues?: IGsaHousingDetailsSuymmaryResponse;
  scenarioModal: { modalStatus: boolean; modalName: string };
  deletedSplits?: IScenarioSplit[];
  scenarioCreateUpdateResponse?: IMarginUpdateResponse;
  selectedMarginDetail?: MarginDetailsResponse;
  scenariosTreeView: MarginDetailsResponse[];
  selectedSearchPlacement?: {
    placementId: number;
    removed: boolean;
    candidateFirstName?: string;
    candidateLastName?: string;
  };
  shouldFeatchScenarioCalculate?: boolean | false;
  selectedTreeViewBookingPeriod?: ITreeViewBookingPeriod;
  isPageLoaded?: boolean | false;
  isSaveTriggered?: boolean | false;
  isCancelTriggered?: boolean | false;
  shouldShowOrderIdModifiedDialog?: boolean | false;
  addEditScenarioModelData?: IAddScenarioForm | null | undefined;
}

export interface MarginDetailsResponse {
  placementId: number;
  placementStartDate?: Date;
  placementEndDate?: Date;
  placementDuration?: number;
  facility: MarginFacility;
  travelerId?: number;
  candidateNameFirst: string;
  candidateNameMiddle: string;
  candidateNameLast: string;
  candidateNameGoesBy: string;
  brandId?: number;
  brand: string;
  amnDivisionTypeId?: number;
  amnDivisionType?: string;
  orderId?: number;
  orderTypeId?: number;
  orderType?: string;
  originalOrderId?: number;
  isOrderIdModified: boolean;
  isSkillSetModified: boolean;
  isBaseDetailsModified: boolean;
  disciplineId?: number;
  discipline?: string;
  specialtyId?: number;
  specialty?: string;
  subSpecialtyId?: number;
  subSpecialty?: string;
  originalDisciplineId?: number;
  originalSpecialtyId?: number;
  originalSubSpecialtyId?: number;
  shiftId?: number;
  shift: string;
  payCycleStartDayNum?: number;
  payCycleStartDay?: string;
  payCycleEndDayNum?: number;
  payCycleEndDay?: string;
  isPerDiemValuesValid: boolean;
  isScenarioExtention: boolean;
  extensionNumber?: number;
  isExtensionOfPriorPlacement: boolean;
  extensionOfPriorPlacementId?: number;
  bookingPeriodId?: number;
  bookingPeriodStartDate?: Date;
  bookingPeriodEndDate?: Date;
  bookingPeriodDuration?: number;
  packageName: string;
  recruiter: MarginEmployee;
  accountManager?: MarginEmployee;
  isMostRecentBookingPeriod: boolean;
  hasApprovedScenario: boolean;
  candidateSkillSets?: ICandidateSkillSet[];
  scenarios: MarginDetailsResponseScenario[];
}

export interface ICandidateSkillSet {
  disciplineId?: number | null;
  disciplineAbbr: string;
  specialtyId?: number | null;
  specialtyAbbr: string;
  subSpecialtyId?: number | null;
  subSpecialtyAbbr: string;
  status: string;
}

export interface MarginFacility {
  facilityId?: number;
  facilityName: string;
  facilityAddress1: string;
  facilityAddress2: string;
  facilityState: string;
  facilityCity: string;
  facilityCounty?: string;
  facilityZip?: string;
  facilityLongitude?: number;
  facilityLatitude?: number;
  facilityCountry?: string;
  facilityRegionId?: number;
}

export interface MarginEmployee {
  employeeId?: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
}

export interface MarginDetailsResponseScenario {
  placementId: number;
  bookingPeriodId?: number;
  scenarioId?: number;
  scenarioName: string;
  scenarioStatusId?: number;
  scenarioStatus: string;
  orderId?: number;
  originalOrderId?: number;
  orderTypeId?: number;
  isOrderIdModified: boolean;
  isSkillSetModified: boolean;
  isBaseDetailsModified: boolean;
  disciplineId?: number;
  specialtyId?: number;
  subSpecialtyId?: number;
  originalDisciplineId?: number;
  originalSpecialtyId?: number;
  originalSubSpecialtyId?: number;
  tla?: boolean;
  createdUserId?: number;
  createdUserFirst: string;
  createdUserLast: string;
  createdDateAt?: Date;
  updatedUserId?: number;
  updatedUserFirst: string;
  updatedUserLast: string;
  updatedDateAt?: Date;
  grossMargin?: number;
  grossProfit?: number;
  revenue?: number;
  negotiatedContributionMargin: string;
  approvedUserId?: number;
  approvedUserFirst: string;
  approvedUserLast: string;
  approvedDateAt?: Date;
  approvedReasonId?: string;
  verifiedUserId?: number;
  verifiedUserFirst: string;
  verifiedUserLast: string;
  verifiedDateAt?: Date;
  verifiedReasonId?: number;
  notes: string;
  payCycleStartDayNum?: number;
  payCycleStartDay?: string;
  payCycleEndDayNum?: number;
  payCycleEndDay?: string;
  isPerDiemValuesValid: boolean;
  interimPayPackageTimeOffId?: number;
  assignment: IAssignmentDetails;
  timestamp?: string;
  insuranceEffectiveDate?: string;
  insuranceWaitingPeriod?: number;
  isDefaultScenario: boolean;
  isMostRecentBookingPeriod: boolean;
  hasApprovedScenario: boolean;
  splits: MarginDetailsResponseScenarioSplitItem[];
}

export interface MarginDetailsResponseScenarioSplitItem {
  id?: string;
  placementId: number;
  bookingPeriodId?: number;
  scenarioId?: number;
  splitId?: number;
  effectiveStartDate?: Date;
  effectiveEndDate?: Date;
  payCycleStartDayNum?: number;
  payCycleStartDay?: string;
  payCycleEndDayNum?: number;
  payCycleEndDay?: string;
  splitStartDayNum?: number;
  splitStartDay?: string;
  splitEndDayNum?: number;
  splitEndDay?: string;
  isPerDiemValuesValid: boolean;
  billRate?: number;
  contractRegularBillRate?: number;
  overtime?: number;
  holiday?: number;
  callback?: number;
  billGuaranteedHours?: number;
  billAmountPerMile?: number;
  payAmountPerMile?: number;
  splitPlacementId?: number;
  housingCoPay?: number;
  lodgingPerDiem?: number;
  standardFurniture?: number;
  housingTypeId?: number;
  housingType?: string;
  earlyMoveInDays?: number;
  earlyMoveInDaysWaived?: number;
  earlyMoveInCostPerDay?: number;
  lateMoveOutDays?: number;
  lateMoveOutDaysWaived?: number;
  lateMoveOutCostPerDay?: number;
  mealPerDiem?: number;
  cellPhoneStipend?: number;
  tlaMealAllowance?: number;
  tlaCarAllowance?: number;
  tlaShiftCompletionBonus?: number;
  shiftId?: number;
  shift?: string;
  hoursPerWeek?: number;
  hoursPerShift?: number;
  healthInsuranceTypeId?: number;
  healthInsuranceType?: string;
  isWaitingPeriodBenefit?: boolean;
  tlaCellPhoneStipend?: number;
  vms?: number;
  other?: number;
  billDoubletimeRate?: number;
  billOvertimeFactor?: number;
  billCallBackFactor?: number;
  billDoubletimeFactor?: number;
  billHolidayFactor?: number;
  billOnCallRate?: number;
  billCharge?: number;
  contractChargeAmount?: number;
  billPreceptor?: number;
  contractShiftId?: number;
  contractShiftDescription?: string;
  orientationHours?: number;
  isVoidOrientationHours?: boolean;
  payRate?: number;
  payrollRegularPayRate?: number;
  minPayRate?: number;
  payOvertimeFactor?: number;
  payCallBackFactor?: number;
  payDoubletimeFactor?: number;
  payHolidayFactor?: number;
  payOnCallRate?: number;
  payGuaranteedHours?: number;
  payCharge?: number;
  payrollChargeAmount?: number;
  payPreceptor?: number;
  payrollShiftId?: number;
  payrollShiftDescription?: string;
  csfSupervisorCosts?: number;
  additionalCostMiscellaneousAmount?: number;
  additionalCostMiscellaneousDescription?: string;
  furnitureCoPay?: number;
  isEarlyMoveIn?: boolean;
  isLateMoveOut?: boolean;
  earlyMoveInDate?: Date;
  lateMoveOutDate?: Date;
  rentCost?: number;
  utilities?: number;
  rentOverrideNot?: string;
  miscellaneousFurnitureDescription?: string;
  orientationFactor?: number;
  orientationRate?: number;
  orientationOverrideUserId?: number;
  orientationOverrideFirst?: string;
  orientationOverrideLast?: string;
  orientationOverrideDate?: Date;
  standardFurnitureOriginal?: number;
  utilitiesOriginal?: number;
  rentCostOriginal?: number;
  furnitureCosts: FurnitureCost[];
  moveInDate?: Date;
  moveOutDate?: Date;
  standardMinPayRate?: number;
  standardNewGradPayRate?: number;
  standardTlaMinPayRate?: number;
  standardTlaNewGradPayRate?: number;
  standardTeletherapy?: number;
  isAlliedTrue: boolean;
  isAssignmentSplit: boolean;
}

export interface FurnitureCost {
  id?: number;
  description: string;
  standardCost?: number;
  costToTraveler?: number;
  quantity: number;
  include?: boolean;
}

export interface PayPackageTimeOffItem {
  timeOffId?: number;
  startDate?: Date;
  endDate?: Date;
  days?: number;
  hours?: number;
  scenarioId?: number;
  splitId?: number;
  approvedBy: string;
}

export interface ScenarioSplitPayPackageDetailsValue {
  scenarioId?: number;
  splitId?: number;
  categoryId?: number;
  category: string;
  subCategoryId?: number;
  subCategory: string;
  pickListId?: number;
  pickListDescription: string;
  payPackageValues: Record<string, any>;
}

export interface IAssignmentDetails {
  timeOffs: IPayPackageTimeOffItem[];
  travel: IPlacementMarginDetailsResponseScenarioTravel;
  payPackageDetailsValues: IPlacementMarginDetailsResponseScenarioSplitPayPackageDetailsValue[];
}

export type IPayPackageTimeOffItem = {
  timeOffId: number;
  startDate: Date;
  endDate: Date;
  days: number;
  hours: number;
  scenarioId: number;
  splitId: number;
  approvedBy: string;
};

export type IPlacementMarginDetailsResponseScenarioTravel = {
  arrivingTravel?: number;
  arrivalAmountPerMile?: number;
  endingTravel?: number;
  endingAmountPerMile?: number;
  interimTravel?: number;
  interimAmountPerMile?: number;
  amnFlight?: number;
  amnRentalCar?: number;
};

export type IPlacementMarginDetailsResponseScenarioSplitPayPackageDetailsValue = {
  scenarioId?: number;
  splitId?: number;
  categoryId?: number;
  category?: string;
  subCategoryId?: number;
  subCategory?: string;
  pickListId?: number;
  pickListDescription?: string;
  payPackageValues: PayPackageValues;
};

export interface PayPackageItem {
  category: string;
  categoryId: number;
  payPackageValues: PayPackageValues;
  pickListDescription: string;
  pickListId: number;
  scenarioId: number;
  splitId: number;
  subCategory: string;
  subCategoryId: number;
}

interface PayPackageValues {
  amount: number;
  description: string;
  receiptsRequiredToPay: boolean;
}

export enum MarginEntityType {
  Placement = 'placement',
}
