import React from 'react';
import moment from 'moment';
import { Controller, useFormContext } from 'react-hook-form';
import { DateRangePicker } from 'app/ComponentLibrary/DateRangeNew';
import { makeStyles } from 'tss-react/mui';

interface IMarginToolDatePickerProps {
  name: string;
  placeholder: string;
  rules: object;
  error: boolean | null;
  helperText: string;
  isDisabled?: boolean;
  handleDateChange: (date: Date | null) => void;
  maxWidth?: number;
  defaultValue?: any;
  isReadOnly?: boolean;
}

const useCustomDateStyles = makeStyles()(theme => ({
  fieldStyle: {
    '& .MuiFilledInput-root': {
      backgroundColor: `${theme.palette.framework.system.platinum} !important`,
    },
    '&:hover .MuiFilledInput-root': {
      backgroundColor: `${theme.palette.framework.system.silverTwo} !important`,
    },
    '&:hover .MuiInputLabel-root': {
      color: `${theme.palette.framework.system.navyBlue} !important`,
    },
    '& .MuiInputAdornment-positionEnd': {
      color: `${theme.palette.framework.system.redTwo}`,
    },
  },
}));

export const MarginToolDatePicker = ({
  name,
  placeholder,
  rules,
  error,
  helperText,
  isDisabled,
  handleDateChange,
  maxWidth,
  defaultValue = null,
  isReadOnly = false,
}: IMarginToolDatePickerProps) => {
  const { control } = useFormContext();
  const { classes } = useCustomDateStyles();

  const extractValue = date => {
    const isValid = moment(date).isValid();
    return {
      startDate: isValid ? new Date(date) : undefined,
      endDate: isValid ? new Date(date) : undefined,
      useLabelAsValue: true,
    };
  };

  /**
   *
   * @param newValue - New value from date picker
   * @param onChange - Method to handle form change and set value
   */
  const onHandleChange = (newValue, onChange) => {
    if (newValue?.endDate !== undefined) {
      const newDate = moment(newValue.endDate);
      const formattedDate = newDate.isValid() ? moment(newDate).format('YYYY-MM-DDTHH:mm:ss') : null;
      onChange(formattedDate);
      handleDateChange(newValue);
    } else {
      onChange(null);
      handleDateChange(newValue);
      return;
    }
  };

  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      defaultValue={defaultValue}
      render={({ value, ref, onChange, ...rest }) => {
        return (
          <DateRangePicker
            {...rest}
            onChange={newValue => onHandleChange(newValue, onChange)}
            value={value}
            open={false}
            variant="filled"
            single
            labelClass={classes.fieldStyle}
            className={classes.fieldStyle}
            placeholder={placeholder}
            quickSelect={false}
            fullWidth={true}
            maxWidth={maxWidth ?? 180}
            textFieldSize="medium"
            showIcon={true}
            actionBar={false}
            trailingIconShow
            initialDateRange={extractValue(value)}
            error={error}
            helperText={helperText}
            clickAway
            keepClickAwayVal={false}
            isDisabled={isDisabled}
            readOnly={isReadOnly}
          />
        );
      }}
    />
  );
};
