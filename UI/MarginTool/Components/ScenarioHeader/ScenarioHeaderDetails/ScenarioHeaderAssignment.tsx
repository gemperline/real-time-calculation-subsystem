import { formatDateObj } from '@AMIEWEB/MarginTool/helper';
import { Grid, Typography } from 'amn-ui-core';
import { missingField } from 'app/constants';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { MarginDetailsResponseScenario } from 'store/redux-store/margin-tool/slices/add-edit-scenario/add-edit-scenario.model';
import { IHeaderDetails } from '../helper';

export const ScenarioHeaderAssignment = ({
  headerData,
  headerDetails,
}: {
  headerData: MarginDetailsResponseScenario;
  headerDetails: IHeaderDetails;
}) => {
  const { t } = useTranslation();

  return (
    <>
      <Grid container item direction={'column'} md={4} xs={12} pr={4}>
        <Grid container item pb={1} pr={1}>
          <Grid container item md={4.5} xs={4.5}>
            <Typography variant="subtitle2">{t('marginTool.labels.assignment')}</Typography>
          </Grid>
          <Grid container item md={7.5} xs={7.5}>
            {headerDetails?.assignment?.startDate &&
            headerDetails?.assignment?.endDate &&
            headerDetails?.assignment?.duration ? (
              <>
                <Typography component={'span'} sx={{ pr: 1 }}>{`${formatDateObj(
                  headerDetails?.assignment?.startDate,
                )} - ${formatDateObj(headerDetails?.assignment?.endDate)}`}</Typography>
                <Typography component={'span'}>{`(${headerDetails?.assignment?.duration} ${t(
                  'marginTool.labels.weeks',
                )})`}</Typography>
              </>
            ) : (
              missingField
            )}
          </Grid>
        </Grid>
        <Grid container item pb={1}>
          <Grid container item md={4.5} xs={4.5}>
            <Typography variant="subtitle2">{t('marginTool.labels.shift')}</Typography>
          </Grid>
          <Grid container item md={7.5} xs={7.5}>
            <Typography component={'span'}>{`${headerData?.splits.map(item => item?.shift).join(', ')}`}</Typography>
          </Grid>
        </Grid>
        <Grid container item pb={1}>
          <Grid container item md={4.5} xs={4.5}>
            <Typography variant="subtitle2">{t('marginTool.labels.recruiter')}</Typography>
          </Grid>
          <Grid container item md={7.5} xs={7.5}>
            {headerDetails?.recruiter?.firstName && headerDetails?.recruiter?.lastName ? (
              <Typography
                component={'span'}
              >{`${headerDetails?.recruiter?.firstName} ${headerDetails?.recruiter?.lastName}`}</Typography>
            ) : (
              missingField
            )}
          </Grid>
        </Grid>
        <Grid container item pb={1}>
          <Grid item md={4.5} xs={4.5}>
            <Typography variant="subtitle2">{t('marginTool.labels.accountManager')}</Typography>
          </Grid>
          <Grid item md={7.5} xs={7.5}>
            {headerDetails?.accountManager?.firstName && headerDetails?.accountManager?.lastName ? (
              <Typography
                component={'span'}
              >{`${headerDetails?.accountManager?.firstName} ${headerDetails?.accountManager?.lastName}`}</Typography>
            ) : (
              missingField
            )}
          </Grid>
        </Grid>
        <Grid container item pb={1}>
          <Grid item md={4.5} xs={4.5}>
            <Typography variant="subtitle2">{t('marginTool.labels.brand')}</Typography>
          </Grid>
          <Grid item md={7.5} xs={7.5}>
            <Typography>{`${headerDetails?.brandName ? headerDetails?.brandName : missingField}`}</Typography>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};
