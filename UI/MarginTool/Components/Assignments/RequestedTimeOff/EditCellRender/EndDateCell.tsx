import { Controller, useFormContext } from 'react-hook-form';
import React from 'react';
import { DateRangePicker } from 'app/ComponentLibrary/DateRangeNew';
import { isNullOrUndefined } from 'app/helpers/objectHelpers';
import { useDispatch, useSelector } from 'react-redux';
import { differenceInDays, isAfter, isBefore, isSameDay, isValid } from 'date-fns';
import { dateTimeFormat, dateTimeLabelFormat } from './modal';
import { useEditCellRenderStyles } from './EditCellRenderStyles';
import { selectEditTimeOffs } from 'store/redux-store/margin-tool/slices/assignment/assignment.selector';
import { assignmentActions } from 'store/redux-store/margin-tool/slices/assignment/assignment.redux';
import moment from 'moment';
import { checkOverlapForAllRecords, checkOverlapForArray, isInValidHours } from './helper';
import { WhiteTooltip } from '@AMIEWEB/Common';
import { missingField } from '@AMIEWEB/Notification/MultiChannel/Sms/CredentialingAnalyst/PlacementDisplay';
import { usePeopleSoftCalculation } from '@AMIEWEB/MarginTool/Components/PeopleSoftCalculation/IPeopleSoftCalculationHelper';
import { useTranslation } from 'react-i18next';
import { GridCellParams } from '@mui/x-data-grid-pro';

export const EndDateEditCell = (cellParams: GridCellParams) => {
  return <EndDateEdit {...cellParams} />;
};

const EndDateEdit = React.memo(function EndDateEdit(cellParams: GridCellParams) {
  const { classes } = useEditCellRenderStyles();
  const { control, errors } = useFormContext();
  const dispatch = useDispatch();
  const rowId = cellParams?.row?.id;
  const editTimeOffs = useSelector(selectEditTimeOffs);
  const editTimeOffRow = editTimeOffs?.find(item => item?.id === cellParams?.id);
  const startDateCell = cellParams?.row?.startDate ?? editTimeOffRow?.startDate;
  const endDateCell = cellParams?.row?.endDate ?? editTimeOffRow?.endDate;
  const { triggerPeopleSoftCalculation } = usePeopleSoftCalculation();

  const setDaysDifference = date => {
    return differenceInDays(new Date(date), new Date(startDateCell)) + 1;
  };

  const triggerPeopleSoftCalculationForValidDates = newRow => {
    const validRequestedTimeOff = newRow?.filter(item => item?.days !== null && item?.days !== '--');
    triggerPeopleSoftCalculation(false, validRequestedTimeOff);
  };

  const setDateForTimeOffEdit = date => {
    let newRow = updateTimeOffEdit(date);
    dispatch(assignmentActions.setEditTimeOffs(newRow));
    triggerPeopleSoftCalculationForValidDates(newRow);
  };

  const updateTimeOffEdit = date => {
    let newRow = editTimeOffs?.slice(0);
    let timeOffEditRow = editTimeOffs?.find(item => item?.id === rowId);
    let editIndex = editTimeOffs?.findIndex(row => row?.id === rowId);
    if (editIndex >= 0) {
      const daysDiff =
        !isValid(new Date(date)) || isBefore(new Date(date), new Date(startDateCell)) ? null : setDaysDifference(date);
      let updatedEndDate = {
        ...timeOffEditRow,
        endDate: date,
        days: daysDiff ? daysDiff : missingField,
      };
      newRow[editIndex] = updatedEndDate;
    }
    return newRow;
  };

  return (
    <Controller
      control={control}
      name={`assignment.timeOffs[${rowId}].endDate`}
      rules={{ required: true }}
      render={({ ref, onChange, onBlur, ...rest }) => {
        return (
          <React.Fragment>
            <DateRangePicker
              onChange={newValue => {
                if (newValue?.endDate !== undefined) {
                  const newDate = moment(newValue?.endDate);
                  const setTo = newDate?.isValid() ? moment(newDate)?.format(dateTimeFormat) : null;
                  onChange(setTo);
                  setDateForTimeOffEdit(setTo);
                  if (
                    !isInValidHours(editTimeOffRow?.hours) &&
                    (isAfter(new Date(setTo), new Date(editTimeOffRow?.startDate)) ||
                      isSameDay(new Date(setTo), new Date(editTimeOffRow?.startDate))) &&
                    !checkOverlapForAllRecords(updateTimeOffEdit(setTo))
                  ) {
                    dispatch(assignmentActions.setEditTimeOffGridError(false));
                  } else {
                    dispatch(assignmentActions.setEditTimeOffGridError(true));
                  }
                } else {
                  onChange(null);
                  setDateForTimeOffEdit(null);
                }
              }}
              value={endDateCell}
              onCancel={() => {}}
              clear
              open={false}
              variant="filled"
              quickSelect={false}
              single
              useMaxWidth={true}
              showIcon={true}
              className={endDateCell ? classes.inputFieldNoLabel : classes.inputFields}
              labelClass={endDateCell ? classes.hideInputFieldLabel : classes.inputFields}
              actionBar={false}
              clickAway={true}
              trailingIconShow={true}
              keepClickAwayVal={true}
              initialDateRange={{
                startDate: endDateCell && endDateCell !== missingField ? new Date(endDateCell) : undefined,
                endDate: endDateCell && endDateCell !== missingField ? new Date(endDateCell) : undefined,
                useLabelAsValue: true,
              }}
              error={!isNullOrUndefined(errors?.newEndDate)}
              helperText={!isNullOrUndefined(errors?.newEndDate) ? errors?.newEndDate?.message : undefined}
            />
          </React.Fragment>
        );
      }}
    />
  );
});

export const EndDateCellRender = React.memo(function EndDateCellRender(cellParams: GridCellParams) {
  const { t } = useTranslation();
  const { classes } = useEditCellRenderStyles();
  const editTimeOffs = useSelector(selectEditTimeOffs);
  const timeOffEditRow = { row: editTimeOffs?.find(item => item?.id === cellParams?.id) };

  const getTitle = props => {
    const compareRow = props?.row?.endDate ? cellParams : timeOffEditRow;
    const startDate = props?.row?.startDate ?? timeOffEditRow?.row?.startDate;
    const endDate = props?.row?.endDate ?? timeOffEditRow?.row?.endDate;
    if (moment(startDate) > moment(endDate)) {
      return `${t('marginTool.components.assignment.requestedTimeOff.grid.cellRender.afterStartDate')}`;
    } else if (checkOverlapForArray(editTimeOffs, compareRow)) {
      return `${t('marginTool.components.assignment.requestedTimeOff.grid.cellRender.overLapExistingRecord')}`;
    } else if (endDate === missingField || !endDate) {
      return `${t('marginTool.components.assignment.requestedTimeOff.grid.cellRender.required')}`;
    } else {
      return '';
    }
  };

  const getEndDate = renderEndDateRow => {
    const endDate = renderEndDateRow?.row?.endDate ?? timeOffEditRow?.row?.endDate;
    return endDate ? moment(endDate)?.format(dateTimeLabelFormat) : missingField;
  };

  return (
    <WhiteTooltip
      arrow={true}
      title={getTitle(cellParams)}
      classes={{ tooltip: classes.tooltipContent, arrow: classes.arrow }}
    >
      <span className={classes.truncation}>{getEndDate(cellParams)}</span>
    </WhiteTooltip>
  );
});

export const EndDateCell = (cellParams: GridCellParams) => {
  return <EndDateCellRender {...cellParams} />;
};
