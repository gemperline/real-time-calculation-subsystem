import { xGridDateSort, xGridNumberSort } from '@AMIEWEB/Common';
import { XGridDefaultColumn } from '@AMIEWEB/Common/XGrid/cells/XGridDefaults';
import { GridColumns, GridPreProcessEditCellProps } from '@mui/x-data-grid-pro';
import { checkOverlapForArray, isInValidEndDate, isInValidHours, isInValidStartDate } from './EditCellRender/helper';
import { HoursCell, HoursEditCell } from './EditCellRender/HoursCell';
import { ApprovedByCell, ApprovedByEditCell } from './EditCellRender/ApprovedByCell';
import { StartDateCell, StartDateEditCell } from './EditCellRender/StartDateCell';
import { EndDateCell, EndDateEditCell } from './EditCellRender/EndDateCell';

export const timeOffColumn = {
  ...XGridDefaultColumn,
  flex: 0,
};
export const getTimeOffGridColumns = (t, isEdit, classes, timeOffEditRequests): GridColumns => [
  {
    ...timeOffColumn,
    field: 'startDate',
    headerName: `${t('marginTool.components.assignment.requestedTimeOff.grid.columns.startDate')}`,
    width: 150,
    hide: false,
    type: 'Date',
    editable: isEdit,
    preProcessEditCellProps: (params: GridPreProcessEditCellProps) => {
      const timeOffEditRow = { row: timeOffEditRequests?.find(item => item?.id === params?.id) };
      const paramsCheck = params?.row?.startDate ? params : timeOffEditRow;
      if (isInValidStartDate(paramsCheck)) {
        return { ...params, error: true, errorField: 'startDate' };
      } else if (checkOverlapForArray(timeOffEditRequests, paramsCheck)) {
        return { ...params, error: true, errorField: 'startDate' };
      } else {
        return { ...params, error: false, errorField: null };
      }
    },
    cellClassName: params => {
      const timeOffEditRow = { row: timeOffEditRequests?.find(item => item?.id === params?.id) };
      const paramsCheck = params?.row?.startDate ? params : timeOffEditRow;
      if (isInValidStartDate(paramsCheck)) {
        return classes.isErrorCell;
      } else if (checkOverlapForArray(timeOffEditRequests, paramsCheck)) {
        return classes.isErrorCell;
      } else {
        return null;
      }
    },
    renderEditCell: StartDateEditCell,
    renderCell: StartDateCell,
    sortComparator: xGridDateSort,
  },
  {
    ...timeOffColumn,
    field: 'endDate',
    headerName: `${t('marginTool.components.assignment.requestedTimeOff.grid.columns.endDate')}`,
    width: 150,
    hide: false,
    type: 'Date',
    editable: isEdit,
    preProcessEditCellProps: (params: GridPreProcessEditCellProps) => {
      const timeOffEditRow = { row: timeOffEditRequests?.find(item => item?.id === params?.id) };
      const paramsCheck = params?.row?.endDate ? params : timeOffEditRow;
      if (isInValidEndDate(paramsCheck)) {
        return { ...params.props, error: true, errorField: 'endDate' };
      } else if (checkOverlapForArray(timeOffEditRequests, paramsCheck)) {
        return { ...params, error: true, errorField: 'endDate' };
      } else {
        return { ...params, error: false, errorField: null };
      }
    },
    cellClassName: params => {
      const timeOffEditRow = { row: timeOffEditRequests?.find(item => item?.id === params?.id) };
      const paramsCheck = params?.row?.endDate ? params : timeOffEditRow;
      if (isInValidEndDate(paramsCheck)) {
        return classes.isErrorCell;
      } else if (checkOverlapForArray(timeOffEditRequests, paramsCheck)) {
        return classes.isErrorCell;
      } else {
        return null;
      }
    },
    renderEditCell: EndDateEditCell,
    renderCell: EndDateCell,
    sortComparator: xGridDateSort,
  },
  {
    ...timeOffColumn,
    headerName: t('marginTool.components.assignment.requestedTimeOff.grid.columns.days'),
    field: 'days',
    width: 150,
    hide: false,
    sortComparator: xGridNumberSort,
    preProcessEditCellProps: (params: GridPreProcessEditCellProps) => {
      return { ...params };
    },
  },
  {
    ...timeOffColumn,
    headerName: `${t('marginTool.components.assignment.requestedTimeOff.grid.columns.hours')}`,
    field: 'hours',
    width: 150,
    hide: false,
    editable: isEdit,
    preProcessEditCellProps: (params: GridPreProcessEditCellProps) => {
      const timeOffEditRow = { row: timeOffEditRequests?.find(item => item?.id === params?.id) };
      const paramsCheck = params?.row?.hours ? params : timeOffEditRow;
      if (isInValidHours(paramsCheck?.row?.hours)) {
        return { ...params, error: true, errorField: 'hours' };
      } else {
        return { ...params, error: false, errorField: null };
      }
    },
    cellClassName: params => {
      const timeOffEditRow = { row: timeOffEditRequests?.find(item => item?.id === params?.id) };
      const paramsCheck = params?.row?.hours ? params : timeOffEditRow;
      if (isInValidHours(paramsCheck?.row?.hours)) {
        return classes.isErrorCell;
      } else {
        return null;
      }
    },
    renderEditCell: HoursEditCell,
    renderCell: HoursCell,
    sortComparator: xGridNumberSort,
  },
  {
    ...timeOffColumn,
    headerName: t('marginTool.components.assignment.requestedTimeOff.grid.columns.facilityApprovedBy'),
    field: 'approvedBy',
    width: 350,
    hide: false,
    editable: isEdit,
    sortable: true,
    renderEditCell: ApprovedByEditCell,
    renderCell: ApprovedByCell,
  },
];
