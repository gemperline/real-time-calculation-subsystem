import React, { useCallback } from 'react';
import MarginToolCard from '../../../Common/MarginToolCard';
import { MarginToolCardTitle } from '../../../Common/MarginToolCardTitle';
import { debounce, Divider, Grid, Typography, useTheme } from 'amn-ui-core';
import { useTranslation } from 'react-i18next';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { IFieldItem, ReimbursementItem } from './ReimbursementItem';
import { AddReimbursement } from './AddReimbursement';
import { makeStyles } from 'tss-react/mui';
import { usePeopleSoftCalculation } from '../../PeopleSoftCalculation/IPeopleSoftCalculationHelper';

const useReimbursementStyles = makeStyles()({
  gridContainer: {
    height: '400px',
    overflowY: 'auto',
  },
  noScroll: {
    overflow: 'none',
  },
});

export const Reimbursement = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { classes } = useReimbursementStyles();
  const { control } = useFormContext();
  const { triggerPeopleSoftCalculation } = usePeopleSoftCalculation();

  /**
   * Method to handle the field array for reimbursement items
   * Do not use FieldArray with same name in nested components
   */
  const { fields, remove, append } = useFieldArray({
    control,
    name: `assignment.reimbursementFieldArray`,
  });

  const onHandleReimbursementDelete = (index: number) => {
    remove(index);
    debouncedTriggerCalculation();
  };

  /**
   * Debounce the trigger calculation method as deleting the item won't extract the latest values from the form
   */
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedTriggerCalculation = useCallback(
    debounce(() => {
      triggerPeopleSoftCalculation();
    }, 300),
    [],
  );

  return (
    <MarginToolCard
      id="reimbursement-card-margin-tool-details-page"
      title={<MarginToolCardTitle title={t('marginTool.components.assignment.reimbursement.title')} />}
      isCustomIcon
      customBackGroundColor={theme.palette.framework.system.white}
      children={
        <>
          {fields?.length ? (
            <Grid container item className={fields?.length > 6 ? classes.gridContainer : classes.noScroll}>
              {fields.map((field: IFieldItem, index: number) => (
                <>
                  <Grid container key={field.id}>
                    <ReimbursementItem
                      key={field.id}
                      index={index}
                      item={field}
                      handleReimbursementDelete={(currentIndex: number) => onHandleReimbursementDelete(currentIndex)}
                      totalItems={fields.length}
                    />
                  </Grid>
                  {index !== fields.length - 1 && (
                    <Grid item sx={{ width: '100%', m: '0px 12px' }}>
                      <Divider />
                    </Grid>
                  )}
                </>
              ))}
            </Grid>
          ) : (
            <Grid container p="12px" alignItems="center" justifyContent="center">
              <Typography variant="subtitle1">
                {t('marginTool.components.assignment.reimbursement.noReimbursement')}
              </Typography>
            </Grid>
          )}
        </>
      }
      icon={<AddReimbursement append={append} />}
    />
  );
};
