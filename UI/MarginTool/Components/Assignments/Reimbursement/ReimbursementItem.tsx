import React, { useEffect } from 'react';
import { MarginToolCheckbox } from '@AMIEWEB/MarginTool/Common/MarginToolCheckbox';
import { MarginToolCurrencyField } from '@AMIEWEB/MarginTool/Common/MarginToolCurrencyField';
import MarginToolTextField from '@AMIEWEB/MarginTool/Common/MarginToolTextField';
import { Grid, IconButton } from 'amn-ui-core';
import { useTranslation } from 'react-i18next';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import { MarginToolTextArea } from '@AMIEWEB/MarginTool/Common/MarginToolTextArea';
import { registerNonFormFieldValuesForReimbursement, shouldShowDescription } from './helper';
import { useFormContext } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { selectSelectedScenario } from 'store/redux-store/margin-tool/slices/add-edit-scenario/add-edit-scenario.selector';
import { PayPackageStatus } from 'store/redux-store/margin-tool/slices/pay-package-status/pay-package-status.model';
import { makeStyles } from 'tss-react/mui';
import { usePeopleSoftCalculation } from '../../PeopleSoftCalculation/IPeopleSoftCalculationHelper';
import { IPayPackageCategory } from '@AMIEWEB/MarginTool/enum';

interface ReimbursementItemProps {
  index: number;
  item: IFieldItem;
  handleReimbursementDelete: (index: number) => void;
  totalItems: number;
}

export interface IFieldItem {
  id: string;
  name: string;
  userChecked: boolean;
  value: number;
  parentCategoryName: string;
  parentCategoryValue: number;
  description: string;
  isReimbursementRequired: boolean;
  reimbursementAmount: string;
}

const useReimbursementItemStyles = makeStyles()(() => ({
  deleteIcon: {
    display: 'flex',
    flexDirection: 'row-reverse',
    position: 'absolute',
    right: '10px',
    top: '20px',
    '&:hover': {},
  },
}));

export const ReimbursementItem = ({ index, item, handleReimbursementDelete, totalItems }: ReimbursementItemProps) => {
  const { classes } = useReimbursementItemStyles();
  const { t } = useTranslation();
  const {
    setValue,
    formState: { errors },
    setError,
    clearErrors,
    register,
  } = useFormContext();
  const { triggerPeopleSoftCalculation } = usePeopleSoftCalculation();
  const scenario = useSelector(selectSelectedScenario);
  const isScenarioStatusPending = scenario?.scenarioStatusId === PayPackageStatus.Pending;
  const reimbursementError = errors?.assignment?.reimbursementFieldArray?.[index];
  const reimbursementsConfig = {
    categoryId: IPayPackageCategory.Reimbursements,
    categoryName: 'Reimbursements',
    subCategory: item.parentCategoryName,
  };

  /**
   * Method to handle the description change
   * @param event
   */
  const handleDescriptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event?.target?.value;
    setValue(`assignment.reimbursementFieldArray[${index}].description`, value);
    const isError = !!reimbursementError?.description;
    //Manually set error if the character length exceeds 255
    if (value.length >= 255) {
      setError(`assignment.reimbursementFieldArray[${index}].description`, {
        type: 'manual',
        message: t('global.textValidations.maxCharacterLimit'),
      });
    } else if (isError) {
      clearErrors(`assignment.reimbursementFieldArray[${index}].description`);
    }
  };

  useEffect(() => {
    registerNonFormFieldValuesForReimbursement(
      register,
      setValue,
      `assignment.reimbursementFieldArray[${index}]`,
      reimbursementsConfig,
    );
  }, [totalItems]);

  return (
    <>
      <Grid container p="12px" columnGap={6} rowGap={2} alignItems="center" position={'relative'}>
        <Grid item xs={4}>
          <MarginToolTextField
            name={`assignment.reimbursementFieldArray[${index}].reimbursementType`}
            id={`reimbursement-type-margin-tool-text-field-${index}`}
            label={t('marginTool.components.assignment.reimbursement.reimbursementType')}
            disabled={true}
            defaultValue={item?.name}
          />
        </Grid>
        <Grid item xs={3}>
          <MarginToolCurrencyField
            name={`assignment.reimbursementFieldArray[${index}].reimbursementAmount`}
            id={`reimbursement-amount-margin-tool-currency-field-${index}`}
            required={false}
            disabled={!isScenarioStatusPending}
            label={t('marginTool.components.assignment.reimbursement.reimbursementAmount')}
            tooltip={{
              tooltipText: '',
              disabled: true,
            }}
            triggerMarginToolFormUpdates={() => triggerPeopleSoftCalculation()}
            defaultValue={item?.reimbursementAmount ?? null}
          />
        </Grid>
        <Grid item xs={1} lg={3}>
          <MarginToolCheckbox
            name={`assignment.reimbursementFieldArray[${index}].isReimbursementRequired`}
            id={`reimbursement-required-margin-tool-checkbox-${index}`}
            defaultChecked={item?.isReimbursementRequired}
            label={t('marginTool.components.assignment.reimbursement.receiptRequired')}
            onHandleChange={(value: boolean) => triggerPeopleSoftCalculation()}
            disabled={!isScenarioStatusPending}
          />
        </Grid>
        <Grid item xs={0.5} className={classes.deleteIcon}>
          <IconButton
            onClick={() => handleReimbursementDelete(index)}
            aria-label="delete"
            disabled={!isScenarioStatusPending}
            id={`delete-reimbursement-icon-${index}`}
          >
            <DeleteOutlinedIcon
              sx={{
                '&:hover': {
                  color: theme => theme.palette.framework.system.main,
                },
              }}
            />
          </IconButton>
        </Grid>
        {shouldShowDescription(item) && (
          <Grid xs={4}>
            <MarginToolTextArea
              handleChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                handleDescriptionChange(event);
              }}
              name={`assignment.reimbursementFieldArray[${index}].description`}
              id="reimbursement-description-margin-tool-text-area"
              label={t('marginTool.components.assignment.reimbursement.description')}
              error={!!reimbursementError?.description}
              helperText={reimbursementError?.description?.message}
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
