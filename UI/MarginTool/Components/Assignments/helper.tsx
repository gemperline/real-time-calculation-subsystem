import React from 'react';
import { useSelector } from 'react-redux';
import { selectTreeViewLookupData } from 'store/redux-store/margin-tool/slices/assignment/assignment.selector';
import { AssignmentSplitContainerFields, TreeViewLookupTypes } from './enum';
import { ITreeFieldCollection, ITreeItem } from 'store/redux-store/margin-tool/slices/assignment/assignment.model';
import { isUndefined, orderBy, sortBy } from 'lodash';
import { IBookingPeriodData, IParentReimbursementCategory } from './Reimbursement/model';
import {
  MarginDetailsResponseScenario,
  MarginDetailsResponseScenarioSplitItem,
} from 'store/redux-store/margin-tool/slices/add-edit-scenario/add-edit-scenario.model';
import { missingDate, missingField } from 'app/constants';
import { formatDate, formatDateObj } from '@AMIEWEB/MarginTool/helper';
import { Theme } from 'amn-ui-core';
import { TFunction } from 'i18next';
import { selectSelectedScenario } from 'store/redux-store/margin-tool/slices/add-edit-scenario/add-edit-scenario.selector';

/**
 * Custom hook to get tree view lookup data by category name
 * @param categoryName
 * @returns
 */
export function useTreeLookupByCategoryName(categoryName: TreeViewLookupTypes) {
  const lookupOptions = useSelector(selectTreeViewLookupData);
  if (!lookupOptions?.length) return [];
  const selectedOptions = lookupOptions?.find(option => option.category === categoryName);
  return selectedOptions;
}

/**
 * Method to transform tree view
 * @param fieldCollections
 * @returns
 */
export const transformTreeViewData = (fieldCollections: ITreeFieldCollection[]) => {
  if (!fieldCollections?.length) return [];
  const treeOptions = fieldCollections.map((fieldCollection, index) => ({
    name: fieldCollection.field,
    value: index,
    children: createSubSectionForTreeView(fieldCollection.items),
  }));
  return orderBy(treeOptions, ['name'], ['asc']);
};

/**
 * Method to create subsection for tree view
 * @param subSection
 * @returns
 */
const createSubSectionForTreeView = (subSection: ITreeItem[]) => {
  const subSectionOptions = subSection.map(item => ({
    name: item.description,
    value: item.id,
  }));
  return orderBy(subSectionOptions, ['name'], ['asc']);
};

/**
 * Method to flatten the array of parent reimbursement categories and extract parent properties to children
 * @param array
 * @returns
 */
export const flattenArray = (array: IParentReimbursementCategory[]) => {
  return array.flatMap(parent => {
    // Extract parent's name and value to add to child
    const { name: parentCategoryName, value: parentCategoryValue, children } = parent;
    // Map over the children and add the parent properties
    const flattenedArray = children.map(child => ({
      ...child,
      parentCategoryName,
      parentCategoryValue,
    }));
    return flattenedArray;
  });
};

/**
 * Method to sort assignment splits by isAssignmentSplit order asc
 * first array should be isAssignmentSplit = true and then isAssignmentSplit = false which is split
 * @param assignmentSplits
 */
export const sortAssignmentSplits = (assignmentSplits: MarginDetailsResponseScenarioSplitItem[]) => {
  if (assignmentSplits?.length === 0) return [];
  return sortBy(assignmentSplits, item => !item.isAssignmentSplit);
};

/**
 *
 * @param selectedScenario - selected scenario of type MarginDetailsResponseScenario
 * @param splitIndex - index of the split
 */
export const formattedSplitHeader = (selectedScenario: MarginDetailsResponseScenario, splitIndex: number) => {
  const currentSplitItem = selectedScenario?.splits[splitIndex];
  return {
    scenarioStartDate: !isUndefined(currentSplitItem?.effectiveStartDate)
      ? formatDateObj(currentSplitItem.effectiveStartDate)
      : formatDate(missingDate),
    scenarioEndDate: !isUndefined(currentSplitItem?.effectiveEndDate)
      ? formatDateObj(currentSplitItem.effectiveEndDate)
      : formatDate(missingDate),
    shift: !isUndefined(selectedScenario?.splits) ? currentSplitItem?.shift : missingField,
    hoursPerWeek: !isUndefined(selectedScenario?.splits) ? currentSplitItem?.hoursPerWeek : missingField,
    hoursPerShift: !isUndefined(selectedScenario?.splits) ? currentSplitItem?.hoursPerShift : missingField,
  };
};

