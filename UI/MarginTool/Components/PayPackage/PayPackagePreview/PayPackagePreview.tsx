import { Box, Divider, Grid, Typography } from 'amn-ui-core';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import TaxableIcon from 'app/assets/images/MarginTool/Pay_Package/TaxableIcon.svg';
import ReceiptIcon from 'app/assets/images/MarginTool/Pay_Package/ReceiptIcon.svg';
import { usePromiseTracker } from 'react-promise-tracker';
import { usePayPackagePreviewStyles } from './PayPackagePreviewStyles';
import { formatDateObj } from '@AMIEWEB/MarginTool/helper';
import { amnHousingFields, getWeeklyCalculatedValue, ValueAccumulator, weeklyTotalFields } from './helper';
import { useFormContext, useWatch } from 'react-hook-form';
import { transformTreeViewData, useTreeLookupByCategoryName } from '../../Assignments/helper';
import { TreeViewLookupTypes } from '../../Assignments/enum';
import { travelerContainerFields } from './helper';
import {
  AdditionalFurnitureList,
  IconHelperDetails,
  HousingIndividualContainer,
  InsuranceDetails,
  PayOutIndividualContainer,
  PaySplitHeader,
  PaySplitSubHeader,
  SkeletonBody,
  TotalAmounts,
  WeeklyIndividualContainer,
} from './HelperComponents';
import { useSelector } from 'react-redux';
import { selectSelectedScenario } from 'store/redux-store/margin-tool/slices/add-edit-scenario/add-edit-scenario.selector';
import { getExtensionDuration } from 'app/helpers/getExtensionDuration';
import moment from 'moment';
import { PromiseTrackerKeys } from 'app/constants/PromiseTrackerKeys';
import { BonusFields, FieldType, HousingType, PreviewContainerFieldNames } from '../enum';

