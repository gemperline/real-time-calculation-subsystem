import { Grid, Typography } from 'amn-ui-core';
import React, { useEffect, useState } from 'react';
import { furnitureCalculation, includeCostCalculation } from './helper';
import { useDispatch, useSelector } from 'react-redux';

import { GridColumns } from '@mui/x-data-grid-pro';
import { MarginToolTextArea } from '@AMIEWEB/MarginTool/Common/MarginToolTextArea';
import { PayPackageStatus } from 'store/redux-store/margin-tool/slices/pay-package-status/pay-package-status.model';
import { XGrid } from '@AMIEWEB/Common/XGrid/XGrid';
import { getAdjustFurnitureGridColumns } from './AdjustFurnitureGridUtils';
import { globalActions } from 'app/ApplicationRoot/Global.redux';
import { selectFurnitureAdjustments } from 'store/redux-store/margin-tool/slices/assignment/assignment.selector';
import { selectSelectedScenario } from 'store/redux-store/margin-tool/slices/add-edit-scenario/add-edit-scenario.selector';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { amnHousingStyles } from './HousingStyles';
import { assignmentActions } from 'store/redux-store/margin-tool/slices/assignment/assignment.redux';

export const AdjustFurnitureGrid = props => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { classes } = amnHousingStyles();
  const { setValue, errors, watch } = useFormContext();
  const { splitIndex, furnitureCost, setFurnitureCost, savedFurniture, miscellaneousFurnitureDescription } = props;
  const adjustFurnitureDescription = `assignmentSplits.${splitIndex}.adjustFurnitureDescription`;
  const furnitureDescription = watch(adjustFurnitureDescription);
  const [includeCount, setIncludeCount] = useState<number>(0);
  const [columns, setColumns] = useState<GridColumns>(getAdjustFurnitureGridColumns(classes));
  const scenario = useSelector(selectSelectedScenario);
  const furnitureAdjustments = useSelector(selectFurnitureAdjustments);

  const isScenarioStatusPending = scenario?.scenarioStatusId === PayPackageStatus.Pending;

  const resetColumns = () => {
    setColumns(getAdjustFurnitureGridColumns(classes));
  };
  useEffect(() => {
    if (furnitureAdjustments?.length > 0) {
      setFurnitureCost(furnitureCalculation(furnitureAdjustments));
      setIncludeCount(includeCostCalculation(furnitureAdjustments));
    }
  }, [furnitureAdjustments, setFurnitureCost]);
  return (
    <>
      <Grid container>
        <Grid item xs={12} sx={{ p: 1 }}>
          <Typography
            component="span"
            variant="subtitle1"
            sx={{ color: theme => theme.palette.components.typography.color, fontWeight: '500' }}
          >
            {t('marginTool.components.assignment.amnHousing.grid.furnitureAmount')}
          </Typography>
          <Typography
            component="span"
            variant="subtitle1"
            sx={{ color: theme => theme.palette.components.typography.color, fontWeight: '400' }}
          >
            {`$ ${furnitureCost}`}
          </Typography>
        </Grid>
        <Grid item xs={12} sx={{ p: 1 }}>
          <XGrid
            rows={furnitureAdjustments || []}
            columns={columns}
            disableSelectionOnClick
            editMode="row"
            pagination={false}
            autoHeight={true}
            sx={{ minWidth: '700px' }}
            hideFooter
            inDialog
            title={t('marginTool.components.assignment.amnHousing.grid.title')}
            displayCustomCount={furnitureAdjustments?.length ?? 0}
            secondaryTitle={`/ ${t(
              'marginTool.components.assignment.amnHousing.grid.secondaryTitle',
            )} (${includeCount})`}
            className={classes.expandedGrid}
            toolbarProps={{
              refreshButton: true,
              refreshGrid: () => {
                dispatch(assignmentActions.setFurnitureAdjustments(savedFurniture));
              },
              columnSelector: !isScenarioStatusPending ? false : true,
              resetButton: true,
              resetColumns: () => {
                resetColumns();
                dispatch(
                  globalActions.setSnackBar({
                    message: t('marginTool.components.assignment.amnHousing.grid.columnsResetMessage'),
                    severity: 'success',
                  }),
                );
              },
            }}
          />
        </Grid>
        <Grid item xs={12} sx={{ pt: 2 }}>
          <MarginToolTextArea
            name={adjustFurnitureDescription}
            id={'marginTool-amnHousing-miscFurnitureDescription-textArea'}
            disabled={false}
            label={t('marginTool.labels.miscFurnitureDescription')}
            error={!!errors?.furnitureDescription}
            helperText={
              <div className={classes.descriptionCountStyle}>{`${
                furnitureDescription?.length
                  ? furnitureDescription?.length
                  : miscellaneousFurnitureDescription?.length > 0 && furnitureDescription !== ''
                  ? miscellaneousFurnitureDescription?.length
                  : 0
              }/1000`}</div>
            }
            handleChange={event => {
              setValue(adjustFurnitureDescription, event.target.value);
            }}
            inputProps={{ maxLength: 1000 }}
            defaultValue={miscellaneousFurnitureDescription}
          />
        </Grid>
      </Grid>
    </>
  );
};
