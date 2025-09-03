import { Box, Divider, Grid, Skeleton, Typography } from 'amn-ui-core';
import React from 'react';
import { usePayPackagePreviewStyles } from './PayPackagePreviewStyles';
import TaxableIcon from 'app/assets/images/MarginTool/Pay_Package/TaxableIcon.svg';
import ReceiptIcon from 'app/assets/images/MarginTool/Pay_Package/ReceiptIcon.svg';
import NonTaxableIcon from 'app/assets/images/MarginTool/Pay_Package/NonTaxableIcon.svg';
import { selectSelectedScenario } from 'store/redux-store/margin-tool/slices/add-edit-scenario/add-edit-scenario.selector';
import { useSelector } from 'react-redux';
import { formattedNumber } from './helper';
import { formatDateObj } from '@AMIEWEB/MarginTool/helper';
import { missingField } from 'app/constants';
import { TFunction } from 'i18next';
import { MarginDetailsResponseScenarioSplitItem } from 'store/redux-store/margin-tool/slices/add-edit-scenario/add-edit-scenario.model';
import { DurationType, FieldType, IconType, PreviewContainerFieldNames } from '../enum';
import { IFurnitureCosts } from '@AMIEWEB/MarginTool/IMarginToolSave';

export const IconHelperDetails = ({ t, customClass }: { t: TFunction; customClass: Record<string, string> }) => {
  return (
    <Grid container className={customClass.helperContainer}>
      <Grid xs={0.5} item>
        <img src={ReceiptIcon} alt="helper-receipt" />
      </Grid>
      <Grid xs={7.5} item>
        <Typography className={customClass.helperContent}>
          {t('marginTool.payPackagePreview.receiptOrFormRequired')}
        </Typography>
      </Grid>
      <Grid xs={0.5} item>
        <img src={TaxableIcon} alt="helper-taxable" />
      </Grid>
      <Grid xs={3.5} item>
        <Typography className={customClass.helperContent}>{t('marginTool.payPackagePreview.taxable')}</Typography>
      </Grid>
    </Grid>
  );
};

export const InsuranceDetails = ({ t, customClass }: { t: TFunction; customClass: Record<string, string> }) => {
  const selectedScenario = useSelector(selectSelectedScenario);
  return (
    <>
      <Grid container className={customClass.insurance}>
        <Grid item xs={7}>
          <Typography variant={'subtitle2'}>{t('marginTool.payPackagePreview.insuranceEffectiveDate')}</Typography>
        </Grid>
        <Grid item xs={5}>
          <Typography className={customClass.contentValue}>
            {selectedScenario?.insuranceEffectiveDate ? 
            formatDateObj(selectedScenario?.insuranceEffectiveDate) : missingField}
          </Typography>
        </Grid>
      </Grid>
      <Grid className={customClass.divider}>
        <Divider />
      </Grid>
    </>
  );
};

export const PayOutIndividualContainer = ({
  iconSrc,
  altText,
  title,
  value,
  index,
  customClass,
}: {
  iconSrc: string;
  altText: string;
  title: string;
  value: number;
  index: number;
  customClass: Record<string, string>;
}) => {
  if (!value) return null;
  return (
    <>
      <Grid container className={customClass.individualContainer} key={index}>
        <Grid item xs={0.5}>
          <img src={iconSrc} alt={altText} />
        </Grid>
        <Grid item xs={7.5}>
          <Typography variant="subtitle2" className={customClass.contentTitle}>
            {title}
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography className={customClass.contentValue}>{`$ ${formattedNumber(value?.toFixed(2))}`}</Typography>
        </Grid>
      </Grid>
    </>
  );
};

export const PaySplitHeader = ({
  t,
  customClass,
  index,
  eachSplit,
}: {
  t: TFunction;
  customClass: Record<string, string>;
  index: number;
  eachSplit: MarginDetailsResponseScenarioSplitItem;
}) => {
  return (
    <>
      <Grid container className={customClass.individualContainer}>
        <Grid item md={4}>
          <Typography variant={'subtitle2'} className={customClass.headerTitle} sx={{ lineHeight: 1.4 }}>
            {`${t('marginTool.payPackagePreview.paySplit')} ${index + 1}`}
          </Typography>
        </Grid>
        <Grid item md={8}>
          <Typography className={customClass.contentValue}>
            {`${
              eachSplit?.effectiveStartDate && eachSplit?.effectiveEndDate
                ? formatDateObj(eachSplit?.effectiveStartDate) + ' - ' + formatDateObj(eachSplit?.effectiveEndDate)
                : ''
            }`}
          </Typography>
        </Grid>
      </Grid>
    </>
  );
};

