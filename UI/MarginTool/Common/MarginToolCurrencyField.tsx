import React, { ReactNode, useEffect, useRef } from 'react';
import { InputAdornment, TextField, Typography, useTheme } from 'amn-ui-core';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { validDecimal } from 'app/helpers/numberHelper';
import { CustomTooltip } from '@AMIEWEB/Common/Tooltips';
import { makeStyles } from 'tss-react/mui';
import { isEqual } from 'lodash';

export interface ICurrencyTooltipProps {
  tooltipText?: string;
  disabled?: boolean;
}

const useMarginToolTextFieldStyles = makeStyles()(theme => ({
  endAdornmentStyle: {
    display: 'flex',
    alignItems: 'baseline',
  },
  textStyle: {
    color: theme.palette.framework.system.coolGray,
    padding: '0 4px',
  },
}));

export const MarginToolCurrencyField = ({
  id,
  name,
  required = false,
  disabled = false,
  label,
  error,
  helperText,
  rules,
  tooltip,
  defaultValue,
  onChange,
  placeholder,
  endAdornmentValue,
  triggerMarginToolFormUpdates,
  isReadOnly = false,
}: {
  id: string;
  name: string;
  required?: boolean;
  disabled: boolean;
  label: string;
  error?: boolean;
  helperText?: string | ReactNode;
  rules?: {};
  tooltip?: ICurrencyTooltipProps;
  defaultValue?: string | number;
  onChange?: (e) => void;
  placeholder?: string;
  endAdornmentValue?: string;
  isReadOnly?: boolean;
  triggerMarginToolFormUpdates?: () => void;
}) => {
  const { control, setError, setValue } = useFormContext();
  const { t } = useTranslation();
  const theme = useTheme();
  const { classes } = useMarginToolTextFieldStyles();
  // Ref to store the previous value for margin tool form updates for people soft
  const prevValueRef = useRef<string | number | undefined>(defaultValue);
  const manualChange = useRef(false);

  const isOverwriteAfterTabbing = target => {
    return target.selectionStart === 0 && target.selectionEnd === target.value.length && target.value.length > 0;
  };

  const onKeyDown = e => {
    manualChange.current = true;
    const newVal =
      e.target.value.slice(0, e.target.selectionStart) +
      e.key.replace(/[^0-9.-]/g, '') +
      e.target.value.slice(e.target.selectionStart);
    const valid =
      /^([0-9.]|Control|Meta|Shift|Tab|ArrowLeft|ArrowRight|Backspace|Delete|Enter)$/.test(e.key) ||
      ((e.metaKey || e.ctrlKey) && e.keyCode === 65);

    if (!valid || (newVal === '' && e.keyCode !== 8 && e.keyCode !== 9)) {
      e.preventDefault();
      e.stopPropagation();
    } else if (e.keyCode === 13) {
      if (!!e.target.value) {
        e.target.value = parseFloat(newVal).toFixed(2);
      }
    } else if (
      e.keyCode !== 8 &&
      e.keyCode !== 46 &&
      e.keyCode !== 37 &&
      e.keyCode !== 39 &&
      !isOverwriteAfterTabbing(e.target)
    ) {
      if (!validDecimal(newVal, { numberLength: 5, decimalLength: 2 })) {
        e.preventDefault();
        e.stopPropagation();
      }
    }
  };

  const onBlur = e => {
    const newVal = e.target.value;
    if (!Number.isNaN(newVal) && newVal?.length > 0) {
      let val = '';
      if (newVal === '.') {
        val = parseFloat('0').toFixed(2);
      } else {
        val = parseFloat(newVal).toFixed(2);
      }
      e.target.value = val;
      handleChange(e, name);
      if (error) setError(name, null);
    }
    if (manualChange.current && !isEqual(prevValueRef.current, newVal)) {
      triggerMarginToolFormUpdates();
      prevValueRef.current = e.target.value;
    }
    manualChange.current = false;
  };

  const handleChange = (e, name) => {
    setValue(name, e.target.value);
  };

  useEffect(() => {
    setValue(name, defaultValue);
  }, [defaultValue]);

  return (
    <CustomTooltip
      placement="top"
      arrow={true}
      disabled={tooltip?.disabled}
      tooltipContent={tooltip?.tooltipText}
      contentStyle={{
        fontWeight: theme.typography.fontWeightRegular,
      }}
    >
      <Controller
        name={name}
        control={control}
        rules={rules}
        defaultValue={defaultValue}
        render={({ value, onChange: onFormChange, ...rest }) => (
          <TextField
            {...rest}
            id={id}
            required={required}
            style={{ opacity: isReadOnly ? 0.5 : 1, pointerEvents: isReadOnly ? 'none' : 'auto' }}
            label={label}
            name={name}
            autoComplete="off"
            maxRows={5}
            variant="filled"
            fullWidth
            type={'text'}
            value={value}
            InputProps={{
              startAdornment: value ? <InputAdornment position="start">{t('currency.dollar')}</InputAdornment> : null,
              endAdornment: value ? (
                <InputAdornment position="end" className={classes.endAdornmentStyle}>
                  <Typography className={classes.textStyle}>{endAdornmentValue}</Typography>
                </InputAdornment>
              ) : null,
              readOnly: isReadOnly,
            }}
            disabled={disabled}
            onKeyDown={e => e.code !== 'Tab' && onKeyDown(e)}
            onBlur={onBlur}
            onChange={e => {
              onFormChange(e); // To-do-margin-tool @Vipin remove multiple on change events from form
              handleChange(e, name); // To-do-margin-tool @Vipin remove multiple on change events from form
              onChange?.(e); // To-do-margin-tool @Vipin remove multiple on change events from form
            }}
            error={error}
            helperText={helperText}
            placeholder={placeholder}
            onFocus={e => (e.target.placeholder = '')}
          />
        )}
      />
    </CustomTooltip>
  );
};
