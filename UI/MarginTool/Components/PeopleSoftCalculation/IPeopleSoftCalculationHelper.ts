import {
  MarginDetailsResponse,
  MarginDetailsResponseScenario,
} from 'store/redux-store/margin-tool/slices/add-edit-scenario/add-edit-scenario.model';
import { MarginBonusTypes } from '../Assignments/enum';
import {
  IAssignmentForm,
  IAssignmentSplitFormDetails,
  ISplitForm,
  ITimeOffEntryForm,
} from '../Assignments/models/IAssignmentSplitForm';
import { IPeopleSoftMarginDetailsRequest } from './IPeopleSoftCalculation';
import { IUser } from 'oidc/user.redux';
import { assignmentActions } from 'store/redux-store/margin-tool/slices/assignment/assignment.redux';
import { transformReimbursementForPeopleSoftCalculation } from '../Assignments/Reimbursement/helper';
import { mapAdditionalCostsForPeopleSoftCalculation } from '../Assignments/AdditionalCosts/helper';
import { mapBonusesForPeopleSoftCalculations } from '../Assignments/Bonuses/helper';
import { useDispatch } from 'react-redux';
import { useFormContext } from 'react-hook-form';
import { IRequestTimeOff } from 'store/redux-store/margin-tool/slices/assignment/assignment.model';

export const createRequestPayloadForPeopleSoftCalculation = (
  assignmentForm: IAssignmentForm,
  selectedScenario: MarginDetailsResponseScenario,
  user: IUser,
  currentMarginDetail: MarginDetailsResponse,
  timestamp: string,
  autoSave: boolean,
): IPeopleSoftMarginDetailsRequest => {
  const requestPayload = {
    placementId: currentMarginDetail?.placementId,
    bookingPeriodId: selectedScenario?.bookingPeriodId,
    scenarioId: selectedScenario?.scenarioId,
    scenarioName: selectedScenario?.scenarioName,
    facilityId: currentMarginDetail?.facility?.facilityId,
    disciplineId: currentMarginDetail?.disciplineId,
    specialtyId: currentMarginDetail?.specialtyId,
    subspecialtyId: currentMarginDetail?.subspecialtyId,
    bookingPeriodStartDate: currentMarginDetail?.bookingPeriodStartDate,
    bookingPeriodEndDate: currentMarginDetail?.bookingPeriodEndDate,
    brandId: currentMarginDetail?.brandId,
    brand: currentMarginDetail?.brand,
    userId: user?.userInfo?.employeeId,
    autoSave,
    timestamp,
    splits: transformSplits(assignmentForm, selectedScenario),
  };
  return requestPayload;
};

/**
 *  Method to transform the assignment splits
 * @param assignmentForm
 */
