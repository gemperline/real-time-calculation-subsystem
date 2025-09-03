import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useFormContext } from 'react-hook-form';
import { Grid } from 'amn-ui-core';
import moment, { Moment } from 'moment';
import MarginToolTextField from '@AMIEWEB/MarginTool/Common/MarginToolTextField';
import { MarginToolDatePicker } from '@AMIEWEB/MarginTool/Common/MarginToolDatePicker';
import { getExtensionDuration } from 'app/helpers/getExtensionDuration';
import { getExtensionEndDate } from '@AMIEWEB/Placement/PlacementDetails/Edit/helper';
import { PayPackageOptions } from '@AMIEWEB/MarginTool/enum';
import { useSelector } from 'react-redux';
import {
  selectAddScenario,
  selectScenarioModalState,
} from 'store/redux-store/margin-tool/slices/add-edit-scenario/add-edit-scenario.selector';
import { IScenarioSplit } from './model';
import { useIsAssignmentScenario } from '@AMIEWEB/MarginTool/hooks';

export const DatesAndDuration = () => {
  const { setValue, watch, errors, setError, clearErrors } = useFormContext();
  const { t } = useTranslation();
  const defaultWeeks = 13;
  const selectedStartDate = watch('startDate');
  const selectedEndDate = watch('endDate');
  const durationValue = watch('duration');
  const isInExtension: boolean = watch('isInExtension');
  const isModalOpen = useSelector(selectScenarioModalState);
  const addScenario = useSelector(selectAddScenario);
  const isEditScenarioExtension = isModalOpen?.modalName === PayPackageOptions.editScenario && isInExtension;
  const isAddScenarioFromExtensionDisabled =
    isModalOpen?.modalName === PayPackageOptions.AddScenario && addScenario?.isInExtension;
  const splitsList: Array<IScenarioSplit> = watch('splitsList');
  const { isFromAssignmentBookingPeriod } = useIsAssignmentScenario();

  const populateDuration = (endDate: Date) => {
    if (selectedStartDate && endDate) {
      const weeksGap = getExtensionDuration(moment(selectedStartDate), endDate);
      setValue('duration', weeksGap);
      clearErrors('duration');
    }
  };

  const handleNullDates = () => {
    setValue('endDate', null);
    setValue('duration', '');
    handleSplitStartDate(null);
    handleSplitEndDate(null);
  };
  const handleSplitStartDate = startDate => {
    if (splitsList.length) {
      setValue(`splitsList[0].startDate`, startDate);
      clearErrors('splitsList[0].endDate');
      clearErrors('splitsList[0].startDate');
    }
  };
  const handleSplitEndDate = endDate => {
    const lastIndex = splitsList.length - 1;
    if (lastIndex >= -1) setValue(`splitsList[${lastIndex}].endDate`, endDate);
    clearErrors(`splitsList[${lastIndex}].endDate`);
  };

  const handleStartDateChange = selectedRange => {
    if (!selectedRange?.startDate) {
      handleNullDates();
      return;
    }
    const startDate = moment(selectedRange.startDate);
    handleSplitStartDate(startDate?.format('YYYY-MM-DDTHH:mm:ss'));
    calculateEndDate(startDate);
  };

  const calculateWeeksGap = (startDateMoment: Moment, endDateMoment: Moment) => {
    const weeksGap = getExtensionDuration(startDateMoment, endDateMoment?.format('YYYY-MM-DDTHH:mm:ss'));
    if (weeksGap >= 0) {
      setValue('duration', weeksGap);
      clearErrors('duration');
      clearErrors('endDate');
    } else {
      setValue('duration', 0);
      setError('endDate', {
        type: 'validate',
        message: t(''),
      });
    }
  };

  /**
   * Method to calculate end date based on start date
   * @param startDate
   */
  const calculateEndDate = (startDate: Moment) => {
    const startDateMoment = moment(startDate);
    const endDateMoment = moment(selectedEndDate);
    const placementLength = watch('duration');
    if (endDateMoment?.isValid()) {
      calculateWeeksGap(startDateMoment, endDateMoment);
    } else if (!Boolean(placementLength) && selectedEndDate === null) {
      const endDate = getExtensionEndDate(startDate, defaultWeeks);
      setValue('endDate', endDate?.format('YYYY-MM-DDTHH:mm:ss'));
      setValue('duration', defaultWeeks, { shouldValidate: true });
      handleSplitEndDate(endDate?.format('YYYY-MM-DDTHH:mm:ss'));
    }
  };

  const handleEndDateChange = selectedRange => {
    if (!selectedRange?.endDate) {
      setValue('duration', '');
      handleSplitEndDate(null);
      return;
    }
    const { endDate } = selectedRange;
    const selectedDate = moment(endDate);
    if (selectedDate.isValid()) {
      clearErrors('endDate');
      if (selectedDate.isBefore(moment(selectedStartDate))) {
        setValue('duration', '');
        handleSplitEndDate(selectedDate?.format('YYYY-MM-DDTHH:mm:ss'));
        return;
      }
      populateDuration(endDate);
      handleSplitEndDate(selectedDate?.format('YYYY-MM-DDTHH:mm:ss'));
    }
  };

  /**
   * Method to handle duration change
   * @param event
   */
  const handleDurationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const isValidValue = /^[0-9]{1,4}$/;
    const inputValue = event.target.value;
    if (inputValue !== null && isValidValue.test(inputValue?.toString())) {
      const weeksGap = Math.floor(Number(inputValue));
      setValue('duration', weeksGap);
      calculatePlacementDates(weeksGap);
    } else {
      calculatePlacementDates(0);
      setValue('duration', '');
    }
  };

  /**
   * Method to set end date based on start date and weeks gap
   * @param endDate
   */
  const setEndDate = (weeksGap: number, startDate: Moment) => {
    clearErrors('endDate');
    const endDate = getExtensionEndDate(startDate, weeksGap ?? 0);
    const placementDateValue = {
      startDate: startDate?.format('YYYY-MM-DDTHH:mm:ss'),
      endDate: weeksGap === 0 ? startDate?.format('YYYY-MM-DDTHH:mm:ss') : endDate?.format('YYYY-MM-DDTHH:mm:ss'),
    };
    setValue('endDate', placementDateValue?.endDate);
    handleSplitEndDate(placementDateValue?.endDate);
  };

  /**
   * Method to calculate placement dates based when weeks gap/duration is changed
   * @param weeksGap
   */
  const calculatePlacementDates = (weeksGap: number) => {
    const startDateMoment = moment(selectedStartDate);
    const endDateMoment = moment(selectedEndDate);
    if (startDateMoment?.isValid()) {
      setEndDate(weeksGap, startDateMoment);
    } else if (endDateMoment?.isValid()) {
      const startDate = startDateMoment?.subtract(weeksGap, 'weeks');
      setValue('startDate', startDate?.format('YYYY-MM-DDTHH:mm:ss'));
      handleSplitStartDate(startDate?.format('YYYY-MM-DDTHH:mm:ss'));
    }
  };

  const isChronological = (start, end) => {
    return moment(end).isSameOrAfter(moment(start));
  };

  useEffect(() => {
    if (selectedStartDate && selectedEndDate) {
      if (!isChronological(selectedStartDate, selectedEndDate)) {
        setError('endDate', { message: 'Must be greater than Start Date' });
      } else {
        clearErrors('endDate');
      }
    }
  }, [selectedStartDate, selectedEndDate]);

  const validateDateValue = value => {
    const startDate = moment(watch('startDate'));
    const endDate = moment(value);
    return endDate.isSameOrAfter(startDate, 'day') || 'Must be greater than Start Date';
  };

  return (
    <Grid container item>
      <Grid item>
        <MarginToolDatePicker
          name="startDate"
          rules={{ required: 'Required' }}
          handleDateChange={newDate => handleStartDateChange(newDate)}
          placeholder={t('marginTool.labels.startDateWithAsterisk')}
          error={Boolean(errors?.startDate?.message)}
          helperText={errors?.startDate?.message}
          isDisabled={isModalOpen?.modalName === PayPackageOptions.AddExtension || !isFromAssignmentBookingPeriod}
          isReadOnly={isEditScenarioExtension}
        />
      </Grid>
      <Grid item sx={{ padding: '0px 12px' }}>
        <MarginToolDatePicker
          name="endDate"
          rules={{
            required: 'Required',
            validate: value => validateDateValue(value),
          }}
          handleDateChange={newDate => handleEndDateChange(newDate)}
          placeholder={t('marginTool.labels.endDateWithAsterisk')}
          error={Boolean(errors?.endDate?.message)}
          helperText={errors?.endDate?.message}
        />
      </Grid>
      <Grid item maxWidth="180px">
        <MarginToolTextField
          onHandleChange={(event: React.ChangeEvent<HTMLInputElement>) => handleDurationChange(event)}
          endAdornmentValue="weeks"
          name="duration"
          id="marginTool-addScenarioModal-duration-textfield"
          label={t('marginTool.labels.durationWithAsterisk')}
          defaultValue={durationValue}
          inputProps={{ maxLength: 4 }}
          rules={{ required: 'Required' }}
          disabled={!selectedStartDate || !selectedEndDate}
          error={!!errors?.duration}
          helperText={errors?.duration ? errors?.duration?.message : undefined}
        />
      </Grid>
    </Grid>
  );
};
