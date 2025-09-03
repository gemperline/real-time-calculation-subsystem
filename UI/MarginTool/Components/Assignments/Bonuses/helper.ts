import { IPlacementMarginDetailsResponseScenarioSplitPayPackageDetailsValue } from 'store/redux-store/margin-tool/slices/add-edit-scenario/add-edit-scenario.model';
import { IMarginFormBonus } from '../models/IAssignmentSplitForm';

export const getBonuses = (
  payPackageDetailsValues: IPlacementMarginDetailsResponseScenarioSplitPayPackageDetailsValue[],
) => {
  return payPackageDetailsValues?.map(matchingItem => ({
    bonusType: matchingItem?.pickListDescription || null,
    bonusAmount: parseFloat(matchingItem?.payPackageValues?.amount?.toString()).toFixed(2) || null,
    category: matchingItem?.category,
    categoryId: matchingItem?.categoryId,
    subCategory: matchingItem?.subCategory,
    subCategoryId: matchingItem?.subCategoryId,
    name: matchingItem?.pickListDescription || null, // used as bonus type in bonusesItem component
    description: matchingItem?.payPackageValues?.description || null,
  }));
};

/**
 * Method to register the non form field values for bonuses
 */
export const registerNonFormFieldValuesForBonuses = (
  register,
  setValue,
  assignmentFormArray,
  bonuses: { categoryId: number; categoryName: string; subCategory: string },
) => {
  register(`${assignmentFormArray}.category`);
  register(`${assignmentFormArray}.categoryId`);
  register(`${assignmentFormArray}.subCategory`);
  setValue(`${assignmentFormArray}.category`, bonuses?.categoryName);
  setValue(`${assignmentFormArray}.categoryId`, bonuses?.categoryId);
  setValue(`${assignmentFormArray}.subCategory`, bonuses?.subCategory);
};

export const mapBonusesForPeopleSoftCalculations = (bonuses: IMarginFormBonus[]) => {
  if (!bonuses) return [];
  const mappedBonuses = bonuses?.map(bonusItem => ({
    category: bonusItem?.category,
    type: bonusItem?.bonusType,
    field: bonusItem?.bonusType,
    rate: bonusItem?.bonusAmount ? parseFloat(bonusItem?.bonusAmount) : 0,
    isReceiptsRequiredToPay: false,
  }));
  return mappedBonuses;
};

export const getBonusesItemFieldNames = (index: number) => {
  const prefix = `assignment.bonusesFieldArray[${index}]`;
  return {
    bonusType: `${prefix}.bonusType`,
    bonusAmount: `${prefix}.bonusAmount`,
    description: `${prefix}.description`,
  };
};
