import { Grid, Skeleton, Typography } from 'amn-ui-core';
import { useEffect, useMemo, useState } from 'react';
import { XGrid } from '@AMIEWEB/Common/XGrid/XGrid';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { getTimeOffGridColumns } from './TimeOffGridUtils';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import { useScenarioStatusPending } from '@AMIEWEB/MarginTool/helper';
import React from 'react';
import { GridColumns, GridRowId, GridSortItem } from '@mui/x-data-grid-pro';
import { selectEditTimeOffs } from 'store/redux-store/margin-tool/slices/assignment/assignment.selector';
import { useEditCellRenderStyles } from './EditCellRender/EditCellRenderStyles';
import { isValid } from 'date-fns';
import { assignmentActions } from 'store/redux-store/margin-tool/slices/assignment/assignment.redux';
import { checkOverlapForAllRecords, getFormattedTimeOff } from './EditCellRender/helper';
import { IXGridBulkActionButton } from '@AMIEWEB/Common/XGrid/Toolbar/XGridToolbar';
import { IRequestTimeOff } from 'store/redux-store/margin-tool/slices/assignment/assignment.model';
import { usePeopleSoftCalculation } from '../../PeopleSoftCalculation/IPeopleSoftCalculationHelper';
import { selectSelectedScenario } from 'store/redux-store/margin-tool/slices/add-edit-scenario/add-edit-scenario.selector';
import { useFormContext } from 'react-hook-form';
import { useDebouncedTriggerCalculation } from '@AMIEWEB/MarginTool/hooks';

