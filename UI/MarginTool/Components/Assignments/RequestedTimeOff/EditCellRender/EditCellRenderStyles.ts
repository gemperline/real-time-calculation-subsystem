/* eslint-disable tss-unused-classes/unused-classes */
import { Theme } from 'amn-ui-core';
import { makeStyles } from 'tss-react/mui';
export const useEditCellRenderStyles = makeStyles()((theme: Theme) => ({
  alignmentField: {
    paddingRight: '25px !important',
  },
  gridRightContainer: {
    maxHeight: 'calc(100vh - 64px)',
    height: '100%',
    '&::-webkit-scrollbar': {
      width: '0px',
    },
  },
  labelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '6px 10px',
  },
  labelFont: {
    fontSize: '12px !important',
    fontWeight: 'bold',
  },
  hideInputFieldLabel: {
    display: 'none',
  },
  inputFields: {
    minWidth: '326px',
    '& .MuiInputLabel-root-inputFields.Mui-disabled': {
      color: `${theme.palette.framework.system.charcoal} !important`,
    },
    '& .MuiFormHelperText-root': {
      width: 'max-content !important',
    },
    '& .MuiFilledInput-input': {
      paddingTop: '24px !important',
      paddingBottom: '8px !important',
    },
    '& .MuiFilledInput-root': {
      backgroundColor: 'rgba(0,0,0, 0.04)',
    },
  },
  autocompleteField: {
    '& .MuiFilledInput-root': {
      backgroundColor: 'rgba(0,0,0, 0.04) !important',
    },
    '& .MuiFilledInput-root.Mui-disabled:before': {
      borderBottomStyle: 'solid',
    },
    '& .MuiFilledInput-root:hover.Mui-disabled:before': {
      borderBottom: '1px solid rgba(0, 0, 0, 0.42)!important',
    },
  },

  inputFieldNoLabel: {
    minWidth: '326px',
    '& .MuiInputLabel-root-inputFields.Mui-disabled': {
      color: `${theme.palette.framework.system.charcoal} !important`,
    },
    '& .MuiFormHelperText-root': {
      width: 'max-content !important',
    },
    '& .MuiFilledInput-input': {
      paddingTop: '4px',
      height: '2rem',
    },
  },
  dateContainer: {
    '& .MuiInputBase-root.Mui-disabled': {
      background: `${theme.palette.framework.system.white}`,
      color: `${theme.palette.framework.system.charcoal} !important`,
    },
    '& .MuiFormHelperText-root': {
      width: 'max-content !important',
    },
    minWidth: '350px',
  },
  gridContainer: {
    display: 'flex',
    flexDirection: 'column',
    flexWrap: 'wrap',
    alignContent: 'flex-start',
    padding: '10px',
    minWidth: '350px',
  },
  root: {
    flexGrow: 1,
  },

  arrow: {
    '&:before': {
      border: `1px solid ${theme.palette.framework.alertColors.failure}`,
    },
    color: theme.palette.components.tooltip.arrowColor,
  },
  truncation: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  tooltipContent: {
    backgroundColor: theme.palette.components.tooltip.backgroundColor,
    border: `1px solid ${theme.palette.framework.alertColors.failure}`,
    color: theme.palette.system.errorRed,
    fontWeight: 'normal',
  },
  expandedGrid: {
    fontSize: '14px',
    '& .MuiDataGrid-main': {
      minHeight: '60px',
    },
  },
  isErrorCell: {
    border: '1px solid !important',
    borderColor: `${theme.palette.framework.system.red}`,
    color: theme.palette.framework.system.red,
  },
}));
