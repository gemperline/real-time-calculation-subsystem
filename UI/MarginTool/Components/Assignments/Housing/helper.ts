import _ from 'lodash';
import { orderBy } from 'lodash';
import { FurnitureCost } from 'store/redux-store/margin-tool/slices/add-edit-scenario/add-edit-scenario.model';
import { CheckInTypes, defaultTimeFormat, HousingTypeOptions, IEarlyOrLateDateChange } from './model';
import moment from 'moment';

export const defaultValue = '0.00';
export const formatTypeAheadOptions = options => {
  const allHousingOptions = orderBy(options, ['description'], ['asc']).map(item => ({
    label: item.description,
    object: {
      id: parseInt(item?.id),
      description: item?.description,
    },
  }));
  return _.remove(allHousingOptions, function (item) {
    return item?.label !== 'Lodging Per Diem';
  });
};

export const furnitureCalculation = (furnitureAdjustments: FurnitureCost[]) => {
  return _.sum(
    _.map(furnitureAdjustments, function (item) {
      return item?.quantity > 0 ? item?.standardCost * item?.quantity : 0;
    }),
  ).toFixed(2);
};

export const includeCostCalculation = (furnitureAdjustments: FurnitureCost[]) => {
  return _.sum(
    _.map(furnitureAdjustments, function (item) {
      return item?.include ? 1 : 0;
    }),
  );
};

export const housingTypeSelection = (housingData, selection) => {
  switch (selection) {
    case HousingTypeOptions.noHousing:
      return housingData?.noHousing;
    case HousingTypeOptions.clientHousing:
      return housingData?.clientHousing;
    case HousingTypeOptions.companyHotel:
      return housingData?.companyHotel;
    case HousingTypeOptions.private1Bedroom:
      return housingData?.private1Bedroom;
    case HousingTypeOptions.private2Bedroom:
      return housingData?.private2Bedroom;
    case HousingTypeOptions.private3Bedroom:
      return housingData?.private3Bedroom;
    case HousingTypeOptions.privateStudio:
      return housingData?.privateStudio;
    case HousingTypeOptions.shared1Bedroom:
      return housingData?.shared1Bedroom;
    case HousingTypeOptions.shared2Bedroom:
      return housingData?.shared2Bedroom;
    case HousingTypeOptions.shared3Bedroom:
      return housingData?.shared3Bedroom;
    case HousingTypeOptions.sharedStudio:
      return housingData?.sharedStudio;
  }
};

export const getValueAsFloat = number => {
  return number && number !== 0 ? parseFloat(number).toFixed(2) : defaultValue;
};

export const getAMNHousingFieldNames = (splitIndex: number) => {
  const prefix = `assignmentSplits.${splitIndex}`;
  return {
    housingType: `${prefix}.housingType`,
    moveInDate: `${prefix}.moveInDate`,
    moveOutDate: `${prefix}.moveOutDate`,
    housingCoPay: `${prefix}.housingCoPay`,
    furnitureCoPay: `${prefix}.furnitureCoPay`,
    rentCostMonthly: `${prefix}.rentCostMonthly`,
    standardFurniture: `${prefix}.standardFurniture`,
    additionalFurniture: `${prefix}.additionalFurniture`,
    utilities: `${prefix}.utilities`,
    rentOverrideNote: `${prefix}.rentOverrideNote`,
    earlyMoveIn: `${prefix}.earlyMoveIn`,
    earlyMoveInDate: `${prefix}.earlyMoveInDate`,
    earlyMoveInNumberOfDays: `${prefix}.earlyMoveInNumberOfDays`,
    earlyMoveInDaysWaived: `${prefix}.earlyMoveInDaysWaived`,
    earlyMoveInCostPerDay: `${prefix}.earlyMoveInCostPerDay`,
    lateMoveOut: `${prefix}.lateMoveOut`,
    lateMoveOutDate: `${prefix}.lateMoveOutDate`,
    lateMoveOutNumberOfDays: `${prefix}.lateMoveOutNumberOfDays`,
    lateMoveOutDaysWaived: `${prefix}.lateMoveOutDaysWaived`,
    lateMoveOutCostPerDay: `${prefix}.lateMoveOutCostPerDay`,
    miscDescription: `${prefix}.miscFurnitureDescription`,
  };
};

