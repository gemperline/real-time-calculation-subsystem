import React, { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDatePickerStyles } from './PayPackageStatusTransitionModalStyles.styles';
import { DateRangePicker } from 'app/ComponentLibrary/DateRangeNew';
import { addDays } from 'date-fns';
import { PayPackageField } from 'store/redux-store/margin-tool/slices/pay-package-status/pay-package-status.model';

const DueDate = () => {
  const { t } = useTranslation();
  const { classes } = useDatePickerStyles();
  const [dueDateValue, setDueDateValue] = useState<string>(new Date().toDateString());
  const { control, clearErrors, errors } = useFormContext();
  const date = new Date();

  return (
    <>
      <Controller
        control={control}
        name={PayPackageField.DueDate}
        rules={{ required: true }}
        defaultValue={dueDateValue}
        render={({ ref, onChange, value, ...rest }) => (
          <DateRangePicker
            variant="filled"
            placeholder={t('notification.createTask.dueDateLabel')}
            className={classes.dueDateInput}
            useMaxWidth={true}
            single={true}
            value={dueDateValue}
            initialDateRange={{
              startDate: dueDateValue ? new Date(dueDateValue) : undefined,
              endDate: dueDateValue ? new Date(dueDateValue) : undefined,
              useLabelAsValue: true,
            }}
            labelClass={dueDateValue ? classes.fieldLabel : classes.dueDateField}
            minDate={addDays(date, -1)}
            maxWidth={150}
            trailingIconShow={true}
            // isDisabled={isCallingAPI}
            disablePortal={true}
            actionBar={false}
            clickAway={true}
            keepClickAwayVal={true}
            onInlineEdit={() => {
              clearErrors(PayPackageField.DueDate);
            }}
            fallbackPlacements={['bottom-start']}
            onChange={e => {
              onChange(e?.endDate ?? '');
              setDueDateValue(e?.endDate ? `${e?.endDate}` : '');
            }}
            error={errors?.dueDate}
            helperText={errors?.dueDate ? t('Required') : ''}
            definedRanges={[
              {
                label: t('notification.createTask.dueDateLabels.today'),
                startDate: date,
                endDate: date,
                useLabelAsValue: false,
              },
              {
                label: t('notification.createTask.dueDateLabels.tomorrow'),
                startDate: addDays(date, 1),
                endDate: addDays(date, 1),
                useLabelAsValue: false,
              },
              {
                label: t('notification.createTask.dueDateLabels.2Days'),
                startDate: addDays(date, 2),
                endDate: addDays(date, 2),
                useLabelAsValue: false,
              },
              {
                label: t('notification.createTask.dueDateLabels.7Days'),
                startDate: addDays(date, 7),
                endDate: addDays(date, 7),
                useLabelAsValue: false,
              },
              {
                label: t('notification.createTask.dueDateLabels.30Days'),
                startDate: addDays(date, 30),
                endDate: addDays(date, 30),
                useLabelAsValue: false,
              },
            ]}
          />
        )}
      />
    </>
  );
};
export default DueDate;
