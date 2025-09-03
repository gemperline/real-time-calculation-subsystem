/* eslint-disable tss-unused-classes/unused-classes */

import { makeStyles } from 'tss-react/mui';

export const amnHousingStyles = makeStyles()(theme => ({
  modalContainer: {
    maxWidth: 'fit-content',
  },
  modalContainerExpand: {
    maxWidth: 'none',
  },
  dialogContent: {
    maxWidth: '810px',
  },
  dialogContentExpand: {
    maxWidth: 'none',
  },
  switchLightBlue: {
    '& .MuiSwitch-switchBase': {
      '&:hover': {
        backgroundColor: 'transparent',
      },
    },
    '& .MuiSwitch-switchBase.Mui-checked': {
      color: '#A8CAED',
    },
    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
      backgroundColor: '#A8CAED',
    },
  },
  expandedGrid: {
    fontSize: '14px',
    '& .MuiDataGrid-main': {
      minHeight: '60px',
    },
  },
  iconButton: {
    '&.Mui-disabled': {
      cursor: 'not-allowed',
      pointerEvents: 'auto',
    },
    '&:hover': {
      backgroundColor: 'transparent',
    },
  },
  tuneIcon: {
    color: theme.palette.framework.system.tertiaryGrey,
    '&:hover': {
      color: theme.palette.framework.system.main,
    },
  },
  isErrorCell: {
    border: '1px solid !important',
    borderRadius: '4px',
    borderColor: theme.palette.framework.system.red,
    color: theme.palette.framework.system.red,
  },
  furnitureAdjustmentsAdornment: {
    alignItems: 'center',
    paddingTop: '1rem',
  },
  cancelButton: {
    '&:focus': {
      backgroundColor: theme.palette.framework.system.darkGray,
    },
  },
  saveButton: {
    '&:focus': {
      backgroundColor: theme.palette.framework.system.darkBlue,
    },
  },
  descriptionCountStyle: {
    display: 'flex',
    justifyContent: 'flex-end',
    fontSize: '10px',
  },
}));
