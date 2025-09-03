import { makeStyles } from 'tss-react/mui';

export const usePayPackageStyles = makeStyles()(theme => ({
  formStyle: {
    borderRadius: '4px',
    border: `1px solid ${theme.palette.framework.system.lightGrey}`,
    opacity: 1,
    background: `${theme.palette.framework.system.smoke}`,
    marginBottom: '12px',
    width: '100%',
  },
  headerContainer: {
    margin: '12px',
  },
  contentContainer: {
    flexDirection: 'column',
    flexGrow: 1,
    margin: '6px 12px 0px 12px',
  },
  button: {
    'font-size': '0.7rem',
    padding: '0.3rem 1rem',
  },
  buttonGrid: {
    margin: '0px 12px 12px 12px',
    justifyContent: 'flex-end',
  },
  textField: {
    backgroundColor: theme.palette.framework.system.white,
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: theme.palette.framework.system.neutralGray,
      },
      '&:hover fieldset': {
        borderColor: theme.palette.framework.system.neutralGray,
      },
      '&.Mui-focused fieldset': {
        borderColor: theme.palette.framework.system.neutralGray,
      },
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: theme.palette.framework.system.neutralGray,
    },
  },
}));