export const PayPackagePreview = () => {
  let payoutsTotal = 0;
  let splitsTotal = 0;
  const { t } = useTranslation();
  const { watch } = useFormContext();
  const { classes } = usePayPackagePreviewStyles();
  const travelerContainerValues = useWatch({ name: travelerContainerFields?.map(x => x?.fieldName) });
  const reimbursementContainerValues = watch('assignment.reimbursementFieldArray');
  const bonusContainerValues = watch('assignment.bonusesFieldArray');
  const assignmentSplitValues = watch('assignmentSplits');
  const selectedScenario = useSelector(selectSelectedScenario);
  const reimbursementOptions = useTreeLookupByCategoryName(TreeViewLookupTypes.Reimbursements);
  const bonusesOptions = useTreeLookupByCategoryName(TreeViewLookupTypes.BonusType);
  const reimbursementFields = useMemo(() => {
    if (!reimbursementOptions || Array.isArray(reimbursementOptions)) return [];
    return transformTreeViewData(reimbursementOptions?.fields)
      ?.flatMap(item => item?.children ?? [])
      ?.map(child => child?.name ?? '');
  }, [reimbursementOptions]);
  const matchedReimbursementFields = useMemo(
    () =>
      reimbursementFields?.filter(value =>
        reimbursementContainerValues?.flatMap(x => x?.reimbursementType).includes(value),
      ),
    [reimbursementFields, reimbursementContainerValues],
  );
  const bonusesFields = useMemo(() => {
    if (!bonusesOptions || Array.isArray(bonusesOptions)) return [];
    const fields = bonusesOptions?.fields;
    if (fields?.length === 0) return [];
    return fields[0]?.items?.map(item => item?.description) ?? [];
  }, [bonusesOptions]);
  const matchedBonusesFields = useMemo(
    () => bonusesFields?.filter(value => bonusContainerValues?.flatMap(x => x?.bonusType).includes(value)),
    [bonusesFields, bonusContainerValues],
  );
  const memoizedIcons = useMemo(() => {
    return {
      ReceiptIcon: ReceiptIcon,
      TaxableIcon: TaxableIcon,
    };
  }, []);

  const { promiseInProgress: isScenarioDataLoading } = usePromiseTracker({
    area: PromiseTrackerKeys.marginTool.scenarioNavigationData,
    delay: 0,
  });
  return (
    <>
      <Grid container item className={classes.formStyle} id="marginTool-marginToolDetailsPage-payPackagesContainer">
        <Grid container item className={classes.headerContainer}>
          <Typography sx={{ fontWeight: 'bold' }} variant="subtitle1">
            {t('marginTool.payPackagePreview.title')}
          </Typography>
        </Grid>
        {!isScenarioDataLoading && selectedScenario?.scenarioId > 0 ? (
          <Grid container direction={'row'} className={classes.container}>
            <IconHelperDetails t={t} customClass={classes} />
            <InsuranceDetails t={t} customClass={classes} />
            <Grid container>
              <Grid container className={classes.secondContainer}>
                <Grid item>
                  <Typography variant={'subtitle2'} className={classes.headerTitle}>
                    {t('marginTool.payPackagePreview.onetimeReimbursementsPayouts')}
                  </Typography>
                </Grid>
              </Grid>
              {travelerContainerFields?.map((eachField, index) => {
                if (!travelerContainerValues?.hasOwnProperty(eachField?.fieldName)) return null;
                const totalFieldValue = Number(travelerContainerValues[eachField?.fieldName]);
                if (!totalFieldValue) return null;

                payoutsTotal += totalFieldValue;
                const altText = `traveler-${eachField?.fieldTitle}-${index}`;

                return (
                  <React.Fragment key={index}>
                    <PayOutIndividualContainer
                      iconSrc={memoizedIcons?.ReceiptIcon}
                      altText={altText}
                      title={eachField?.fieldTitle}
                      value={totalFieldValue}
                      index={index}
                      customClass={classes}
                    />
                  </React.Fragment>
                );
              })}

              {reimbursementContainerValues?.length > 0 &&
                matchedReimbursementFields?.map((eachField, index) => {
                  const fieldValue = reimbursementContainerValues
                    ?.filter(x => x?.reimbursementType === eachField)
                    ?.flatMap(x => x?.reimbursementAmount);
                  const iconType = reimbursementContainerValues?.find(
                    x => x?.reimbursementType === eachField && x?.isReimbursementRequired === true,
                  );
                  const totalFieldValue = ValueAccumulator(fieldValue);

                  if (!totalFieldValue) return null;

                  payoutsTotal += totalFieldValue;
                  const iconSrc = iconType ? memoizedIcons?.ReceiptIcon : memoizedIcons?.TaxableIcon;
                  const altText = `reimbursement-${eachField}-${index}`;

                  return (
                    <React.Fragment key={index}>
                      <PayOutIndividualContainer
                        iconSrc={iconSrc}
                        altText={altText}
                        title={eachField}
                        value={totalFieldValue}
                        index={index}
                        customClass={classes}
                      />
                    </React.Fragment>
                  );
                })}

              {bonusContainerValues?.length > 0 &&
                matchedBonusesFields?.map((eachField, index) => {
                  const fieldValue = bonusContainerValues
                    ?.filter(x => x?.bonusType === eachField)
                    ?.flatMap(x => x?.bonusAmount);
                  const totalFieldValue =
                    eachField === BonusFields?.facilityCompletion || eachField === BonusFields?.facilitySignOn
                      ? ValueAccumulator(fieldValue) * 0.8
                      : ValueAccumulator(fieldValue);
                  if (!totalFieldValue) return null;

                  payoutsTotal += totalFieldValue;
                  const iconSrc = memoizedIcons?.TaxableIcon;
                  const altText = `bonus-${eachField}-${index}`;
                  return (
                    <React.Fragment key={index}>
                      <PayOutIndividualContainer
                        iconSrc={iconSrc}
                        altText={altText}
                        title={eachField}
                        value={totalFieldValue}
                        index={index}
                        customClass={classes}
                      />
                    </React.Fragment>
                  );
                })}
              <Grid container className={classes.individualContainer}>
                <TotalAmounts
                  title={t('marginTool.payPackagePreview.total')}
                  totalAmount={payoutsTotal}
                  customClass={classes}
                />
              </Grid>
            </Grid>
            <Grid className={classes.divider}>
              <Divider />
            </Grid>
            <>
              {assignmentSplitValues?.length > 0 &&
                assignmentSplitValues?.map((eachSplit, index) => {
                  let eachSplitTotal = 0;
                  const eachSplitItem = selectedScenario?.splits[index];
                  const startDateMoment = moment(eachSplitItem?.effectiveStartDate);
                  const endDateMoment = moment(eachSplitItem?.effectiveEndDate);
                  const splitDuration = getExtensionDuration(startDateMoment, endDateMoment);
                  const hoursPerWeek = eachSplitItem?.hoursPerWeek;
                  const hoursPerShift = eachSplitItem?.hoursPerShift;
                  const housingType = eachSplit?.housingType?.label;
                  const furnitureCosts = eachSplitItem?.furnitureCosts;
                  const housingCheck =
                    housingType && housingType !== HousingType.NoHousing && housingType !== undefined;
                  return (
                    <React.Fragment key={index}>
                      <PaySplitHeader t={t} customClass={classes} index={index} eachSplit={eachSplitItem} />
                      <PaySplitSubHeader t={t} customClass={classes} eachSplit={eachSplitItem} />
                      {weeklyTotalFields?.map((eachField, idx1) => {
                        if (!eachSplit?.hasOwnProperty(eachField?.fieldName)) return null;
                        const fieldValue = eachSplit[eachField?.fieldName];
                        if (!fieldValue) return null;
                        const totalFieldValue = getWeeklyCalculatedValue(
                          eachField?.fieldName,
                          fieldValue,
                          hoursPerWeek,
                          hoursPerShift,
                        );
                        if (!totalFieldValue) return null;
                        eachSplitTotal += totalFieldValue;
                        return (
                          <React.Fragment key={idx1}>
                            <WeeklyIndividualContainer
                              index={idx1}
                              field={eachField}
                              fieldValue={fieldValue}
                              totalValue={totalFieldValue}
                              customClass={classes}
                            />
                          </React.Fragment>
                        );
                      })}
                      <Grid container sx={{ display: 'none' }}>
                        {eachSplitTotal > 0 && splitDuration > 0 && (splitsTotal += eachSplitTotal * splitDuration)}
                      </Grid>
                      <Grid container className={classes.individualContainer}>
                        <TotalAmounts
                          title={t('marginTool.payPackagePreview.weeklyTotal')}
                          totalAmount={eachSplitTotal}
                          customClass={classes}
                        />
                      </Grid>
                      <Grid className={classes.divider}>
                        <Divider />
                      </Grid>

                      {housingCheck && (
                        <Grid container>
                          <Grid container className={classes.individualContainer}>
                            <Grid item md={6}>
                              <Typography sx={{ fontWeight: 'bolder', fontSize: '1rem' }} variant={'subtitle2'}>
                                {t('marginTool.payPackagePreview.amnHousing')}
                              </Typography>
                            </Grid>
                            <Grid item md={6}>
                              <Typography className={classes.contentValue}>{housingType}</Typography>
                            </Grid>
                          </Grid>
                          {amnHousingFields?.map((eachField, idx2) => {
                            if (eachField?.fieldType === FieldType.number) {
                              const fieldValue = eachSplit?.hasOwnProperty(eachField?.fieldName)
                                ? eachSplit[eachField?.fieldName]
                                : undefined;
                              if (!fieldValue) return null;

                              const totalFieldValue =
                                eachField?.fieldName === PreviewContainerFieldNames.additionalFurniture
                                  ? Number(fieldValue)
                                  : Number(((fieldValue * 12) / 52)?.toFixed(2));
                              if (!totalFieldValue) return null;
                              return (
                                <Grid container className={classes.individualContainerHousing} key={idx2}>
                                  <HousingIndividualContainer
                                    fieldType={FieldType.number}
                                    fieldTitle={eachField?.fieldTitle}
                                    fieldValue={totalFieldValue}
                                    fieldTitleWidth={8}
                                    fieldValueWidth={4}
                                  />
                                </Grid>
                              );
                            } else if (eachField?.fieldType === FieldType.date) {
                              const fieldValue = eachSplit?.hasOwnProperty(eachField?.fieldName)
                                ? eachSplit[eachField?.fieldName]
                                : undefined;

                              if (!fieldValue) return null;

                              return (
                                <Grid container className={classes.individualContainerHousing} key={idx2}>
                                  <HousingIndividualContainer
                                    fieldType={FieldType.date}
                                    fieldTitle={eachField?.fieldTitle}
                                    fieldValue={formatDateObj(fieldValue)}
                                    fieldTitleWidth={6}
                                    fieldValueWidth={6}
                                  />
                                </Grid>
                              );
                            }
                          })}
                          <AdditionalFurnitureList furnitureCosts={furnitureCosts} customClass={classes} />
                          <Grid item sx={{ padding: 0, width: '100%' }}>
                            <Divider />
                          </Grid>
                        </Grid>
                      )}
                    </React.Fragment>
                  );
                })}
            </>
            <Grid container className={classes.PayPackageContainer}>
              <TotalAmounts
                title={t('marginTool.payPackagePreview.payPackageAmount')}
                totalAmount={payoutsTotal + splitsTotal}
                customClass={classes}
              />
            </Grid>
          </Grid>
        ) : isScenarioDataLoading ? (
          <SkeletonBody customClass={classes} />
        ) : (
          <Box className={classes.scenarioNavigationEmptyContainer} style={{ border: 'none' }}></Box>
        )}
      </Grid>
    </>
  );
};