export const TimeOffGrid = ({ isRefreshInProgress }: { isRefreshInProgress: boolean }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { triggerPeopleSoftCalculation } = usePeopleSoftCalculation();
  const { debouncedTriggerPeopleSoftCalculation } = useDebouncedTriggerCalculation();
  const { classes } = useEditCellRenderStyles();
  const isScenarioStatusPending = useScenarioStatusPending();
  const scenario = useSelector(selectSelectedScenario);
  const editTimeOffs = useSelector(selectEditTimeOffs);
  const [headerCount, setHeaderCount] = useState<number>(0);
  const [columns, setColumns] = useState<GridColumns>(
    getTimeOffGridColumns(t, isScenarioStatusPending, classes, editTimeOffs),
  );
  const [, setCurrentSortModel] = React.useState<GridSortItem[]>([{ field: 'startDate', sort: 'desc' }]);
  const [selectedIds, setSelectedIds] = useState<GridRowId[]>([]);
  const { setValue, register } = useFormContext();
  const assignmentTimeOffs = 'assignmentTimeOffs';
  useEffect(() => {
    const assignment = scenario?.assignment;
    const selectedScenarioTimeOffs: IRequestTimeOff[] = getFormattedTimeOff(assignment?.timeOffs);
    dispatch(assignmentActions.setEditTimeOffs([]));
    if (scenario?.assignment?.timeOffs?.length > 0) {
      dispatch(assignmentActions.setEditTimeOffs(selectedScenarioTimeOffs));
      debouncedTriggerPeopleSoftCalculation();
    }
  }, [scenario?.assignment]);

  useEffect(() => {
    const initialColumns = getTimeOffGridColumns(t, isScenarioStatusPending, classes, editTimeOffs);
    setColumns(initialColumns);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t, isScenarioStatusPending, editTimeOffs]);

  const rightActions = useMemo<IXGridBulkActionButton[]>(() => {
    return [
      {
        KeyId: 'add-new-timeOff',
        Icon: AddIcon,
        disabled: !isScenarioStatusPending,
        onClick: e => addNewTimeOffRow(e),
        tooltipProps: {
          tooltipContent: t('marginTool.components.assignment.requestedTimeOff.grid.tootTips.addNew'),
        },
      },
      {
        KeyId: 'delete-existing-timeOff',
        Icon: DeleteOutlinedIcon,
        disabled: !isScenarioStatusPending || !selectedIds || selectedIds?.length === 0,
        onClick: () => deleteHandler(),
        tooltipProps: {
          tooltipContent: t('marginTool.components.assignment.requestedTimeOff.grid.tootTips.delete'),
        },
        rightDivider: false,
      },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isScenarioStatusPending, selectedIds, editTimeOffs]);

  const addNewTimeOffRow = e => {
    const existingRow = editTimeOffs?.slice(0);
    const newRow = {
      id: `${editTimeOffs?.length}`,
      timeOffId: null,
      startDate: '',
      endDate: '',
      days: '',
      hours: '',
      scenarioId: null,
      splitId: null,
      approvedBy: '',
    };
    existingRow.unshift(newRow);
    const formattedData = getFormattedTimeOff(existingRow);
    dispatch(assignmentActions.setEditTimeOffGridError(true));
    dispatch(assignmentActions.setEditTimeOffs(formattedData));
    setSelectedIds([]);
  };

  const deleteHandler = () => {
    const updatedDataAfterDelete = editTimeOffs?.filter(item => !selectedIds?.includes(item?.id));
    const formattedData = getFormattedTimeOff(updatedDataAfterDelete);
    triggerPeopleSoftCalculation(false, formattedData);
    dispatch(assignmentActions.setEditTimeOffs(formattedData));
    setSelectedIds([]);
    if (!checkOverlapForAllRecords(formattedData)) {
      dispatch(assignmentActions.setEditTimeOffGridError(false));
      register(assignmentTimeOffs);
      setValue(assignmentTimeOffs, formattedData, { shouldDirty: true });
    }
  };

  const getHeaderCount = timeOffEditRequests => {
    const totalRowCount = timeOffEditRequests?.length;
    const nullRowCount = timeOffEditRequests?.filter(
      eachRecord =>
        !isValid(new Date(eachRecord?.startDate)) ||
        !isValid(new Date(eachRecord?.endDate)) ||
        eachRecord?.hours === '' ||
        eachRecord?.hours === null,
    )?.length;
    setHeaderCount(totalRowCount - nullRowCount);
  };

  useEffect(() => {
    if (!isScenarioStatusPending) {
      setCurrentSortModel([]);
    }
    getHeaderCount(editTimeOffs);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editTimeOffs]);

  return (
    <>
      <Grid
        item
        xs={12}
        sx={theme => ({ paddingBottom: theme.spacing(4), maxHeight: '400px', overflowY: 'auto', overflowX: 'hidden' })}
      >
        {isRefreshInProgress ? (
          <TimeOffSkeleton />
        ) : (
          <XGrid
            rows={editTimeOffs || []}
            columns={columns}
            disableSelectionOnClick
            pagination={false}
            autoHeight={true}
            hideFooter
            editMode="row"
            title={t('marginTool.components.assignment.requestedTimeOff.grid.title')}
            onSortModelChange={model => {
              setCurrentSortModel(model);
            }}
            displayCustomCount={selectedIds?.length > 0 ? selectedIds?.length : headerCount}
            className={classes.expandedGrid}
            onSelectionModelChange={ids => {
              if (isScenarioStatusPending) setSelectedIds(ids);
            }}
            checkboxSelection={true}
            selectionModel={selectedIds}
            toolbarProps={{
              rightActions: rightActions,
              refreshButton: false,
              columnSelector: false,
              moreOption: false,
            }}
            components={{
              NoRowsOverlay: () => {
                return (
                  <div className="center" style={{ height: '100%' }}>
                    <Typography variant="subtitle1" justifyContent={'center'}>
                      {t('marginTool.components.assignment.requestedTimeOff.grid.noTimeOffs')}
                    </Typography>
                  </div>
                );
              },
            }}
          />
        )}
      </Grid>
    </>
  );
};

const TimeOffSkeleton = () => {
  return (
    <>
      {[1, 2, 3].map(row => (
        <Grid item xs={12} key={row}>
          <Grid container spacing={2}>
            <Grid item xs={3}>
              <Skeleton variant="rectangular" width="100%" height={10} />
            </Grid>
            <Grid item xs={3}>
              <Skeleton variant="rectangular" width="100%" height={10} />
            </Grid>
            <Grid item xs={3}>
              <Skeleton variant="rectangular" width="100%" height={10} />
            </Grid>
            <Grid item xs={3}>
              <Skeleton variant="rectangular" width="100%" height={10} />
            </Grid>
          </Grid>
        </Grid>
      ))}
    </>
  );
};
