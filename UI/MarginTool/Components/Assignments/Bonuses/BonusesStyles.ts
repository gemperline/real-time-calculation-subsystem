/* eslint-disable tss-unused-classes/unused-classes */
import { makeStyles } from 'tss-react/mui';

export const useBonusesStyles = makeStyles()(theme => ({
  gridContainer: {
    height: '400px',
    overflowY: 'auto',
  },
  noScroll: {
    overflow: 'none',
  },
  noBonusesTitle: {
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
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
  addIcon: {
    color: theme.palette.framework.system.tertiaryGrey,
    '&:hover': {
      color: theme.palette.framework.system.main,
    },
  },
  listBox: {
    maxHeight: '300px !important',
    overflow:'hidden'
  },
  option: {
    paddingLeft: '0px !important',
  },
  deleteIcon: {
    display: 'flex',
    flexDirection: 'row-reverse',
    position: 'absolute',
    right: '10px',
    top: '20px',
  },
  deleteHover: {
    '&:hover': {
      color: theme.palette.framework.system.main,
    },
  },
}));
