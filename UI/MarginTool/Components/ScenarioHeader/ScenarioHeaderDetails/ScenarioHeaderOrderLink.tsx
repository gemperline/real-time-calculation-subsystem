import { Grid, Link, Typography, useTheme } from 'amn-ui-core';
import React from 'react';

import { missingField } from 'app/constants';
import { DrawerFitted } from '@AMIEWEB/Common';
import { useScenarioHeaderStyles } from '../ScenarioHeader.Styles';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { globalActions } from 'app/ApplicationRoot/Global.redux';
import { selectOrderDrawer } from 'app/ApplicationRoot/Global.selectors';
import { OrderPreviewDrawerViewer } from '@AMIEWEB/GlobalSearch/Order/OrderPreviewDrawerViewer';
import { IHeaderDetails } from '../helper';

export const ScenarioHeaderOrderLink = ({ headerDetails }: { headerDetails: IHeaderDetails }) => {
  const { t } = useTranslation();
  const { classes } = useScenarioHeaderStyles();
  const theme = useTheme();
  const dispatch = useDispatch();
  const orderDrawer = useSelector(selectOrderDrawer);
  return (
    <>
      <Grid container item pb={1}>
        <Grid container item md={2} xs={2}>
          <Typography variant="subtitle2">{t('marginTool.labels.oid')}</Typography>
        </Grid>
        <Grid container item md={10} xs={10}>
          {headerDetails?.order?.orderId ? (
            <>
              <Link
                href={`/order/${headerDetails?.order?.orderId}`}
                onClick={event => {
                  event.preventDefault();
                  event.stopPropagation();
                  dispatch(globalActions.setFacilityDrawerData({ open: false, facility: undefined }));
                  dispatch(globalActions.setCandidateProfileDrawer({ open: false }));
                  dispatch(
                    globalActions.setOrderDrawerData({
                      open: true,
                      order: { orderId: `${headerDetails?.order?.orderId}` },
                    }),
                  );
                }}
                data-testid="margintool-order-link"
              >
                {headerDetails?.order?.orderId}
              </Link>

              <Typography component={'span'} className={classes.separator}>
                {'|'}
              </Typography>
              <Typography component={'span'}>
                {headerDetails?.order?.orderType ? headerDetails?.order?.orderType : missingField}
              </Typography>
            </>
          ) : (
            missingField
          )}
        </Grid>
      </Grid>
      {orderDrawer?.open && (
        <DrawerFitted
          onDrawerClose={() => {
            dispatch(globalActions.setOrderDrawerData({ open: false, order: undefined }));
          }}
          width={450}
          top={0}
          sx={{ zIndex: '9999 !important' }}
          backgroundColor={theme.palette.framework.system.whisper}
          open={orderDrawer?.open || false}
        >
          {<OrderPreviewDrawerViewer orderId={headerDetails?.order?.orderId} />}
        </DrawerFitted>
      )}
    </>
  );
};
