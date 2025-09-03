import { MissingField } from '@AMIEWEB/Candidate/CandidateProfile/CandidateTabPanel/SummaryTab/WorkExperience/v2/GetColumns';
import { PayPackageOptions, ShiftId } from './enum';
import {
  MarginDetailsResponse,
  MarginDetailsResponseScenario,
  MarginDetailsResponseScenarioSplitItem,
} from 'store/redux-store/margin-tool/slices/add-edit-scenario/add-edit-scenario.model';
import { IScenarioSplit, SenarioSplitMode } from './Components/PayPackage/AddScenario/model';
import { ITypeAheadOption } from '@AMIEWEB/Candidate/CandidateProfile/CandidateTabPanel/PreferencesTab/CustomComponents/ControlledTypeAhead';
import { useSelector } from 'react-redux';
import { selectSelectedScenario } from 'store/redux-store/margin-tool/slices/add-edit-scenario/add-edit-scenario.selector';
import { PayPackageStatus } from 'store/redux-store/margin-tool/slices/pay-package-status/pay-package-status.model';

export const formatDate = (dateValue: string) => {
  let date = new Date(dateValue);
  let formattedDate =
    ('0' + (date.getMonth() + 1)).slice(-2) + '/' + ('0' + date.getDate()).slice(-2) + '/' + date.getFullYear();
  return formattedDate;
};

export const formatDateObj = (dateValue: string | Date | null) => {
  // Convert to Date object if it's a string
  if (typeof dateValue === 'string') {
    dateValue = new Date(dateValue);
  }

  // Check if date is null, invalid, or not a Date object
  if (!dateValue || isNaN(dateValue.getTime())) {
    return MissingField; // Return '--' when date is null or invalid
  }

  let formattedDate =
    ('0' + (dateValue.getMonth() + 1)).slice(-2) +
    '/' +
    ('0' + dateValue.getDate()).slice(-2) +
    '/' +
    dateValue.getFullYear();
  return formattedDate;
};

export const validateInputValue = (inputValue: string, maxLength: number): boolean => {
  return (inputValue === '' || /^[0-9]+$/.test(inputValue)) && inputValue.length <= maxLength;
};

export const getDefaultShiftData = (shiftDetailsData, addScenario, PayPackageOption) => {
  if (shiftDetailsData.length > 0) {
    const defaultShift =
      shiftDetailsData.find(shift => shift.object.shiftId === addScenario?.shiftId) ||
      shiftDetailsData.find(shift => shift.object.shiftId === ShiftId.defaultShiftId);
    if (defaultShift) {
      return {
        label: defaultShift.object.shiftDescription,
        object: {
          shiftId: defaultShift.object.shiftId,
          shiftDescription: defaultShift.object.shiftDescription,
          hoursPerWeek:
            PayPackageOption === PayPackageOptions?.editScenario
              ? addScenario?.hoursPerWeek
              : defaultShift.object.hoursPerWeek,
          hoursPerShift:
            PayPackageOption === PayPackageOptions?.editScenario
              ? addScenario?.hoursPerShift
              : defaultShift.object.hoursPerShift,
          rateShiftListId: defaultShift.object.rateShiftListId,
          shiftTypeId: defaultShift.object.shiftTypeId,
          orderBy: defaultShift.object.orderBy,
        },
      };
    }
  }
  return null;
};

export const getDetailsByScenarioId = (marginToolDetails: MarginDetailsResponse[], scenarioId: number) => {
  return marginToolDetails.find(response => response?.scenarios?.some(scenario => scenario?.scenarioId === scenarioId));
};

export const isValidDecimal = (value: string, maxDigits?: number, maxDecimals?: number, belowOne?: boolean) => {
  const decimalPattern = new RegExp('^\\d{1,' + maxDigits + '}(\\.\\d{0,' + maxDecimals + '})?$');
  const belowOneValue = new RegExp('^0(\\.\\d{0,' + maxDecimals + '})?$');
  const numericValue = parseFloat(value);
  return belowOne
    ? belowOneValue.test(value)
    : decimalPattern.test(value) && numericValue >= 0 && numericValue <= 99999.99;
};

export const arrayValidation = (value: []) => {
  return Array.isArray(value) && value.length > 0;
};

export const getInputValueAsCurrency = (value: number | string) => {
  return value ? parseFloat(value.toString()).toFixed(2) : '';
};

export const getSplitsDetails = (
  scenarioSplits: MarginDetailsResponseScenarioSplitItem[],
  shiftDetails: ITypeAheadOption[],
): IScenarioSplit[] => {
  return scenarioSplits?.map(split => {
    const shiftData: ITypeAheadOption = shiftDetails.find(shift => shift.object.shiftId === split?.shiftId);
    return {
      mode: SenarioSplitMode.EDIT,
      splitId: split?.splitId,
      startDate: split.effectiveStartDate?.toLocaleString('en-US', {
        timeZone: 'America/Los_Angeles',
      }),
      endDate: split.effectiveEndDate?.toLocaleString('en-US', {
        timeZone: 'America/Los_Angeles',
      }),
      shift: {
        ...shiftData,
        object: { ...shiftData?.object, hoursPerWeek: split?.hoursPerWeek, hoursPerShift: split?.hoursPerShift },
      },
      hoursPerWeek: split?.hoursPerWeek,
      hoursPerShift: split?.hoursPerShift,
    };
  });
};
/**
 *  Hook to determine scenario status
 */
export const useScenarioStatusPending = () => {
  const scenario = useSelector(selectSelectedScenario);
  return scenario?.scenarioStatusId === PayPackageStatus.Pending;
};

/**
 *  Hook to determine whether the TLA is true or false
 */
export const useIsTLA = () => {
  const scenario = useSelector(selectSelectedScenario);
  return scenario?.tla;
};

/**
 * Method to find matching split from initial margin details by current splitId from which refresh button is clicked
 * @param initialMarginDetails - initialMarginDetails
 * @param splitId - splitId to be selected
 */
export const findInitialSplitValueBySplitId = (
  initialMarginDetails: MarginDetailsResponseScenario,
  splitId: number,
) => {
  return initialMarginDetails?.splits.find(splitItem => splitItem?.splitId === splitId);
};

export const formatToDecimal = (value: any, maxDigitCount: number, decimalPlaces: number) => {
  const max = Math.pow(10, maxDigitCount);

  const num = parseFloat(value);

  // Check if value is valid and within the calculated range; return empty string if not
  if (isNaN(num) || num < 0 || num > max) {
    return '';
  }

  return num.toFixed(decimalPlaces);
};
