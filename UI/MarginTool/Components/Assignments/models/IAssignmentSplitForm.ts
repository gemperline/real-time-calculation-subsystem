import { IFurnitureCosts } from "@AMIEWEB/MarginTool/IMarginToolSave";
export interface ISplitForm {
  additionalFurniture: string;
  additionalPremiumPay: {
    label: string;
    object: {
      id: number;
      description: string;
    };
  };
  amountPerMile: string;
  billRate: string;
  callBackFactor: string;
  callBackRate: string;
  cellPhoneStipend?: string;
  cfSupervisorCosts: string;
  chargeRate: string;
  doubleTimeFactor: string;
  doubleTimeRate: string;
  earlyMoveIn: boolean;
  earlyMoveInCostPerDay: string;
  earlyMoveInDate: string; // Can use Date if needed
  earlyMoveInDaysWaived: string;
  earlyMoveInNumberOfDays: string;
  effectiveEndDate: string; // Can use Date if needed
  effectiveStartDate: string; // Can use Date if needed
  furnitureCoPay: string;
  guaranteedHours: string;
  miscFurnitureDescription?: string;
  holidayFactor: string;
  holidayRate: string;
  hoursPerShift: number;
  hoursPerWeek: number;
  housingCoPay: string;
  housingType: {
    label: string;
    object: {
      description: string;
      id: number;
    };
  };
  insurance: {
    label: string;
    object: {
      description: string;
      id: number;
    };
  };
  lateMoveOut: boolean;
  lateMoveOutCostPerDay: string;
  lateMoveOutDate: string; // Can use Date if needed
  lateMoveOutDaysWaived: string;
  lateMoveOutNumberOfDays: string;
  lodgingPerDiem: string;
  mealPerDiem: string;
  miscellaneousAmount: string;
  miscellaneousDescription: string;
  moveInDate?: string | null;
  moveOutDate?: string | null;
  onCallRate: string;
  orientationFactor: string;
  orientationHours: string;
  orientationRate: string;
  otherFee: string;
  overtimeFactor: string;
  overtimeRate: string;
  payAmountPerMile: string;
  payCallBackFactor: string;
  payCharge: string;
  payDoubletimeFactor: string;
  payGuaranteedHours: string;
  payHolidayFactor: string;
  payOnCallRate: string;
  payOvertimeFactor: string;
  payPreceptor: string;
  payRate: string;
  preceptorRate: string;
  rentCostMonthly: string;
  rentOverrideNote?: string;
  shift: string;
  shiftId: number;
  splitId: number;
  standardFurniture: string;
  tlaCarAllowance?: string;
  tlaCellPhoneStipend?: string;
  tlaMealAllowance?: string;
  tlaShiftCompletionBonus?: string;
  utilities: string;
  vmsFee: string;
  voidOrientationHours?: boolean;
  waitingPeriod?: boolean;
  healthInsuranceType?: string;
  healthInsuranceTypeId?: number;
  furnitureCosts?:IFurnitureCosts[]
}

export interface IPayPackage {
  placementId: string;
}

export interface IAssignmentSplitsForm {
  assignmentSplits: ISplitForm[];
}

export interface IAssignmentForm {
  assignment: IAssignmentSplitFormDetails;
  assignmentSplits: ISplitForm[];
  payPackage: IPayPackage;
  timeOffRequest?: ITimeOffEntryForm[];
}

export interface IMarginFormBonus {
  bonusType: string;
  bonusAmount: string;
  category?: string;
}

export interface IMarginFormReimbursement {
  isReimbursementRequired: boolean;
  reimbursementAmount: string;
  reimbursementType: string;
  category?: string;
  categoryId?: number;
  subCategory?: string;
  description?: string;
}

interface IMarginFormTravel {
  amnFlight: string;
  amnRentalCar: string;
  arrivingTravel: string;
  endingTravel: string;
  interimTravel: string;
}

export interface IAssignmentSplitFormDetails {
  bonusesFieldArray: IMarginFormBonus[];
  reimbursementFieldArray: IMarginFormReimbursement[];
  travel: IMarginFormTravel;
}

export interface ITimeOffEntryForm {
  approvedBy: string;
  days: number | null;
  endDate: string;
  hours: number | null;
  id: string;
  scenarioId: string | null;
  splitId: number;
  startDate: string;
  timeOffId: string | null;
}