export const handleEarlyOrLateDateChange = (
  inputValues: IEarlyOrLateDateChange,
  moveInDateMoment: moment.Moment,
  moveOutDateMoment: moment.Moment,
  setValue,
  clearErrors?,
  splitIndex?,
) => {
  const fieldToBeCleared =
    inputValues.conditionType === CheckInTypes.earlyMoveIn
      ? `assignmentSplits.${splitIndex}.earlyMoveInDate`
      : `assignmentSplits.${splitIndex}.lateMoveOutDate`;
  clearErrors(fieldToBeCleared);
  const inputDate = inputValues.inputValue;
  if (!inputValues.inputValue) {
    setValue(inputValues.valueToSet, '');
    return;
  }
  const startDateMoment = inputValues.conditionType === CheckInTypes.earlyMoveIn ? moveInDateMoment : moveOutDateMoment;
  const endDateMoment = moment(CheckInTypes.earlyMoveIn ? inputDate?.startDate : inputDate?.endDate);
  const validDateSelectionCheck =
    inputValues.conditionType === CheckInTypes.earlyMoveIn
      ? endDateMoment.isAfter(startDateMoment)
      : endDateMoment.isBefore(startDateMoment);
  const daysGapCalculationCheck =
    inputValues.conditionType === CheckInTypes.earlyMoveIn
      ? startDateMoment?.diff(endDateMoment, 'd')
      : endDateMoment?.diff(startDateMoment, 'd');
  if (endDateMoment.isValid()) {
    if (validDateSelectionCheck) {
      setValue(inputValues.valueToSet, '');
      return;
    }
    if (startDateMoment && endDateMoment && daysGapCalculationCheck > 0) {
      setValue(inputValues.valueToSet, daysGapCalculationCheck.toString());
    } else {
      setValue(inputValues.valueToSet, '');
    }
  }
};

export const handleEarlyOrLateNumberOfDays = (
  inputValues: IEarlyOrLateDateChange,
  moveInDateMoment: moment.Moment,
  moveOutDateMoment: moment.Moment,
  setValue,
) => {
  if (inputValues.inputValue === '') {
    setValue(inputValues.valueToSet, null);
    return;
  }
  const startDateSelectionMoment =
    inputValues.conditionType === CheckInTypes.earlyMoveIn ? moveInDateMoment : moveOutDateMoment;
  const endDateCalculationMoment =
    inputValues.conditionType === CheckInTypes.earlyMoveIn
      ? startDateSelectionMoment.subtract(parseInt(inputValues.inputValue.toString()), 'd')
      : startDateSelectionMoment.add(parseInt(inputValues.inputValue.toString()), 'd');
  const validDateSelectionCheck =
    inputValues.conditionType === CheckInTypes.earlyMoveIn
      ? endDateCalculationMoment.isAfter(startDateSelectionMoment)
      : endDateCalculationMoment.isBefore(startDateSelectionMoment);
  if (endDateCalculationMoment.isValid()) {
    if (validDateSelectionCheck) {
      setValue(inputValues.valueToSet, null);
      return;
    }
    if (startDateSelectionMoment && endDateCalculationMoment) {
      setValue(inputValues.valueToSet, endDateCalculationMoment.format(defaultTimeFormat));
    }
  } else {
    setValue(inputValues.valueToSet, null);
  }
};

