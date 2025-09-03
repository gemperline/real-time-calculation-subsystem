export interface IPeopleSoftMarginDetailsRequest {
  placementId: number;
  bookingPeriodId?: number;
  scenarioId?: number;
  scenarioName: string;
  facilityId: number;
  disciplineId?: number;
  specialtyId?: number;
  subspecialtyId?: number;
  bookingPeriodStartDate?: Date;
  bookingPeriodEndDate?: Date;
  brandId?: number;
  brand: string;
  userId: number;
  autoSave: boolean;
  splits: ScenarioMarginCalculationDetailsSplitItem[];
  timestamp: string;
}

export interface IPeopleSoftCalculationResult {
  placementId: number;
  scenarioId?: number;
  userId: number;
  grossProfit?: number;
  grossMargin?: number;
  revenue?: number;
  negotiatedContributionMargin?: number;
  timestamp: string;
}

interface ScenarioMarginCalculationDetailsSplitItem {
  splitId?: number;
  splitStartDate?: string;
  splitEndDate?: string;
  shiftId?: number;
  shift: string;
  hoursPerWeek?: number;
  hoursPerShift?: number;
  billRateOvertimeFactor?: number;
  payRateOvertimeFactor?: number;
  billRateDoubletimeFactor?: number;
  payRateDoubletimeFactor?: number;
  additionalPremiumPayDesc: string;
  billRateAdditionalOvertimeRate?: number;
  billRateAdditionalDoubletimeRate?: number;
  billRateRegularRate?: number;
  billRateVms?: number;
  billRateOther?: number;
  payRateRegularRate?: number;
  billRateOvertimeRate?: number;
  billRateDoubleTimeRate?: number;
  payRateDoubleTimeRate?: number;
  timeOffs: PayPackageTimeOffItem[];
  healthInsuranceTypeId?: number;
  healthInsuranceType: string;
  isWaitingPeriod: boolean;
  isVoidOrientationHours: boolean;
  billRateOrientationHours?: number;
  travelArrivingTravelValue: number;
  travelEndingTravelValue: number;
  travelInterimTravelValue: number;
  bonusesFacilitySignOnValue: number;
  bonusesAmnSignOnValue: number;
  bonusesFacilityCompletionValue: number;
  bonusesAmnCompletionValue: number;
  bonusesInconvenienceValue: number;
  allowancesStipendsMealPerDiemValue: number;
  allowancesStipendsLodgingPerDiemValue: number;
  allowancesStipendsCellPhoneStipendValue: number;
  allowancesStipendsTlaCarAllowanceValue: number;
  allowancesStipendsTlaMealAllowanceValue: number;
  allowancesStipendsTlaShiftCompletionBonusValue: number;
  allowancesStipendsTlaCellPhoneStipendValue: number;
  amnHousingUtilitiesValue: number;
  amnHousingStandardFurnitureValue: number;
  amnHousingAdditionalFurnitureValue: number;
  amnHousingRentCostValue: number;
  amnHousingCoPayValue: number;
  amnFurnitureCoPayValue: number;
  travelAmnFlightValue: number;
  travelAmnRentalCartValue: number;
  amnHousingEarlyMoveInCostPerDayValue: number;
  amnHousingEarlyMoveInDaysWaivedValue: number;
  amnHousingLateMoveOutCostPerDayValue: number;
  amnHousingLateMoveOutDaysWaivedValue: number;
  costItems: ScenarioMarginCalculationDetailsSplitItemCostItem[];
}

interface PayPackageTimeOffItem {
  timeOffId?: number;
  startDate?: Date;
  endDate?: Date;
  days?: number;
  hours?: number;
  scenarioId?: number;
  splitId?: number;
  approvedBy: string;
}

interface ScenarioMarginCalculationDetailsSplitItemCostItem {
  category: string;
  type: string;
  field: string;
  rate: number;
  isReceiptsRequiredToPay: boolean;
}
