import { MarginDetailsResponseScenario } from 'store/redux-store/margin-tool/slices/add-edit-scenario/add-edit-scenario.model';
import {
  IMarginToolSave,
  IPayPackageTimeOffItem,
  IPlacementMarginDetailsResponseScenarioSplitPayPackageDetailsValue,
  ISplit,
} from './IMarginToolSave';
import { IAssignmentForm, IMarginFormReimbursement } from './Components/Assignments/models/IAssignmentSplitForm';
import { IUser } from 'oidc/user.redux';
import {
  IPayPackageCategory,
  PayPackageDetailsValuesSubCategory,
  stringToEnumMap,
  PayPackageSubCategoryId,
} from './enum';
import { TreeViewLookupTypes } from './Components/Assignments/enum';

/**
 * Creates a payload for the Margin Tool SAVE.
 *
 * @param scenario - The scenario details to be used for creating the payload.
 * @param userId - The ID of the user creating the payload.
 * @returns The payload object for the Margin Tool.
 */
export const createPayloadMarginTool = (
  assignmentForm: IAssignmentForm,
  selectedScenario: MarginDetailsResponseScenario,
  user: IUser,
  timestamp: string,
  editTimeOffs: IPayPackageTimeOffItem[],
  isApprovalFlow: boolean | false,
): IMarginToolSave => {
  return {
    placementId: selectedScenario?.placementId,
    bookingPeriodId: selectedScenario?.bookingPeriodId,
    scenarioId: selectedScenario?.scenarioId,
    scenarioName: selectedScenario?.scenarioName,
    scenarioStatusId: selectedScenario?.scenarioStatusId,
    scenarioStatus: selectedScenario?.scenarioStatus,
    orderId: selectedScenario?.orderId,
    originalOrderId: selectedScenario?.originalOrderId,
    isOrderIdModified: selectedScenario?.isOrderIdModified,
    disciplineId: selectedScenario?.disciplineId,
    specialtyId: selectedScenario?.specialtyId,
    subSpecialtyId: selectedScenario?.subSpecialtyId,
    originalDisciplineId: selectedScenario?.originalDisciplineId,
    originalSpecialtyId: selectedScenario?.originalSpecialtyId,
    originalSubSpecialtyId: selectedScenario?.originalSubSpecialtyId,
    isBaseDetailsModified: selectedScenario?.isBaseDetailsModified,
    isSkillSetModified: selectedScenario?.isSkillSetModified,
    tla: selectedScenario?.tla,
    createdUserId: selectedScenario?.createdUserId,
    createdUserFirst: selectedScenario?.createdUserFirst,
    createdUserLast: selectedScenario?.createdUserLast,
    createdDateAt: selectedScenario?.createdDateAt ? new Date(selectedScenario?.createdDateAt).toISOString() : '',
    updatedUserId: selectedScenario?.updatedUserId,
    updatedUserFirst: selectedScenario?.updatedUserFirst,
    updatedUserLast: selectedScenario?.updatedUserLast,
    updatedDateAt: selectedScenario?.updatedDateAt ? new Date(selectedScenario?.updatedDateAt).toISOString() : '',
    revenue: selectedScenario?.revenue,
    grossMargin: selectedScenario?.grossMargin,
    grossProfit: selectedScenario?.grossProfit,
    negotiatedContributionMargin: selectedScenario?.negotiatedContributionMargin
      ? parseFloat(selectedScenario?.negotiatedContributionMargin)
      : null,
    payCycleStartDayNum: selectedScenario?.payCycleStartDayNum,
    payCycleStartDay: selectedScenario?.payCycleStartDay,
    payCycleEndDayNum: selectedScenario?.payCycleEndDayNum,
    payCycleEndDay: selectedScenario?.payCycleEndDay,
    isPerDiemValuesValid: selectedScenario?.isPerDiemValuesValid,
    approvedUserId: selectedScenario?.approvedUserId,
    approvedUserFirst: selectedScenario?.approvedUserFirst,
    approvedUserLast: selectedScenario?.approvedUserLast,
    approvedDateAt: selectedScenario?.approvedDateAt,
    approvedReasonId: selectedScenario?.approvedReasonId,
    verifiedUserId: selectedScenario?.verifiedUserId,
    verifiedUserFirst: selectedScenario?.verifiedUserFirst,
    verifiedUserLast: selectedScenario?.verifiedUserLast,
    verifiedDateAt: selectedScenario?.verifiedDateAt,
    verifiedReasonId: selectedScenario?.verifiedReasonId,
    notes: selectedScenario?.notes,
    interimPayPackageTimeOffId: selectedScenario?.interimPayPackageTimeOffId,
    assignment: {
      timeOffs: editTimeOffs,
      travel: {
        arrivingTravel: assignmentForm?.assignment?.travel?.arrivingTravel
          ? parseFloat(assignmentForm?.assignment?.travel?.arrivingTravel)
          : null,
        endingTravel: assignmentForm?.assignment?.travel?.endingTravel
          ? parseFloat(assignmentForm?.assignment?.travel?.endingTravel)
          : null,
        interimTravel: assignmentForm?.assignment?.travel?.interimTravel
          ? parseFloat(assignmentForm?.assignment?.travel?.interimTravel)
          : null,
        amnFlight: assignmentForm?.assignment?.travel?.amnFlight
          ? parseFloat(assignmentForm?.assignment?.travel?.amnFlight)
          : null,
        amnRentalCar: assignmentForm?.assignment?.travel?.amnRentalCar
          ? parseFloat(assignmentForm?.assignment?.travel?.amnRentalCar)
          : null,
        arrivalAmountPerMile: selectedScenario?.assignment?.travel?.arrivalAmountPerMile,
        endingAmountPerMile: selectedScenario?.assignment?.travel?.endingAmountPerMile,
        interimAmountPerMile: selectedScenario?.assignment?.travel?.interimAmountPerMile,
      },
      payPackageDetailsValues: transformedPayPackageDetailsValues(assignmentForm, selectedScenario),
    },
    timestamp: timestamp,
    isDefaultScenario: selectedScenario?.isDefaultScenario,
    isMostRecentBookingPeriod: selectedScenario?.isMostRecentBookingPeriod,
    hasApprovedScenario: selectedScenario?.hasApprovedScenario,
    splits: transformSplits(assignmentForm, selectedScenario),
    userId: user?.userInfo?.employeeId,
    isApprovalFlow: isApprovalFlow,
  };
};

