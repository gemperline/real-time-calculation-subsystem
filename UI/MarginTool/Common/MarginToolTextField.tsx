import React, { ReactNode, useEffect, useRef } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { InputAdornment, TextField, Typography } from 'amn-ui-core';
import { makeStyles } from 'tss-react/mui';
import { isEqual } from 'lodash';
import { validDecimal } from 'app/helpers/numberHelper';

const useMarginToolTextFieldStyles = makeStyles()(theme => ({
  endAdornment: {
    alignItems: 'baseline',
    p: {
      fontSize: '12px',
    },
  },
  input: {
    '& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button': {
      '-webkit-appearance': 'none',
      margin: 0,
    },
    '& input[type=number]': {
      '-moz-appearance': 'textfield',
    },
  },
}));

interface MarginToolTextFieldProps {
  onHandleChange?: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  startAdornmentValue?: React.ReactNode;
  endAdornmentValue?: React.ReactNode;
  name?: string;
  id?: string;
  label?: string;
  inputProps?: object;
  rules?: Record<string, unknown>;
  disabled?: boolean;
  isReadOnly?: boolean;
  error?: boolean;
  helperText?: string | ReactNode;
  shrinkLabel?: boolean;
  isDecimalNumber?: boolean;
  customRegExp?: string;
  defaultValue?: string | number;
  belowOne?: boolean;
  maxNumbersAllowed?: number;
  maxDecimals?: number;
  onChange?: (e) => void;
  customAdornmentClass?: string;
  placeholder?: string;
  triggerMarginToolFormUpdates?: () => void;
}

const MarginToolTextField = ({
  onHandleChange,
  startAdornmentValue,
  endAdornmentValue,
  name,
  id,
  error,
  helperText,
  label,
  inputProps = {},
  rules,
  disabled,
  isReadOnly = false,
  shrinkLabel = undefined,
  isDecimalNumber = false,
  customRegExp,
  defaultValue,
  belowOne = false,
  maxNumbersAllowed = 3,
  maxDecimals = 2,
  onChange,
  customAdornmentClass,
  placeholder,
  triggerMarginToolFormUpdates,
}: MarginToolTextFieldProps) => {
  const { classes } = useMarginToolTextFieldStyles();
  const { control, setValue, watch } = useFormContext();
  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const defaultValidation = new RegExp(customRegExp ?? '^[0-9.]$');
    if (!defaultValidation.test(event.key) && isDecimalNumber) {
      event.preventDefault();
    }
  };
  // Ref to store the previous value
  const prevValueRef = useRef<string | number | undefined>(defaultValue);
  const manualChange = useRef(false);

  const onTextFieldChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!isDecimalNumber) {
      onHandleChange(event);
    } else {
      onDecimalChange(event);
    }
  };

  const onDecimalChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    let inputValue = event.target.value;
    const restrictions = {
      numberLength: maxNumbersAllowed,
      decimalLength: maxDecimals,
      belowOne,
    };

    if (inputValue === '') {
      setValue(name, inputValue);
      return;
    }
    if (validDecimal(inputValue, restrictions)) {
      setValue(name, inputValue);
    }
  };

  const handleChange = event => {
    onTextFieldChange(event);
    onChange?.(event);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    manualChange.current = true; // Set manual change on first key down
  };
  /**
   * Method to update previous state value on blur when people soft call is made
   */
  const handleBlur = () => {
    const watchedValue = watch(name);
    // Compare the previous value with the current watched value
    if (manualChange.current && !isEqual(prevValueRef.current, watchedValue)) {
      triggerMarginToolFormUpdates?.();
      prevValueRef.current = watchedValue;
    }

    manualChange.current = false;
  };

  useEffect(() => {
    setValue(name, defaultValue);
    prevValueRef.current = defaultValue; // Initialize the previous value
  }, [defaultValue]);

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      defaultValue={defaultValue}
      render={({ value, onChange: onFormChange, ...rest }) => (
        <TextField
          {...rest}
          id={id}
          label={label}
          maxRows={1}
          variant="filled"
          fullWidth
          value={value}
          disabled={disabled}
          error={error}
          InputLabelProps={{
            shrink: shrinkLabel,
          }}
          helperText={helperText}
          className={classes.input}
          onChange={(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const restrictions = {
              numberLength: maxNumbersAllowed,
              decimalLength: maxDecimals,
              belowOne,
            };

            if (isDecimalNumber && validDecimal(event.target.value, restrictions)) {
              onFormChange(event);
            } else if (!isDecimalNumber) {
              onFormChange(event);
            }
            handleChange(event);
          }}
          InputProps={{
            inputProps: { ...inputProps, readOnly: isReadOnly },
            startAdornment: value
              ? startAdornmentValue && <InputAdornment position="start"> {startAdornmentValue}</InputAdornment>
              : null,
            endAdornment: endAdornmentValue && (
              <InputAdornment className={customAdornmentClass ?? classes.endAdornment} position="end">
                <Typography
                  sx={theme => ({
                    color: theme.palette.framework.system.coolGray,
                    padding: '0 4px',
                  })}
                >
                  {endAdornmentValue}
                </Typography>
              </InputAdornment>
            ),
          }}
          onKeyPress={handleKeyPress}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          onFocus={e => (e.target.placeholder = '')}
          onBlur={() => handleBlur()}
        />
      )}
    />
  );
};

export default MarginToolTextField;
