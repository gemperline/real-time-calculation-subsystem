import React, { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { TaskEntity } from 'app/models/Tasks/Tasks';
import { ITypeAheadOption } from 'app/models/Orders/OrderDetails';
import { CCEmployees } from '@AMIEWEB/Tasks/CreateTask/CCEmployees';
import { IconButton } from 'amn-ui-core';
import { usePayPackageStatusTransitionStyles } from './PayPackageStatusTransitionModalStyles.styles';
import {
  PayPackageField,
  StatusTransitionModalType,
} from 'store/redux-store/pay-package-status/pay-package-status.model';

const CcField = props => {
  const { assignedToEmpValues, placementEmployees } = props;
  const { t } = useTranslation();
  const formMethods = useFormContext();
  const { classes } = usePayPackageStatusTransitionStyles({ type: StatusTransitionModalType.None });
  const [showccField, setShowccField] = useState(false);
  const [ccEmpValues, setCCEmpvalues] = useState<ITypeAheadOption[]>([]);

  const { control } = formMethods;
  const isCallingAPI = false;

  return (
    <>
      {!showccField && (
        <IconButton
          color="primary"
          data-testid="task-cc-btn"
          className={classes.ccBtn}
          disabled={isCallingAPI}
          centerRipple={false}
          onClick={() => {
            setShowccField(true);
          }}
        >
          {t('notification.createTask.ccBtn')}
        </IconButton>
      )}
      {showccField && (
        <Controller
          control={control}
          name={PayPackageField.CC}
          render={({ ref, onChange, value, ...rest }) => (
            <CCEmployees
              placementEmployees={placementEmployees}
              ccEmpValues={ccEmpValues}
              setCCEmpvalues={data => {
                setCCEmpvalues(data);
                onChange(data);
              }}
              assignedToValue={assignedToEmpValues}
              isDisabled={isCallingAPI}
              formMethods={formMethods}
              container={TaskEntity.ALL}
            />
          )}
        />
      )}
    </>
  );
};
export default CcField;
