/* eslint-disable tss-unused-classes/unused-classes */
import { makeStyles } from 'tss-react/mui';

export const useAddScenarioStyles = makeStyles()(theme => ({
  divider: {
    border: `1px solid ${theme.palette.framework.system.lightGray}`,
    width: '100%',
    margin: '12px 0px',
  },
  container: {
    bgcolor: theme.palette.framework.system.white,
  },
  splitIcon: {
    transform: 'rotate(90deg)',
    height: '20px',
    width: '20px',
  },
  splitButton: {
    color: theme.palette.system.black,
    textDecoration: 'none',
    '&:hover': {
      color: theme.palette.framework.system.main,
      backgroundColor: 'transparent',
      textDecoration: 'none',
    },
  },
}));
