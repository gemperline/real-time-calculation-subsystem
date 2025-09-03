import React, { ReactNode, useEffect } from 'react';
import { Checkbox, FormControlLabel } from 'amn-ui-core';
import { Controller, useFormContext } from 'react-hook-form';

export const MarginToolCheckbox = ({
  name,
  defaultChecked,
  label,
  disabled,
  id,
  onHandleChange,
  isReadOnly = false,
  checked = false,
}: {
  name: string;
  defaultChecked?: boolean;
  label: string | ReactNode;
  disabled?: boolean;
  id: string;
  onHandleChange?: (checked: boolean) => void;
  isReadOnly?: boolean;
  checked?: boolean;
  triggerMarginToolFormUpdates?: () => void;
}) => {
  const { control, setValue } = useFormContext();

  useEffect(() => {
    setValue(name, defaultChecked);
  }, [defaultChecked]);

  return (
    <Controller
      name={name}
      control={control}
      render={({ value, onChange }) => (
        <FormControlLabel
          control={
            <Checkbox
              id={id}
              checked={value ?? checked}
              sx={{ opacity: isReadOnly ? 0.5 : 1 }}
              onChange={event => {
                if (isReadOnly) return;
                onChange(event?.target?.checked);
                onHandleChange?.(event?.target?.checked);
              }}
              disabled={disabled}
              defaultChecked={defaultChecked}
              disableRipple={isReadOnly}
            />
          }
          label={label}
        />
      )}
    />
  );
};
