import i18next from 'i18next';
import { DurationType, FieldType, IconType, PreviewContainerFieldNames } from '../enum';

export const travelerContainerFields = [
  {
    fieldTitle: i18next.t('marginTool.payPackagePreview.arrivingTravel'),
    fieldName: PreviewContainerFieldNames.arrivingTravel,
  },
  {
    fieldTitle: i18next.t('marginTool.payPackagePreview.endingTravel'),
    fieldName: PreviewContainerFieldNames.endingTravel,
  },
  {
    fieldTitle: i18next.t('marginTool.payPackagePreview.interimTravel'),
    fieldName: PreviewContainerFieldNames.interimTravel,
  },
  {
    fieldTitle: i18next.t('marginTool.payPackagePreview.flight'),
    fieldName: PreviewContainerFieldNames.amnFlight,
  },
  {
    fieldTitle: i18next.t('marginTool.payPackagePreview.rentalCar'),
    fieldName: PreviewContainerFieldNames.amnRentalCar,
  },
];

export const weeklyTotalFields = [
  {
    fieldTitle: i18next.t('marginTool.payPackagePreview.payRate'),
    fieldName: PreviewContainerFieldNames.payRate,
    IconType: IconType.Tax,
    durationType: DurationType.hr,
  },
  {
    fieldTitle: i18next.t('marginTool.payPackagePreview.lodging'),
    fieldName: PreviewContainerFieldNames.lodgingPerDiem,
    IconType: IconType.NonTax,
    durationType: DurationType.day,
  },
  {
    fieldTitle: i18next.t('marginTool.payPackagePreview.meal'),
    fieldName: PreviewContainerFieldNames.mealPerDiem,
    IconType: IconType.NonTax,
    durationType: DurationType.day,
  },
  {
    fieldTitle: i18next.t('marginTool.payPackagePreview.cellPhoneStipend'),
    fieldName: PreviewContainerFieldNames.cellPhoneStipend,
    IconType: IconType.NonTax,
    durationType: DurationType.day,
  },
  {
    fieldTitle: i18next.t('marginTool.payPackagePreview.carAllowance'),
    fieldName: PreviewContainerFieldNames.tlaCarAllowance,
    IconType: IconType.Tax,
    durationType: DurationType.shift,
  },
  {
    fieldTitle: i18next.t('marginTool.payPackagePreview.mealAllowance'),
    fieldName: PreviewContainerFieldNames.tlaMealAllowance,
    IconType: IconType.Tax,
    durationType: DurationType.shift,
  },
  {
    fieldTitle: i18next.t('marginTool.payPackagePreview.shiftCompletionBonus'),
    fieldName: PreviewContainerFieldNames.tlaShiftCompletionBonus,
    IconType: IconType.Tax,
    durationType: DurationType.shift,
  },
  {
    fieldTitle: i18next.t('marginTool.payPackagePreview.cellPhoneStipend'),
    fieldName: PreviewContainerFieldNames.tlaCellPhoneStipend,
    IconType: IconType.NonTax,
    durationType: DurationType.shift,
  },
];

export const amnHousingFields = [
  {
    fieldTitle: i18next.t('marginTool.payPackagePreview.amnHousing'),
    fieldName: PreviewContainerFieldNames.housingType,
    fieldType: FieldType.string,
  },
  {
    fieldTitle: i18next.t('marginTool.payPackagePreview.additionalFurniture'),
    fieldName: PreviewContainerFieldNames.additionalFurniture,
    fieldType: FieldType.number,
  },
  {
    fieldTitle: i18next.t('marginTool.payPackagePreview.housingCoPay'),
    fieldName: PreviewContainerFieldNames.housingCoPay,
    fieldType: FieldType.number,
  },
  {
    fieldTitle: i18next.t('marginTool.payPackagePreview.furnitureCoPay'),
    fieldName: PreviewContainerFieldNames.furnitureCoPay,
    fieldType: FieldType.number,
  },
  {
    fieldTitle: i18next.t('marginTool.payPackagePreview.earlyMoveInDate'),
    fieldName: PreviewContainerFieldNames.earlyMoveInDate,
    fieldType: FieldType.date,
  },
  {
    fieldTitle: i18next.t('marginTool.payPackagePreview.lateMoveOutDate'),
    fieldName: PreviewContainerFieldNames.lateMoveOutDate,
    fieldType: FieldType.date,
  },
];

export const getWeeklyCalculatedValue = (fieldName, fieldValue, hoursPerWeek, hoursPerShift) => {
  switch (fieldName) {
    case PreviewContainerFieldNames.payRate: {
      return fieldValue * hoursPerWeek;
    }
    case PreviewContainerFieldNames.lodgingPerDiem: {
      return fieldValue * 7;
    }
    case PreviewContainerFieldNames.mealPerDiem: {
      return fieldValue * 7;
    }
    case PreviewContainerFieldNames.cellPhoneStipend: {
      return fieldValue * 7;
    }
    case PreviewContainerFieldNames.tlaCarAllowance: {
      return fieldValue * (hoursPerWeek / hoursPerShift);
    }
    case PreviewContainerFieldNames.tlaMealAllowance: {
      return fieldValue * (hoursPerWeek / hoursPerShift);
    }
    case PreviewContainerFieldNames.tlaShiftCompletionBonus: {
      return fieldValue * (hoursPerWeek / hoursPerShift);
    }
    case PreviewContainerFieldNames.tlaCellPhoneStipend: {
      return fieldValue * (hoursPerWeek / hoursPerShift);
    }
  }
};

export const formattedNumber = (value: string) => {
  return value?.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

export const ValueAccumulator = (fieldValue: string[]) => {
  return fieldValue
    ?.filter(item => item !== undefined)
    ?.map(Number)
    ?.reduce((acc, curr) => acc + curr, 0);
};
