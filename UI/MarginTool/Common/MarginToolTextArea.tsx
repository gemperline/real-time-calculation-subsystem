import React, { ReactNode, useEffect } from 'react';
import { TextField } from 'amn-ui-core';
import { Controller, useFormContext } from 'react-hook-form';

export const MarginToolTextArea = ({
  id,
  disabled,
  label,
  name,
  error,
  defaultValue,
  helperText,
  isValueNumber,
  rules,
  handleChange,
  inputProps,
}: {
  id: string;
  name: string;
  disabled?: boolean;
  label: string;
  defaultValue?: string;
  error?: boolean;
  helperText?: string | ReactNode;
  isValueNumber?: boolean;
  rules?: {};
  handleChange: (e) => void;
  inputProps?: {};
}) => {
  const { control,setValue } = useFormContext();

  useEffect(() => {
    setValue(name, defaultValue);
  }, [defaultValue]);
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ value, onChange, ...rest }) => (
        <TextField
          {...rest}
          id={id}
          label={label}
          multiline
          maxRows={5}
          variant="filled"
          size="medium"
          fullWidth
          defaultValue={defaultValue}
          type={isValueNumber ? 'number' : 'text'}
          value={value}
          disabled={disabled}
          onChange={(e) => {
            onChange(e);
            handleChange(e);
          }}
          error={error}
          helperText={helperText}
          inputProps={inputProps}
        />
      )}
    />
  );
};