const transformSplits = (assignmentForm: IAssignmentForm, selectedScenario: MarginDetailsResponseScenario) => {
  const assignmentSection = assignmentForm?.assignment;
  const assignmentSplits = assignmentForm?.assignmentSplits;
  const timeOffRequest = mapTimeRequest(assignmentForm?.timeOffRequest, selectedScenario);

  const mappedSplits = assignmentSplits?.map((currentSplit: ISplitForm) => {
    const {
      bonusesFacilitySignOnValue,
      bonusesAmnSignOnValue,
      bonusesFacilityCompletionValue,
      bonusesAmnCompletionValue,
      bonusesInconvenienceValue,
    } = extractBonusesValuesFrom(assignmentSection?.bonusesFieldArray);
    const transformCostItems = mapCostItems(currentSplit, assignmentSection);

    return {
      splitId: currentSplit?.splitId,
      splitStartDate: currentSplit?.effectiveStartDate,
      splitEndDate: currentSplit?.effectiveEndDate,
      shiftId: currentSplit?.shiftId,
      shift: currentSplit?.shift,
      hoursPerWeek: currentSplit?.hoursPerWeek,
      hoursPerShift: currentSplit?.hoursPerShift,
      billRateOvertimeFactor: parseFloat(currentSplit?.overtimeFactor) || 0,
      payRateOvertimeFactor: parseFloat(currentSplit?.payOvertimeFactor) || 0,
      billRateDoubletimeFactor: parseFloat(currentSplit?.doubleTimeFactor) || 0,
      payRateDoubletimeFactor: parseFloat(currentSplit?.payDoubletimeFactor) || 0,
      additionalPremiumPayDesc: currentSplit?.additionalPremiumPay?.label || '',
      billRateAdditionalOvertimeRate: parseFloat(currentSplit?.overtimeRate) || 0, //@To-do-margin-tool need confirmation - change name to billRateAdditionalOvertimeRate
      billRateAdditionalDoubletimeRate: parseFloat(currentSplit?.doubleTimeRate) || 0, //@To-do-margin-tool need confirmation - change name to billRateAdditionalDoubletimeRate
      billRateRegularRate: parseFloat(currentSplit?.billRate) || 0,
      billRateVms: parseFloat(currentSplit?.vmsFee) || 0,
      billRateOther: parseFloat(currentSplit?.otherFee) || 0,
      payRateRegularRate: parseFloat(currentSplit?.payRate) || 0,
      billRateOvertimeRate: 0, // need confirmation - duplicate - not in use
      billRateDoubleTimeRate: 0, // need confirmation - duplicate - not in use
      payRateDoubleTimeRate: 0, // need confirmation  does not exist on UI .
      timeOffs: timeOffRequest ?? [],
      healthInsuranceTypeId: currentSplit?.insurance?.object?.id,
      healthInsuranceType: currentSplit?.insurance?.object?.description,
      isWaitingPeriod: Boolean(currentSplit?.waitingPeriod),
      isVoidOrientationHours: Boolean(currentSplit?.voidOrientationHours),
      billRateOrientationHours: parseFloat(currentSplit?.orientationHours) || 0,
      travelArrivingTravelValue: parseFloat(assignmentSection?.travel?.arrivingTravel) || 0,
      travelEndingTravelValue: parseFloat(assignmentSection?.travel?.endingTravel) || 0,
      travelInterimTravelValue: parseFloat(assignmentSection?.travel?.interimTravel) || 0,
      bonusesFacilitySignOnValue: parseFloat(bonusesFacilitySignOnValue), // Placeholder: Adjust according to the requirement
      bonusesAmnSignOnValue: parseFloat(bonusesAmnSignOnValue), // Placeholder: Adjust according to the requirement
      bonusesFacilityCompletionValue: parseFloat(bonusesFacilityCompletionValue), // Placeholder: Adjust according to the requirement
      bonusesAmnCompletionValue: parseFloat(bonusesAmnCompletionValue), // Placeholder: Adjust according to the requirement
      bonusesInconvenienceValue: parseFloat(bonusesInconvenienceValue), // Placeholder: Adjust according to the requirement
      allowancesStipendsMealPerDiemValue: parseFloat(currentSplit?.mealPerDiem) || 0,
      allowancesStipendsLodgingPerDiemValue: parseFloat(currentSplit?.lodgingPerDiem) || 0,
      allowancesStipendsCellPhoneStipendValue: parseFloat(currentSplit?.cellPhoneStipend) || 0,
      allowancesStipendsTlaCarAllowanceValue: parseFloat(currentSplit?.tlaCarAllowance) || 0,
      allowancesStipendsTlaMealAllowanceValue: parseFloat(currentSplit?.tlaMealAllowance) || 0,
      allowancesStipendsTlaShiftCompletionBonusValue: parseFloat(currentSplit?.tlaShiftCompletionBonus) || 0,
      allowancesStipendsTlaCellPhoneStipendValue: parseFloat(currentSplit?.tlaCellPhoneStipend) || 0,
      amnHousingUtilitiesValue: parseFloat(currentSplit?.utilities) || 0,
      amnHousingStandardFurnitureValue: parseFloat(currentSplit?.standardFurniture) || 0,
      amnHousingAdditionalFurnitureValue: parseFloat(currentSplit?.additionalFurniture) || 0,
      amnHousingRentCostValue: parseFloat(currentSplit?.rentCostMonthly) || 0,
      amnHousingCoPayValue: parseFloat(currentSplit?.housingCoPay) || 0,
      amnFurnitureCoPayValue: parseFloat(currentSplit?.furnitureCoPay) || 0,
      travelAmnFlightValue: parseFloat(assignmentSection?.travel?.amnFlight) || 0,
      travelAmnRentalCartValue: parseFloat(assignmentSection?.travel?.amnRentalCar) || 0,
      amnHousingEarlyMoveInCostPerDayValue: parseFloat(currentSplit?.earlyMoveInCostPerDay) || 0,
      amnHousingEarlyMoveInDaysWaivedValue: parseFloat(currentSplit?.earlyMoveInDaysWaived) || 0,
      amnHousingLateMoveOutCostPerDayValue: parseFloat(currentSplit?.lateMoveOutCostPerDay) || 0,
      amnHousingLateMoveOutDaysWaivedValue: parseFloat(currentSplit?.lateMoveOutDaysWaived) || 0,
      costItems: transformCostItems,
    };
  });
  return mappedSplits;
};

