import { Box, IconButton, Typography } from 'amn-ui-core';
import React from 'react';
import { getMultiplyAmount, getPSFTAmount, getSumAmount, getValueAsFloat } from './helper';
import { TFunction } from 'i18next';
import { GenericTooltip } from '@AMIEWEB/Common/genericTooltip/GenericTooltip';
import infoIconSvg from 'app/assets/images/infoIcon.svg';
import { missingField } from 'app/constants';
import { MarginDetailsResponseScenarioSplitItem } from 'store/redux-store/margin-tool/slices/add-edit-scenario/add-edit-scenario.model';

export const getHelperSumAmount = (otherRateValue: string, billRateValue: string, t: TFunction) => {
  return (
    <>
      <Typography component="span" variant={'body2'}>{`(${t('marginTool.labels.amount')}: $ ${getSumAmount(
        otherRateValue,
        billRateValue,
      )})`}</Typography>
    </>
  );
};

export const getHelperMultiplyAmount = (otherRateValue: string, billRateValue: string, t: TFunction) => {
  return (
    <>
      <Typography component="span" variant={'body2'}>{`(${t('marginTool.labels.amount')}: $ ${getMultiplyAmount(
        otherRateValue,
        billRateValue,
      )})`}</Typography>
    </>
  );
};

export const helperTextWithInfoIcon = (
  otherRateValue: string,
  billRateValue: string,
  hoverMessage: string,
  t: TFunction,
) => {
  return (
    <>
      <Typography component="span" variant={'body2'}>{`(${t('marginTool.labels.amount')}: $ ${getPSFTAmount(
        otherRateValue,
        billRateValue,
      )})`}</Typography>
      <GenericTooltip
        placement={'bottom-end'}
        title={
          <Typography variant={'body2'} sx={{ whiteSpace: 'pre-line' }}>
            {hoverMessage}
          </Typography>
        }
      >
        <IconButton sx={{ padding: '0px !important' }} disableRipple disableFocusRipple disableTouchRipple>
          <img alt={'info'} src={infoIconSvg} style={{ paddingLeft: 5 }} />
        </IconButton>
      </GenericTooltip>
    </>
  );
};

export const getContractChargeRateTooltip = (field: MarginDetailsResponseScenarioSplitItem, t: TFunction) => {
  const chargeRates = [
    {
      title: t('marginTool.components.assignment.billRates.tooltip.contractRegularRate'),
      rate: field?.contractRegularBillRate ? `$${getValueAsFloat(field?.contractRegularBillRate)}` : missingField,
    },
    {
      title: t('marginTool.components.assignment.billRates.tooltip.contractChargeAmount'),
      rate: field?.contractChargeAmount ? `$${getValueAsFloat(field?.contractChargeAmount)}` : missingField,
    },
    {
      title: t('marginTool.components.assignment.billRates.tooltip.contractShift'),
      rate: field?.contractShiftDescription ? `${field?.contractShiftDescription} ${t('marginTool.components.assignment.billRates.tooltip.hr')}` : missingField,
    },
  ];

  const tooltipContent = (
    <Box sx={{ padding: 0.5 }}>
      {chargeRates.map((item, index) => (
        <Box key={index} display="flex" justifyContent="space-between" alignItems="center" sx={{ mt: 0.5 }}>
          <Typography variant="body2">{item.title}</Typography>
          <Typography variant="body2" sx={{ pl: 2 }}>
            {item.rate}
          </Typography>
        </Box>
      ))}
    </Box>
  );

  return (
    <>
      <GenericTooltip placement={'bottom'} disableInteractive={false} title={tooltipContent}>
        <IconButton sx={{ padding: '0px !important' }} disableRipple disableFocusRipple disableTouchRipple>
          <img alt={'info'} src={infoIconSvg} />
        </IconButton>
      </GenericTooltip>
    </>
  );
};
