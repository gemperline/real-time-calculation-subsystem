import React from 'react';
import { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { selectEditTimeOffs } from 'store/redux-store/margin-tool/slices/assignment/assignment.selector';
import { assignmentActions } from 'store/redux-store/margin-tool/slices/assignment/assignment.redux';
import { WhiteTooltip } from '@AMIEWEB/Common';
import { useEditCellRenderStyles } from './EditCellRenderStyles';
import { TextField } from 'amn-ui-core';
import { missingField } from '@AMIEWEB/Notification/MultiChannel/Sms/CredentialingAnalyst/PlacementDisplay';
import { checkOverlapForAllRecords, isInValidHours } from './helper';
import { isBefore, isSameDay } from 'date-fns';
import { GridCellParams } from '@mui/x-data-grid-pro';

export const ApprovedByEditCell = (cellParams: GridCellParams) => {
  return <ApprovedByEdit {...cellParams} />;
};

const ApprovedByEdit = React.memo(function ApprovedByEdit(cellParams: GridCellParams) {
  const dispatch = useDispatch();
  const rowId = cellParams?.row?.id;
  const editTimeOffs = useSelector(selectEditTimeOffs);
  const editTimeOffRow = editTimeOffs?.find(item => item?.id === cellParams?.id);
  const [facilityApproved, setFacilityApprovedHours] = useState(
    cellParams?.row?.approvedBy || editTimeOffRow?.approvedBy,
  );
  const { control } = useFormContext();

  const setFacilityApprovedEdit = data => {
    let newRow = editTimeOffs?.slice(0);
    let timeOffEditRow = editTimeOffs?.find(item => item?.id === rowId);
    let editIndex = editTimeOffs?.findIndex(row => row?.id === rowId);
    let updateApprovedBy = { ...timeOffEditRow, approvedBy: data };
    newRow[editIndex] = updateApprovedBy;
    dispatch(assignmentActions.setEditTimeOffs(newRow));
  };

  const enableSave = e => {
    if (
      !isInValidHours(editTimeOffRow?.hours) &&
      (isBefore(new Date(editTimeOffRow?.startDate), new Date(editTimeOffRow?.endDate)) ||
        isSameDay(new Date(editTimeOffRow?.startDate), new Date(editTimeOffRow?.endDate))) &&
      !checkOverlapForAllRecords(editTimeOffs)
    ) {
      dispatch(assignmentActions.setEditTimeOffGridError(false));
    } else {
      dispatch(assignmentActions.setEditTimeOffGridError(true));
    }
  };
  return (
    <>
      <Controller
        name={`assignment.timeOffs[${rowId}].approvedBy`}
        control={control}
        rules={{
          required: true,
        }}
        render={({ ref, value, onChange, onBlur, ...rest }) => (
          <TextField
            required={true}
            variant="outlined"
            size={'small'}
            style={{ width: '350px' }}
            value={facilityApproved}
            inputProps={{ maxLength: 255 }}
            onBlur={e => {
              setFacilityApprovedEdit(e.target.value);
              onChange(e.target.value);
            }}
            onChange={e => {
              if (e.target.value) {
                setFacilityApprovedHours(e.target.value);
              } else {
                setFacilityApprovedHours('');
              }
              enableSave(e);
            }}
            {...rest}
          />
        )}
      />
    </>
  );
});

export const ApprovedByCellRender = React.memo(function ApprovedByCellRender(cellParams: GridCellParams) {
  const { classes } = useEditCellRenderStyles();
  const editTimeOffs = useSelector(selectEditTimeOffs);
  const timeOffRow = { row: editTimeOffs?.find(item => item?.id === cellParams?.id) };
  const renderRowApprovedBy = cellParams?.row?.approvedBy || timeOffRow?.row?.approvedBy;

  return (
    <WhiteTooltip arrow={false} title={renderRowApprovedBy > 25 ? renderRowApprovedBy : ''}>
      <div className={classes.truncation}>{renderRowApprovedBy ? renderRowApprovedBy : missingField}</div>
    </WhiteTooltip>
  );
});

export const ApprovedByCell = (params: GridCellParams) => {
  return <ApprovedByCellRender {...params} />;
};
