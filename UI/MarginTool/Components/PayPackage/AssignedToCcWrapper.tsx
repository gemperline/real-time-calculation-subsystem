import { Grid } from 'amn-ui-core';
import React, { useState } from 'react';
import AssignedToField from './AssignedToField';
import CcField from './CcField';
import { ITypeAheadOption } from 'app/models/Orders/OrderDetails';

const AssignedToCcWrapper = () => {
  const [placementEmployees, setPlacementEmployees] = useState<ITypeAheadOption[]>([]);

  return (
    <>
      <Grid item xs={12}>
        <AssignedToField ccEmpValues={[]} placementEmployees={placementEmployees} />
      </Grid>
      <Grid item xs={12}>
        <CcField assignedToEmpValues={[]} placementEmployees={placementEmployees}/>
      </Grid>
    </>
  );
};
export default AssignedToCcWrapper;
