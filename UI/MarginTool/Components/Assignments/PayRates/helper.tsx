import React from 'react';
import { orderBy } from 'lodash';
import { PayRateFieldNames } from './enum';
import { defaultValue, getDynamicPSFTValue, getValueAsFloat } from '../BillRates/helper';
import { GenericTooltip } from '@AMIEWEB/Common/genericTooltip/GenericTooltip';
import { TFunction } from 'i18next';
import _ from 'lodash';
import { IconButton, Typography } from 'amn-ui-core';
import infoIconSvg from 'app/assets/images/infoIcon.svg';
import { GetChargeRateTooltip, PayRateTooltip } from './PayRateTooltip';
import { missingField } from 'app/constants';
import { PayPackageDetailsValuesSubCategory } from '@AMIEWEB/MarginTool/enum';
import { IPlacementMarginDetailsResponseScenarioSplitPayPackageDetailsValue, MarginDetailsResponseScenarioSplitItem } from 'store/redux-store/margin-tool/slices/add-edit-scenario/add-edit-scenario.model';
import { ITypeAheadOption } from '@AMIEWEB/Candidate/CandidateProfile/CandidateTabPanel/PreferencesTab/CustomComponents/ControlledTypeAhead';

export const helperTextWithInfoIcon = (
  otherRate: string,
  otherRateValue: string,
  payRateValue: string,
  t: TFunction,
) => {
  const getHoverMessage = (calculationType: string, calculationRate: string) => {
    return t('marginTool.components.assignment.billRates.hoverToolTipMessage', {
      calculationType,
      calculationRate,
    });
  };

  const calculationType =
    otherRate === PayRateFieldNames.callBackFactor
      ? t('marginTool.labels.callBackFactor')
      : t('marginTool.labels.holidayFactor');
  const calculationRate = getDynamicPSFTValue(otherRateValue);
  const hoverMessage = getHoverMessage(calculationType, calculationRate);
  return (
    <>
      {getHelperAmount(otherRate, otherRateValue, payRateValue, t)}
      <GenericTooltip
        disableInteractive={false}
        placement={'bottom-end'}
        title={_.split(hoverMessage, '\n').map((str, ix) => (
          <Typography variant={'body2'} key={ix}>
            {str}
          </Typography>
        ))}
      >
        <IconButton sx={{ padding: '0px !important' }} disableRipple disableFocusRipple disableTouchRipple>
          <img alt={'info'} src={infoIconSvg} style={{ paddingLeft: '5px' }} />
        </IconButton>
      </GenericTooltip>
    </>
  );
};

export const getHelperAmount = (otherRate: string, otherRateValue: string, payRateValue: string, t: TFunction) => {
  return `(${t('marginTool.labels.amount')}: $${getCalculatedAmount(otherRate, otherRateValue, payRateValue)})`;
};

export const getValueAsFloatWithMissingField = number => {
  return number && number !== 0 ? parseFloat(number).toFixed(2) : missingField;
};

interface SplitData {
  isAlliedTrue: boolean;
  minPayRate: number;
}

export const getPayRateHelperText = (splitData: SplitData, splitIndex: number, t: TFunction) => {
  return !splitData?.isAlliedTrue ? (
    `(${t('marginTool.components.assignment.payRate.helperText')} $${
      getValueAsFloat(splitData?.minPayRate) !== '' ? getValueAsFloat(splitData?.minPayRate) : defaultValue
    })`
  ) : (
    <>
      <PayRateTooltip
        splitIndex={splitIndex}
        helperText={`(${t('marginTool.components.assignment.payRate.helperText')} $${
          getValueAsFloat(splitData?.minPayRate) !== '' ? getValueAsFloat(splitData?.minPayRate) : defaultValue
        })`}
      />
    </>
  );
};

export const getPayChargeHelperText = (field: MarginDetailsResponseScenarioSplitItem) => {
  return <GetChargeRateTooltip field={field} />;
};

/**
 * Formats an array of options for type-ahead components.
 */
export const formatTypeAheadOptions = options => {
  const payRateOptions = orderBy(options, ['id'], ['asc']).map(item => {
    const isNone = item.description.toLowerCase() === 'none';

    return {
      label: isNone ? item.description : parseFloat(item.description).toFixed(2),
      object: {
        id: parseInt(item?.id),
        description: isNone ? item.description : parseFloat(item.description).toFixed(2),
      },
    };
  });
  return payRateOptions;
};

export const getAdditionalPremiumPay = (
  payPackageDetailsValues: IPlacementMarginDetailsResponseScenarioSplitPayPackageDetailsValue[],
  additionalPremiumPayOptions: ITypeAheadOption[],
) => {
  const matchingItems = payPackageDetailsValues.filter(
    item => item?.subCategory === PayPackageDetailsValuesSubCategory.additionalPremiumPay,
  );
  if (matchingItems.length === 0) {
    return null;
  }
  const additionalPremiumPayValues = matchingItems.map(matchingItem =>
    additionalPremiumPayOptions.find(item => item?.object?.id === matchingItem?.pickListId)
  );
  return additionalPremiumPayValues.length === 1 ? additionalPremiumPayValues[0] : additionalPremiumPayValues;
};

/**
 * Calculates the amount based on the provided pay rate and other rate values.
 */
export const getCalculatedAmount = (otherRate: string, otherRateValue: string, payRateValue: string) => {
  switch (otherRate) {
    case PayRateFieldNames.overtimeFactor:
    case PayRateFieldNames.doubleTimeFactor:
    case PayRateFieldNames.additionalPremiumPay:
      return payRateValue && otherRateValue && otherRateValue !== '' && payRateValue !== ''
        ? `${(parseFloat(payRateValue) * parseFloat(otherRateValue ? otherRateValue : defaultValue)).toFixed(2)}`
        : defaultValue;
    case PayRateFieldNames.callBackFactor:
    case PayRateFieldNames.holidayFactor:
      return payRateValue && otherRateValue && otherRateValue !== '' && payRateValue !== ''
        ? `${(parseFloat(payRateValue) * (1 + parseFloat(otherRateValue ? otherRateValue : defaultValue))).toFixed(2)}`
        : defaultValue;
    default:
      return defaultValue;
  }
};