/**
 *
 * @param selectedScenario - selected scenario of type MarginDetailsResponseScenario
 * @param splitIndex - current split index
 * @param t - translation hook
 * @param theme - theme hook
 */
export const customSplitTitle = ({
  selectedScenario,
  splitIndex,
  bookingPeriodData,
  noSplitCreated,
  t,
  theme,
}: {
  selectedScenario: MarginDetailsResponseScenario;
  splitIndex: number;
  bookingPeriodData: IBookingPeriodData;
  noSplitCreated: boolean;
  t: TFunction;
  theme: Theme;
}) => {
  const formattedAssignmentData = formattedSplitHeader(selectedScenario, splitIndex);
  if (noSplitCreated) {
    const bookingPeriod = formattedAssignmentHeader(bookingPeriodData);
    formattedAssignmentData.scenarioStartDate = bookingPeriod.scenarioStartDate;
    formattedAssignmentData.scenarioEndDate = bookingPeriod.scenarioEndDate;
  }
  return (
    <>
      <span
        style={{ paddingRight: '5px' }}
      >{` - ${formattedAssignmentData?.scenarioStartDate} - ${formattedAssignmentData?.scenarioEndDate} `}</span>
      <span style={{ color: theme.palette.framework.system.neutralGray, paddingRight: '5px' }}>{'|'}</span>
      <span style={{ paddingRight: '5px' }}>{` ${formattedAssignmentData?.shift} `}</span>
      <span style={{ color: theme.palette.framework.system.neutralGray, paddingRight: '10px' }}>{'|'}</span>
      <span style={{ color: theme.palette.components.typography.color, fontWeight: 500, fontSize: '12px' }}>
        {t('marginTool.labels.hrPerWeekWithColon')}
      </span>
      <span style={{ paddingRight: '5px' }}>{` ${formattedAssignmentData?.hoursPerWeek} `}</span>
      <span style={{ color: theme.palette.framework.system.neutralGray, paddingRight: '10px' }}>{'|'}</span>
      <span style={{ color: theme.palette.components.typography.color, fontWeight: 500, fontSize: '12px' }}>
        {t('marginTool.labels.hrPerShiftWithColon')}
      </span>
      <span>{` ${formattedAssignmentData?.hoursPerShift}`}</span>
    </>
  );
};

export const customAssignmentTitle = (bookingPeriodData: IBookingPeriodData, theme: Theme) => {
  const formattedAssignmentData = formattedAssignmentHeader(bookingPeriodData);
  return (
    <>
      <span
        style={{ paddingRight: theme.spacing(1) }}
      >{` - ${formattedAssignmentData?.scenarioStartDate} - ${formattedAssignmentData?.scenarioEndDate} `}</span>
    </>
  );
};

export const customContainerTitle = ({
  selectedScenario,
  splitIndex,
  fieldsToShow,
  bookingPeriodData,
  noSplitCreated,
  t,
  theme,
}: {
  selectedScenario: MarginDetailsResponseScenario;
  splitIndex: number;
  fieldsToShow: AssignmentSplitContainerFields[];
  noSplitCreated?: boolean;
  bookingPeriodData: IBookingPeriodData;
  t: TFunction;
  theme: Theme;
}) => {
  return fieldsToShow.includes(AssignmentSplitContainerFields.AssignmentTitle) && !noSplitCreated
    ? customAssignmentTitle(bookingPeriodData, theme)
    : customSplitTitle({
        selectedScenario,
        splitIndex,
        bookingPeriodData,
        noSplitCreated,
        t,
        theme,
      });
};

