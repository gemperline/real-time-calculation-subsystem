import { Grid, IconButton, Typography, useTheme } from 'amn-ui-core';
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useFormContext, useWatch } from 'react-hook-form';

import { AdjustFurnitureModal } from './AdjustFurnitureModal';
import { ControlledTypeAhead } from '@AMIEWEB/Candidate/CandidateProfile/CandidateTabPanel/PreferencesTab/CustomComponents/ControlledTypeAhead';
import { CustomTooltip } from '@AMIEWEB/Common';
import MarginToolCard from '../../../Common/MarginToolCard';
import { MarginToolCardTitle } from '../../../Common/MarginToolCardTitle';
import { MarginToolCheckbox } from '@AMIEWEB/MarginTool/Common/MarginToolCheckbox';
import { MarginToolCurrencyField } from '@AMIEWEB/MarginTool/Common/MarginToolCurrencyField';
import { MarginToolDatePicker } from '@AMIEWEB/MarginTool/Common/MarginToolDatePicker';
import MarginToolTextField from '@AMIEWEB/MarginTool/Common/MarginToolTextField';
import { TreeViewLookupTypes } from '../enum';
import TuneIcon from '@mui/icons-material/Tune';
import { assignmentActions } from 'store/redux-store/margin-tool/slices/assignment/assignment.redux';
import {
  defaultValue,
  formatTypeAheadOptions,
  furnitureCalculation,
  getAMNHousingFieldNames,
  getValueAsFloat,
  handleEarlyOrLateDateChange,
  handleEarlyOrLateNumberOfDays,
  handleHousingTypeSelection,
  housingTypeSelection,
} from './helper';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { useTreeLookupByCategoryName } from '../helper';
import { CheckInTypes, HousingTypeOptions, defaultTimeFormat } from './model';
import { amnHousingStyles } from './HousingStyles';
import {
  FurnitureCost,
  MarginDetailsResponseScenarioSplitItem,
} from 'store/redux-store/margin-tool/slices/add-edit-scenario/add-edit-scenario.model';
import { useScenarioStatusPending } from '@AMIEWEB/MarginTool/helper';
import { selectGsaDetails } from 'store/redux-store/margin-tool/slices/add-edit-scenario/add-edit-scenario.selector';
import { usePeopleSoftCalculation } from '../../PeopleSoftCalculation/IPeopleSoftCalculationHelper';
import { MarginToolTextArea } from '@AMIEWEB/MarginTool/Common/MarginToolTextArea';
import { selectFurnitureAdjustments } from 'store/redux-store/margin-tool/slices/assignment/assignment.selector';

