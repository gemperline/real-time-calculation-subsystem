import React, { useMemo } from 'react';
import { Grid, Divider, Typography, Link, Skeleton } from 'amn-ui-core';
import { XGrid } from '@AMIEWEB/Common/XGrid/XGrid';
import { collection2Table, gsaRates } from './helper';
import { usePromiseTracker } from 'react-promise-tracker';
import { PromiseTrackerKeys } from 'app/constants/PromiseTrackerKeys';
import {
  selectGsaDetails,
  selectMarginToolDetailsData,
  selectSelectedScenario,
} from 'store/redux-store/margin-tool/slices/add-edit-scenario/add-edit-scenario.selector';
import { GridColDef, GridColumns } from '@mui/x-data-grid-pro';
import { useSelector } from 'react-redux';
import { allowancesStyles } from './AllowancesPerDiemStyles';
import { useTranslation } from 'react-i18next';
import { MarginDetailsResponseScenarioSplitItem } from 'store/redux-store/margin-tool/slices/add-edit-scenario/add-edit-scenario.model';

export const GSAContainer = ({ field }: { field: MarginDetailsResponseScenarioSplitItem }) => {
  const { classes } = allowancesStyles();
  const { t } = useTranslation();
  const treeViewData = useSelector(selectMarginToolDetailsData);
  const selectedScenario = useSelector(selectSelectedScenario);
  const gsaCalculationValuesDetails = useSelector(selectGsaDetails);
  const { promiseInProgress: gsaCalculateFetchInProgress } = usePromiseTracker({
    area: PromiseTrackerKeys.marginTool.gsaCalculateFetchData,
    delay: 0,
  });
  const facilityDetails = useMemo(() => {
    return treeViewData?.find(treeData =>
      treeData?.scenarios?.some(scenario => scenario.scenarioId === selectedScenario?.scenarioId),
    )?.facility;
  }, [treeViewData, selectedScenario?.scenarioId]);

  const gsaDetails = useMemo(() => {
    if (gsaCalculationValuesDetails?.gsaItems?.length > 0) {
      const gsaTypeIdLookup: { [key: string]: number } = {
        Lodging: 1,
        'Meals and Incidentals': 2,
        Mileage: 3,
      };

      const bookingPeriodGsaValues = gsaCalculationValuesDetails.gsaItems.map((item, key) => ({
        bookingGsaRateId: key,
        gsaTypeId: item.subCategory ? gsaTypeIdLookup[item.subCategory] || null : null,
        gsaType: item.subCategory,
        month: item.month,
        rate: item.amount,
        scenarioId: field.scenarioId,
        splitId: field.splitId,
        year: item.year,
      }));
      const tableData = collection2Table(bookingPeriodGsaValues, t);
      return { columnHeaders: tableData.columnHeaders, cellsData: tableData.cells };
    }
    return {
      columnHeaders: [],
      cellsData: [],
    };
  }, [gsaCalculationValuesDetails?.gsaItems, field.scenarioId, field.splitId, t]);

  const gsaGridColDef = useMemo(() => {
    if (gsaDetails?.columnHeaders?.length > 0) {
      const flexHeaderLimit = gsaDetails?.columnHeaders?.length > 9;
      const gridColumns: GridColumns = [];

      gsaDetails?.columnHeaders.map(columnHeader => {
        const eachColumnHeader: GridColDef = {
          field: columnHeader,
          headerName: columnHeader,
          hide: columnHeader === 'id' ? true : false,
          type: columnHeader === gsaRates ? 'string' : 'number',
          align: columnHeader === gsaRates ? 'left' : 'right',
          sortable: false,
          minWidth: columnHeader === gsaRates ? 150 : 107,
          disableColumnMenu: true,
          filterable: false,
          headerClassName: classes.columnHeader,
        };
        if (flexHeaderLimit) {
          return gridColumns.push(eachColumnHeader);
        } else {
          const flexColumn: GridColDef = { ...eachColumnHeader, resizable: true, flex: 1 };
          return gridColumns.push(flexColumn);
        }
      });
      return { gridColumns };
    }
  }, [classes.columnHeader, gsaDetails?.columnHeaders]);

  const gsaGrid = useMemo(() => {
    return (
      <XGrid
        rows={gsaDetails?.cellsData || []}
        columns={gsaGridColDef?.gridColumns || []}
        disableSelectionOnClick
        pagination={false}
        autoHeight={true}
        hideFooter
        title={''}
        headerHeight={80}
        checkboxSelection={false}
        disableColumnReorder={true}
        disableColumnResize={true}
        disableColumnSelector={true}
        initialState={{ pinnedColumns: { left: [gsaRates] } }}
        keepColumnPositionIfDraggedOutside={true}
        toolbarProps={{
          refreshButton: false,
          columnSelector: false,
          moreOption: false,
        }}
        components={{
          NoRowsOverlay: () => {
            return <></>;
          },
        }}
        classes={{
          columnHeaderTitleContainerContent: classes.columnHeaderTitleContent,
          columnHeaderTitle: classes.rightColumnHeader,
          toolbarContainer: classes.toolbarContainer,
        }}
      />
    );
  }, [gsaGridColDef?.gridColumns]);

  const getGsaPerDiemUrl = (state?: string, zip?: string) => {
    const baseUrl = globalThis?.app?.env.REACT_APP_GSA_PER_DIEM_RATE_URL;

    if ((!zip) && !state) {
      return baseUrl;
    }

    const today = new Date();
    const year = today.getFullYear();
    const fiscalYear = today.getMonth() >= 9 ? year + 1 : year;
    if (!zip) {
      return `${baseUrl}/per-diem-rates-results?action=perdiems_report&fiscal_year=${fiscalYear}&state=${state}&city=&zip=`;
    } else {
      return `${baseUrl}/per-diem-rates-results?action=perdiems_report&fiscal_year=${fiscalYear}&state=&city=&zip=${zip}`;
    }
  };

  return (
    <>
      <Grid sx={{ pl: 2, pr: 2, pt: 1, pb: 1 }}>
        <Divider />
      </Grid>
      <Grid container p={2}>
        <Grid item>
          <Link
            href={getGsaPerDiemUrl(facilityDetails?.facilityState, facilityDetails?.facilityZip)}
            data-testid="gsa-diem-rate-external-link"
            target="_blank"
          >
            <Typography component={'span'} variant={'subtitle2'}>
              {t('marginTool.labels.gsa')}
            </Typography>
            {` ${t('marginTool.labels.usGeneralServiceAdministration')}`}
          </Link>
          <Typography component="span" variant="body1">
            {`: ${facilityDetails?.facilityCity || ''}`}
            {facilityDetails?.facilityCounty ? `, ${facilityDetails.facilityCounty} ${t('marginTool.labels.county')}` : ''}
            {facilityDetails?.facilityState ? `, ${facilityDetails.facilityState}` : ''}
            {facilityDetails?.facilityZip ? ` ${facilityDetails.facilityZip}` : ''}
          </Typography>
        </Grid>
      </Grid>
      {!gsaCalculateFetchInProgress && gsaDetails?.cellsData?.length > 0 && gsaGridColDef?.gridColumns ? (
        <>
          <Grid container p={2}>
            <Grid item xs={12}>
              {gsaGrid}
            </Grid>
          </Grid>
        </>
      ) : gsaCalculateFetchInProgress ? (
        <>
          <Grid container className={classes.noGSATitleWrapper}>
            <Skeleton variant="rectangular" width={'100%'} height={24} sx={{ marginLeft: '1px' }} />
          </Grid>
        </>
      ) : (
        <Grid container className={classes.noGSATitleWrapper}>
          <Grid item className={classes.noGSATitle}>
            <Typography variant="subtitle1">
              {t('marginTool.components.assignment.allowancesPerDiemStipend.gsaValueNotAvailableMessage')}
            </Typography>
          </Grid>
        </Grid>
      )}
    </>
  );
};