export const handleHousingTypeSelection = (
  e,
  field,
  housingData,
  setShowSection,
  setSavedFurniture,
  setManualCostPerDays,
  setValue,
  amnHousingFieldNames,
  triggerPeopleSoftCalculation,
) => {
  if (e?.label !== HousingTypeOptions.noHousing) {
    const isDefaultSelection = field?.housingType === e?.label;
    const originalValues = housingTypeSelection(housingData, e?.label);
    const rentCost = getValueAsFloat(originalValues?.originalRentCost);
    const furnitureCost = getValueAsFloat(originalValues?.originalFurnitureCost);
    const utilitiesCost = getValueAsFloat(originalValues?.originalUtilitiesCost);
    setValue(
      amnHousingFieldNames.housingCoPay,
      isDefaultSelection && field?.housingCoPay ? field?.housingCoPay : defaultValue,
    );
    setValue(
      amnHousingFieldNames.furnitureCoPay,
      isDefaultSelection && field?.furnitureCoPay ? getValueAsFloat(field?.furnitureCoPay) : defaultValue,
    );
    setValue(
      amnHousingFieldNames.rentCostMonthly,
      isDefaultSelection && field?.rentCost ? getValueAsFloat(field?.rentCost) : rentCost,
    );
    setValue(
      amnHousingFieldNames.standardFurniture,
      isDefaultSelection && field?.standardFurniture ? getValueAsFloat(field?.standardFurniture) : furnitureCost,
    );
    setValue(
      amnHousingFieldNames.additionalFurniture,
      isDefaultSelection && field?.additionalFurniture ? getValueAsFloat(field?.additionalFurniture) : defaultValue,
    );
    setValue(
      amnHousingFieldNames.utilities,
      isDefaultSelection && field?.utilities ? getValueAsFloat(field?.utilities) : utilitiesCost,
    );
    setValue(
      amnHousingFieldNames.rentOverrideNote,
      isDefaultSelection && field?.rentOverrideNot ? field?.rentOverrideNot : '',
    );
    setValue(
      amnHousingFieldNames.earlyMoveIn,
      isDefaultSelection && field?.isEarlyMoveIn ? field?.isEarlyMoveIn : null,
    );
    setValue(
      amnHousingFieldNames.earlyMoveInDate,
      isDefaultSelection && field?.earlyMoveInDate ? field?.earlyMoveInDate : null,
    );
    setValue(
      amnHousingFieldNames.earlyMoveInNumberOfDays,
      isDefaultSelection && field?.earlyMoveInDays ? field?.earlyMoveInDays : '',
    );
    setValue(
      amnHousingFieldNames.earlyMoveInDaysWaived,
      isDefaultSelection && field?.earlyMoveInDaysWaived ? field?.earlyMoveInDaysWaived : '',
    );
    setValue(
      amnHousingFieldNames.earlyMoveInCostPerDay,
      isDefaultSelection && field?.earlyMoveInCostPerDay ? getValueAsFloat(field?.earlyMoveInCostPerDay) : '',
    );
    setValue(
      amnHousingFieldNames.lateMoveOut,
      isDefaultSelection && field?.isLateMoveOut ? field?.isLateMoveOut : null,
    );
    setValue(
      amnHousingFieldNames.lateMoveOutDate,
      isDefaultSelection && field?.lateMoveOutDate ? field?.lateMoveOutDate : null,
    );
    setValue(
      amnHousingFieldNames.lateMoveOutNumberOfDays,
      isDefaultSelection && field?.lateMoveOutDays ? field?.lateMoveOutDays : '',
    );
    setValue(
      amnHousingFieldNames.lateMoveOutDaysWaived,
      isDefaultSelection && field?.lateMoveOutDaysWaived ? field?.lateMoveOutDaysWaived : '',
    );
    setValue(
      amnHousingFieldNames.lateMoveOutCostPerDay,
      isDefaultSelection && field?.lateMoveOutCostPerDay ? getValueAsFloat(field?.lateMoveOutCostPerDay) : '',
    );
    setShowSection(true);
    setSavedFurniture(
      field?.furnitureCosts.map(item => ({
        ...item,
        quantity: isDefaultSelection ? item?.quantity : 0,
        include: isDefaultSelection && item?.quantity > 0 ? true : false,
      })),
    );
    setManualCostPerDays({
      earlyMoveInCostPerDay: false,
      lateMoveOutCostPerDay: false,
    });
    triggerPeopleSoftCalculation();
  } else {
    setShowSection(false);
  }
};
