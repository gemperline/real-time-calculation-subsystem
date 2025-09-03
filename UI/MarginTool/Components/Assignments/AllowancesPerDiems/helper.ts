import { TFunction } from 'i18next';
import { IGsaHousingDetailsResponseItem } from '../../PayPackage/models/PayPackage';
import _ from 'lodash';
import { missingField } from 'app/constants';
import { MarginDetailsResponseScenarioSplitItem } from 'store/redux-store/margin-tool/slices/add-edit-scenario/add-edit-scenario.model';

/**
 * Method to calculate non TLA allowances per week
 * @param fieldValue - non TLA field value
 */
const calculateNonTLAAllowances = (fieldValue: number) => {
  if (fieldValue === null || fieldValue === undefined) return '0.00';
  const calculatedResult = fieldValue * 7;
  return calculatedResult?.toFixed(2);
};

/**
 *
 * @param fieldValue - TLA Field value
 * @param hoursPerShift - hours per shift for the split
 * @param hoursPerWeek - hours per week for the split
 */
const calculateTLAAllowances = (fieldValue: number, hoursPerShift: number, hoursPerWeek: number) => {
  if (fieldValue === null || fieldValue === undefined) return '0.00';
  const calculatedResult = fieldValue * (hoursPerWeek / hoursPerShift);
  return calculatedResult?.toFixed(2);
};

/**
 *  Method to generate helper text for TLA values
 * @param fieldValue
 * @param hoursPerShift
 * @param hoursPerWeek
 * @param t
 */
export const tlaHelperText = (fieldValue: number, hoursPerShift: number, hoursPerWeek: number, t: TFunction) => {
  return `(${t('marginTool.labels.amount')} $${calculateTLAAllowances(fieldValue, hoursPerShift, hoursPerWeek)} ${t(
    'marginTool.labels.perWeek',
  )})`;
};

/**
 *  Method to generate helper text values for non TLA
 * @param fieldValue
 * @param t
 */
export const nonTLAHelperText = (fieldValue: number, t: TFunction) => {
  return `(${t('marginTool.labels.amount')} $${calculateNonTLAAllowances(fieldValue)} ${t(
    'marginTool.labels.perWeek',
  )})`;
};

/**
 *
 * @param isScenarioStatusPending - boolean value to check if scenario status is pending
 * @param isTLASelected - boolean value to check if TLA is selected for a scenario
 * @param t
 */
export const showTooltipForNonTLA = (isScenarioStatusPending: boolean, isTLASelected: boolean, t: TFunction) => {
  return {
    disabled: !isScenarioStatusPending || !isTLASelected,
    tooltipText: t('marginTool.labels.disabledDueToTLA'),
  };
};

/**
 *
 * @param isScenarioStatusPending - boolean value to check if scenario status is pending
 * @param isTLASelected - boolean value to check if TLA is selected for a scenario
 * @param t
 */
export const showTooltipForTLA = (isScenarioStatusPending: boolean, isTLASelected: boolean, t: TFunction) => {
  return {
    disabled: !isScenarioStatusPending || isTLASelected,
    tooltipText: t('marginTool.labels.disabledScenarioNotTLA'),
  };
};

export const getMonthName = monthNumber => {
  const date = new Date();
  date.setMonth(monthNumber - 1);
  return date.toLocaleString('en-US', { month: 'short' });
};

const getProperty = (obj: IGsaHousingDetailsResponseItem, prop: string) => {
  return prop?.split('.')?.reduce((o, k) => obj[k], obj);
};

export const gsaRates = 'GSA Rates';
export const collection2Table = (gsaDetails, t: TFunction) => {
  const gsaTypeColumn = 'gsaType';
  const yearColumn = 'year';
  const monthColumn = 'month';
  const cellColumn = 'rate';
  const gsaColumnHeader = gsaRates;
  const idColumn = 'id';
  const table = {};
  const columns = {};
  const cells = [];
  const coll = _.sortBy(gsaDetails, [gsaTypeColumn])?.map(item => {
    let newItem = { ...item };
    newItem.gsaType =
      newItem?.gsaType === 'Lodging'
        ? t('marginTool.components.assignment.allowancesPerDiemStipend.dailyLodging')
        : newItem?.gsaType === 'Meals and Incidentals'
        ? t('marginTool.components.assignment.allowancesPerDiemStipend.mealsAndIncidentalExpenses')
        : newItem?.gsaType;
    return newItem;
  });
  coll.forEach((a, idx) => {
    var rowHeader = getProperty(a, gsaTypeColumn);
    if (rowHeader in table === false) {
      table[rowHeader] = {};
    }
    columns[gsaColumnHeader] = null;
    columns[idColumn] = null;
    table[rowHeader][gsaColumnHeader] = getProperty(a, gsaTypeColumn);
    table[rowHeader][idColumn] = idx;
    var monthCol = getProperty(a, monthColumn);
    var yearCol = getProperty(a, yearColumn);
    var columnHeader = yearCol + '\n' + getMonthName(monthCol);
    columns[columnHeader] = null;
    const cellValue = getProperty(a, cellColumn);
    table[rowHeader][columnHeader] = cellValue ? `$ ${cellValue?.toFixed(2)}` : missingField;
  });
  for (var row in table) cells.push(table[row]);
  return { columnHeaders: Object.keys(columns), cells };
};

export const handleAllowancesFieldUpdatesAfterRefresh = (
  setValue,
  splitIndex: number,
  initialSplit: MarginDetailsResponseScenarioSplitItem,
  debouncedTriggerPeopleSoftCalculation,
) => {
  setValue(`assignmentSplits.${splitIndex}.mealPerDiem`, initialSplit?.mealPerDiem);
  setValue(`assignmentSplits.${splitIndex}.lodgingPerDiem`, initialSplit?.lodgingPerDiem);
  setValue(`assignmentSplits.${splitIndex}.cellPhoneStipend`, initialSplit?.cellPhoneStipend);
  setValue(`assignmentSplits.${splitIndex}.tlaCarAllowance`, initialSplit?.tlaCarAllowance);
  setValue(`assignmentSplits.${splitIndex}.tlaMealAllowance`, initialSplit?.tlaMealAllowance);
  setValue(`assignmentSplits.${splitIndex}.tlaShiftCompletionBonus`, initialSplit?.tlaShiftCompletionBonus);
  setValue(`assignmentSplits.${splitIndex}.tlaCellPhoneStipend`, initialSplit?.tlaCellPhoneStipend);
  debouncedTriggerPeopleSoftCalculation();
};
