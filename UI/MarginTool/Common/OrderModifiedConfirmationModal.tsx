import React from 'react';
import { GenericDialog } from 'app/components/Alerts/GenericDialog';
import { useTranslation } from 'react-i18next';
import { Typography } from 'amn-ui-core';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectOrderIdModifiedConfirmationDialogStatus,
  selectSelectedScenario,
} from 'store/redux-store/margin-tool/slices/add-edit-scenario/add-edit-scenario.selector';
import { makeStyles } from 'tss-react/mui';
import { scenarioActions } from 'store/redux-store/margin-tool/slices/add-edit-scenario/add-edit-scenario.redux';

const useOrderModifiedConfirmationModalStyles = makeStyles()(theme => ({
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
}));

export const OrderModifiedConfirmationModal = () => {
  const { t } = useTranslation();
  const { classes } = useOrderModifiedConfirmationModalStyles();
  const dispatch = useDispatch();
  const orderIdModifiedConfirmationDialogStatus = useSelector(selectOrderIdModifiedConfirmationDialogStatus);
  const selectedScenario = useSelector(selectSelectedScenario);

  return (
    <GenericDialog
      open={orderIdModifiedConfirmationDialogStatus}
      disableEscapeKeyDown
      maxWidth="sm"
      fullWidth
      onClose={(e, reason) => {
        if (reason === 'backdropClick') return;
        dispatch(scenarioActions.setShowOrderIdModifiedDialogStatus(false));
      }}
      className={classes.container}
      dialogTitleProps={{
        style: { paddingTop: '20px' },
        text: t('marginTool.orderIdModifiedConfirmation.modalTitle'),
      }}
      dialogActions={[
        {
          text: t('marginTool.orderIdModifiedConfirmation.cancelAction'),
          color: 'tertiary',
          variant: 'contained',
          onClick: () => {
            dispatch(scenarioActions.setShowOrderIdModifiedDialogStatus(false));
          },
        },
        {
          text: t('marginTool.orderIdModifiedConfirmation.proceedAction'),
          variant: 'contained',
          color: 'primary',
          onClick: () =>
            dispatch(
              scenarioActions.cleanMarginToolDetails({
                placementId: selectedScenario?.placementId,
              }),
            ),
          disabled: false,
        },
      ]}
    >
      <Typography className={classes.text}>
        {t('marginTool.orderIdModifiedConfirmation.confirmationMessage')}
      </Typography>
    </GenericDialog>
  );
};
