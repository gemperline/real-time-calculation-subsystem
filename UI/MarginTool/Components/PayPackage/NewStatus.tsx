import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { Autocomplete, TextField } from 'amn-ui-core';
import ExpandMoreOutlinedIcon from '@mui/icons-material/ExpandMoreOutlined';
import { usePayPackageStatusTransitionStyles } from './PayPackageStatusTransitionModalStyles.styles';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  IStatusOptions,
  PayPackageField,
  StatusTransitionModalType,
} from 'store/redux-store/pay-package-status/pay-package-status.model';
import { selectpayPackageStatusOptions } from 'store/redux-store/margin-tool/slices/pay-package-status/pay-package-status.selector';

const NewStatus = () => {
  const { classes } = usePayPackageStatusTransitionStyles({ type: StatusTransitionModalType.None });
  const {
    control,
    formState: { errors },
  } = useFormContext();
  const options: IStatusOptions[] = useSelector(selectpayPackageStatusOptions);
  const { t } = useTranslation();
  return (
    <>
      <Controller
        control={control}
        name={PayPackageField.NewStatus}
        rules={{
          required: true,
        }}
        render={({ ref, onChange, value, ...rest }) => (
          <Autocomplete
            disableClearable
            value={value}
            options={options}
            style={{ width: '160px' }}
            popupIcon={<ExpandMoreOutlinedIcon />}
            getOptionLabel={(option: IStatusOptions) => option.name}
            onChange={(e, value) => {
              onChange(value);
            }}
            renderInput={params => (
              <TextField
                {...params}
                label={t('marginTool.labels.newStatus')}
                required={true}
                variant="filled"
                className={classes.statusFieldStyle}
                error={!!errors[PayPackageField.NewStatus]}
                helperText={!!errors[PayPackageField.NewStatus] ? t('Required') : ''}
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
export default NewStatus;
