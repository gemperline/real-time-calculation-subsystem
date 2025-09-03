/* eslint-disable tss-unused-classes/unused-classes */
import { makeStyles } from 'tss-react/mui';

export const allowancesStyles = makeStyles()(theme => ({
  columnHeader: {
    lineHeight: '20px !important',
    height: '60px',
    background: `${theme.palette.framework.system.backgroundGrey}`,
    minHeight: '60px !important',
    maxHeight: '60px !important',
    display: 'flex',
  },
  columnHeaderTitleContent: {
    textAlign: 'end',
  },
  rightColumnHeader: {
    whiteSpace: 'break-spaces',
    background: `${theme.palette.framework.system.backgroundGrey}`,
  },
  toolbarContainer: {
    padding: '0px !important',
  },
  noGSATitleWrapper: {
    width: '100%',
    padding: theme.spacing(1),
    paddingTop: 0,
    boxSizing: 'border-box',
    display: 'flex', 
    justifyContent: 'center', 
},
  noGSATitle: {
    display: 'flex',
    padding: `${theme.spacing(2)} ${theme.spacing(3)}`,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '4px',
    border: `1px solid ${theme.palette.framework.system.lightGrey}`,
    width: '100%',
    boxSizing: 'border-box',
  },
}));
