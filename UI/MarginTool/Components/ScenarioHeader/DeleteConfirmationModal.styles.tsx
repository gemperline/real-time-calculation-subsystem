/* eslint-disable tss-unused-classes/unused-classes */
import { makeStyles } from 'tss-react/mui';

export const useDeleteConfirmationModalStyles = makeStyles()(theme => ({
  container: {
    '& .MuiDialog-paper': {
      maxWidth: '390px',
      minHeight: '200px',
    },
  },
  text: {
    color: theme.palette.framework.system.charcoal,
    fontSize: '14px !important',
  },
  name: {
    color: theme.palette.framework.system.charcoal,
    fontSize: '14px !important',
    fontWeight: 500,
  },
}));
