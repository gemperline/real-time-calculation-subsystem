import React from 'react';
import { Box, IconButton, Typography } from 'amn-ui-core';
import infoIconSvg from 'app/assets/images/infoIcon.svg';
import { useTranslation } from 'react-i18next';
import { selectSelectedScenario } from 'store/redux-store/margin-tool/slices/add-edit-scenario/add-edit-scenario.selector';
import { useSelector } from 'react-redux';
import { GenericTooltip } from '@AMIEWEB/Common/genericTooltip/GenericTooltip';
import { missingField } from 'app/constants';
import { getValueAsFloatWithMissingField } from './helper';
import { getValueAsFloat } from '../BillRates/helper';
import { MarginDetailsResponseScenarioSplitItem } from 'store/redux-store/margin-tool/slices/add-edit-scenario/add-edit-scenario.model';

export const PayRateTooltip = ({ splitIndex, helperText }: { splitIndex: number; helperText: string }) => {
  const { t } = useTranslation();
  const scenario = useSelector(selectSelectedScenario);
  const splitData = scenario?.splits[splitIndex];

  const payRates = [
    {
      title: t('marginTool.components.assignment.payRate.tooltip.standard'),
      rate: splitData?.standardMinPayRate
        ? `$${getValueAsFloatWithMissingField(splitData?.standardMinPayRate)}`
        : missingField,
    },
    {
      title: t('marginTool.components.assignment.payRate.tooltip.tla'),
      rate: splitData?.standardTLAMinPayRate
        ? `$${getValueAsFloatWithMissingField(splitData?.standardTLAMinPayRate)}`
        : missingField,
    },
    {
      title: t('marginTool.components.assignment.payRate.tooltip.standardNewGrad'),
      rate: splitData?.standardNewGradPayRate
        ? `$${getValueAsFloatWithMissingField(splitData?.standardNewGradPayRate)}`
        : missingField,
    },
    {
      title: t('marginTool.components.assignment.payRate.tooltip.tlaNewGrad'),
      rate: splitData?.standardTLANewGradPayRate
        ? `$${getValueAsFloatWithMissingField(splitData?.standardTLANewGradPayRate)}`
        : missingField,
    },
    {
      title: t('marginTool.components.assignment.payRate.tooltip.teletherapy'),
      rate: splitData?.standardTeletherapy
        ? `$${getValueAsFloatWithMissingField(splitData?.standardTeletherapy)}`
        : missingField,
    },
  ];

  const tooltipContent = (
    <Box sx={{ padding: 1 }}>
      <Typography variant="body1">
        {t('marginTool.components.assignment.payRate.tooltip.disciplineMinPayRates')}
      </Typography>
      {payRates.map((item, index) => (
        <Box key={index} display="flex" justifyContent="space-between" alignItems="center" sx={{ mt: 0.5 }}>
          <Typography variant="body2">{item.title}</Typography>
          <Typography variant="body2">{item.rate}</Typography>
        </Box>
      ))}
    </Box>
  );

  return (
    <>
      {helperText}
      <GenericTooltip title={tooltipContent} placement={'bottom-end'} disableInteractive={false}>
        <IconButton sx={{ padding: '0px !important' }} disableRipple disableFocusRipple disableTouchRipple>
          <img alt={'info'} src={infoIconSvg} style={{ paddingLeft: '5px' }} />
        </IconButton>
      </GenericTooltip>
    </>
  );
};

export const GetChargeRateTooltip = ({ field }: { field: MarginDetailsResponseScenarioSplitItem }) => {
  const { t } = useTranslation();
  const chargeRates = [
    {
      title: t('marginTool.components.assignment.payRate.tooltip.payrollRegularRate'),
      rate: field?.payrollRegularPayRate ? `$${getValueAsFloat(field?.payrollRegularPayRate)}` : missingField,
    },
    {
      title: t('marginTool.components.assignment.payRate.tooltip.payrollChargeAmount'),
      rate: field?.payrollChargeAmount ? `$${getValueAsFloat(field?.payrollChargeAmount)}` : missingField,
    },
    {
      title: t('marginTool.components.assignment.payRate.tooltip.payrollShift'),
      rate: field?.payrollShiftDescription
        ? `${field?.payrollShiftDescription} ${t('marginTool.components.assignment.payRate.tooltip.hr')}`
        : missingField,
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
