import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { AdjustFurnitureGrid } from './AdjustFurnitureGrid';
import { GenericDialog } from '@AMIEWEB/Alerts/GenericDialog';
import { assignmentActions } from 'store/redux-store/margin-tool/slices/assignment/assignment.redux';
import {
  selectFurnitureAdjustments,
  selectFurnitureEditError,
} from 'store/redux-store/margin-tool/slices/assignment/assignment.selector';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { deepEqual } from 'utils/common/comparison';
import { amnHousingStyles } from './HousingStyles';
import { Cancel } from '@AMIEWEB/Common';
import { furnitureCalculation } from './helper';
import { Banner } from '@AMIEWEB/Common/Banner/CustomBanner';
import { usePeopleSoftCalculation } from '../../PeopleSoftCalculation/IPeopleSoftCalculationHelper';

export const AdjustFurnitureModal = props => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { setValue, watch } = useFormContext();
  const { classes } = amnHousingStyles();
  const [furnitureCost, setFurnitureCost] = useState<string>('');
  const [expanded, setExpanded] = useState<boolean>(false);
  const [cancel, setCancel] = useState<boolean>(false);
  const [undo, setUndo] = useState<boolean>(false);
  const [enableSave, setEnableSave] = useState<boolean>(false);
  const { splitIndex, savedFurniture, setSavedFurniture, setFurnitureModel } = props;
  const furnitureAdjustments = useSelector(selectFurnitureAdjustments);
  const furnitureEditError = useSelector(selectFurnitureEditError);
  const additionalFurniture = `assignmentSplits.${splitIndex}.additionalFurniture`;
  const miscFurnitureDescription = `assignmentSplits.${splitIndex}.miscFurnitureDescription`;
  const adjustFurnitureDescription = watch(`assignmentSplits.${splitIndex}.adjustFurnitureDescription`);
  const { triggerPeopleSoftCalculation } = usePeopleSoftCalculation();

  const handleClose = (e, reason?: string) => {
    if (reason === 'backdropClick') return;
    else {
      if (!deepEqual(savedFurniture, furnitureAdjustments)) {
        setCancel(true);
      } else {
        setFurnitureModel(false);
      }
    }
  };
  const handleSave = () => {
    setValue(miscFurnitureDescription, adjustFurnitureDescription);
    setFurnitureModel(false);
    setSavedFurniture(furnitureAdjustments);
    setValue(additionalFurniture, furnitureCost.toString(), { shouldDirty: true });
    triggerPeopleSoftCalculation();
  };

  const handleNoAction = () => {
    setCancel(false);
  };

  const handleUndoYesAction = () => {
    setCancel(false);
    setUndo(false);
    dispatch(assignmentActions.setFurnitureAdjustments(savedFurniture));
    setValue(additionalFurniture, furnitureCalculation(savedFurniture).toString(), { shouldDirty: true });
  };

  const handleYesAction = () => {
    setCancel(false);
    setUndo(false);
    setFurnitureModel(false);
    dispatch(assignmentActions.setFurnitureAdjustments(savedFurniture));
    dispatch(assignmentActions.setFurnitureEditError([]));
  };

  useEffect(() => {
    let errorRowId = furnitureEditError?.find(x => x?.errorCaptured === true);
    if (errorRowId) {
      setEnableSave(true);
    } else {
      setEnableSave(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [furnitureEditError]);

  return (
    <>
      <GenericDialog
        disablePortal
        disableEscapeKeyDown
        open={props?.open}
        fullWidth
        draggable
        variant="blue"
        classes={{
          paper: expanded ? classes.modalContainerExpand : classes.modalContainer,
        }}
        dialogContentProps={{
          classes: { root: expanded ? classes.dialogContentExpand : classes.dialogContent },
        }}
        dialogTitleProps={{
          text: t('marginTool.components.assignment.amnHousing.adjustFurnitureDialogTitle'),
          closeButton: true,
          expandable: true,
          undoButton: true,
          disableUndo: !deepEqual(savedFurniture, furnitureAdjustments) ? false : true,
          onUndoClick: () => {
            setCancel(true);
            setUndo(true);
          },
          onExpandChange: expand => {
            setExpanded(expand);
          },
        }}
        dialogActions={[
          {
            text: t('marginTool.buttons.cancel'),
            id: 'marginTool-adjustFurniture-cancelBtn',
            variant: 'contained',
            color: 'tertiary',
            classes: classes.cancelButton,
            onClick: e => handleClose(e),
          },
          {
            text: t('marginTool.buttons.save'),
            id: 'marginTool-adjustFurniture-saveBtn',
            variant: 'contained',
            color: 'primary',
            classes: classes.saveButton,
            onClick: handleSave,
            disabled: enableSave,
          },
        ]}
        onClose={(e, reason: string) => {
          handleClose(e, reason);
        }}
      >
        <>
          {enableSave && (
            <Banner
              message={t('marginTool.components.assignment.amnHousing.adjustFurnitureQuantityError')}
              justify="center"
              severity="error"
            />
          )}
          <AdjustFurnitureGrid
            {...props}
            furnitureCost={furnitureCost}
            setFurnitureCost={setFurnitureCost}
            expanded={expanded}
          />
        </>
      </GenericDialog>
      {cancel && (
        <Cancel
          openDialog={cancel}
          handleConfirmAction={undo ? handleUndoYesAction : handleYesAction}
          handleCancelAction={handleNoAction}
        />
      )}
    </>
  );
};
