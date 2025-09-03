import { isNumber } from 'lodash';
import { MarginFacility } from 'store/redux-store/margin-tool/slices/add-edit-scenario/add-edit-scenario.model';

export const customRoundOff = (num: Number) => {
  const strNum = num.toString();
  if (isNumber(num) && num % 1 !== 0) {
    const [decimalPart] = strNum.split('.')[1];
    if (decimalPart && decimalPart.length > 2) {
      const thirdDecimal = parseInt(decimalPart[2], 10);
      if (thirdDecimal < 5) {
        return parseFloat(strNum).toFixed(2);
      }
    }
    return parseFloat(strNum).toFixed(2);
  }

  return parseFloat(strNum).toFixed(2);
};

export const formattedNumber = (value: string) => {
  return value.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

export const isNegative = (value: Number) => {
  return typeof value === 'number' && value < 0;
};

export interface IHeaderDetails {
  placement: {
    startDate: Date;
    endDate: Date;
    duration: number;
    discipline: string;
    specialty: string;
    subSpecialty: string;
  };
  order: {
    orderId: number;
    orderType: string;
  };
  facility: MarginFacility;
  candidate: {
    name: string;
    candidateId: number;
  };
  assignment: {
    startDate: Date;
    endDate: Date;
    duration: number;
  };
  recruiter: {
    firstName: string;
    lastName: string;
  };
  accountManager: {
    firstName: string;
    lastName: string;
  };
  brandName: string;
  brandId: number;
}
