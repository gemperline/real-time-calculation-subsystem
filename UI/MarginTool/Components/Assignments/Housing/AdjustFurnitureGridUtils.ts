import {
  EditQuantityCell,
  RenderIncludeCell,
  RenderQuantityCell,
  StandardCost,
} from './AdjustFurnitureGridCellRenders';
import { GridColumns } from '@mui/x-data-grid-pro';

import { XGridDefaultColumn } from '@AMIEWEB/Common/XGrid/cells/XGridDefaults';
import i18next from 'i18next';
import { xGridNumberSort } from '@AMIEWEB/Common';
import { missingField } from 'app/constants';

export const defaultXGridColumn = {
  ...XGridDefaultColumn,
  flex: 0,
};

export const getAdjustFurnitureGridColumns = (classes): GridColumns => [
  {
    field: 'include',
    headerName: i18next.t('marginTool.components.assignment.amnHousing.grid.columns.include'),
    width: 130,
    hide: false,
    renderCell: RenderIncludeCell,
  },
  {
    ...defaultXGridColumn,
    field: 'description',
    headerName: i18next.t('marginTool.components.assignment.amnHousing.grid.columns.description'),
    width: 300,
    hide: false,
  },
  {
    ...defaultXGridColumn,
    field: 'standardCost',
    headerName: i18next.t('marginTool.components.assignment.amnHousing.grid.columns.standardCost'),
    width: 150,
    align: 'right',
    headerAlign: 'right',
    hide: false,
    renderCell: StandardCost,
    sortComparator: xGridNumberSort,
  },
  {
    ...defaultXGridColumn,
    headerName: i18next.t('marginTool.components.assignment.amnHousing.grid.columns.quantity'),
    field: 'quantity',
    width: 150,
    align: 'right',
    headerAlign: 'right',
    hide: false,
    editable: true,
    renderCell: RenderQuantityCell,
    renderEditCell: EditQuantityCell,
    cellClassName: params => {
      if (isInvalidFieldBasedOnInclude(params?.row?.include, params?.row?.quantity)) {
        return classes.isErrorCell;
      } else {
        return null;
      }
    },
    sortComparator: xGridNumberSort,
  },
];

export const isInvalidFieldBasedOnInclude = (isIncluded, fieldToValidate) => {
  if (isIncluded) {
    return (
      fieldToValidate === 0 || !fieldToValidate || fieldToValidate === missingField
    );
  }
  return false;
};
