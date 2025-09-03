import React from 'react';
import { useFormContext } from 'react-hook-form';
import { TreeViewLookupTypes } from '../enum';
import { flattenArray, transformTreeViewData, useTreeLookupByCategoryName } from '../helper';
import MarginToolTreeView from '@AMIEWEB/MarginTool/Common/MarginToolTreeView';
import { useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import { IconButton } from 'amn-ui-core';
import { CustomTooltip } from '@AMIEWEB/Common';
import { useTranslation } from 'react-i18next';
import { IParentReimbursementCategory } from './model';
import { selectSelectedScenario } from 'store/redux-store/margin-tool/slices/add-edit-scenario/add-edit-scenario.selector';
import { useSelector } from 'react-redux';
import { PayPackageStatus } from 'store/redux-store/margin-tool/slices/pay-package-status/pay-package-status.model';
import { makeStyles } from 'tss-react/mui';

const useAddReimbursementStyles = makeStyles()(() => ({
  iconButton: {
    '&.Mui-disabled': {
      cursor: 'not-allowed',
      pointerEvents: 'auto',
    },
    '&:hover': {
      backgroundColor: 'transparent',
    },
  },
}));

interface IAddReimbursementProps {
  append: (obj: object | object[], focusOptions?) => void;
}

export const AddReimbursement = ({ append }: IAddReimbursementProps) => {
  const { classes } = useAddReimbursementStyles();
  const { t } = useTranslation();
  const reimbursementTreeViewOptions = useTreeLookupByCategoryName(TreeViewLookupTypes.Reimbursements);
  const reimbursementOptions = transformTreeViewData(
    Array.isArray(reimbursementTreeViewOptions) ? [] : reimbursementTreeViewOptions?.fields,
  );
  const [anchorEl, setAnchorEl] = useState(null);
  const { setValue } = useFormContext();
  const open = Boolean(anchorEl);
  const id = open ? 'reimbursement-tree-popper' : undefined;
  const scenario = useSelector(selectSelectedScenario);
  const isScenarioStatusPending = scenario?.scenarioStatusId === PayPackageStatus.Pending;

  /**
   * Method to handle the click event for the add reimbursement icon
   * @param event
   */
  const handleClick = event => {
    // Toggle between opening and closing the popper
    if (anchorEl) {
      handleClose();
    } else {
      setAnchorEl(event.currentTarget); // Open the popper
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  /**
   * Method to handle the field change event
   * @param values
   */
  const handleFieldChange = (values: IParentReimbursementCategory[]) => {
    const flattenedList = flattenArray(values);
    // Append the flattened list to the reimbursementFieldArray
    flattenedList.forEach(item => {
      append(item); // Append each new item to the field array
    });
    setValue(`assignment.reimbursementTree`, []); // Reset the tree selection
    handleClose();
  };

  return (
    <>
      <IconButton
        onClick={event => handleClick(event)}
        id="reimbursement-add-icon"
        disabled={!isScenarioStatusPending}
        className={classes.iconButton}
      >
        <CustomTooltip
          standardMargin
          tooltipContent={t('marginTool.components.assignment.reimbursement.addReimbursements')}
          disabled={!isScenarioStatusPending}
        >
          <AddIcon
            id="add-reimbursement-margin-tool-icon"
            sx={{
              color: theme => theme.palette.framework.system.tertiaryGrey,
              '&:hover': {
                color: theme => theme.palette.framework.system.main,
              },
            }}
          />
        </CustomTooltip>
      </IconButton>
      {open && (
        <MarginToolTreeView
          id={id}
          anchorElement={anchorEl}
          options={reimbursementOptions}
          name={`assignment.reimbursementTree`}
          onChangeFieldValues={values => handleFieldChange(values)}
          filterName="reimbursement-tree-filter"
          onCancelClick={handleClose}
        />
      )}
    </>
  );
};
