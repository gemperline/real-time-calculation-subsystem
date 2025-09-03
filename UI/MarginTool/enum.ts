export enum PayPackageOptions {
  AddScenario = 'addScenario',
  AddExtension = 'addExtension',
  editScenario = 'editScenario',
}

export enum BenefitsInsuranceStatus {
  insuranceStatus = 'Insurance Status',
  accepted = 'Accepted',
  declined = 'Declined',
  acceptedId = 1,
  declinedId = 2,
}

export enum ShiftId {
  defaultShiftId = 1,
}

export enum TreeViewConstants {
  MAX_NUM_BOOKING_PERIODS = 4,
  MAX_NUM_SCENARIOS = 4,
}

export enum PackageType {
  Assignment = 'Assignment',
}

export enum PayPackageDetailsValuesCategory { //TO-DO : check and remove unused enums
  reimbursements = 'Reimbursements',
}

export enum PayPackageDetailsValuesSubCategory {
  additionalPremiumPay = 'Additional Premium Pay',
  bonusType = 'Bonus Type',
}

export enum IPayPackageCategory {
  InsuranceStatus = 1,
  Reimbursements,
  BonusType,
  PayRates,
  HousingType,
  AdditionalCostType,
}

/**
 * using @PayPackageSubCategoryId to get the subcategory id
 * for SAVE Payload
 */
export enum PayPackageSubCategoryId {
  InsuranceStatus = 1,
  HousingExpense = 2,
  CredentialingExpense = 3,
  Miscellaneous = 4,
  Transportation = 5,
  BonusType = 6,
  AdditionalPremiumPay = 7,
  HousingType = 8,
  AdditionalCostType = 9,
}

/**
 * A mapping of string keys to the corresponding enum keys of `SubCategoryId`.
 *
 * PLEASE NOTE: This is a workaround, and when anyone is doing document format (Prettier, etc.), please make sure the below
 * @stringToEnumMap Miscellaneous & Transportation is wrapped in single quotes.
 */
export const stringToEnumMap: Record<string, keyof typeof PayPackageSubCategoryId> = {
  'Insurance Status': 'InsuranceStatus',
  'Housing Expense': 'HousingExpense',
  'Credentialing Expense': 'CredentialingExpense',
  'Miscellaneous': 'Miscellaneous',
  'Transportation': 'Transportation',
  'Bonus Type': 'BonusType',
  'Additional Premium Pay': 'AdditionalPremiumPay',
  'Housing Type': 'HousingType',
  'Additional Cost Type': 'AdditionalCostType',
};