export const transformSplits = (
  assignmentForm: IAssignmentForm,
  selectedScenario: MarginDetailsResponseScenario,
): ISplit[] => {
  return assignmentForm.assignmentSplits.map((split, index) => {
    const selectedScenarioSplit = selectedScenario?.splits?.[index];
    return {
      placementId: selectedScenario?.placementId,
      bookingPeriodId: selectedScenario?.bookingPeriodId,
      scenarioId: selectedScenario?.scenarioId,
      splitId: split?.splitId,
      effectiveStartDate: split?.effectiveStartDate,
      effectiveEndDate: split?.effectiveEndDate,
      payCycleStartDayNum: selectedScenarioSplit?.payCycleStartDayNum,
      payCycleStartDay: selectedScenarioSplit?.payCycleStartDay,
      payCycleEndDayNum: selectedScenarioSplit?.payCycleEndDayNum,
      payCycleEndDay: selectedScenarioSplit?.payCycleEndDay,
      isPerDiemValuesValid: selectedScenarioSplit?.isPerDiemValuesValid,
      splitStartDayNum: selectedScenarioSplit?.splitStartDayNum,
      splitStartDay: selectedScenarioSplit?.splitStartDay,
      splitEndDayNum: selectedScenarioSplit?.splitEndDayNum,
      splitEndDay: selectedScenarioSplit?.splitEndDay,
      billRate: split?.billRate ? parseFloat(split?.billRate) : null,
      contractRegularBillRate: selectedScenarioSplit?.contractRegularBillRate,
      contractShiftId: selectedScenarioSplit?.contractShiftId,
      contractShiftDescription: selectedScenarioSplit?.contractShiftDescription,
      overtime: split?.overtimeRate ? parseFloat(split?.overtimeRate) : null,
      holiday: split?.holidayRate ? parseFloat(split?.holidayRate) : null,
      callback: split?.callBackRate ? parseFloat(split?.callBackRate) : null,
      billGuaranteedHours: split?.guaranteedHours ? parseFloat(split?.guaranteedHours) : null,
      billAmountPerMile: split?.amountPerMile ? parseFloat(split?.amountPerMile) : null,
      payAmountPerMile: split?.payAmountPerMile ? parseFloat(split?.payAmountPerMile) : null,
      splitPlacementId: selectedScenarioSplit?.splitPlacementId,
      housingCoPay: split?.housingCoPay ? parseFloat(split?.housingCoPay) : null,
      lodgingPerDiem: split?.lodgingPerDiem ? parseFloat(split?.lodgingPerDiem) : null,
      standardFurniture: split?.standardFurniture ? parseFloat(split?.standardFurniture) : null,
      housingTypeId: split?.housingType?.object?.id,
      housingType: split?.housingType?.object?.description,
      earlyMoveInDays: split?.earlyMoveInNumberOfDays ? parseFloat(split?.earlyMoveInNumberOfDays) : null,
      earlyMoveInDaysWaived: split?.earlyMoveInDaysWaived ? parseFloat(split?.earlyMoveInDaysWaived) : null,
      earlyMoveInCostPerDay: split?.earlyMoveInCostPerDay ? parseFloat(split?.earlyMoveInCostPerDay) : null,
      lateMoveOutDays: split?.lateMoveOutNumberOfDays ? parseFloat(split?.lateMoveOutNumberOfDays) : null,
      lateMoveOutDaysWaived: split?.lateMoveOutDaysWaived ? parseFloat(split?.lateMoveOutDaysWaived) : null,
      lateMoveOutCostPerDay: split?.lateMoveOutCostPerDay ? parseFloat(split?.lateMoveOutCostPerDay) : null,
      mealPerDiem: split?.mealPerDiem ? parseFloat(split?.mealPerDiem) : null,
      cellPhoneStipend: split?.cellPhoneStipend ? parseFloat(split?.cellPhoneStipend) : null,
      tlaMealAllowance: split?.tlaMealAllowance ? parseFloat(split?.tlaMealAllowance) : null,
      tlaCarAllowance: split?.tlaCarAllowance ? parseFloat(split?.tlaCarAllowance) : null,
      tlaShiftCompletionBonus: split?.tlaShiftCompletionBonus ? parseFloat(split?.tlaShiftCompletionBonus) : null,
      shiftId: split?.shiftId,
      shift: split?.shift,
      hoursPerWeek: split?.hoursPerWeek,
      hoursPerShift: split?.hoursPerShift,
      healthInsuranceTypeId: split?.insurance?.object?.id ?? null,
      healthInsuranceType: split?.insurance?.object?.description ?? null,
      isWaitingPeriodBenefit: split?.waitingPeriod || false,
      tlaCellPhoneStipend: split?.tlaCellPhoneStipend ? parseFloat(split?.tlaCellPhoneStipend) : null,
      vms: split?.vmsFee ? parseFloat(split?.vmsFee) : null,
      other: split?.otherFee ? parseFloat(split?.otherFee) : null,
      billDoubletimeRate: split?.doubleTimeRate ? parseFloat(split?.doubleTimeRate) : null,
      billOvertimeFactor: split?.overtimeFactor ? parseFloat(split?.overtimeFactor) : null,
      billCallBackFactor: split?.callBackFactor ? parseFloat(split?.callBackFactor) : null,
      billDoubletimeFactor: split?.doubleTimeFactor ? parseFloat(split?.doubleTimeFactor) : null,
      billHolidayFactor: split?.holidayFactor ? parseFloat(split?.holidayFactor) : null,
      billOnCallRate: split?.onCallRate ? parseFloat(split?.onCallRate) : null,
      billCharge: split?.chargeRate ? parseFloat(split?.chargeRate) : null,
      contractChargeAmount: selectedScenarioSplit?.contractChargeAmount,
      billPreceptor: split?.preceptorRate ? parseFloat(split?.preceptorRate) : null,
      orientationHours: split?.orientationHours ? parseFloat(split?.orientationHours) : null,
      isVoidOrientationHours: split?.voidOrientationHours || false,
      payRate: split?.payRate ? parseFloat(split?.payRate) : null,
      payrollRegularPayRate: selectedScenarioSplit?.payrollRegularPayRate,
      minPayRate: selectedScenarioSplit?.minPayRate,
      payOvertimeFactor: split?.payOvertimeFactor ? parseFloat(split?.payOvertimeFactor) : null,
      payCallBackFactor: split?.payCallBackFactor ? parseFloat(split?.payCallBackFactor) : null,
      payDoubletimeFactor: split?.payDoubletimeFactor ? parseFloat(split?.payDoubletimeFactor) : null,
      payHolidayFactor: split?.payHolidayFactor ? parseFloat(split?.payHolidayFactor) : null,
      payOnCallRate: split?.payOnCallRate ? parseFloat(split?.payOnCallRate) : null,
      payGuaranteedHours: split?.payGuaranteedHours ? parseFloat(split?.payGuaranteedHours) : null,
      payCharge: split?.payCharge ? parseFloat(split?.payCharge) : null,
      payrollChargeAmount: selectedScenarioSplit?.payrollChargeAmount,
      payPreceptor: split?.payPreceptor ? parseFloat(split?.payPreceptor) : null,
      payrollShiftId: selectedScenarioSplit?.payrollShiftId,
      payrollShiftDescription: selectedScenarioSplit?.payrollShiftDescription,
      csfSupervisorCosts: split?.cfSupervisorCosts ? parseFloat(split?.cfSupervisorCosts) : null,
      additionalCostMiscellaneousAmount: split?.miscellaneousAmount ? parseFloat(split?.miscellaneousAmount) : null,
      additionalCostMiscellaneousDescription: split?.miscellaneousDescription,
      furnitureCoPay: split?.furnitureCoPay ? parseFloat(split?.furnitureCoPay) : null,
      isEarlyMoveIn: split?.earlyMoveIn || false,
      isLateMoveOut: split?.lateMoveOut || false,
      earlyMoveInDate: split?.earlyMoveInDate ? split?.earlyMoveInDate : null,
      lateMoveOutDate: split?.lateMoveOutDate ? split?.lateMoveOutDate : null,
      rentCost: split?.rentCostMonthly ? parseFloat(split?.rentCostMonthly) : null,
      utilities: split?.utilities ? parseFloat(split?.utilities) : null,
      rentOverrideNot: split?.rentOverrideNote ? split?.rentOverrideNote : null,
      miscellaneousFurnitureDescription: split?.miscFurnitureDescription || null,
      orientationFactor: split?.orientationFactor ? parseFloat(split?.orientationFactor) : null,
      orientationRate: split?.orientationRate ? parseFloat(split?.orientationRate) : null,
      orientationOverrideUserId: selectedScenarioSplit?.orientationOverrideUserId,
      orientationOverrideFirst: selectedScenarioSplit?.orientationOverrideFirst,
      orientationOverrideLast: selectedScenarioSplit?.orientationOverrideLast,
      orientationOverrideDate: selectedScenarioSplit?.orientationOverrideDate
        ? new Date(selectedScenarioSplit?.orientationOverrideDate).toISOString()
        : null,
      standardFurnitureOriginal: selectedScenarioSplit?.standardFurnitureOriginal,
      utilitiesOriginal: selectedScenarioSplit?.utilitiesOriginal,
      rentCostOriginal: selectedScenarioSplit?.rentCostOriginal,
      furnitureCosts: split?.furnitureCosts || selectedScenarioSplit?.furnitureCosts || [],
      moveInDate: selectedScenarioSplit?.moveInDate,
      moveOutDate: selectedScenarioSplit?.moveOutDate,
      standardMinPayRate: selectedScenarioSplit?.standardMinPayRate ? selectedScenarioSplit?.standardMinPayRate : null,
      standardNewGradPayRate: selectedScenarioSplit?.standardNewGradPayRate
        ? selectedScenarioSplit?.standardNewGradPayRate
        : null,
      standardTLAMinPayRate: selectedScenarioSplit?.standardTlaMinPayRate
        ? selectedScenarioSplit?.standardTlaMinPayRate
        : null,
      standardTLANewGradPayRate: selectedScenarioSplit?.standardTlaNewGradPayRate
        ? selectedScenarioSplit?.standardTlaNewGradPayRate
        : null,
      standardTeletherapy: selectedScenarioSplit?.standardTeletherapy
        ? selectedScenarioSplit?.standardTeletherapy
        : null,
      isAlliedTrue: selectedScenarioSplit?.isAlliedTrue,
      isAssignmentSplit: selectedScenarioSplit?.isAssignmentSplit || false,
    };
  });
};

