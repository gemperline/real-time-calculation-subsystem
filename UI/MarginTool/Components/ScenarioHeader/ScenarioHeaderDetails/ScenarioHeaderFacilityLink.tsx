import { Grid, Link, Typography, useTheme } from 'amn-ui-core';
import React from 'react';

import { missingField } from 'app/constants';
import { DrawerFitted } from '@AMIEWEB/Common';
import { useScenarioHeaderStyles } from '../ScenarioHeader.Styles';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { globalActions } from 'app/ApplicationRoot/Global.redux';
import { FacilityPreviewDrawerViewer } from '@AMIEWEB/GlobalSearch/Facility/FacilityPreviewDrawerViewer';
import { selectFacilityDrawer } from 'app/ApplicationRoot/Global.selectors';
import { IHeaderDetails } from '../helper';

export const ScenarioHeaderFacilityLink = ({ headerDetails }: { headerDetails: IHeaderDetails }) => {
  const { t } = useTranslation();
  const { classes } = useScenarioHeaderStyles();
  const theme = useTheme();
  const dispatch = useDispatch();
  const facilityDrawer = useSelector(selectFacilityDrawer);
  return (
    <>
      <Grid container item pb={1}>
        <Grid container item md={2} xs={2}>
          <Typography variant="subtitle2">{t('marginTool.labels.fid')}</Typography>
        </Grid>
        <Grid container item md={10} xs={10}>
          {headerDetails?.facility?.facilityId ? (
            <>
              <Typography component={'span'}>
                <Link
                  href={`/facility/${headerDetails?.facility?.facilityId}`}
                  onClick={event => {
                    event.preventDefault();
                    event.stopPropagation();
                    dispatch(globalActions.setCandidateProfileDrawer({ open: false }));
                    dispatch(globalActions.setOrderDrawerData({ open: false, order: undefined }));
                    dispatch(
                      globalActions.setFacilityDrawerData({
                        open: true,
                        facility: { facilityId: headerDetails?.facility?.facilityId },
                      }),
                    );
                  }}
                  data-testid="margintool-facility-link"
                >
                  {`${headerDetails?.facility?.facilityName} (${headerDetails?.facility?.facilityId})`}
                </Link>
                <Typography component={'span'} className={classes.separator}>
                  {' | '}
                </Typography>
              </Typography>
              <Typography component={'span'}>{`${
                headerDetails?.facility?.facilityCity ? headerDetails?.facility?.facilityCity : missingField
              }, ${headerDetails?.facility?.facilityState ? headerDetails?.facility?.facilityState : missingField}  ${
                headerDetails?.facility?.facilityZip ? headerDetails?.facility?.facilityZip : missingField
              }`}</Typography>
            </>
          ) : (
            missingField
          )}
        </Grid>
      </Grid>

      {facilityDrawer?.open && (
        <DrawerFitted
          onDrawerClose={() => {
            dispatch(globalActions.setFacilityDrawerData({ open: false, facility: undefined }));
          }}
          width={400}
          top={0}
          sx={{ zIndex: '9999 !important' }}
          backgroundColor={theme.palette.framework.system.whisper}
          open={facilityDrawer?.open || false}
        >
          {<FacilityPreviewDrawerViewer facilityId={facilityDrawer?.facility?.facilityId} />}
        </DrawerFitted>
      )}
    </>
  );
};
