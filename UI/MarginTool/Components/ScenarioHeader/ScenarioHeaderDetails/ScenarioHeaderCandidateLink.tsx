import { Grid, Link, Typography, useTheme } from 'amn-ui-core';
import React from 'react';

import { missingField } from 'app/constants';
import { DrawerFitted } from '@AMIEWEB/Common';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { globalActions } from 'app/ApplicationRoot/Global.redux';
import { CandidateDrawerPreviewer } from '@AMIEWEB/GlobalSearch/Candidate/CandidateDrawerPreviewer';
import {
  selectCandidateProfileDrawer,
} from 'app/ApplicationRoot/Global.selectors';
import { IHeaderDetails } from '../helper';

export const ScenarioHeaderCandidateLink = ({
  headerDetails,
}: {
  headerDetails: IHeaderDetails;
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const dispatch = useDispatch();
  const candidateProfileDrawer = useSelector(selectCandidateProfileDrawer);

  return (
    <>
      <Grid container item pb={1}>
        <Grid container item md={2} xs={2}>
          <Typography variant="subtitle2"> {t('marginTool.labels.cid')}</Typography>
        </Grid>
        <Grid container item md={10} xs={10}>
          {headerDetails?.candidate?.candidateId ? (
            <>
              <Link
                href={`/candidate/${headerDetails?.candidate?.candidateId}/${headerDetails?.brandId}`}
                onClick={event => {
                  event.preventDefault();
                  event.stopPropagation();
                  dispatch(
                    globalActions.setOrderDrawerData({
                      open: false,
                      order: undefined,
                    }),
                  );
                  dispatch(
                    globalActions.setFacilityDrawerData({
                      open: false,
                      facility: undefined,
                    }),
                  );
                  dispatch(globalActions.setCandidateProfileDrawer({ open: true }));
                }}
                data-testid="margintool-candidate-link"
              >
                {`${headerDetails?.candidate?.name} (${headerDetails?.candidate?.candidateId})`}
              </Link>
            </>
          ) : (
            missingField
          )}
        </Grid>
      </Grid>

      {candidateProfileDrawer?.open && (
        <DrawerFitted
          onDrawerClose={() => {
            dispatch(globalActions.setCandidateProfileDrawer({ open: false }));
          }}
          width={400}
          top={0}
          sx={{ zIndex: '9999 !important' }}
          backgroundColor={theme.palette.framework.system.whisper}
          open={candidateProfileDrawer?.open || false}
        >
          {
            <CandidateDrawerPreviewer
              isSearchGrid={false}
              isWorkDesk={false}
              travelerId={headerDetails?.candidate?.candidateId}
              hideNavigationArrows={true}
              brandId={headerDetails?.brandId}
              closeDrawer={() => {
                dispatch(globalActions.setCandidateProfileDrawer({ open: false }));
              }}
            />
          }
        </DrawerFitted>
      )}
    </>
  );
};