export const transformedPayPackageDetailsValues = (
  assignmentForm: IAssignmentForm,
  selectedScenario: MarginDetailsResponseScenario,
): IPlacementMarginDetailsResponseScenarioSplitPayPackageDetailsValue[] => {
  const reimbursement = mapReimbursements(assignmentForm?.assignment?.reimbursementFieldArray, selectedScenario);
  const bonusType = mapBonus(assignmentForm?.assignment?.bonusesFieldArray, selectedScenario);
  const additionalPremiumPay = mapAdditionalPremiumPay(assignmentForm, selectedScenario);
  return [...reimbursement, ...bonusType, ...additionalPremiumPay];
};

const mapReimbursements = (
  reimbursementFieldArray: IMarginFormReimbursement[],
  selectedScenario: MarginDetailsResponseScenario,
) => {
  if (!reimbursementFieldArray) return [];
  const reimbursements = reimbursementFieldArray?.map(reimbursementItem => ({
    scenarioId: selectedScenario?.scenarioId,
    splitId: null, // need confirmation
    categoryId: reimbursementItem?.category ? IPayPackageCategory.Reimbursements : null,
    category: reimbursementItem?.category,
    subCategory: reimbursementItem?.subCategory,
    subCategoryId: getSubCategoryId(reimbursementItem?.subCategory),
    pickListDescription: reimbursementItem?.reimbursementType,
    pickListId: null, // confirm -  if pickListId is needed to be taken directly from selector as it is not present in form.
    payPackageValues: {
      amount: reimbursementItem?.reimbursementAmount ? parseFloat(reimbursementItem?.reimbursementAmount) : 0,
      description: reimbursementItem?.description ? reimbursementItem?.description : null,
      receiptsRequiredToPay: Boolean(reimbursementItem?.isReimbursementRequired),
    },
  }));
  return reimbursements;
};

