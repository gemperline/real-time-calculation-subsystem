import { Grid } from 'amn-ui-core';
import React, { useContext } from 'react';
import { PayPackageContext } from './PayPackageStatusTransitionModal';
import NewStatus from './NewStatus';
import RejectReason from './RejectReason';
import { StatusTransitionModalType } from 'store/redux-store/margin-tool/slices/pay-package-status/pay-package-status.model';

const StatusRejectReasonWrapper = () => {
  const { type } = useContext(PayPackageContext);
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'nowrap',
        width: '399px',
      }}
    >
      {/* New Status */}
      <Grid item>
        <NewStatus />
      </Grid>
      {/* Reject Reasons */}
      <Grid item>{type === StatusTransitionModalType.Deny && <RejectReason />}</Grid>
    </div>
  );
};
export default StatusRejectReasonWrapper;