export const formattedAssignmentHeader = (selectedScenario: IBookingPeriodData) => {
  return {
    scenarioStartDate: !isUndefined(selectedScenario?.bookingPeriodStartDate)
      ? formatDateObj(selectedScenario.bookingPeriodStartDate)
      : formatDate(missingDate),
    scenarioEndDate: !isUndefined(selectedScenario?.bookingPeriodEndDate)
      ? formatDateObj(selectedScenario?.bookingPeriodEndDate)
      : formatDate(missingDate),
  };
};

export const getFieldsToShow = (type: string = ''): AssignmentSplitContainerFields[] => {
  const defaultFields = [
    AssignmentSplitContainerFields.RequestedTimeOff,
    AssignmentSplitContainerFields.Travel,
    AssignmentSplitContainerFields.Benefits,
    AssignmentSplitContainerFields.Reimbursements,
    AssignmentSplitContainerFields.Bonuses,
    AssignmentSplitContainerFields.BillRates,
    AssignmentSplitContainerFields.PayRates,
    AssignmentSplitContainerFields.AllowancesPerDiem,
    AssignmentSplitContainerFields.Housing,
    AssignmentSplitContainerFields.AdditionalCosts,
  ];
  switch (type) {
    case CONSTANTS.CONTAINER.NO_SPLIT_CREATED:
      return defaultFields.concat([AssignmentSplitContainerFields.AssignmentTitle]);
    case CONSTANTS.CONTAINER.IS_ASSIGNMENT_CONTAINER:
      return [
        AssignmentSplitContainerFields.RequestedTimeOff,
        AssignmentSplitContainerFields.Travel,
        AssignmentSplitContainerFields.Reimbursements,
        AssignmentSplitContainerFields.Bonuses,
        AssignmentSplitContainerFields.AssignmentTitle,
      ];
    case CONSTANTS.CONTAINER.IS_SPLIT:
      return [
        AssignmentSplitContainerFields.Benefits,
        AssignmentSplitContainerFields.BillRates,
        AssignmentSplitContainerFields.PayRates,
        AssignmentSplitContainerFields.AllowancesPerDiem,
        AssignmentSplitContainerFields.Housing,
        AssignmentSplitContainerFields.AdditionalCosts,
      ];
    default:
      return defaultFields;
  }
};

export const CONSTANTS = {
  CONTAINER: {
    NO_SPLIT_CREATED: 'noSplitCreated',
    IS_ASSIGNMENT_CONTAINER: 'isAssignmentContainer',
    IS_SPLIT: 'isSplit',
  },
};

/**
 * Method to register and set values to form for fields that does not exist on Margin Tool Form
 * @param register
 * @param setValue
 * @param currentSplit
 * @param field
 */
export const registerNonFormFieldValues = (
  register,
  setValue,
  currentSplit,
  field: MarginDetailsResponseScenarioSplitItem,
) => {
  register(`${currentSplit}.splitId`);
  register(`${currentSplit}.shiftId`);
  register(`${currentSplit}.shift`);
  register(`${currentSplit}.effectiveStartDate`);
  register(`${currentSplit}.effectiveEndDate`);
  register(`${currentSplit}.hoursPerWeek`);
  register(`${currentSplit}.hoursPerShift`);
  setValue(`${currentSplit}.splitId`, field?.splitId);
  setValue(`${currentSplit}.shiftId`, field?.shiftId);
  setValue(`${currentSplit}.shift`, field?.shift);
  setValue(`${currentSplit}.effectiveStartDate`, field?.effectiveStartDate);
  setValue(`${currentSplit}.effectiveEndDate`, field?.effectiveEndDate);
  setValue(`${currentSplit}.hoursPerWeek`, field?.hoursPerWeek);
  setValue(`${currentSplit}.hoursPerShift`, field?.hoursPerShift);
};

export const useFilterPayPackageValuesByCategoryId = (payPackageCategoryId: number) => {
  const selectedScenario = useSelector(selectSelectedScenario);
  const savedPayPackageValues = selectedScenario?.assignment?.payPackageDetailsValues;
  const filteredPayPackageValues = savedPayPackageValues?.filter(
    payPackage => payPackage.categoryId === payPackageCategoryId,
  );
  return filteredPayPackageValues;
};
