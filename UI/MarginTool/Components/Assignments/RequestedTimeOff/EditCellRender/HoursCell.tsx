import { TextField } from 'amn-ui-core';
import { validDecimal } from 'app/helpers/numberHelper';
import React, { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { assignmentActions } from 'store/redux-store/margin-tool/slices/assignment/assignment.redux';
import { selectEditTimeOffs } from 'store/redux-store/margin-tool/slices/assignment/assignment.selector';
import { checkOverlapForAllRecords, isInValidHours, isNumber } from './helper';
import { WhiteTooltip } from '@AMIEWEB/Common';
import { useEditCellRenderStyles } from './EditCellRenderStyles';
import { missingField } from '@AMIEWEB/Notification/MultiChannel/Sms/CredentialingAnalyst/PlacementDisplay';
import { useTranslation } from 'react-i18next';
import { isBefore, isSameDay } from 'date-fns';
import { GridCellParams } from '@mui/x-data-grid-pro';

export const HoursEditCell = (cellParams: GridCellParams) => {
  return <TimeOffHours {...cellParams} />;
};

const TimeOffHours = React.memo(function TimeOffHours(cellParams: GridCellParams) {
  const { control } = useFormContext();
  const dispatch = useDispatch();
  const rowId = cellParams?.row?.id;
  const editTimeOffs = useSelector(selectEditTimeOffs);
  const editTimeOffRow = editTimeOffs?.find(item => item?.id === cellParams?.id);
  const rowHours = cellParams?.row?.hours ?? editTimeOffRow?.hours;
  const [timeOffHours, setTimeOffHours] = useState(rowHours);

  const setHoursForTimeOffEdit = data => {
    let newRow = editTimeOffs?.slice(0);
    let timeOffEditRow = editTimeOffs?.find(item => item?.id === rowId);
    let editIndex = editTimeOffs?.findIndex(row => row?.id === rowId);
    if (editIndex >= 0) {
      let updatedHours = { ...timeOffEditRow, hours: data ? parseFloat(data) : '' };
      newRow[editIndex] = updatedHours;
    }
    dispatch(assignmentActions.setEditTimeOffs(newRow));
  };

  const checkValidDecimal = (value, onChange) => {
    const restrictions = {
      numberLength: 5,
      decimalLength: 2,
    };

    if (validDecimal(value, restrictions)) {
      setTimeOffHours(value);
      onChange(value);
      if (
        (isBefore(new Date(editTimeOffRow?.startDate), new Date(editTimeOffRow?.endDate)) ||
          isSameDay(new Date(editTimeOffRow?.startDate), new Date(editTimeOffRow?.endDate))) &&
        !checkOverlapForAllRecords(editTimeOffs)
      ) {
        dispatch(assignmentActions.setEditTimeOffGridError(false));
      } else {
        dispatch(assignmentActions.setEditTimeOffGridError(true));
      }
    } else {
      setTimeOffHours(value?.slice(0, -1)); // Remove the last invalid character
      onChange(null);
    }
  };

  return (
    <>
      <Controller
        name={`assignment.timeOffs[${rowId}].hours`}
        control={control}
        render={({ ref, value, onChange, onBlur, ...rest }) => (
          <TextField
            required={true}
            variant="outlined"
            size={'small'}
            sx={{
              width: '150px',
            }}
            value={timeOffHours}
            onBlur={e => {
              if (validDecimal(e?.target?.value, { numberLength: 5, decimalLength: 2 })) {
                setHoursForTimeOffEdit(e?.target?.value);
              }
              onChange(e?.target?.value);
            }}
            onChange={e => {
              if (e?.target?.value) {
                checkValidDecimal(e?.target?.value, onChange);
              } else {
                setTimeOffHours(null);
                dispatch(assignmentActions.setEditTimeOffGridError(true));
              }
            }}
            {...rest}
          />
        )}
      />
    </>
  );
});

export const HoursCellRender = React.memo(function HoursCellRender(cellParams: GridCellParams) {
  const { classes } = useEditCellRenderStyles();
  const { t } = useTranslation();
  const editTimeOffs = useSelector(selectEditTimeOffs);
  const timeOffEditRow = { row: editTimeOffs?.find(item => item?.id === cellParams?.id) };
  const hours = cellParams?.row?.hours || timeOffEditRow?.row?.hours;
  return (
    <WhiteTooltip
      arrow={true}
      title={
        isInValidHours(hours)
          ? `${t('marginTool.components.assignment.requestedTimeOff.grid.cellRender.required')}`
          : ''
      }
      classes={{ tooltip: classes.tooltipContent, arrow: classes.arrow }}
    >
      <span style={!hours ? { paddingLeft: '40px' } : null} className={classes.truncation}>
        {isNumber(hours) ? hours : missingField}
      </span>
    </WhiteTooltip>
  );
});

export const HoursCell = (cellParams: GridCellParams) => {
  return <HoursCellRender {...cellParams} />;
};
