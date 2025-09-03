import React from 'react';
import { MarginToolTextArea } from '@AMIEWEB/MarginTool/Common/MarginToolTextArea';
import { Box, Button, Divider, Grid, Typography } from 'amn-ui-core';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { MarginToolCheckbox } from '@AMIEWEB/MarginTool/Common/MarginToolCheckbox';
import { PackageType, PayPackageOptions } from '@AMIEWEB/MarginTool/enum';
import SplitsWrapper from './Splits/SplitsWrapper';
import CallSplitIcon from '@mui/icons-material/CallSplit';
import { IScenarioSplit, SenarioSplitMode } from './model';
import { CustomTooltip } from '@AMIEWEB/Common';
import { useAddScenarioStyles } from './AddScenario.styles';
import { updateSplitsList } from './helper';
import { useSelector } from 'react-redux';
import {
  selectBookingPeriod,
  selectScenarioModalState,
} from 'store/redux-store/margin-tool/slices/add-edit-scenario/add-edit-scenario.selector';

export const ScenarioData = () => {
  const { control, watch, setValue, errors, setError, clearErrors } = useFormContext();
  const { classes } = useAddScenarioStyles();
  const { t } = useTranslation();
  const tlaValue = watch('tla');
  const scenarioNameValue = watch('scenarioName');
  const splitsList = useWatch<IScenarioSplit[]>({ name: `splitsList` });
  const isModalOpen = useSelector(selectScenarioModalState);
  const selectBookingPeriodDetails = useSelector(selectBookingPeriod);
  const isAddScenario = isModalOpen?.modalName === PayPackageOptions.AddScenario;
  const isEditScenario = isModalOpen?.modalName === PayPackageOptions.editScenario;
  const isAddExtension = isModalOpen?.modalName === PayPackageOptions.AddExtension;
  const isSplitAllowed = watch('startDate') && watch('endDate');
  const { fields: splitsFields, append: appendSplitsField } = useFieldArray({
    control,
    name: 'splitsList',
  });

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e?.target?.value?.length >= 1000) {
      setValue('notes', e?.target?.value.substring(0, 1000));
      setError('notes', { message: t('order.maxCharLimit') });
    } else {
      setValue('notes', e?.target?.value);
      clearErrors('notes');
    }
  };

  const handleScenarioNameChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setValue('scenarioName', e?.target?.value);
  };

  const handleHoursPerShiftChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = event.target.value;
    setValue('hoursPerShift', inputValue);
  };

  const handleShiftChange = (selectedShiftDescription, fieldIndex) => {
    if (selectedShiftDescription) {
      setValue(`splitsList[${fieldIndex}].hoursPerWeek`, selectedShiftDescription.object.hoursPerWeek);
      setValue(`splitsList[${fieldIndex}].hoursPerShift`, selectedShiftDescription.object.hoursPerShift);
    }
  };
  const createSplits = () => {
    if (splitsList.length <= 0) {
      return createSplitEmpty();
    }
    const previosuSplit: IScenarioSplit = splitsList[splitsList.length - 1] as IScenarioSplit;
    appendSplitsField({
      mode: SenarioSplitMode.ADD,
      startDate: '',
      endDate: previosuSplit.endDate,
      shift: previosuSplit.shift,
      hoursPerWeek: previosuSplit.hoursPerWeek,
      hoursPerShift: previosuSplit.hoursPerShift,
    });
  };

  const createSplitEmpty = () => {
    appendSplitsField({
      mode: SenarioSplitMode.ADD,
      startDate: '',
      endDate: '',
      shift: null,
      hoursPerWeek: null,
      hoursPerShift: null,
    });
  };

  const removeSplitsField = (currentIndex: number) => {
    clearErrors(`splitsList`);
    const updatedSplits = updateSplitsList(splitsList, currentIndex);
    setValue('splitsList', updatedSplits);
  };

  return (
    <Grid container direction="column">
      <Grid container item direction="column">
        <Grid item sx={{ mb: '12px' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
            {t('marginTool.components.scenarioDetails')}
          </Typography>
        </Grid>
        <Grid container item sx={{ mb: '12px' }}>
          <Grid item sx={{ width: '370px' }}>
            <MarginToolTextArea
              rules={{
                required: 'Required',
                maxLength: { value: 50, message: t('order.maxCharLimit') },
                validate: value => {
                  return value.trim() !== '' || 'Cannot be empty or only whitespace';
                },
              }}
              defaultValue={scenarioNameValue}
              name="scenarioName"
              id="marginTool-addScenarioModal-scenarioNameTextfield"
              disabled={false}
              label={t('marginTool.labels.scenarioNameWithAsterisk')}
              handleChange={(event: React.ChangeEvent<HTMLInputElement>) => handleScenarioNameChange(event)}
              error={!!errors?.scenarioName}
              helperText={errors?.scenarioName ? errors?.scenarioName?.message : undefined}
            />
          </Grid>
          <Grid item sx={{ ml: '12px' }}>
            <MarginToolCheckbox
              name="tla"
              id="marginTool-addScenarioModal-tlaCheckbox"
              defaultChecked={tlaValue}
              label={t('marginTool.labels.tla')}
              disabled={isModalOpen?.modalName === PayPackageOptions.AddExtension}
              isReadOnly={
                isModalOpen?.modalName === PayPackageOptions.editScenario &&
                selectBookingPeriodDetails?.packageName !== PackageType.Assignment // comparing with packagename , will update once flag is introduced
              }
            />
          </Grid>
        </Grid>
        <MarginToolTextArea
          name="notes"
          id="marginTool-addScenarioModal-notesTextfield"
          disabled={false}
          label={t('marginTool.labels.notes')}
          error={!!errors?.notes}
          helperText={errors?.notes ? errors?.notes?.message : undefined}
          handleChange={(event: React.ChangeEvent<HTMLInputElement>) => handleTextChange(event)}
        />
      </Grid>
      <Divider className={classes.divider} />
      {/* splits section */}
      <Grid container item>
        <Grid container item direction="column">
          {splitsFields?.map((field, fieldIndex) => {
            return (
              <>
                <Box key={field?.id}>
                  <Grid container item sx={{ mb: '3px', mt: '12px' }} alignItems="center" justifyContent="space-between">
                    <Grid item>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        {!fieldIndex &&
                        splitsFields?.length === 1 &&
                        (isAddScenario || isEditScenario || isAddExtension)
                          ? t('marginTool.components.assignment.title')
                          : t('marginTool.components.split.title', { splitNumber: fieldIndex + 1 })}
                      </Typography>
                    </Grid>
                    <Grid item>
                      {!fieldIndex && (isAddScenario || isEditScenario || isAddExtension) && (
                        <CustomTooltip
                          tooltipContent={t('marginTool.tooltip.disabledSplitCreation')}
                          hideToolTip={isSplitAllowed}
                        >
                          <Button
                            onClick={() => createSplits()}
                            startIcon={<CallSplitIcon className={classes.splitIcon} />}
                            classes={{ root: classes.splitButton }}
                            disabled={!isSplitAllowed}
                            disableRipple
                          >
                            {t('marginTool.buttons.split')}
                          </Button>
                        </CustomTooltip>
                      )}
                    </Grid>
                  </Grid>
                  <Grid>
                    <SplitsWrapper
                      handleHoursPerShiftChange={handleHoursPerShiftChange}
                      handleShiftChange={handleShiftChange}
                      fieldIndex={fieldIndex}
                      field={field as IScenarioSplit}
                      removeSplitsField={(currentIndex: number) => removeSplitsField(currentIndex)}
                      splitsFields={splitsFields as Array<IScenarioSplit>}
                    />
                  </Grid>
                </Box>
              </>
            );
          })}
        </Grid>
      </Grid>
    </Grid>
  );
};