export const Housing = ({
  splitIndex,
  field,
}: {
  splitIndex: number;
  field: MarginDetailsResponseScenarioSplitItem;
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { classes } = amnHousingStyles();
  const dispatch = useDispatch();
  const { control, setValue, register, errors, watch, clearErrors } = useFormContext();
  const { triggerPeopleSoftCalculation } = usePeopleSoftCalculation();
  const amnHousingFieldNames = getAMNHousingFieldNames(splitIndex);
  const amnHousingWatchValues = useWatch({ name: Object.values(amnHousingFieldNames) });
  const formData = watch();
  const assignmentSplits = formData?.assignmentSplits;
  const lateMoveOutDays = watch(amnHousingFieldNames.lateMoveOutNumberOfDays);
  const earlyMoveInDays = watch(amnHousingFieldNames.earlyMoveInNumberOfDays);
  const housingTypeOptions = useTreeLookupByCategoryName(TreeViewLookupTypes.HousingType);
  const housingOptions = useMemo(() => {
    if (!Array.isArray(housingTypeOptions) && housingTypeOptions?.fields?.length > 0) {
      return formatTypeAheadOptions(housingTypeOptions.fields[0].items);
    }
    return [];
  }, [housingTypeOptions]);
  const [furnitureModel, setFurnitureModel] = useState<boolean>(false);
  const [showSection, setShowSection] = useState<boolean>(false);
  const [manualCostPerDays, setManualCostPerDays] = useState<{
    earlyMoveInCostPerDay: boolean;
    lateMoveOutCostPerDay: boolean;
  }>({
    earlyMoveInCostPerDay: false,
    lateMoveOutCostPerDay: false,
  });

  const isScenarioStatusPending = useScenarioStatusPending();
  const moveInDateMoment = field?.moveInDate ? moment(field?.moveInDate) : null;
  const moveOutDateMoment = field?.moveOutDate ? moment(field?.moveOutDate) : null;
  const [savedFurniture, setSavedFurniture] = useState<FurnitureCost[]>(
    field?.furnitureCosts?.map(item => ({
      ...item,
      include: item?.quantity > 0 ? true : false,
    })) || [],
  );
  const furnitureAdjustments = useSelector(selectFurnitureAdjustments);
  const isDefaultSelection =
    field?.housingTypeId === amnHousingWatchValues[amnHousingFieldNames?.housingType]?.object?.id;
  const housingDetails = useSelector(selectGsaDetails);
  const housingData = useMemo(() => {
    return housingDetails?.housing ? housingDetails?.housing : {};
  }, [housingDetails]);

  /**
   * Determines if the "Early Move In" option should be disabled based on the number of assignment splits and the current split index.
   * if assignmentSplits length is 1, then early move in should be enabled.
   * if assignmentSplits length is 2, then early move in should be enabled for splitIndex 0 and disabled for splitIndex 1.
   * if assignmentSplits length is greater than 2, then early move in should be enabled for splitIndex 0 and diabled for all other splitIndex.
   */
  const isEarlyMoveInDisabled =
    assignmentSplits?.length === 1 ? false : assignmentSplits?.length === 2 ? splitIndex === 1 : splitIndex !== 0;

  /**
   * Determines if the "Late Move Out" option should be disabled based on the number of assignment splits and the current split index.
   * if assignmentSplits length is 1, then late move out should be enabled.
   * if assignmentSplits length is 2, then late move out should be enabled for splitIndex 1 and disabled for splitIndex 0.
   * if assignmentSplits length is greater than 2, then late move out should be enabled for last splitIndex and diabled for all other splitIndex.
   */
  const isLateMoveOutDisabled =
    assignmentSplits?.length === 1
      ? false
      : assignmentSplits?.length === 2
      ? splitIndex === 0
      : splitIndex !== assignmentSplits?.length - 1;

  useEffect(() => {
    if (housingOptions?.length > 0 && Object.keys(housingData).length > 0) {
      const matchedHousingType = field?.housingTypeId ?? 1;
      const defaultHousingOption = housingOptions?.find(item => item?.object?.id === matchedHousingType);
      setValue(amnHousingFieldNames.housingType, defaultHousingOption);
      setShowSection(field?.housingType !== HousingTypeOptions?.noHousing ? true : false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [housingData, housingOptions, field]);
  const originalCosts = useMemo(() => {
    return Object.keys(housingData).length > 0 && amnHousingWatchValues?.[amnHousingFieldNames.housingType]
      ? housingTypeSelection(
          housingData,
          amnHousingWatchValues?.[amnHousingFieldNames.housingType]?.object?.description ??
            HousingTypeOptions.noHousing,
        )
      : { originalRentCost: defaultValue, originalFurnitureCost: defaultValue, originalUtilitiesCost: defaultValue };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [housingData, amnHousingWatchValues?.[amnHousingFieldNames.housingType]]);

  const handleFurnitureAdjustment = () => {
    setFurnitureModel(true);
    dispatch(assignmentActions.setFurnitureAdjustments(savedFurniture));
  };

  useEffect(() => {
    if (furnitureAdjustments?.length > 0) {
      register(`assignmentSplits.${splitIndex}.furnitureCosts`);
      setValue(`assignmentSplits.${splitIndex}.furnitureCosts`, savedFurniture);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedFurniture]);

  const setRentCostOnCostPerDays = value => {
    const earlyMoveInChecked = amnHousingWatchValues[amnHousingFieldNames.earlyMoveIn];
    const lateMoveOutChecked = amnHousingWatchValues[amnHousingFieldNames.lateMoveOut];
    const earlyMoveInCostPerDay = amnHousingWatchValues[amnHousingFieldNames.earlyMoveInCostPerDay];
    const lateMoveOutCostPerDay = amnHousingWatchValues[amnHousingFieldNames.lateMoveOutCostPerDay];
    if (
      (!manualCostPerDays?.earlyMoveInCostPerDay && !field?.earlyMoveInCostPerDay && earlyMoveInChecked) ||
      (manualCostPerDays?.earlyMoveInCostPerDay &&
        (!earlyMoveInCostPerDay || earlyMoveInCostPerDay === defaultValue) &&
        earlyMoveInChecked)
    ) {
      setValue(amnHousingFieldNames.earlyMoveInCostPerDay, getValueAsFloat(Number(value) / 30), { shouldDirty: false });
    }
    if (
      (!manualCostPerDays?.lateMoveOutCostPerDay && !field?.lateMoveOutCostPerDay && lateMoveOutChecked) ||
      (manualCostPerDays?.lateMoveOutCostPerDay &&
        (!lateMoveOutCostPerDay || lateMoveOutCostPerDay === defaultValue) &&
        lateMoveOutChecked)
    ) {
      setValue(amnHousingFieldNames.lateMoveOutCostPerDay, getValueAsFloat(Number(value) / 30), { shouldDirty: false });
    }
  };
  const earlyMoveInDefaultValue = () => {
    const rentDefaultValue = amnHousingWatchValues[amnHousingFieldNames.rentCostMonthly];
    const earlyMoveInCostPerDay = amnHousingWatchValues[amnHousingFieldNames.earlyMoveInCostPerDay];
    return isDefaultSelection && field?.earlyMoveInCostPerDay
      ? getValueAsFloat(field?.earlyMoveInCostPerDay)
      : rentDefaultValue && !manualCostPerDays?.earlyMoveInCostPerDay
      ? getValueAsFloat(Number(rentDefaultValue) / 30)
      : earlyMoveInCostPerDay
      ? earlyMoveInCostPerDay
      : '';
  };
  const earlyMoveInOnChange = e => {
    setManualCostPerDays({ ...manualCostPerDays, earlyMoveInCostPerDay: e?.target?.value ? true : false });
  };
  const lateMoveOutDefaultValue = () => {
    const rentDefaultValue = amnHousingWatchValues[amnHousingFieldNames.rentCostMonthly];
    const lateMoveOutCostPerDay = amnHousingWatchValues[amnHousingFieldNames.lateMoveOutCostPerDay];
    return isDefaultSelection && field?.lateMoveOutCostPerDay
      ? getValueAsFloat(field?.lateMoveOutCostPerDay)
      : rentDefaultValue && !manualCostPerDays?.lateMoveOutCostPerDay
      ? getValueAsFloat(Number(rentDefaultValue) / 30)
      : lateMoveOutCostPerDay
      ? lateMoveOutCostPerDay
      : '';
  };

  const lateMoveOutOnChange = e => {
    setManualCostPerDays({ ...manualCostPerDays, lateMoveOutCostPerDay: e?.target?.value ? true : false });
  };

  return (
    <>
      <MarginToolCard
        id="marginToolDetailsPage-amnHousing-card"
        title={<MarginToolCardTitle title={t('marginTool.components.assignment.amnHousing.title')} />}
        isActionPanelHidden
        customBackGroundColor={theme.palette.framework.system.white}
        children={
          <Grid>
            <Grid container item direction="row" spacing={4} sx={{ p: 2 }}>
              <Grid item xs={4}>
                <ControlledTypeAhead
                  name={amnHousingFieldNames.housingType}
                  id={'marginTool-amnHousing-housingType-dropDown'}
                  label={t('marginTool.labels.housingType')}
                  register={register}
                  control={control}
                  customScroll={true}
                  showDropdownIcon={true}
                  disabled={!isScenarioStatusPending}
                  options={housingOptions}
                  defaultValue={null}
                  onChange={e =>
                    handleHousingTypeSelection(
                      e,
                      field,
                      housingData,
                      setShowSection,
                      setSavedFurniture,
                      setManualCostPerDays,
                      setValue,
                      amnHousingFieldNames,
                      triggerPeopleSoftCalculation,
                    )
                  }
                ></ControlledTypeAhead>
              </Grid>
              <Grid item xs={4}>
                {showSection && (
                  <MarginToolDatePicker
                    name={amnHousingFieldNames.moveInDate}
                    placeholder={t('marginTool.labels.moveInDate')}
                    rules={{}}
                    isDisabled
                    maxWidth={480}
                    handleDateChange={() => {}}
                    defaultValue={moveInDateMoment?.format(defaultTimeFormat)}
                    error={Boolean(errors?.moveInDate?.message)}
                    helperText={errors?.moveInDate?.message}
                  />
                )}
              </Grid>
              <Grid item xs={4}>
                {showSection && (
                  <MarginToolDatePicker
                    name={amnHousingFieldNames.moveOutDate}
                    placeholder={t('marginTool.labels.moveOutDate')}
                    rules={{}}
                    isDisabled
                    maxWidth={480}
                    handleDateChange={() => {}}
                    defaultValue={moveOutDateMoment?.format(defaultTimeFormat)}
                    error={Boolean(errors?.moveOutDate?.message)}
                    helperText={errors?.moveOutDate?.message}
                  />
                )}
              </Grid>
            </Grid>
            {showSection && (
              <Grid>
                <Grid container item direction="row" spacing={4} sx={{ p: 2 }}>
                  <Grid item xs={4}>
                    <MarginToolCurrencyField
                      name={amnHousingFieldNames.housingCoPay}
                      label={t('marginTool.labels.housingCoPay')}
                      id={'marginTool-amnHousing-coPay-currencyField'}
                      required={false}
                      disabled={!isScenarioStatusPending}
                      tooltip={{ disabled: true }}
                      defaultValue={getValueAsFloat(field?.housingCoPay)}
                      triggerMarginToolFormUpdates={() => triggerPeopleSoftCalculation()}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <MarginToolCurrencyField
                      name={amnHousingFieldNames.furnitureCoPay}
                      label={t('marginTool.labels.furnitureCoPay')}
                      id={'marginTool-amnHousing-furnitureCoPay-currencyField'}
                      required={false}
                      disabled={!isScenarioStatusPending}
                      tooltip={{ disabled: true }}
                      defaultValue={getValueAsFloat(field?.furnitureCoPay)}
                      triggerMarginToolFormUpdates={() => triggerPeopleSoftCalculation()}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <MarginToolCurrencyField
                      name={amnHousingFieldNames.rentCostMonthly}
                      label={t('marginTool.labels.rentCostMonthly')}
                      id={'marginTool-amnHousing-rentCostMonthly-currencyField'}
                      disabled={!isScenarioStatusPending}
                      tooltip={{ disabled: true }}
                      endAdornmentValue={`(${t('marginTool.labels.originalAmount')}: ${t(
                        'currency.dollar',
                      )} ${getValueAsFloat(originalCosts?.originalRentCost)})`}
                      defaultValue={
                        field?.rentCost
                          ? getValueAsFloat(field?.rentCost)
                          : getValueAsFloat(originalCosts?.originalRentCost)
                      }
                      helperText={
                        <>
                          <Typography>{`(${t('marginTool.labels.dailyRentCost')}: ${t('currency.dollar')} ${
                            amnHousingWatchValues[amnHousingFieldNames.rentCostMonthly] === ''
                              ? defaultValue
                              : amnHousingWatchValues[amnHousingFieldNames.rentCostMonthly]
                              ? (Number(amnHousingWatchValues[amnHousingFieldNames.rentCostMonthly]) / 30).toFixed(2)
                              : parseFloat(amnHousingWatchValues[amnHousingFieldNames.rentCostMonthly]).toFixed(2)
                          })`}</Typography>
                        </>
                      }
                      onChange={e => {
                        setRentCostOnCostPerDays(e?.target?.value);
                      }}
                      triggerMarginToolFormUpdates={() => triggerPeopleSoftCalculation()}
                    />
                  </Grid>
                </Grid>
                <Grid container item direction="row" spacing={4} sx={{ p: 2 }}>
                  <Grid item xs={4}>
                    <MarginToolCurrencyField
                      name={amnHousingFieldNames.standardFurniture}
                      label={t('marginTool.labels.standardFurniture')}
                      id={'marginTool-amnHousing-standardFurniture-currencyField'}
                      required={false}
                      disabled={!isScenarioStatusPending}
                      tooltip={{ disabled: true }}
                      endAdornmentValue={`(${t('marginTool.labels.originalAmount')}: ${t(
                        'currency.dollar',
                      )} ${getValueAsFloat(originalCosts?.originalFurnitureCost)})`}
                      defaultValue={
                        field?.standardFurniture
                          ? getValueAsFloat(field?.standardFurniture)
                          : getValueAsFloat(originalCosts?.originalFurnitureCost)
                      }
                      triggerMarginToolFormUpdates={() => triggerPeopleSoftCalculation()}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <MarginToolTextField
                      name={amnHousingFieldNames.additionalFurniture}
                      label={t('marginTool.labels.additionalFurniture')}
                      id={'marginTool-amnHousing-additionalFurniture-currencyField'}
                      disabled={true}
                      isDecimalNumber={true}
                      customAdornmentClass={classes.furnitureAdjustmentsAdornment}
                      startAdornmentValue={t('currency.dollar')}
                      endAdornmentValue={
                        <>
                          <CustomTooltip
                            tooltipContent={t('marginTool.components.assignment.amnHousing.adjustFurnitureIconToolTip')}
                            disabled={!isScenarioStatusPending}
                            placement={'bottom-end'}
                          >
                            <IconButton
                              onClick={handleFurnitureAdjustment}
                              id="amnHousing-adjust-icon"
                              disabled={!isScenarioStatusPending}
                              className={classes.iconButton}
                              disableFocusRipple
                              disableRipple
                              disableTouchRipple
                            >
                              <TuneIcon id="adjust-amnHousing-margin-tool-icon" className={classes.tuneIcon} />
                            </IconButton>
                          </CustomTooltip>
                        </>
                      }
                      defaultValue={furnitureCalculation(field?.furnitureCosts) ?? defaultValue}
                      triggerMarginToolFormUpdates={() => triggerPeopleSoftCalculation()}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <MarginToolCurrencyField
                      name={amnHousingFieldNames.utilities}
                      label={t('marginTool.labels.utilities')}
                      id={'marginTool-amnHousing-utilities-currencyField'}
                      required={false}
                      disabled={!isScenarioStatusPending}
                      tooltip={{ disabled: true }}
                      endAdornmentValue={`(${t('marginTool.labels.originalAmount')}: ${t(
                        'currency.dollar',
                      )} ${getValueAsFloat(originalCosts?.originalUtilitiesCost)})`}
                      defaultValue={
                        field?.utilities
                          ? getValueAsFloat(field?.utilities)
                          : getValueAsFloat(originalCosts?.originalUtilitiesCost)
                      }
                      triggerMarginToolFormUpdates={() => triggerPeopleSoftCalculation()}
                    />
                  </Grid>
                </Grid>
                <Grid container item direction="row" spacing={4} sx={{ p: 2 }}>
                  <Grid item xs={12}>
                    <MarginToolTextArea
                      name={amnHousingFieldNames.rentOverrideNote}
                      label={t('marginTool.labels.rentOverrideNote')}
                      id={'marginTool-amnHousing-rentOverrideNote-textArea'}
                      disabled={!isScenarioStatusPending}
                      inputProps={{ maxLength: 1000 }}
                      handleChange={(event: React.ChangeEvent<HTMLInputElement>) => {}}
                      defaultValue={field?.rentOverrideNot}
                      error={!!errors?.rentOverrideNote}
                      helperText={
                        <div className={classes.descriptionCountStyle}>{`${
                          amnHousingWatchValues[amnHousingFieldNames.rentOverrideNote]?.length
                            ? amnHousingWatchValues[amnHousingFieldNames.rentOverrideNote]?.length
                            : field?.rentOverrideNot?.length > 0 &&
                              amnHousingWatchValues[amnHousingFieldNames.rentOverrideNote] !== ''
                            ? field?.rentOverrideNot?.length
                            : 0
                        }/1000`}</div>
                      }
                    />
                  </Grid>
                </Grid>
              </Grid>
            )}
            {showSection && (
              <Grid>
                <Grid container item direction="row" spacing={4} sx={{ p: 2 }}>
                  <Grid item xs={4}>
                    <MarginToolCheckbox
                      name={amnHousingFieldNames.earlyMoveIn}
                      label={<Typography variant={'body1'}>{t('marginTool.labels.earlyMoveIn')}</Typography>}
                      id={'marginTool-amnHousing-earlyMoveIn-checkBox'}
                      disabled={!isScenarioStatusPending || isEarlyMoveInDisabled}
                      defaultChecked={!isEarlyMoveInDisabled ? field?.isEarlyMoveIn : false}
                      onHandleChange={() => triggerPeopleSoftCalculation()}
                    />
                  </Grid>
                </Grid>
              </Grid>
            )}
            {showSection && amnHousingWatchValues[amnHousingFieldNames.earlyMoveIn] && (
              <Grid>
                <Grid container item direction="row" spacing={4} sx={{ p: 2 }}>
                  <Grid item xs={3}>
                    <MarginToolDatePicker
                      name={amnHousingFieldNames.earlyMoveInDate}
                      placeholder={t('marginTool.labels.earlyMoveInDate')}
                      rules={{
                        validate: value => {
                          const selectedDate = moment(value).startOf('day');
                          const moveInDate = moveInDateMoment.startOf('day');
                          if (selectedDate.isAfter(moveInDate) || selectedDate.isSame(moveInDate)) {
                            return t('marginTool.helperText.moveInDate');
                          }
                          return true;
                        },
                      }}
                      maxWidth={480}
                      isDisabled={!isScenarioStatusPending}
                      defaultValue={isDefaultSelection ? field?.earlyMoveInDate : null}
                      handleDateChange={event => {
                        handleEarlyOrLateDateChange(
                          {
                            inputValue: event,
                            valueToSet: amnHousingFieldNames.earlyMoveInNumberOfDays,
                            conditionType: CheckInTypes.earlyMoveIn,
                          },
                          moveInDateMoment,
                          moveOutDateMoment,
                          setValue,
                          clearErrors,
                          splitIndex,
                        );
                        triggerPeopleSoftCalculation();
                      }}
                      error={Boolean(errors?.assignmentSplits?.[splitIndex]?.earlyMoveInDate?.message)}
                      helperText={errors?.assignmentSplits?.[splitIndex]?.earlyMoveInDate?.message}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <MarginToolTextField
                      name={amnHousingFieldNames.earlyMoveInNumberOfDays}
                      label={t('marginTool.labels.numberOfDays')}
                      id={'marginTool-amnHousing-earlyMoveInNumberOfDays-textField'}
                      disabled={!isScenarioStatusPending}
                      isDecimalNumber={true}
                      shrinkLabel={Boolean(earlyMoveInDays)}
                      maxNumbersAllowed={4}
                      customRegExp={'^[0-9]$'}
                      defaultValue={isDefaultSelection ? field?.earlyMoveInDays : ''}
                      onChange={e =>
                        handleEarlyOrLateNumberOfDays(
                          {
                            inputValue: e?.target?.value,
                            valueToSet: amnHousingFieldNames.earlyMoveInDate,
                            conditionType: CheckInTypes.earlyMoveIn,
                          },
                          moveInDateMoment,
                          moveOutDateMoment,
                          setValue,
                        )
                      }
                      error={!!errors?.earlyMoveInNumberOfDays}
                      helperText={
                        errors?.earlyMoveInNumberOfDays ? errors?.earlyMoveInNumberOfDays?.message : undefined
                      }
                      triggerMarginToolFormUpdates={() => triggerPeopleSoftCalculation()}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <MarginToolTextField
                      name={amnHousingFieldNames.earlyMoveInDaysWaived}
                      label={t('marginTool.labels.daysWaived')}
                      id={'marginTool-amnHousing-earlyMoveInDaysWaived-currencyField'}
                      disabled={!isScenarioStatusPending}
                      isDecimalNumber={true}
                      maxNumbersAllowed={4}
                      customRegExp={'^[0-9]$'}
                      defaultValue={isDefaultSelection ? field?.earlyMoveInDaysWaived : ''}
                      error={!!errors?.earlyMoveInDaysWaived}
                      helperText={errors?.earlyMoveInDaysWaived ? errors?.earlyMoveInDaysWaived?.message : undefined}
                      triggerMarginToolFormUpdates={() => triggerPeopleSoftCalculation()}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <MarginToolCurrencyField
                      name={amnHousingFieldNames.earlyMoveInCostPerDay}
                      label={t('marginTool.labels.costPerDay')}
                      id={'marginTool-amnHousing-earlyMoveInCostPerDay-currencyField'}
                      disabled={!isScenarioStatusPending}
                      tooltip={{
                        disabled: true,
                      }}
                      defaultValue={earlyMoveInDefaultValue()}
                      onChange={e => {
                        earlyMoveInOnChange(e);
                      }}
                      triggerMarginToolFormUpdates={() => triggerPeopleSoftCalculation()}
                    />
                  </Grid>
                </Grid>
              </Grid>
            )}
            {showSection && (
              <Grid>
                <Grid container item direction="row" spacing={4} sx={{ p: 2 }}>
                  <Grid item xs={4}>
                    <MarginToolCheckbox
                      name={amnHousingFieldNames.lateMoveOut}
                      label={<Typography variant={'body1'}>{t('marginTool.labels.lateMoveOut')}</Typography>}
                      id={'marginTool-amnHousing-lateMoveOut-checkBoxField'}
                      disabled={!isScenarioStatusPending || isLateMoveOutDisabled}
                      defaultChecked={!isLateMoveOutDisabled ? field?.isLateMoveOut : false}
                      onHandleChange={() => triggerPeopleSoftCalculation()}
                    />
                  </Grid>
                </Grid>
              </Grid>
            )}
            {showSection && amnHousingWatchValues[amnHousingFieldNames.lateMoveOut] && (
              <Grid>
                <Grid container item direction="row" spacing={4} sx={{ p: 2 }}>
                  <Grid item xs={3}>
                    <MarginToolDatePicker
                      name={amnHousingFieldNames.lateMoveOutDate}
                      placeholder={t('marginTool.labels.lateMoveOutDate')}
                      rules={{
                        validate: value => {
                          const selectedDate = moment(value).startOf('day');
                          const moveOutDate = moveOutDateMoment.startOf('day');
                          if (selectedDate.isBefore(moveOutDate) || selectedDate.isSame(moveOutDate)) {
                            return t('marginTool.helperText.moveOutDate');
                          }
                          return true;
                        },
                      }}
                      maxWidth={480}
                      isDisabled={!isScenarioStatusPending}
                      defaultValue={isDefaultSelection ? field?.lateMoveOutDate : null}
                      handleDateChange={event => {
                        handleEarlyOrLateDateChange(
                          {
                            inputValue: event,
                            valueToSet: amnHousingFieldNames.lateMoveOutNumberOfDays,
                            conditionType: CheckInTypes.lateMoveOut,
                          },
                          moveInDateMoment,
                          moveOutDateMoment,
                          setValue,
                          clearErrors,
                          splitIndex,
                        );
                        triggerPeopleSoftCalculation();
                      }}
                      error={Boolean(errors?.assignmentSplits?.[splitIndex]?.lateMoveOutDate?.message)}
                      helperText={errors?.assignmentSplits?.[splitIndex]?.lateMoveOutDate?.message}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <MarginToolTextField
                      name={amnHousingFieldNames.lateMoveOutNumberOfDays}
                      label={t('marginTool.labels.numberOfDays')}
                      id={'marginTool-amnHousing-lateMoveOutNumberOfDays-textField'}
                      disabled={!isScenarioStatusPending}
                      isDecimalNumber={true}
                      shrinkLabel={Boolean(lateMoveOutDays)}
                      maxNumbersAllowed={4}
                      customRegExp={'^[0-9]$'}
                      defaultValue={isDefaultSelection ? field?.lateMoveOutDays : ''}
                      onChange={e =>
                        handleEarlyOrLateNumberOfDays(
                          {
                            inputValue: e?.target?.value,
                            valueToSet: amnHousingFieldNames.lateMoveOutDate,
                            conditionType: CheckInTypes.lateMoveOut,
                          },
                          moveInDateMoment,
                          moveOutDateMoment,
                          setValue,
                        )
                      }
                      error={!!errors?.lateMoveOutNumberOfDays}
                      helperText={
                        errors?.lateMoveOutNumberOfDays ? errors?.lateMoveOutNumberOfDays?.message : undefined
                      }
                      triggerMarginToolFormUpdates={() => triggerPeopleSoftCalculation()}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <MarginToolTextField
                      name={amnHousingFieldNames.lateMoveOutDaysWaived}
                      label={t('marginTool.labels.daysWaived')}
                      id={'marginTool-amnHousing-lateMoveOutDaysWaived-textField'}
                      disabled={!isScenarioStatusPending}
                      isDecimalNumber={true}
                      maxNumbersAllowed={4}
                      customRegExp={'^[0-9]$'}
                      defaultValue={isDefaultSelection ? field?.lateMoveOutDaysWaived : ''}
                      error={!!errors?.lateMoveOutDaysWaived}
                      helperText={errors?.lateMoveOutDaysWaived ? errors?.lateMoveOutDaysWaived?.message : undefined}
                      triggerMarginToolFormUpdates={() => triggerPeopleSoftCalculation()}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <MarginToolCurrencyField
                      name={amnHousingFieldNames.lateMoveOutCostPerDay}
                      label={t('marginTool.labels.costPerDay')}
                      id={'marginTool-amnHousing-lateMoveOutCostPerDay-currencyField'}
                      required={false}
                      disabled={!isScenarioStatusPending}
                      tooltip={{ disabled: true }}
                      defaultValue={lateMoveOutDefaultValue()}
                      onChange={e => {
                        lateMoveOutOnChange(e);
                      }}
                      triggerMarginToolFormUpdates={() => triggerPeopleSoftCalculation()}
                    />
                  </Grid>
                </Grid>
              </Grid>
            )}

            <Grid item xs={12} sx={{ display: 'none' }}>
              <MarginToolTextField
                name={amnHousingFieldNames?.miscDescription}
                id={'marginTool-amnHousing-miscFurnitureDescription-textArea'}
                disabled={false}
                label={t('marginTool.labels.miscFurnitureDescription')}
                error={!!errors?.furnitureDescription}
                defaultValue={field?.miscellaneousFurnitureDescription}
              />
            </Grid>
          </Grid>
        }
      />
      {furnitureModel && (
        <AdjustFurnitureModal
          open={furnitureModel}
          setFurnitureModel={setFurnitureModel}
          savedFurniture={savedFurniture}
          setSavedFurniture={setSavedFurniture}
          splitIndex={splitIndex}
          {...field}
        />
      )}
    </>
  );
};
