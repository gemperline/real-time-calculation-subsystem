import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { Grid, TextField, Typography } from 'amn-ui-core';
import { usePayPackageStatusTransitionStyles } from './PayPackageStatusTransitionModalStyles.styles';
import { useTranslation } from 'react-i18next';
import { theme } from 'styles/global-styles';
import { StatusTransitionModalType } from 'store/redux-store/pay-package-status/pay-package-status.model';

const PayPackageFreeTextField = props => {
  const { field, label, showMaxCount = false } = props;
  const { t } = useTranslation();
  const { classes } = usePayPackageStatusTransitionStyles({ type: StatusTransitionModalType.None });
  const { control, clearErrors, errors, setError, getValues } = useFormContext();
  const maxCharacters = 4000;
  return (
    <>
      <Controller
        control={control}
        name={field}
        rules={{
          maxLength: { value: maxCharacters, message: t('marginTool.labels.maxLimitLabel') },
        }}
        render={({ ref, onChange, ...rest }) => (
          <>
            <TextField
              multiline
              variant="filled"
              className={classes.inputs}
              color="primary"
              value={rest.value}
              maxRows={5}
              InputLabelProps={{
                className: classes.fieldLabel,
              }}
              error={errors[field] ? true : false}
              disabled={false}
              id={label}
              label={label}
              onChange={e => {
                if (e.target.value?.length > maxCharacters) {
                  setError(field, {
                    type: 'maxLength',
                    message: t('notification.createTask.maxLimitLabel'),
                  });
                } else if (e.target.value?.length <= maxCharacters) {
                  clearErrors(field);
                }
                onChange(e);
              }}
              helperText={!showMaxCount && errors[field] ? t('notification.createTask.maxLimitLabel') : ''}
            />
            {showMaxCount && (
              <span className={classes.helperTextArea}>
                <Grid item>
                  {getValues(field)?.length > maxCharacters && (
                    <Typography variant="body2" style={{ color: theme.palette.framework.system.red }} component="span">
                      {t(`global.textValidations.maxCharacterLimit`)}
                    </Typography>
                  )}
                </Grid>
                <Typography
                  component="span"
                  style={{
                    marginTop: '3px',
                    color: errors[field] ? theme.palette.framework.system.red : theme.palette.framework.system.coolGray,
                  }}
                  variant="body2"
                >{`${getValues(field)?.length ?? 0}/${maxCharacters}`}</Typography>
              </span>
            )}
          </>
        )}
      />
    </>
  );
};

export default PayPackageFreeTextField;
