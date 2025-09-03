/* eslint-disable tss-unused-classes/unused-classes */
import { StatusTransitionModalType } from 'store/redux-store/margin-tool/slices/pay-package-status/pay-package-status.model';
import { makeStyles } from 'tss-react/mui';

export const usePayPackageStatusTransitionModalStyles = makeStyles<{ isExpanded: boolean }>()((theme, props) => ({
  // modalContainer: {
  //   '& .MuiDialog-paper': {
  //     maxWidth: 'none',
  //     color: '#333333',
  //     '& .MuiDialogContent-root': {
  //       padding: '0',
  //       overflowY: 'hidden',
  //       '& .dialogContentRootNoActions': {
  //         padding: '0px',
  //       },
  //     },
  //   },
  // },
  modalContainer: {
    '& .MuiDialog-paperWidthSm': {
      maxWidth: props?.isExpanded ? 'none' : '444px',
      overflow: 'visible',
    },
  },
}));

export const useDatePickerStyles = makeStyles()(theme => ({
  dueDateInput: {
    '& .MuiFilledInput-input': {
      height: '1.3736em',
      padding: '27px 12px 10px',
      textAlign: 'left',
      font: 'normal normal normal 12px/19px Roboto',
      letterSpacing: '0px',
      opacity: '1',
      width: '200px',
    },
  },
  fieldLabel: {
    textAlign: 'left',
    font: 'normal normal normal 14px/19px Roboto',
    color: theme.palette.framework.system.charcoal,
    letterSpacing: '0px',
    opacity: '1',
  },
  dueDateField: {
    textAlign: 'left',
    font: 'normal normal normal 14px/19px Roboto',
    color: theme.palette.framework.system.charcoal,
    letterSpacing: '0px',
    opacity: '1',
    marginTop: '4px',
  },
}));

export const usePayPackageStatusTransitionStyles = makeStyles<{ type: StatusTransitionModalType }>()(
  (theme, props) => ({
    dueDateContainer: {
      '& .MuiInputLabel-filled.MuiInputLabel-marginDense': {
        transform: 'translate(12px, 22px) scale(1)',
        color: 'rgba(0, 0, 0, 0.54)',
        fontSize: '14px',
      },
      '& .MuiInputLabel-filled.MuiInputLabel-shrink': {
        transform: 'translate(12px, 10px) scale(0.75)',
      },
    },
    ccBtn: {
      padding: '0',
      width: '36px',
      height: '36px',
      minWidth: '0',
      background: `${theme.palette.system.grayChip} 0% 0% no-repeat padding-box`,
      border: `1px solid ${theme.palette.system.fadedGrey}`,
      borderRadius: '5px',
      opacity: '1',
      boxShadow: 'none',
      font: 'normal normal normal 14px/20px Roboto',
      letterSpacing: '0',
      color: theme.palette.framework.system.charcoal,
      '&:hover': {
        backgroundColor: `${theme.palette.system.grayChip}`,
        color: theme.palette.system.black,
      },
    },
    inputs: {
      width: '398px',
      overflow: 'auto',
      '& .MuiFormHelperText-root': {
        color: 'red',
      },
      '&:hover': {
        '& .MuiInputLabel-filled.MuiInputLabel-shrink': {
          color: '#006FB9',
        },
      },
    },
    fieldLabel: {
      textAlign: 'left',
      font: 'normal normal normal 14px/19px Roboto',
      color: theme.palette.framework.system.charcoal,
      letterSpacing: '0px',
      opacity: '1',
    },
    statusFieldStyle: {
      textAlign: 'left',
      font: 'normal normal normal 14px/19px Roboto',
      color: theme.palette.framework.system.charcoal,
      letterSpacing: '0px',
      opacity: '1',
    },
    rejectReasonFieldStyle: {
      '& .MuiInputLabel-root': {
        textAlign: 'left',
        font: 'normal normal normal 14px/19px Roboto',
        color: theme.palette.framework.system.charcoal,
        letterSpacing: '0px',
        opacity: '1',
      },
      marginLeft: '12px',
      width: '226px',
    },
    helperTextArea: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '398px',
    },
    dialog: {
      '& .MuiDialog-paperWidthSm': {
        width:
          props?.type === StatusTransitionModalType.RequestApproval
            ? '444px !important'
            : props?.type === StatusTransitionModalType.Approve
            ? '438px !important'
            : '386px !important',
      },
      '& .MuiDialog-paper': {
        maxWidth: 'none',
      },
    },
    modalDescription: {
      textAlign: 'left',
      font: 'normal normal normal 14px/22px Roboto',
      letterSpacing: '0px',
      color: theme.palette.framework.system.charcoal,
      opacity: 1,
      padding: '0px 30px 9px 30px',
    },
    cancelButton: {
      width: '72px',
      height: '16px',
      textAlign: 'center',
      font: 'normal normal bold 12px/16px Roboto',
      letterApacing: '0px',
      color: theme.palette.framework.system.doveGray,
      opacity: '1',
    },
    containedButton: {
      width:
        props?.type === StatusTransitionModalType.Reset
          ? '82px'
          : props?.type === StatusTransitionModalType.Verify
          ? '150px'
          : '148px',
      height: '40px',
      textAlign: 'center',
      font: 'normal normal bold 12px/16px Roboto',
      letterApacing: '0px',
      color: theme.palette.framework.system.white,
      opacity: '1',
    },
  }),
);
