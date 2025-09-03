import { Autocomplete, TextField } from 'amn-ui-core';
import ExpandMoreOutlinedIcon from '@mui/icons-material/ExpandMoreOutlined';
import { Controller, useFormContext } from 'react-hook-form';
import React from 'react';
import { usePayPackageStatusTransitionStyles } from './PayPackageStatusTransitionModalStyles.styles';
import {
  PayPackageField,
  StatusTransitionModalType,
} from 'store/redux-store/margin-tool/slices/pay-package-status/pay-package-status.model';

const RejectReason = () => {
  const { classes } = usePayPackageStatusTransitionStyles({ type: StatusTransitionModalType.None });

  const { control } = useFormContext();
  //TODO: Remove once API is ready
  const options = [
    { label: 'Option 1', name: 'Reson1 ' },
    { label: 'Option 2', name: 'Reson2' },
    { label: 'Option 3', name: 'Reson3' },
  ];
  return (
    <>
      <Controller
        control={control}
        name={PayPackageField.RejectReasons}
        render={({ ref, onChange, value, ...rest }) => (
          <Autocomplete
            disableClearable
            options={options}
            className={classes.rejectReasonFieldStyle}
            popupIcon={<ExpandMoreOutlinedIcon />}
            getOptionLabel={option => option.name}
            onChange={(e, value) => {
              onChange(value);
            }}
            renderInput={params => (
              <TextField
                {...params}
                label={'Reject Reason'}
                variant="filled"
                InputProps={{
                  ...params.InputProps,
                }}
              />
            )}
            {...rest}
          />
        )}
      />
    </>
  );
};
export default RejectReason;
