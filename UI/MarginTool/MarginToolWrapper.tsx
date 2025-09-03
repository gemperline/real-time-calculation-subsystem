import React, { useEffect } from 'react';
import { DetailsPage } from 'app/layout/pages/DetailsPage';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import useDocumentTitle from 'utils/customHooks/useDocumentTitle';
import { pageNames } from 'app/constants/PageNames';
import MarginToolDetails from './MarginToolDetails';
import { Typography, useTheme } from 'amn-ui-core';
import { useInjectReducer, useInjectSaga } from 'utils/redux-injectors';
import {
  payPackageStatusSliceKey,
  payPackageStatusSliceReducer,
} from 'store/redux-store/margin-tool/slices/pay-package-status/pay-package-status.redux';
import { payPackageStatusSaga } from 'store/redux-store/margin-tool/slices/pay-package-status/pay-package-status.saga';
import {
  scenarioActions,
  scenarioReducer,
  scenarioSliceKey,
} from 'store/redux-store/margin-tool/slices/add-edit-scenario/add-edit-scenario.redux';
import { scenarioSaga } from 'store/redux-store/margin-tool/slices/add-edit-scenario/add-edit-scenario.saga';
import {
  assignmentReducer,
  assignmentSliceKey,
} from 'store/redux-store/margin-tool/slices/assignment/assignment.redux';
import { assignmentSaga } from 'store/redux-store/margin-tool/slices/assignment/assignment.saga';
import { useDispatch, useSelector } from 'react-redux';
import {
  marginToolEmailReducer,
  marginToolEmailSliceKey,
} from 'store/redux-store/margin-tool/slices/margin-tool-email/margin-tool-email.redux';
import { marginToolEmailSaga } from 'store/redux-store/margin-tool/slices/margin-tool-email/margin-tool-email.saga';
import { selectPageLoadStatus } from 'store/redux-store/margin-tool/slices/add-edit-scenario/add-edit-scenario.selector';
import { MarginEntityType } from 'store/redux-store/margin-tool/slices/add-edit-scenario/add-edit-scenario.model';

export const MarginToolWrapper = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const dispatch = useDispatch();
  useInjectReducer({ key: scenarioSliceKey, reducer: scenarioReducer });
  useInjectSaga({ key: scenarioSliceKey, saga: scenarioSaga });
  useInjectReducer({ key: assignmentSliceKey, reducer: assignmentReducer });
  useInjectSaga({ key: assignmentSliceKey, saga: assignmentSaga });
  useInjectReducer({ key: payPackageStatusSliceKey, reducer: payPackageStatusSliceReducer });
  useInjectSaga({ key: payPackageStatusSliceKey, saga: payPackageStatusSaga });
  useInjectSaga({ key: marginToolEmailSliceKey, saga: marginToolEmailSaga });
  useInjectReducer({ key: marginToolEmailSliceKey, reducer: marginToolEmailReducer });
  const params = useParams<{ entity: string; entityId: string }>();
  const isPageLoaded = useSelector(selectPageLoadStatus);

  useDocumentTitle({
    title: params?.entityId ? `${pageNames.marginTool} ${params.entityId}` : `${pageNames.marginTool}`,
  });

  const setMarginToolBreadCrumbs = (
    title: string,
    color: string = theme.palette.primary.main,
    isLink: boolean = true,
    fontWeight: string = 'medium',
  ) => {
    return (
      <Typography sx={{ color: color, pointerEvents: isLink ? 'auto' : 'none', fontWeight: fontWeight }}>
        {title}
      </Typography>
    );
  };

  const placementId = params.entityId && params.entity === 'placement' ? Number(params.entityId) : null;

  const breadcrumbItems = {
    items: [
      ...(placementId
        ? [
            {
              title: setMarginToolBreadCrumbs(`${t('templateEditor.placement.allPlacements')}`),
              path: '/search/placement',
              clickable: true,
            },
            {
              title: setMarginToolBreadCrumbs(`PID ${placementId}`),
              path: `/placement/${placementId}`,
              clickable: true,
            },
          ]
        : [
            {
              title: setMarginToolBreadCrumbs('WorkDesk'),
              path: '/',
              clickable: true,
            },
          ]),
      {
        title: setMarginToolBreadCrumbs(`${t('marginTool.marginTool')}`, theme.palette.system.black, false, 'bold'),
        clickable: false,
      },
    ],
  };

  useEffect(() => {
    if (params.entityId && params.entity === MarginEntityType.Placement) {
      const placementId = Number(params.entityId);
      if (placementId > 0) {
        dispatch(scenarioActions.getMarginToolDetails({ placementId: placementId }));
      } else if (!isPageLoaded) {
        dispatch(scenarioActions.setPageLoadStatus(true));
      }
    } else if (!isPageLoaded) {
      dispatch(scenarioActions.setPageLoadStatus(true));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.entityId]);

  useEffect(() => {
    return () => {
      dispatch(scenarioActions.reset());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <DetailsPage
      children={<MarginToolDetails />}
      breadcrum={breadcrumbItems}
      isCreateForm={false}
      paddingBottom="4rem"
      titleActions={<></>}
      head={null}
    />
  );
};
