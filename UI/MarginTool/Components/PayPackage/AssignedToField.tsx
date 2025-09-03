import React, { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { AssignedToValue } from '@AMIEWEB/Tasks/CreateTask/AssignedToEmployeeV2';
import { useTranslation } from 'react-i18next';
import { TaskEntity } from 'app/models/Tasks/Tasks';
import { ITypeAheadOption } from 'app/models/Orders/OrderDetails';
import { PayPackageField } from 'store/redux-store/margin-tool/slices/pay-package-status/pay-package-status.model';

const AssignedToField = props => {
  const { ccEmpValues, placementEmployees } = props;
  const { t } = useTranslation();
  const formMethods = useFormContext();
  const [assignedToValue, setAssignedValue] = useState<ITypeAheadOption[]>([]);

  const {
    control,
    formState: { isDirty, errors },
  } = formMethods;
  const isCallingAPI = false;

  return (
    <>
      <Controller
        control={control}
        name={PayPackageField.AssignedTo}
        rules={{ required: true, validate: value => value?.length > 0 }}
        render={({ ref, onChange, ...rest }) => (
          <React.Fragment>
            <AssignedToValue
              formMethods={formMethods}
              taskVar={PayPackageField}
              placementEmployees={placementEmployees}
              assignedToValue={assignedToValue}
              setAssignedValue={data => {
                setAssignedValue(data);
                onChange(data);
              }}
              ccValues={ccEmpValues}
              isDisabled={isCallingAPI}
              error={!!errors?.assignedTo}
              isTouched={isDirty}
              helperText={errors?.assignedTo && t('Required')}
              container={TaskEntity.ALL} //TODO:Once API is integrated, this should be changed to placements
            />
          </React.Fragment>
        )}
      />
    </>
  );
};
export default AssignedToField;
