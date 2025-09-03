import { ISplitForm } from '../models/IAssignmentSplitForm';
import { AdditionalCostsCategory, AdditionalCostsCategoryFields } from './enum';

export const mapAdditionalCostsForPeopleSoftCalculation = (split: ISplitForm) => [
  {
    category: AdditionalCostsCategory.ADDITIONAL_COST_TYPE,
    type: AdditionalCostsCategory.ADDITIONAL_COST_TYPE,
    field: AdditionalCostsCategoryFields.CF_SUPERVISOR_COSTS,
    rate: split?.cfSupervisorCosts ? parseFloat(split?.cfSupervisorCosts) : 0,
    isReceiptsRequiredToPay: false,
  },
  {
    category: AdditionalCostsCategory.ADDITIONAL_COST_TYPE,
    type: AdditionalCostsCategory.ADDITIONAL_COST_TYPE,
    field: AdditionalCostsCategoryFields.MISCELLENOUS,
    rate: split?.miscellaneousAmount ? parseFloat(split?.miscellaneousAmount) : 0,
    isReceiptsRequiredToPay: false,
  },
];
