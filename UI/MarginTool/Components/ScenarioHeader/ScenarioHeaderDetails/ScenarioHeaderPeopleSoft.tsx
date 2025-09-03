import { Box, CircularProgress, Grid, Typography } from 'amn-ui-core';
import React from 'react';
import { customRoundOff, formattedNumber, isNegative } from '../helper';
import { missingField } from 'app/constants';
import { CustomTooltip, OverflowTooltip } from '@AMIEWEB/Common';
import { useScenarioHeaderStyles } from '../ScenarioHeader.Styles';
import { useTranslation } from 'react-i18next';
import { MarginDetailsResponseScenario } from 'store/redux-store/margin-tool/slices/add-edit-scenario/add-edit-scenario.model';
import { convertToPercentage } from '../../PayPackage/helper';
import { isNullOrUndefined } from 'app/helpers/objectHelpers';
import { PromiseTrackerKeys } from 'app/constants/PromiseTrackerKeys';
import { usePromiseTracker } from 'react-promise-tracker';

const popperModifierNotes = {
  modifiers: [
    {
      name: 'offset',
      options: {
        offset: [0, -100],
      },
    },
  ],
};

export const ScenarioHeaderPeopleSoft = ({ headerData }: { headerData: MarginDetailsResponseScenario }) => {
  const { t } = useTranslation();
  const { classes } = useScenarioHeaderStyles();

  const { promiseInProgress: flagVariationInProgress } = usePromiseTracker({
    area: PromiseTrackerKeys.marginTool.peopleSoftCallMarginTool,
    delay: 0,
  });
  return (
    <Grid container item direction={'column'} md={4} xs={12} pr={4}>
      <Grid container item pb={1} pr={1}>
        <Grid container item md={4} xs={4}>
          <Typography variant="subtitle2">{t('marginTool.labels.grossMargin')}</Typography>
        </Grid>
        <Grid container item md={8} xs={8}>
          <Typography component={'span'}>
            {flagVariationInProgress ? (
              <Box ml={0.5}>
                <CircularProgress size={16} color="inherit" />
              </Box>
            ) : (
              <>
                {!isNullOrUndefined(headerData?.grossMargin)
                  ? convertToPercentage(headerData?.grossMargin)
                  : missingField}
              </>
            )}
          </Typography>
        </Grid>
      </Grid>
      <Grid container item pb={1}>
        <Grid container item md={4} xs={4}>
          <Typography variant="subtitle2">{t('marginTool.labels.grossProfit')}</Typography>
        </Grid>
        <Grid container item md={8} xs={8}>
          <Typography component={'span'}>
            {flagVariationInProgress ? (
              <Box ml={0.5}>
                <CircularProgress size={16} color="inherit" />
              </Box>
            ) : (
              <>
                {headerData?.grossProfit
                  ? isNegative(headerData?.grossProfit)
                    ? `($${formattedNumber(customRoundOff(Math.abs(headerData?.grossProfit)))})`
                    : `$${formattedNumber(customRoundOff(headerData?.grossProfit))}`
                  : missingField}
              </>
            )}
          </Typography>
        </Grid>
      </Grid>
      <Grid container item pb={1}>
        <Grid container item md={4} xs={4}>
          <CustomTooltip
            tooltipContent={
              Number(headerData?.negotiatedContributionMargin)
                ? t('marginTool.components.scenarioHeader.tooltips.negotiatedContributionMargin')
                : ''
            }
            isStandardContent
          >
            <Typography variant="subtitle2">{t('marginTool.labels.ncm')}</Typography>
          </CustomTooltip>
        </Grid>
        <Grid container item md={8} xs={8}>
          <Typography component={'span'}>
            {flagVariationInProgress ? (
              <Box ml={0.5}>
                <CircularProgress size={16} color="inherit" />
              </Box>
            ) : (
              <>
                {headerData?.negotiatedContributionMargin
                  ? isNegative(Number(headerData?.negotiatedContributionMargin))
                    ? `($${formattedNumber(
                        customRoundOff(Math.abs(Number(headerData?.negotiatedContributionMargin))),
                      )})`
                    : `$${formattedNumber(customRoundOff(Number(headerData?.negotiatedContributionMargin)))}`
                  : missingField}
              </>
            )}
          </Typography>
        </Grid>
      </Grid>
      <Grid container item pb={1}>
        <Grid container item md={3}>
          <Typography variant="subtitle2">{t('marginTool.labels.notes')}</Typography>
        </Grid>
        <Grid container item md={9}>
          <Typography component={'span'}>
            <OverflowTooltip
              defaultRender
              value={headerData?.notes ? headerData?.notes : missingField}
              lineClamp={4}
              contentStyle={{
                lineHeight: 1.57,
                display: '-webkit-box',
                WebkitLineClamp: 4,
                WebkitBoxOrient: 'vertical',
                whiteSpace: 'break-spaces',
              }}
              customTooltipClass={classes.customTooltipWithoutArrow}
              modifyPopper={popperModifierNotes}
            />
          </Typography>
        </Grid>
      </Grid>
    </Grid>
  );
};
