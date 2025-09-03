import { DateRangePicker } from 'app/ComponentLibrary/DateRangeNew';
import { differenceInDays, isBefore, isSameDay, isValid } from 'date-fns';
import moment from 'moment';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { assignmentActions } from 'store/redux-store/margin-tool/slices/assignment/assignment.redux';
import { selectEditTimeOffs } from 'store/redux-store/margin-tool/slices/assignment/assignment.selector';
import { useEditCellRenderStyles } from './EditCellRenderStyles';
import { WhiteTooltip } from '@AMIEWEB/Common';
import { dateTimeFormat, dateTimeLabelFormat } from './modal';
import { checkOverlapForAllRecords, checkOverlapForArray, isInValidHours } from './helper';
import { missingField } from '@AMIEWEB/Notification/MultiChannel/Sms/CredentialingAnalyst/PlacementDisplay';
import { useTranslation } from 'react-i18next';
import { GridCellParams } from '@mui/x-data-grid-pro';

export const StartDateEditCell = (cellParams: GridCellParams) => {
  return <EditStartDate {...cellParams} />;
};

const EditStartDate = React.memo(function EditStartDate(cellParams: GridCellParams) {
  const { classes } = useEditCellRenderStyles();
  const { control } = useFormContext();
  const dispatch = useDispatch();
  const rowId = cellParams?.row?.id;
  const editTimeOffs = useSelector(selectEditTimeOffs);
  const editTimeOffRow = editTimeOffs?.find(item => item?.id === rowId);
  const startDateCell = cellParams?.row?.startDate ?? editTimeOffRow?.startDate;
  const rowEndDate = cellParams?.row?.endDate || editTimeOffRow?.endDate;

  const setDateForTimeOffEdit = date => {
    let newRow = updateTimeOffEdit(date);
    dispatch(assignmentActions.setEditTimeOffs(newRow));
  };

  const updateTimeOffEdit = date => {
    let newRow = editTimeOffs?.slice(0);
    let timeOffEditRow = editTimeOffs?.find(item => item?.id === rowId);
    let editIndex = editTimeOffs?.findIndex(row => row?.id === rowId);
    if (editIndex >= 0) {
      const daysDiff =
        !isValid(new Date(date)) || isBefore(new Date(rowEndDate), new Date(date))
          ? null
          : differenceInDays(new Date(rowEndDate), new Date(date)) + 1;
      let updatedStartDate = {
        ...timeOffEditRow,
        startDate: date,
        days: daysDiff ? daysDiff : missingField,
      };
      newRow[editIndex] = updatedStartDate;
    }
    return newRow;
  };

  return (
    <Controller
      control={control}
      name={`assignment.timeOffs[${rowId}].startDate`}
      render={({ ref, onChange, ...rest }) => {
        return (
          <React.Fragment>
            <DateRangePicker
              onChange={newValue => {
                if (newValue?.startDate !== undefined) {
                  const newDate = moment(newValue?.startDate);
                  const setTo = newDate?.isValid() ? moment(newDate).format(dateTimeFormat) : null;
                  onChange(setTo);
                  setDateForTimeOffEdit(setTo);
                  if (
                    !isInValidHours(editTimeOffRow?.hours) &&
                    (isBefore(new Date(setTo), new Date(editTimeOffRow?.endDate)) ||
                      isSameDay(new Date(setTo), new Date(editTimeOffRow?.endDate))) &&
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
              onCancel={() => {}}
              value={startDateCell}
              variant="filled"
              single
              quickSelect={false}
              useMaxWidth={true}
              showIcon={true}
              className={startDateCell ? classes.inputFieldNoLabel : classes.inputFields}
              labelClass={startDateCell ? classes.hideInputFieldLabel : classes.inputFields}
              actionBar={false}
              clickAway={true}
              trailingIconShow={true}
              keepClickAwayVal={true}
              initialDateRange={{
                startDate: startDateCell && startDateCell !== missingField ? new Date(startDateCell) : undefined,
                endDate: startDateCell && startDateCell !== missingField ? new Date(startDateCell) : undefined,
                useLabelAsValue: true,
              }}
            />
          </React.Fragment>
        );
      }}
    />
  );
});

export const StartDateCellRender = React.memo(function StartDateCellRender(cellParams: GridCellParams) {
  const { t } = useTranslation();
  const { classes } = useEditCellRenderStyles();
  const editTimeOffs = useSelector(selectEditTimeOffs);
  const timeOffRow = { row: editTimeOffs?.find(item => item?.id === cellParams?.id) };

  const getTitle = props => {
    const startDate = props?.row?.startDate ?? timeOffRow?.row?.startDate;
    const endDate = props?.row?.endDate ?? timeOffRow?.row?.endDate;
    const compareRow = props?.row?.startDate ? cellParams : timeOffRow;
    if (moment(startDate) > moment(endDate)) {
      return `${t('marginTool.components.assignment.requestedTimeOff.grid.cellRender.beforeEndDate')}`;
    } else if (checkOverlapForArray(editTimeOffs, compareRow)) {
      return `${t('marginTool.components.assignment.requestedTimeOff.grid.cellRender.overLapExistingRecord')}`;
    } else if (startDate === missingField || !startDate) {
      return `${t('marginTool.components.assignment.requestedTimeOff.grid.cellRender.required')}`;
    } else {
      return '';
    }
  };

  const getStartDate = renderStartDate => {
    const startDate = renderStartDate?.row?.startDate ?? timeOffRow?.row?.startDate;
    return startDate ? moment(startDate).format(dateTimeLabelFormat) : missingField;
  };

  return (
    <WhiteTooltip
      arrow={true}
      title={getTitle(cellParams)}
      classes={{ tooltip: classes.tooltipContent, arrow: classes.arrow }}
    >
      <span className={classes.truncation}>{getStartDate(cellParams)}</span>
    </WhiteTooltip>
  );
});
export const StartDateCell = (cellParams: GridCellParams) => {
  return <StartDateCellRender {...cellParams} />;
};
