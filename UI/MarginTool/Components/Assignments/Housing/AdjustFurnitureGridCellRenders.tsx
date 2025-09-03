import React, { useEffect } from 'react';
import { materialUiXGrid, Switch, TextField, Typography } from 'amn-ui-core';
import { missingField } from 'app/constants';
import { GridCellParams } from '@mui/x-data-grid-pro';
import { Controller, useFormContext } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectFurnitureAdjustments,
  selectFurnitureEditError,
} from 'store/redux-store/margin-tool/slices/assignment/assignment.selector';
import { assignmentActions } from 'store/redux-store/margin-tool/slices/assignment/assignment.redux';
import { useTranslation } from 'react-i18next';
import { validInteger } from 'app/helpers/numberHelper';

export const RenderIncludeCell = (cellParams: GridCellParams) => {
  return <IncludeCellComponent {...cellParams} />;
};

const IncludeCellComponent = React.memo(function IncludeCellComponent(cellParams: GridCellParams) {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { control } = useFormContext();
  const rowId = cellParams?.row?.id;
  const furnitureAdjustments = useSelector(selectFurnitureAdjustments);
  const furnitureEditError = useSelector(selectFurnitureEditError);

  let editRow = furnitureAdjustments?.find(x => x.id === rowId);
  const isIncluded = editRow?.include;
  const quantity = editRow.quantity;

  const setRowError = (editedrow: number) => {
    let arr = furnitureEditError?.slice(0);
    const currentObj = arr?.find(value => value?.errorRowId === editedrow);
    if (isIncluded && quantity === 0) {
      if (currentObj) {
        const updatedObj = { ...currentObj, errorCaptured: false, errorRowId: editedrow };
        const editIndex = arr?.findIndex(value => value?.errorRowId === editedrow);
        arr[editIndex] = updatedObj;
      } else {
        const valueObj = { errorCaptured: true, errorRowId: Number(rowId) };
        arr.push(valueObj);
      }
    } else if (!isIncluded && currentObj) {
      const updatedObj = { ...currentObj, errorCaptured: false, errorRowId: editedrow };
      const editIndex = arr?.findIndex(value => value?.errorRowId === editedrow);
      arr[editIndex] = updatedObj;
    } else if (isIncluded && currentObj && quantity > 0) {
      const updatedObj = { ...currentObj, errorCaptured: false, errorRowId: editedrow };
      const editIndex = arr?.findIndex(value => value?.errorRowId === editedrow);
      arr[editIndex] = updatedObj;
    }
    dispatch(assignmentActions.setFurnitureEditError(arr));
  };

  const onClickHandler = async params => {
    let allRows = furnitureAdjustments?.slice(0);
    let editIndex = furnitureAdjustments?.findIndex(row => row.id === rowId);
    let updatedRow = {
      ...editRow,
      include: !isIncluded,
      quantity: !isIncluded ? 1 : quantity >= 1 ? 0 : quantity,
    };
    allRows[editIndex] = updatedRow;
    dispatch(assignmentActions.setFurnitureAdjustments(allRows));
    setRowError(cellParams?.row?.id);
  };

  return (
    <>
      <Controller
        name={`furnitureAdjustments.${rowId}.include`}
        control={control}
        render={({ ref, value, onChange, onBlur, ...rest }) => (
          <>
            <Switch
              checked={isIncluded}
              onClick={() => {
                onClickHandler(cellParams);
              }}
              disableFocusRipple
              disableRipple
              disableTouchRipple
              defaultChecked={isIncluded}
            />
            {isIncluded
              ? `${t('marginTool.components.assignment.amnHousing.grid.yes')}`
              : `${t('marginTool.components.assignment.amnHousing.grid.no')}`}
          </>
        )}
      />
    </>
  );
});

export const StandardCost = (params: GridCellParams) => {
  return (
    <div>
      <Typography>
        {params?.row?.standardCost === missingField ? missingField : `$ ${params?.row?.standardCost}`}
      </Typography>
    </div>
  );
};

export const RenderQuantityCell = (params: GridCellParams) => {
  return <QuantityComponent {...params} />;
};

export const QuantityComponent = React.memo(function QuantityComponent(cellParams: GridCellParams) {
  const rowId = cellParams?.row?.id;
  const furnitureAdjustments = useSelector(selectFurnitureAdjustments);
  const updatedValue = furnitureAdjustments?.find(x => x.id === rowId);
  const value = updatedValue?.include ? updatedValue?.quantity : 0;
  return (
    <div>
      <Typography>{value === 0 || value === null ? missingField : `${value}`}</Typography>
    </div>
  );
});

