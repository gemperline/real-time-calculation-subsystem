import { CustomTreeView } from '@AMIEWEB/Common/TreeView/CustomTreeView';
import { calculateTreeCount } from '@AMIEWEB/Common/TreeView/TreeViewHelpers';
import { PaperDropdown } from 'app/ComponentLibrary/Filter/PaperDropDown';
import { FilterCompTypes } from 'app/ComponentLibrary/Filter/utils';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

interface MarginToolTreeViewProps {
  name: string;
  onChangeFieldValues: (newValue: any) => void;
  filterName: string;
  options: any[];
  anchorElement: HTMLElement | null;
  id: string;
  onCancelClick?: () => void;
  isSelectAll?: boolean;
  customClasses?: any;
  component?: any;
  hiddenInput?: boolean;
}

const MarginToolTreeView = ({
  name,
  onChangeFieldValues,
  filterName,
  options,
  anchorElement,
  id,
  onCancelClick,
  isSelectAll = true,
  customClasses,
  component,
  hiddenInput = false,
}: MarginToolTreeViewProps) => {
  const { control, watch } = useFormContext();

  /**
   * Method to handle the apply event for the tree picker
   */
  const handleTreePickerApply = () => {
    const newValue = watch(name);
    onChangeFieldValues?.(newValue);
  };

  return (
    <Controller
      control={control}
      name={name}
      render={({ ref, onChange, ...rest }) => (
        <PaperDropdown
          {...rest}
          id={id}
          anchorElement={anchorElement}
          onChange={newValue => {
            onChange(newValue);
          }}
          onApplyEvent={() => handleTreePickerApply()}
          filterName={filterName}
          type={FilterCompTypes.TREE}
          isMultiSelect={true}
          options={options}
          placeholder={'Select'}
          version2={true}
          returnsObjectAsValue={true}
          size="large"
          customSelectedCount={value => calculateTreeCount(value)}
          applyOnClickAway={false}
          applyOnEnter={false}
          Component={component ?? CustomTreeView}
          hiddenInput={hiddenInput}
          customClasses={customClasses ? customClasses : undefined}
          isSelectAll={isSelectAll}
          isCustomTree
          handleCancel={() => onCancelClick()}
        ></PaperDropdown>
      )}
    />
  );
};

export default MarginToolTreeView;