const mapBonus = (bonusesFieldArray, selectedScenario: MarginDetailsResponseScenario) => {
  if (!bonusesFieldArray) return [];
  const bonuses = bonusesFieldArray?.map(bonusItem => ({
    scenarioId: selectedScenario?.scenarioId,
    splitId: null, // need confirmation
    categoryId: bonusItem?.categoryId,
    category: TreeViewLookupTypes.BonusType, // TO-DO : remove the hardcoded value and bind properly with the formData.
    subCategory: TreeViewLookupTypes.BonusType, // TO-DO : remove the hardcoded value and bind properly with the formData.
    subCategoryId: getSubCategoryId(TreeViewLookupTypes.BonusType), // confirm -  category is same as subCategory.
    pickListDescription: bonusItem?.bonusType,
    pickListId: null, // confirm -  if pickListId is needed to be taken directly from selector as it is not present in form.
    payPackageValues: {
      amount: bonusItem?.bonusAmount ? parseFloat(bonusItem?.bonusAmount) : 0,
      description: bonusItem?.description ? bonusItem?.description : null,
    },
  }));
  return bonuses;
};

const mapAdditionalPremiumPay = (assignmentForm: IAssignmentForm, selectedScenario: MarginDetailsResponseScenario) => {
  const data = assignmentForm?.assignmentSplits?.map(pay => {
    return {
      pickListDescription: pay?.additionalPremiumPay?.object?.description,
      pickListId: pay?.additionalPremiumPay?.object?.id,
      splitId: pay?.splitId,
    };
  });
  if (!data) return [];
  const additionalPremiumPay = data?.map(item => ({
    scenarioId: selectedScenario?.scenarioId,
    splitId: item?.splitId,
    categoryId: IPayPackageCategory.PayRates,
    category: TreeViewLookupTypes.PayRates, // this needs to be hardcoded.
    subCategory: PayPackageDetailsValuesSubCategory.additionalPremiumPay, // this needs to be hardcoded.
    subCategoryId: getSubCategoryId(PayPackageDetailsValuesSubCategory.additionalPremiumPay),
    pickListDescription: item?.pickListDescription,
    pickListId: item?.pickListId,
    payPackageValues: {},
  }));
  return additionalPremiumPay;
};

export const getSubCategoryId = (subCategory: string) => {
  const enumKey = stringToEnumMap[subCategory];
  if (enumKey) {
    return PayPackageSubCategoryId[enumKey];
  }
  return null;
};
