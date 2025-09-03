import { ControlledTypeAhead } from '@AMIEWEB/Candidate/CandidateProfile/CandidateTabPanel/PreferencesTab/CustomComponents/ControlledTypeAhead';
import MarginToolTextField from '@AMIEWEB/MarginTool/Common/MarginToolTextField';
import { Grid, IconButton } from 'amn-ui-core';
import React, { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectDeletedSplits,
  selectShiftDetails,
  selectScenarioModalState,
} from 'store/redux-store/margin-tool/slices/add-edit-scenario/add-edit-scenario.selector';
import { MarginToolDatePicker } from '@AMIEWEB/MarginTool/Common/MarginToolDatePicker';
import moment from 'moment';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import { PayPackageOptions } from '@AMIEWEB/MarginTool/enum';
import { IScenarioSplit, IShiftData, SenarioSplitMode } from '../model';
import { scenarioActions } from 'store/redux-store/margin-tool/slices/add-edit-scenario/add-edit-scenario.redux';
import { CustomTooltip } from '@AMIEWEB/Common';
interface ISplitsWrapperProps {
  handleShiftChange: (shift: IShiftData, fieldIndex: number) => void;
  handleHoursPerShiftChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  fieldIndex?: number;
  field?: IScenarioSplit;
  removeSplitsField?: (index: number) => void;
  splitsFields?: Array<IScenarioSplit>;
}
const SplitsWrapper = ({
  fieldIndex,
  field,
  splitsFields,
  handleShiftChange,
  removeSplitsField,
}: ISplitsWrapperProps) => {
  const dispatch = useDispatch();
  const { control, watch, register, errors, setValue, trigger } = useFormContext();
  const shiftDetailsData = useSelector(selectShiftDetails);
  const deletedSplitsDetails = useSelector(selectDeletedSplits);
  const isModalOpen = useSelector(selectScenarioModalState);

  const hoursPerShift = watch(`splitsList[${fieldIndex}].hoursPerShift`);
  const noSplitsPresent = splitsFields.length === 1;
  const { t } = useTranslation();
  const validateDateValue = value => {
    const startDate = moment(watch(`splitsList[${fieldIndex}].startDate`));
    const endDate = moment(value);
    return endDate.isSameOrAfter(startDate, 'day') || 'Must be greater than Start Date';
  };

  const registerDefaultValues = (split, index) => {
    if (isModalOpen?.modalName === PayPackageOptions.editScenario) {
      register(`splitsList[${index}].splitId`);
      register(`splitsList[${index}].mode`);
      setValue(`splitsList[${index}].splitId`, split?.splitId);
      setValue(`splitsList[${index}].mode`, split?.mode);
    }
  };

  const deleteSplit = index => {
    if (isModalOpen?.modalName === PayPackageOptions.editScenario) {
      removeSplitsField(index);
      if (field?.splitId) {
        const updatedField = { ...field, shift: { ...field?.shift }, mode: SenarioSplitMode.DELETE };
        const selectedSplits = [...deletedSplitsDetails];
        selectedSplits.push(updatedField);
        dispatch(scenarioActions.setDeletedScenarioSplits(selectedSplits));
      }
    } else {
      removeSplitsField(index);
    }
  };

  useEffect(() => {
    registerDefaultValues(field, fieldIndex);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fieldIndex, field]);

  return (
    <Grid container item columnSpacing={2}>
      <Grid item xs={2.5} sx={{ display: noSplitsPresent ? 'none' : 'block' }}>
        <CustomTooltip
          contentStyle={{ whiteSpace: 'wrap' }}
          tooltipContent={fieldIndex === 0 ? t('marginTool.tooltip.splitsStartDateTooltip') : ''}
        >
          <MarginToolDatePicker
            name={`splitsList[${fieldIndex}].startDate`}
            rules={{ required: 'Required' }}
            defaultValue={field.startDate}
            handleDateChange={newDate => {
              trigger(`splitsList[${fieldIndex}].endDate`);
            }}
            placeholder={t('marginTool.labels.startDateWithAsterisk')}
            error={errors?.splitsList?.length && Boolean(errors?.splitsList[fieldIndex]?.startDate?.message)}
            helperText={errors?.splitsList?.length && errors?.splitsList[fieldIndex]?.startDate?.message}
            isReadOnly={fieldIndex === 0}
          />
        </CustomTooltip>
      </Grid>
      <Grid item xs={2.5} sx={{ display: noSplitsPresent ? 'none' : 'block' }}>
        <CustomTooltip
          contentStyle={{ whiteSpace: 'wrap' }}
          tooltipContent={fieldIndex === splitsFields?.length - 1 ? t('marginTool.tooltip.splitEndDateTooltip') : ''}
        >
          <MarginToolDatePicker
            name={`splitsList[${fieldIndex}].endDate`}
            rules={{
              required: 'Required',
              validate: value => validateDateValue(value),
            }}
            defaultValue={field.endDate}
            handleDateChange={newDate => {}}
            placeholder={t('marginTool.labels.endDateWithAsterisk')}
            error={errors?.splitsList?.length && Boolean(errors?.splitsList[fieldIndex]?.endDate?.message)}
            helperText={errors?.splitsList?.length && errors?.splitsList[fieldIndex]?.endDate?.message}
            isReadOnly={fieldIndex === splitsFields.length - 1}
          />
        </CustomTooltip>
      </Grid>
      <Grid item xs={2}>
        <ControlledTypeAhead
          name={`splitsList[${fieldIndex}].shift`}
          register={register}
          control={control}
          options={shiftDetailsData || []}
          mandatory={false}
          defaultValue={field.shift}
          filledNormal={false}
          label={t('marginTool.labels.shift')}
          onChange={shift => handleShiftChange(shift, fieldIndex)}
          disabled={false}
          customScroll={true}
          id={'marginTool-addScenarioModal-shiftDropDown'}
          showDropdownIcon={true}
        />
      </Grid>
      <Grid item xs={2}>
        <MarginToolTextField
          endAdornmentValue={'hours'}
          name={`splitsList[${fieldIndex}].hoursPerWeek`}
          id={'marginTool-addScenarioModal-hoursPerWeekTextfield'}
          label={t('marginTool.labels.hoursPerWeekWithAsterisk')}
          rules={{ required: t('marginTool.validation.required') }}
          error={errors?.splitsList?.length && Boolean(errors?.splitsList[fieldIndex]?.hoursPerWeek?.message)}
          helperText={errors?.splitsList?.length && errors?.splitsList[fieldIndex]?.hoursPerWeek?.message}
          shrinkLabel={!!hoursPerShift}
          isDecimalNumber={true}
          defaultValue={field.hoursPerWeek}
        />
      </Grid>
      <Grid item xs={2}>
        <MarginToolTextField
          // onHandleChange={(event: React.ChangeEvent<HTMLInputElement>) => handleHoursPerShiftChange(event)}
          endAdornmentValue={'hours'}
          name={`splitsList[${fieldIndex}].hoursPerShift`}
          id={'marginTool-addScenarioModal-hoursPerShiftTextfield'}
          label={t('marginTool.labels.hoursPerShift')}
          isReadOnly={true}
          shrinkLabel={!!hoursPerShift}
          defaultValue={field.hoursPerShift}
        />
      </Grid>
      <Grid
        item
        sx={{
          display: noSplitsPresent ? 'none' : 'block',
        }}
      >
        <IconButton
          onClick={() => deleteSplit(fieldIndex)}
          aria-label="delete"
          id={`delete-reimbursement-icon-${fieldIndex}`}
        >
          <DeleteOutlinedIcon
            sx={{
              '&:hover': {
                color: theme => theme.palette.framework.system.main,
              },
            }}
          />
        </IconButton>
      </Grid>
    </Grid>
  );
};
export default SplitsWrapper;
