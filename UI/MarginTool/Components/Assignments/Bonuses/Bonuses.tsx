import React, { useCallback } from 'react';
import MarginToolCard from '../../../Common/MarginToolCard';
import { MarginToolCardTitle } from '../../../Common/MarginToolCardTitle';
import { debounce, Divider, Grid, Typography, useTheme } from 'amn-ui-core';
import { useTranslation } from 'react-i18next';
import { AddBonuses } from './AddBonusItem';
import { useFieldArray } from 'react-hook-form';
import { useBonusesStyles } from './BonusesStyles';
import { BonusesItem } from './BonusesItem';
import { IFieldItem } from './model';
import { usePeopleSoftCalculation } from '../../PeopleSoftCalculation/IPeopleSoftCalculationHelper';

export const Bonuses = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { classes } = useBonusesStyles();
  const { triggerPeopleSoftCalculation } = usePeopleSoftCalculation();
  const { fields, append, remove } = useFieldArray({
    name: `assignment.bonusesFieldArray`,
  });

  const onHandleBonusesDelete = (index: number) => {
    remove(index);
    debouncedTriggerCalculation();
  };

  /**
   * Debounce the trigger calculation method as deleting the item won't extract the latest values from the form
   */
  const debouncedTriggerCalculation = useCallback(
    debounce(() => {
      triggerPeopleSoftCalculation();
    }, 300),
    [],
  );

  return (
    <MarginToolCard
      id="marginToolDetailsPage-bonuses-card"
      title={<MarginToolCardTitle title={t('marginTool.components.assignment.bonuses.title')} />}
      isCustomIcon
      customBackGroundColor={theme.palette.framework.system.white}
      children={
        <>
          {fields?.length ? (
            <Grid container item className={fields?.length > 6 ? classes.gridContainer : classes.noScroll}>
              {fields?.map((field: IFieldItem, index: number) => (
                <>
                  <Grid container key={field.id}>
                    <BonusesItem
                      key={field.id}
                      index={index}
                      item={field}
                      handleBonusesDelete={(currentIndex: number) => onHandleBonusesDelete(currentIndex)}
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
            <Grid container className={classes.noBonusesTitle}>
              <Typography variant="subtitle1">{t('marginTool.components.assignment.bonuses.noBonuses')}</Typography>
            </Grid>
          )}
        </>
      }
      icon={<AddBonuses append={append} />}
    />
  );
};
