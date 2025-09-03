import React from 'react';
import { GenericDialog } from 'app/components/Alerts/GenericDialog';
import { useTranslation } from 'react-i18next';
import { Typography } from 'amn-ui-core';
import { useSelector } from 'react-redux';
import { selectSelectedScenario } from 'store/redux-store/margin-tool/slices/add-edit-scenario/add-edit-scenario.selector';
import { useDeleteConfirmationModalStyles } from './DeleteConfirmationModal.styles';

export const DeleteConfirmationModal = ({
  open,
  setDialogOpen,
  handleProceed,
}: {
  open: boolean;
  setDialogOpen: (e) => void;
  handleProceed: () => void;
  removePID?: boolean;
}) => {
  const { t } = useTranslation();
  const headerData = useSelector(selectSelectedScenario);
  const { classes } = useDeleteConfirmationModalStyles();
  return (
    <GenericDialog
      open={open}
      disableEscapeKeyDown
      maxWidth="sm"
      fullWidth
      onClose={(e, reason) => {
        if (reason === 'backdropClick') return;
        setDialogOpen(false);
      }}
      className={classes.container}
      dialogTitleProps={{
        style: { paddingTop: '20px' },
        text: t('marginTool.deleteConfirmation.modalTitle'),
      }}
      dialogActions={[
        {
          text: t('marginTool.deleteConfirmation.cancelAction'),
          color: 'tertiary',
          variant: 'contained',
          onClick: () => {
            setDialogOpen(false);
          },
        },
        {
          text: t('marginTool.deleteConfirmation.deleteAction'),
          variant: 'contained',
          color: 'primary',
          onClick: () => handleProceed(),
          disabled: false,
        },
      ]}
    >
      <Typography className={classes.text}>{t('marginTool.deleteConfirmation.deleteConfirmationMessage')}</Typography>
      <Typography className={classes.name}>
        {t('marginTool.deleteConfirmation.scenarioName', { scenarioName: headerData?.scenarioName })}
      </Typography>
    </GenericDialog>
  );
};
