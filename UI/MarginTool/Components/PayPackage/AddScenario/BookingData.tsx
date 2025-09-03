import React from 'react';
import { MarginToolCheckbox } from '@AMIEWEB/MarginTool/Common/MarginToolCheckbox';
import { Divider, Grid } from 'amn-ui-core';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { formatDate } from '@AMIEWEB/MarginTool/helper';
import { MarginToolCardTitle } from '../../../Common/MarginToolCardTitle';
import { DatesAndDuration } from './DatesAndDuration';
import MarginToolTextField from '@AMIEWEB/MarginTool/Common/MarginToolTextField';
import { useTheme } from 'amn-ui-core';
import {
  selectAddExtention,
  selectAddScenario,
  selectBookingPeriod,
  selectCurrentEditScenarioDetails,
  selectScenarioModalState,
  selectSelectedScenario,
} from 'store/redux-store/margin-tool/slices/add-edit-scenario/add-edit-scenario.selector';
import { PackageType, PayPackageOptions } from '@AMIEWEB/MarginTool/enum';
import { useAddScenarioStyles } from './AddScenario.styles';
import { disableExtension, disableExtensionOfPriorPlacementID } from './helper';
import { useIsAssignmentScenario } from '@AMIEWEB/MarginTool/hooks';
import { missingField } from 'app/constants';

const BookingData = () => {
  const { classes } = useAddScenarioStyles();
  const theme = useTheme();
  const { setValue, watch, errors, clearErrors } = useFormContext();
  const { t } = useTranslation();
  const addScenario = useSelector(selectAddScenario);
  const addExtension = useSelector(selectAddExtention);
  const selectedScenario = useSelector(selectSelectedScenario);
  const selectBookingPeriodDetails = useSelector(selectBookingPeriod);
  const editScenarioFormDetails = useSelector(selectCurrentEditScenarioDetails);
  const extensionValue = watch('isInExtension');
  const isModalOpen = useSelector(selectScenarioModalState);
  const isAssignmentScenario = selectBookingPeriodDetails?.packageName === PackageType.Assignment; // comparing with packagename , will update once flag is introduced
  const isExtensionDisabled = disableExtension(isModalOpen?.modalName, isAssignmentScenario, addScenario);
  const isExtensionOfPriorPlacementIDDisabled = disableExtensionOfPriorPlacementID(
    isModalOpen?.modalName,
    isAssignmentScenario,
    extensionValue,
    addScenario?.isExtensionFromPriorPlacementId,
  );
  const defaultExtensionOfPriorPlacementIDValue = watch('extensionOfPriorPlacementID');
  const { isFromAssignmentBookingPeriod } = useIsAssignmentScenario();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    let inputValue = event.target.value.replace(/[^0-9]/g, '');
    if (inputValue.length > 16) {
      inputValue = inputValue.slice(0, 16);
    }
    setValue('extensionOfPriorPlacementID', inputValue, { shouldValidate: true });
  };

  const title =
    isModalOpen?.modalName === PayPackageOptions.AddScenario
      ? addScenario?.placementId > 0
        ? addScenario?.placementId
        : missingField
      : isModalOpen?.modalName === PayPackageOptions.editScenario
      ? selectedScenario?.placementId
      : addExtension?.placementId > 0
      ? addExtension?.placementId
      : missingField;

  const customSubtitle =
    isModalOpen?.modalName === PayPackageOptions.AddScenario ? (
      addScenario?.placementDuration && addScenario?.placementStartDate && addScenario?.placementEndDate ? (
        <>
          <span
            style={{ color: theme.palette.framework.system.neutralGray, paddingLeft: '10px', paddingRight: '10px' }}
          >
            {'|'}
          </span>
          <span>
            {`${formatDate(addScenario?.placementStartDate)} - ${formatDate(addScenario?.placementEndDate)} (
            ${addScenario?.placementDuration} weeks)`}
          </span>
        </>
      ) : (
        ''
      )
    ) : isModalOpen?.modalName === PayPackageOptions.editScenario ? (
      editScenarioFormDetails?.duration && editScenarioFormDetails?.startDate && editScenarioFormDetails?.endDate ? (
        <>
          <span
            style={{ color: theme.palette.framework.system.neutralGray, paddingLeft: '10px', paddingRight: '10px' }}
          >
            {'|'}
          </span>
          <span>
            {`${formatDate(editScenarioFormDetails?.startDate)} - ${formatDate(editScenarioFormDetails?.endDate)} (
            ${editScenarioFormDetails?.duration} weeks)`}
          </span>
        </>
      ) : (
        ''
      )
    ) : addExtension?.placementDuration && addExtension?.placementStartDate && addExtension?.placementEndDate ? (
      <>
        <span style={{ color: theme.palette.framework.system.neutralGray, paddingLeft: '10px', paddingRight: '10px' }}>
          {'|'}
        </span>
        <span>
          {`${formatDate(addExtension?.placementStartDate)} - ${formatDate(addExtension?.placementEndDate)} (
          ${addExtension?.placementDuration} weeks)`}
        </span>
      </>
    ) : (
      ''
    );

  const handleExtensionChange = (extValue: boolean) => {
    if (!extValue) {
      setValue('extensionOfPriorPlacementID', '');
      clearErrors('extensionOfPriorPlacementID');
    }
  };

  return (
    <Grid container direction="column">
      <Grid item sx={{ mb: '12px' }}>
        <MarginToolCardTitle title={`PID ${title}`} customSubtitle={customSubtitle} />
      </Grid>
      <Grid container item>
        <DatesAndDuration />
      </Grid>
      <Divider className={classes.divider} />
      <Grid container item sx={{ paddingLeft: '11px' }} direction="row">
        <Grid item>
          <MarginToolCheckbox
            name="isInExtension"
            id="marginTool-addScenarioModal-isInExtensionCheckbox"
            defaultChecked={extensionValue}
            disabled={isExtensionDisabled || !isFromAssignmentBookingPeriod}
            label={
              isModalOpen?.modalName === PayPackageOptions.AddScenario ||
              isModalOpen?.modalName === PayPackageOptions.editScenario
                ? t('marginTool.labels.placementChange')
                : t('marginTool.labels.extensionFrom')
            }
            onHandleChange={(value: boolean) => handleExtensionChange(value)}
          />
        </Grid>
        <Grid item sx={{ width: '180px', marginLeft: '42px' }}>
          <MarginToolTextField
            onHandleChange={(event: React.ChangeEvent<HTMLInputElement>) => handleChange(event)}
            name="extensionOfPriorPlacementID"
            id="marginTool-addScenarioModal-placementIdTextfield"
            label={`${t('marginTool.labels.pidWithAsterisk')} ${extensionValue ? '*' : ''}`}
            rules={{ required: extensionValue ? 'Required' : false }}
            disabled={isExtensionOfPriorPlacementIDDisabled || !isFromAssignmentBookingPeriod}
            error={!!errors?.extensionOfPriorPlacementID}
            helperText={errors?.extensionOfPriorPlacementID ? errors?.extensionOfPriorPlacementID?.message : undefined}
            shrinkLabel={!!defaultExtensionOfPriorPlacementIDValue}
            defaultValue={extensionValue ? defaultExtensionOfPriorPlacementIDValue : ''}
          />
        </Grid>
      </Grid>
    </Grid>
  );
};

export default BookingData;
