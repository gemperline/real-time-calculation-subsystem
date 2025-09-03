import { GenericDialog } from '@AMIEWEB/Alerts/GenericDialog';
import { Typography } from 'amn-ui-core';
import React from 'react';

import { useTranslation } from 'react-i18next';

const MarginToolConfirmationModal = ({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) => {
  const { t } = useTranslation();

  return (
    <GenericDialog
      open={open}
      dialogTitleProps={{
        text: t('marginTool.modal.discardChanges.discardTitle'),
      }}
      fullWidth
      maxWidth={'sm'}
      disableEscapeKeyDown
      dialogActions={[
        {
          onClick: onClose,
          text: t('marginTool.buttons.cancel'),
          variant: 'contained',
          color: 'tertiary',
        },
        {
          onClick: onConfirm,
          text: t('marginTool.buttons.yes'),
          variant: 'contained',
        },
      ]}
    >
      <Typography>{t('marginTool.modal.discardChanges.discardContent')}</Typography>
    </GenericDialog>
  );
};

export default MarginToolConfirmationModal;
