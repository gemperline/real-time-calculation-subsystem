import { Grid, Link, Typography } from 'amn-ui-core';
import React from 'react';

import { useScenarioHeaderStyles } from '../ScenarioHeader.Styles';
import { useTranslation } from 'react-i18next';
import { formatDateObj } from '@AMIEWEB/MarginTool/helper';
import { MarginDetailsResponseScenario } from 'store/redux-store/margin-tool/slices/add-edit-scenario/add-edit-scenario.model';
import { IHeaderDetails } from '../helper';
import { ScenarioHeaderOrderLink } from './ScenarioHeaderOrderLink';
import { ScenarioHeaderFacilityLink } from './ScenarioHeaderFacilityLink';
import { ScenarioHeaderCandidateLink } from './ScenarioHeaderCandidateLink';

export const ScenarioHeaderLinks = ({
  headerData,
  headerDetails,
}: {
  headerData: MarginDetailsResponseScenario;
  headerDetails: IHeaderDetails;
}) => {
  const { t } = useTranslation();
  const { classes } = useScenarioHeaderStyles();
  return (
    <>
      <Grid container item direction={'column'} md={4} xs={12} pr={4}>
        <Grid container item pb={1} pr={1}>
          <Grid container item md={2} xs={2}>
            <Typography variant="subtitle2"> {t('marginTool.labels.pid')}</Typography>
          </Grid>
          <Grid container item md={10} xs={10}>
            <Link href={`/placement/${headerData?.placementId}`}>{headerData?.placementId}</Link>
            {headerDetails?.placement?.startDate && headerDetails?.placement?.endDate && (
              <>
                <Typography component={'span'} className={classes.separator}>
                  {'|'}
                </Typography>
                <Typography component={'span'} sx={{ pr: 1 }}>
                  {` ${formatDateObj(headerDetails?.placement?.startDate)} - ${formatDateObj(
                    headerDetails?.placement?.endDate,
                  )}`}
                </Typography>
                <Typography component={'span'}>{`(${headerDetails?.placement?.duration} ${t(
                  'marginTool.labels.weeks',
                )})`}</Typography>
              </>
            )}
            <Typography component={'span'} className={classes.separator}>
              {'|'}
            </Typography>
            <Typography component={'span'}>{`${headerDetails?.placement?.discipline} - ${
              headerDetails?.placement?.specialty
            } ${
              headerDetails?.placement?.subSpecialty ? `- ${headerDetails?.placement?.subSpecialty}` : ''
            }`}</Typography>
          </Grid>
        </Grid>
        <ScenarioHeaderOrderLink headerDetails={headerDetails} />
        <ScenarioHeaderFacilityLink headerDetails={headerDetails} />
        <ScenarioHeaderCandidateLink headerDetails={headerDetails} />
      </Grid>
    </>
  );
};
