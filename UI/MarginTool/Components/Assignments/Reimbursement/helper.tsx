import { IPlacementMarginDetailsResponseScenarioSplitPayPackageDetailsValue } from 'store/redux-store/margin-tool/slices/add-edit-scenario/add-edit-scenario.model';
import { CredentialingExpenseSubType, MiscellaneousSubType, ReimbursementTreeFieldCategoryName } from './enum';
import { IFieldItem } from './ReimbursementItem';
import { IMarginFormReimbursement } from '../models/IAssignmentSplitForm';

/**
 * Method to check if the description should be shown for the item if it is a miscellaneous category or credentialing expense
 * @param item
 */
export const shouldShowDescription = (item: IFieldItem) => {
  const miscellaneousCategory = item.parentCategoryName === ReimbursementTreeFieldCategoryName.Miscellaneous;
  const credentialingExpense = item.parentCategoryName === ReimbursementTreeFieldCategoryName.CredentialingExpense;
  if (miscellaneousCategory) {
    return item.name === MiscellaneousSubType.Other ? true : false;
  } else if (credentialingExpense) {
    return item.name === CredentialingExpenseSubType.License ||
      item.name === CredentialingExpenseSubType.MiscellaneousMedicalOrLabWork
      ? true
      : false;
  }
  return false;
};

export const getReimbursement = (
  payPackageDetailsValues: IPlacementMarginDetailsResponseScenarioSplitPayPackageDetailsValue[],
) => {
  return payPackageDetailsValues?.map(matchingItem => ({
    name: matchingItem?.pickListDescription || null, // reimbursement type field on form
    reimbursementAmount: parseFloat(matchingItem?.payPackageValues?.amount?.toString()).toFixed(2) || null,
    isReimbursementRequired: matchingItem?.payPackageValues?.receiptsRequiredToPay || false,
    parentCategoryName: matchingItem?.subCategory || null,
    description: matchingItem?.payPackageValues?.description || null,
    category: matchingItem?.category,
    categoryId: matchingItem?.categoryId,
    subCategory: matchingItem?.subCategory,
    subCategoryId: matchingItem?.subCategoryId,
  }));
};

/**
 * Method to register the non form field values for reimbursement
 */
export const registerNonFormFieldValuesForReimbursement = (
  register,
  setValue,
  assignmentFormArray,
  reimbursement: { categoryId: number; categoryName: string; subCategory: string },
) => {
  register(`${assignmentFormArray}.category`);
  register(`${assignmentFormArray}.categoryId`);
  register(`${assignmentFormArray}.subCategory`);
  setValue(`${assignmentFormArray}.category`, reimbursement?.categoryName);
  setValue(`${assignmentFormArray}.categoryId`, reimbursement?.categoryId);
  setValue(`${assignmentFormArray}.subCategory`, reimbursement?.subCategory);
};

/**
 * Method to transform the reimbursement field array to the format required for people soft calculation
 * @param reimbursementFieldArray
 */
export const transformReimbursementForPeopleSoftCalculation = (reimbursementFieldArray: IMarginFormReimbursement[]) => {
  if (!reimbursementFieldArray) return [];
  const reimbursements = reimbursementFieldArray?.map(reimbursementItem => ({
    category: reimbursementItem?.category,
    type: reimbursementItem?.subCategory,
    field: reimbursementItem?.reimbursementType,
    rate: reimbursementItem?.reimbursementAmount ? parseFloat(reimbursementItem?.reimbursementAmount) : 0,
    isReceiptsRequiredToPay: Boolean(reimbursementItem?.isReimbursementRequired),
  }));
  return reimbursements;
};
