import React, { useEffect } from 'react';
import { MarginToolCurrencyField } from '@AMIEWEB/MarginTool/Common/MarginToolCurrencyField';
import MarginToolTextField from '@AMIEWEB/MarginTool/Common/MarginToolTextField';
import { Grid, IconButton } from 'amn-ui-core';
import { useTranslation } from 'react-i18next';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import { useSelector } from 'react-redux';
import { selectSelectedScenario } from 'store/redux-store/margin-tool/slices/add-edit-scenario/add-edit-scenario.selector';
import { PayPackageStatus } from 'store/redux-store/margin-tool/slices/pay-package-status/pay-package-status.model';
import { useBonusesStyles } from './BonusesStyles';
import { BonusesFieldCategoryName, BonusesItemProps } from './model';
import { usePeopleSoftCalculation } from '../../PeopleSoftCalculation/IPeopleSoftCalculationHelper';
import { useFormContext } from 'react-hook-form';
import { IPayPackageCategory } from '@AMIEWEB/MarginTool/enum';
import { getBonusesItemFieldNames, registerNonFormFieldValuesForBonuses } from './helper';
import { TreeViewLookupTypes } from '../enum';
import { MarginToolTextArea } from '@AMIEWEB/MarginTool/Common/MarginToolTextArea';

export const BonusesItem = ({ index, item, handleBonusesDelete, totalItems }: BonusesItemProps) => {
  const { classes } = useBonusesStyles();
  const { t } = useTranslation();
  const scenario = useSelector(selectSelectedScenario);
  const { register, setValue, setError, clearErrors,
    formState: { errors },
   } = useFormContext();
  const { triggerPeopleSoftCalculation } = usePeopleSoftCalculation();
  const bonusesItemFieldNames = getBonusesItemFieldNames(index);
  const bonusesError = errors?.assignment?.bonusesFieldArray?.[index];

  const isScenarioStatusPending = scenario?.scenarioStatusId === PayPackageStatus.Pending;
  const bonusesConfig = {
    categoryId: IPayPackageCategory.BonusType,
    categoryName: TreeViewLookupTypes.BonusType,
    subCategory: TreeViewLookupTypes.BonusType, // name of the bonuses is the sub category
  };

  useEffect(() => {
    registerNonFormFieldValuesForBonuses(register, setValue, `assignment.bonusesFieldArray[${index}]`, bonusesConfig);
  }, [totalItems]);

  const handleDescriptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event?.target?.value;
    setValue(bonusesItemFieldNames?.description, value);
    const isError = !!bonusesError?.description;
    if (value.length >= 255) {
      setError(bonusesItemFieldNames?.description, {
        type: 'manual',
        message: t('global.textValidations.maxCharacterLimit'),
      });
    } else if (isError) {
      clearErrors(bonusesItemFieldNames?.description);
    }
  };

  return (
    <>
      <Grid container p="12px" columnGap={6} rowGap={2} alignItems="center" position={'relative'}>
        <Grid item xs={4}>
          <MarginToolTextField
            name={bonusesItemFieldNames.bonusType}
            id={`marginTool-bonuses-bonusType-textField-${index}`}
            label={t('marginTool.labels.bonusType')}
            disabled={true}
            defaultValue={item?.name}
          />
        </Grid>
        <Grid item xs={3}>
          <MarginToolCurrencyField
            name={bonusesItemFieldNames.bonusAmount}
            id={`marginTool-bonuses-bonusAmount-currencyField-${index}`}
            required={false}
            disabled={!isScenarioStatusPending}
            label={t('marginTool.labels.bonusAmount')}
            tooltip={{
              tooltipText: '',
              disabled: true,
            }}
            defaultValue={item?.bonusAmount ?? null}
            triggerMarginToolFormUpdates={() => triggerPeopleSoftCalculation()}
          />
        </Grid>

        <Grid item xs={1} className={classes.deleteIcon}>
          <IconButton
            onClick={() => handleBonusesDelete(index)}
            aria-label="delete"
            disabled={!isScenarioStatusPending}
            id={`delete-bonuses-icon-${index}`}
          >
            <DeleteOutlinedIcon className={classes.deleteHover} />
          </IconButton>
        </Grid>
        {item?.name === BonusesFieldCategoryName.AMNFindAndFill && (
          <Grid xs={12}>
            <MarginToolTextArea
              handleChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                handleDescriptionChange(event);
              }}
              name={bonusesItemFieldNames?.description}
              id="bonuses-description-margin-tool-text-area"
              label={t('marginTool.components.assignment.bonuses.description')}
              error={!!bonusesError?.description}
              helperText={bonusesError?.description?.message}
              disabled={!isScenarioStatusPending}
              inputProps={{ maxLength: 255 }}
              defaultValue={item?.description ?? ''}
            />
          </Grid>
        )}
      </Grid>
    </>
  );
};