export const EditQuantityCell = (cellParams: GridCellParams) => {
  return <EditQuantityComponent {...cellParams} />;
};

const EditQuantityComponent = React.memo(function EditQuantityComponent(cellParams: GridCellParams) {
  const apiRef = materialUiXGrid.useGridApiContext();
  const dispatch = useDispatch();
  const { control } = useFormContext();
  const rowId = cellParams?.row?.id;
  const furnitureAdjustments = useSelector(selectFurnitureAdjustments);
  const furnitureEditError = useSelector(selectFurnitureEditError);
  let editRow = furnitureAdjustments?.find(x => x.id === rowId);
  const isIncluded = editRow?.include;
  const defaultQuantity = editRow?.quantity === 0 ? 1 : editRow?.quantity;
  const quantity = !isIncluded ? 0 : defaultQuantity;

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!/^[0-9]$/.test(event.key)) {
      event.preventDefault();
    }
  };
  const setQuantityEdit = (data: number) => {
    let allRows = furnitureAdjustments?.slice(0);
    let editIndex = furnitureAdjustments?.findIndex(row => row.id === rowId);
    let updatedRow = { ...editRow, quantity: data };
    allRows[editIndex] = updatedRow;
    if (data !== editRow?.quantity) {
      dispatch(assignmentActions.setFurnitureAdjustments(allRows));
    }
  };

  const handleEditChanges = async e => {
    if (e.target.value && validInteger(e.target.value, { numberLength: 1 })) {
      setQuantityEdit(e.target.value);
      const arr = furnitureEditError?.slice(0);
      const currentObj = arr?.find(value => value?.errorRowId === rowId);
      if (currentObj) {
        const updatedObj = { ...currentObj, errorCaptured: false, errorRowId: rowId };
        const editIndex = arr?.findIndex(value => value?.errorRowId === rowId);
        arr[editIndex] = updatedObj;
        dispatch(assignmentActions.setFurnitureEditError(arr));
      }
    } else if (
      e.nativeEvent.inputType === 'deleteContentBackward' ||
      e.nativeEvent.inputType === 'deleteContentForward'
    ) {
      setQuantityEdit(e.target.value);
    } else {
      if (e.target.value === '') {
        const arr = furnitureEditError?.length > 0 ? furnitureEditError?.slice(0) : [];
        const currentObj = arr?.find(value => value?.errorRowId === editRow?.id);
        if (currentObj) {
          const updatedObj = { ...currentObj, errorCaptured: true, errorRowId: editRow?.id };
          const editIndex = arr?.findIndex(value => value?.errorRowId === editRow?.id);
          arr[editIndex] = updatedObj;
        } else {
          const valueObj = { errorCaptured: true, errorRowId: Number(rowId) };
          arr.push(valueObj);
        }
        dispatch(assignmentActions.setFurnitureEditError(arr));
      }
      //setQuantityEdit(0);
    }
    await apiRef.current.setEditCellValue({
      id: cellParams?.row?.id,
      field: cellParams?.field,
      value: e.target.value,
    });
  };

  useEffect(() => {
    if (isIncluded && editRow?.quantity === 0) {
      setQuantityEdit(defaultQuantity);
      const arr = furnitureEditError?.slice(0);
      const currentObj = arr?.find(value => value?.errorRowId === editRow?.id);
      if (currentObj) {
        const updatedObj = { ...currentObj, errorCaptured: false, errorRowId: editRow?.id };
        const editIndex = arr?.findIndex(value => value?.errorRowId === editRow?.id);
        arr[editIndex] = updatedObj;
        dispatch(assignmentActions.setFurnitureEditError(arr));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <>
      <Controller
        name={`'furnitureAdjustments.'${rowId}.quantity`}
        control={control}
        render={({ ref, value, onChange, onBlur, ...rest }) => (
          <TextField
            variant="outlined"
            size={'small'}
            style={{ width: '150px' }}
            disabled={!isIncluded}
            value={isIncluded ? quantity : missingField}
            inputProps={{ maxLength: 1 }}
            onBlur={e => {
              handleEditChanges(e);
            }}
            onChange={e => {
              handleEditChanges(e);
            }}
            onKeyPress={handleKeyPress}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === 'Tab') {
                handleEditChanges(e);
              }
            }}
            {...rest}
          />
        )}
      />
    </>
  );
});
