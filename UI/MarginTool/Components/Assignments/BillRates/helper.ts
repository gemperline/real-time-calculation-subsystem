
export const defaultValue = '0.00';
/**
 * @todo Modify @getValueAsFloat function to display '0.00' if the API returns a value of 0.
 */
export const getValueAsFloat = number => {
  return number && number !== 0 ? parseFloat(number).toFixed(2) : '';
};

export const getValueAsCustomDecimal = (number,decimalCount) => {
  return number && number !== 0 ? parseFloat(number).toFixed(decimalCount) : '';
};

export const getSumAmount = (otherRateValue: string, billRateValue: string) => {
  return billRateValue && otherRateValue && otherRateValue !== '' && billRateValue !== ''
    ? `${(parseFloat(billRateValue) + parseFloat(otherRateValue ? otherRateValue : defaultValue)).toFixed(2)}`
    : defaultValue;
};
export const getMultiplyAmount = (otherRateValue: string, billRateValue: string) => {
  return billRateValue && otherRateValue && otherRateValue !== '' && billRateValue !== ''
    ? `${(parseFloat(billRateValue) * parseFloat(otherRateValue ? otherRateValue : defaultValue)).toFixed(2)}`
    : defaultValue;
};
export const getPSFTAmount = (otherRateValue: string, billRateValue: string) => {
  return billRateValue && otherRateValue && otherRateValue !== '' && billRateValue !== ''
    ? `${(parseFloat(billRateValue) * (1 + parseFloat(otherRateValue ? otherRateValue : defaultValue))).toFixed(2)}`
    : defaultValue;
};
export const getDynamicPSFTValue = (inputValue: string) => {
  return inputValue !== '' ? (1 + parseFloat(inputValue)).toFixed(2) : defaultValue;
};

export const getBillRateFieldNames = (splitIndex: number) => {
  const prefix = `assignmentSplits.${splitIndex}`;
  return {
    billRate: `${prefix}.billRate`,
    vmsFee: `${prefix}.vmsFee`,
    otherFee: `${prefix}.otherFee`,
    overtimeRate: `${prefix}.overtimeRate`,
    overtimeFactor: `${prefix}.overtimeFactor`,
    callBackRate: `${prefix}.callBackRate`,
    callBackFactor: `${prefix}.callBackFactor`,
    doubleTimeRate: `${prefix}.doubleTimeRate`,
    doubleTimeFactor: `${prefix}.doubleTimeFactor`,
    holidayRate: `${prefix}.holidayRate`,
    holidayFactor: `${prefix}.holidayFactor`,
    onCallRate: `${prefix}.onCallRate`,
    chargeRate: `${prefix}.chargeRate`,
    amountPerMile: `${prefix}.amountPerMile`,
    guaranteedHours: `${prefix}.guaranteedHours`,
    preceptorRate: `${prefix}.preceptorRate`,
    orientationRate: `${prefix}.orientationRate`,
    orientationFactor: `${prefix}.orientationFactor`,
    orientationHours: `${prefix}.orientationHours`,
    voidOrientationHours: `${prefix}.voidOrientationHours`,
  };
};