export const PaySplitSubHeader = ({
  t,
  customClass,
  eachSplit,
}: {
  t: TFunction;
  customClass: Record<string, string>;
  eachSplit: MarginDetailsResponseScenarioSplitItem;
}) => {
  return (
    <>
      <Grid container className={customClass.individualContainerWeekly}>
        <Grid item md={12}>
          <Typography component={'span'} sx={{ fontSize: '13px' }}>
            <Typography component={'span'} sx={{ fontWeight: 500, letterSpacing: '0.05em', paddingRight: 1 }}>
              {t('marginTool.payPackagePreview.weeklyPay')}
            </Typography>
            {`   ${t('marginTool.payPackagePreview.hrsPerWeek')} ${eachSplit?.hoursPerWeek ?? missingField}, ${t(
              'marginTool.payPackagePreview.hrsPerShift',
            )} ${eachSplit?.hoursPerShift ?? missingField}, ${t('marginTool.payPackagePreview.shift')} ${
              eachSplit?.shift ?? missingField
            }`}
          </Typography>
        </Grid>
      </Grid>
    </>
  );
};

export const WeeklyIndividualContainer = ({
  index,
  field,
  fieldValue,
  totalValue,
  customClass,
}: {
  index: number;
  field: {
    fieldTitle: string;
    fieldName: PreviewContainerFieldNames;
    IconType: IconType;
    durationType: DurationType | string;
  };
  fieldValue: number | string;
  totalValue: number;
  customClass: Record<string, string>;
}) => {
  const iconSrc = field?.IconType === 'Tax' ? TaxableIcon : NonTaxableIcon;
  const altText = `weekly-${field.fieldName}-${index}`;
  return (
    <>
      <Grid container className={customClass.individualContainer} key={index}>
        <Grid item xs={0.5}>
          <img src={iconSrc} alt={altText} />
        </Grid>
        <Grid item xs={8.5}>
          <Typography variant="subtitle2" className={customClass.contentTitle}>
            {`${field?.fieldTitle} ($${formattedNumber(parseFloat(fieldValue?.toString())?.toFixed(2))}${
              field?.durationType !== '' ? '/' + field?.durationType : ''
            }) `}
          </Typography>
        </Grid>
        <Grid item xs={3}>
          <Typography className={customClass.contentValue}>{`$ ${totalValue?.toFixed(2)}`}</Typography>
        </Grid>
      </Grid>
    </>
  );
};

export const HousingIndividualContainer = ({
  fieldType,
  fieldTitle,
  fieldValue,
  fieldTitleWidth,
  fieldValueWidth,
}: {
  fieldType: FieldType;
  fieldTitle: string;
  fieldValue: any;
  fieldTitleWidth: number;
  fieldValueWidth: number;
}) => {
  const { classes } = usePayPackagePreviewStyles();
  return (
    <>
      <Grid item xs={fieldTitleWidth}>
        <Typography variant="subtitle2" className={classes.contentTitle}>
          {fieldTitle}
        </Typography>
      </Grid>
      <Grid item xs={fieldValueWidth}>
        <Typography className={classes.contentValue}>
          {fieldType === FieldType.number
            ? `$ ${formattedNumber(parseFloat(fieldValue?.toString())?.toFixed(2))}`
            : fieldValue}
        </Typography>
      </Grid>
    </>
  );
};

export const AdditionalFurnitureList = ({
  customClass,
  furnitureCosts,
}: {
  customClass: Record<string, string>;
  furnitureCosts: IFurnitureCosts[];
}) => {
  return (
    <>
      {furnitureCosts?.length > 0 &&
        furnitureCosts?.map((eachFurniture, idx2) => {
          if (eachFurniture?.quantity <= 0) return null;
          return (
            <>
              <Grid container className={customClass.individualContainerHousing} key={idx2}>
                <Grid item xs={8}>
                  <Typography variant="subtitle2" className={customClass.contentTitle}>
                    {eachFurniture?.description}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography className={customClass.contentValue}>{eachFurniture?.quantity}</Typography>
                </Grid>
              </Grid>
            </>
          );
        })}
    </>
  );
};

export const TotalAmounts = ({
  title,
  totalAmount,
  customClass,
}: {
  title: string;
  totalAmount: number;
  customClass: Record<string, string>;
}) => {
  return (
    <>
      <Grid item xs={7}>
        <Typography variant={'subtitle2'} className={customClass.headerTitle}>
          {title}
        </Typography>
      </Grid>
      <Grid item xs={5}>
        <Typography className={customClass.headerValue}>{`$ ${formattedNumber(
          parseFloat(totalAmount?.toString())?.toFixed(2),
        )}`}</Typography>
      </Grid>
    </>
  );
};

export const SkeletonBody = ({ customClass }: { customClass: Record<string, string> }) => {
  return (
    <>
      <Box
        className={customClass.scenarioNavigationEmptyContainer}
        id="marginTool-marginToolDetailsPage-packagePreview"
      >
        <Skeleton variant="rectangular" className={customClass.skeletonBody} />
        <Skeleton variant="rectangular" className={customClass.skeletonBody} />
        <Skeleton variant="rectangular" className={customClass.skeletonBody} />
        <Skeleton variant="rectangular" className={customClass.skeletonBody} />
        <Skeleton variant="rectangular" className={customClass.skeletonBody} />
      </Box>
    </>
  );
};
