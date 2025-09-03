import React, { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import MarginToolTreeView from '@AMIEWEB/MarginTool/Common/MarginToolTreeView';
import { useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import { IconButton } from 'amn-ui-core';
import { CustomTooltip } from '@AMIEWEB/Common';
import { useTranslation } from 'react-i18next';
import { selectSelectedScenario } from 'store/redux-store/margin-tool/slices/add-edit-scenario/add-edit-scenario.selector';
import { useSelector } from 'react-redux';
import { PayPackageStatus } from 'store/redux-store/margin-tool/slices/pay-package-status/pay-package-status.model';
import { TreeViewLookupTypes } from '../enum';
import { useTreeLookupByCategoryName } from '../helper';
import { useBonusesStyles } from './BonusesStyles';
import { IAddBonusProps, IBonusCategory } from './model';
import { CustomTypeAhead } from 'app/ComponentLibrary/Filter/TypeAheadDropdown/CustomTypeAhead';

export const AddBonuses = ({ append }: IAddBonusProps) => {
  const { classes } = useBonusesStyles();
  const { t } = useTranslation();
  const bonusesTypeOptions = useTreeLookupByCategoryName(TreeViewLookupTypes.BonusType);
  const bonusesOptions = useMemo(() => {
    return Array.isArray(bonusesTypeOptions)
      ? []
      : bonusesTypeOptions?.fields.length > 0
      ? bonusesTypeOptions?.fields[0]?.items?.map(item => ({
          name: item.description,
          value: item.id,
        }))
      : [];
  }, [bonusesTypeOptions]);
  const [anchorEl, setAnchorEl] = useState(null);
  const { setValue } = useFormContext();
  const open = Boolean(anchorEl);
  const id = open ? 'bonuses-tree-popper' : undefined;
  const scenario = useSelector(selectSelectedScenario);
  const isScenarioStatusPending = scenario?.scenarioStatusId === PayPackageStatus.Pending;

  const handleClick = event => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  const handleFieldChange = (values: IBonusCategory[]) => {
    values.forEach(item => {
      append(item);
    });
    setValue(`assignment.bonusesTree`, []);
    handleClose();
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <CustomTooltip
        standardMargin
        tooltipContent={t('marginTool.components.assignment.bonuses.addBonuses')}
        disabled={!isScenarioStatusPending}
      >
        <IconButton
          onClick={event => handleClick(event)}
          id="bonuses-add-icon"
          disabled={!isScenarioStatusPending}
          className={classes.iconButton}
        >
          <AddIcon id="add-bonuses-margin-tool-icon" className={classes.addIcon} />
        </IconButton>
      </CustomTooltip>
      {open && (
        <MarginToolTreeView
          id={id}
          anchorElement={anchorEl}
          options={bonusesOptions}
          name={`assignment.bonusesTree`}
          onChangeFieldValues={values => handleFieldChange(values)}
          filterName="bonuses-tree-filter"
          isSelectAll={false}
          customClasses={{ listbox: classes.listBox, option: classes.option }}
          hiddenInput={true}
          component={CustomTypeAhead}
          onCancelClick={handleClose}
        />
      )}
    </>
  );
};