/**
 *  Remove this method and update it with category type
 * @param bonusesFieldArray
 * @param bonusType
 */
const extractBonusesValuesFrom = (
  bonusesFieldArray: {
    bonusAmount: string;
    bonusType: string;
  }[],
) => {
  const bonusesFacilitySignOnValue =
    bonusesFieldArray?.find(bonus => bonus?.bonusType === MarginBonusTypes.FacilitySignOn)?.bonusAmount ?? '0';
  const bonusesAmnSignOnValue =
    bonusesFieldArray?.find(bonus => bonus?.bonusType === MarginBonusTypes.AMNSignOn)?.bonusAmount ?? '0';
  const bonusesFacilityCompletionValue =
    bonusesFieldArray?.find(bonus => bonus?.bonusType === MarginBonusTypes.FacilityCompletion)?.bonusAmount ?? '0';
  const bonusesAmnCompletionValue =
    bonusesFieldArray?.find(bonus => bonus?.bonusType === MarginBonusTypes.AMNCompletion)?.bonusAmount ?? '0';
  const bonusesInconvenienceValue =
    bonusesFieldArray?.find(bonus => bonus?.bonusType === MarginBonusTypes.Inconvenience)?.bonusAmount ?? '0';
  return {
    bonusesFacilitySignOnValue,
    bonusesAmnSignOnValue,
    bonusesFacilityCompletionValue,
    bonusesAmnCompletionValue,
    bonusesInconvenienceValue,
  };
};

/**
 *
 * @param timeOffRequest - time off request in assignment container
 * @param selectedScenario - selected scenario
 */
const mapTimeRequest = (timeOffRequest: ITimeOffEntryForm[], selectedScenario: MarginDetailsResponseScenario) => {
  return timeOffRequest?.map(timeOff => ({
    timeOffId: timeOff?.timeOffId ? Number(timeOff?.timeOffId) : 0,
    startDate: timeOff?.startDate ? new Date(timeOff.startDate) : null,
    endDate: timeOff?.endDate ? new Date(timeOff.endDate) : null,
    days: timeOff?.days,
    hours: timeOff?.hours,
    scenarioId: selectedScenario?.scenarioId,
    splitId: null, // need confirmation
    approvedBy: timeOff?.approvedBy,
  }));
};

/**
 * Method to map the cost items
 * Combine additional costs, reimbursements, bonuses as cost items from assignment section on UI
 */
const mapCostItems = (split: ISplitForm, assignmentSection: IAssignmentSplitFormDetails) => {
  const additionalCost = mapAdditionalCostsForPeopleSoftCalculation(split);
  const reimbursements = transformReimbursementForPeopleSoftCalculation(assignmentSection?.reimbursementFieldArray);
  const bonuses = mapBonusesForPeopleSoftCalculations(assignmentSection?.bonusesFieldArray);
  const combinedCostItems = [...additionalCost, ...reimbursements, ...bonuses];
  return combinedCostItems;
};

/**
 * Custom hook to trigger the PeopleSoft calculation
 * Extract triggerPeopleSoftCalculation calculation method from the usePeopleSoftCalculation hook
 * @param timeOffRequest - Requested time off from assignment section
 */
export const usePeopleSoftCalculation = () => {
  const dispatch = useDispatch();
  const { watch } = useFormContext();

  const triggerPeopleSoftCalculation = (
    autoSave?: boolean | false,
    timeOffRequest?: ITimeOffEntryForm[] | IRequestTimeOff[],
  ) => {
    const formData = watch();
    // Combine formData and timeOffRequest into a single object
    const mappedFormData = {
      ...formData,
      timeOffRequest,
    };
    dispatch(
      assignmentActions.triggerPeopleSoftCalculation({
        formData: mappedFormData,
        isDataUpdateFlow: autoSave ?? false,
        formDataRaw: formData,
      }),
    );
  };

  return { triggerPeopleSoftCalculation };
};
