export interface IMarginToolSave {
  placementId?: number;
  bookingPeriodId?: number;
  scenarioId?: number;
  scenarioName?: string;
  scenarioStatusId?: number;
  scenarioStatus?: string;
  orderId?: number;
  originalOrderId?: number;
  isOrderIdModified: boolean;
  disciplineId?: number;
  specialtyId?: number;
  subSpecialtyId?: number;
  originalDisciplineId?: number;
  originalSpecialtyId?: number;
  originalSubSpecialtyId?: number;
  isSkillSetModified: boolean;
  isBaseDetailsModified: boolean;
  tla?: boolean;
  createdUserId?: number;
  createdUserFirst?: string;
  createdUserLast?: string;
  createdDateAt?: string;
  updatedUserId?: number;
  updatedUserFirst?: string;
  updatedUserLast?: string;
  updatedDateAt?: string;
  grossMargin?: number;
  grossProfit?: number;
  revenue?: number;
  negotiatedContributionMargin?: number;
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
  notes?: string;
  interimPayPackageTimeOffId?: number;
  assignment?: IAssignmentDetails;
  timestamp?: string;
  isDefaultScenario: boolean;
  splits?: ISplit[];

  payCycleStartDayNum?: number;
  payCycleStartDay?: string;
  payCycleEndDayNum?: number;
  payCycleEndDay?: string;
  isPerDiemValuesValid?: boolean;
  hasApprovedScenario?: boolean | false;
  isMostRecentBookingPeriod?: boolean;

  userId?: number;
  isApprovalFlow?: boolean | false;
}

export interface ISplit {
  placementId?: number;
  bookingPeriodId?: number;
  scenarioId?: number;
  splitId?: number;
  effectiveStartDate?: string;
  effectiveEndDate?: string;
  payCycleStartDayNum?: number;
  payCycleStartDay?: string;
  payCycleEndDayNum?: number;
  payCycleEndDay?: string;
  isPerDiemValuesValid?: boolean;
  splitStartDayNum?: number;
  splitStartDay?: string;
  splitEndDayNum?: number;
  splitEndDay?: string;
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
  earlyMoveInDate?: string;
  lateMoveOutDate?: string;
  rentCost?: number;
  utilities?: number;
  rentOverrideNot?: string;
  miscellaneousFurnitureDescription?: string;
  orientationFactor?: number;
  orientationRate?: number;
  orientationOverrideUserId?: number;
  orientationOverrideFirst?: string;
  orientationOverrideLast?: string;
  orientationOverrideDate?: string;
  standardFurnitureOriginal?: number;
  utilitiesOriginal?: number;
  rentCostOriginal?: number;
  furnitureCosts?: IFurnitureCosts[];
  moveInDate?: Date;
  moveOutDate?: Date;
  standardMinPayRate?: number;
  standardNewGradPayRate?: number;
  standardTLAMinPayRate?: number;
  standardTLANewGradPayRate?: number;
  standardTeletherapy?: number;
  isAlliedTrue?: boolean;
  isAssignmentSplit?: boolean;
}

export interface IFurnitureCosts {
  id?: number;
  description?: string;
  standardCost?: number;
  costToTraveler?: number;
  quantity?: number;
}

export interface IAssignmentDetails {
  timeOffs?: IPayPackageTimeOffItem[];
  travel?: IPlacementMarginDetailsResponseScenarioTravel;
  payPackageDetailsValues?: IPlacementMarginDetailsResponseScenarioSplitPayPackageDetailsValue[];
}

export type IPayPackageTimeOffItem = {
  timeOffId?: number;
  startDate?: Date;
  endDate?: Date;
  days?: number;
  hours?: number;
  scenarioId?: number;
  splitId?: number;
  approvedBy?: string;
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
  payPackageValues?: IPayPackageValues;
};

export interface IPayPackageValues {
  amount?: number;
  description?: string;
  receiptsRequiredToPay?: boolean;
}
