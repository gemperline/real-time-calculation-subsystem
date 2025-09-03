import { Grid } from 'amn-ui-core';
import React, { useState } from 'react';
import DueDate from './DueDate';
import AssignedToCcWrapper from './AssignedToCcWrapper';
import StatusRejectReasonWrapper from './StatusRejectReasonWrapper';
import { TaskAttachment } from '@AMIEWEB/Tasks/CustomComponents/TaskAttachments/TaskAttachments';
import PayPackageFreeTextField from './PayPackageNotes';
import { useTranslation } from 'react-i18next';
import { PayPackageField } from 'store/redux-store/margin-tool/slices/pay-package-status/pay-package-status.model';

const PayPackageStatusTransition = () => {
  const { t } = useTranslation();
  const [attachments, setAttachments] = useState<any>([]);

  return (
    <Grid style={{ margin: '24px 0px' }}>
      <Grid xs={12} rowSpacing={5} container>
        {/*//?ROW :  New Status & Reject Reasons */}
        <Grid xs={12} container item direction="row">
          <StatusRejectReasonWrapper />
        </Grid>
        {/*//?ROW : Due Date */}
        <Grid xs={12} item>
          <DueDate />
        </Grid>
        {/*//?ROW : Assigned To and CC */}
        <Grid container rowSpacing={5} item xs={12}>
          <AssignedToCcWrapper />
        </Grid>
        {/*//?ROW :Attachements */}
        <Grid item xs={12}>
          <TaskAttachment setAttachments={setAttachments} attachments={attachments} existingAttachmentAttributes={[]} />
        </Grid>
        {/*//?ROW :Notes */}
        <Grid item xs={12}>
          <PayPackageFreeTextField
            field={PayPackageField.AdditionalDetails}
            label={t('marginTool.labels.additionalDetails')}
            showMaxCount={true}
          />
        </Grid>
      </Grid>
    </Grid>
  );
};
export default PayPackageStatusTransition;
