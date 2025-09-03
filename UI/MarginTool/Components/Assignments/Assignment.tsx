import React, { useCallback, useEffect } from 'react';
import { debounce } from 'amn-ui-core';
import { useDispatch, useSelector } from 'react-redux';
import { assignmentActions } from 'store/redux-store/margin-tool/slices/assignment/assignment.redux';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { CONSTANTS, getFieldsToShow, sortAssignmentSplits } from './helper';
import { MarginDetailsResponseScenarioSplitItem } from 'store/redux-store/margin-tool/slices/add-edit-scenario/add-edit-scenario.model';
import { selectTreeViewLookupData } from 'store/redux-store/margin-tool/slices/assignment/assignment.selector';
import { SplitWrapper } from './SplitWrapper';
import { AssignmentSplitItem } from './AssignmentSplitItem';
import { AssignmentSplitContainerTitles } from './enum';
import { usePeopleSoftCalculation } from '../PeopleSoftCalculation/IPeopleSoftCalculationHelper';
import { scenarioActions } from 'store/redux-store/margin-tool/slices/add-edit-scenario/add-edit-scenario.redux';
import { selectFeatchScenarioCalculateState } from 'store/redux-store/margin-tool/slices/add-edit-scenario/add-edit-scenario.selector';

/**
 * Component to render Assignment section with splits
 */
export const AssignmentSection = () => {
  const dispatch = useDispatch();
  const { control } = useFormContext();
  const pickListData = useSelector(selectTreeViewLookupData);
  const { triggerPeopleSoftCalculation } = usePeopleSoftCalculation();
  const shouldFeatchScenarioCalculateData = useSelector(selectFeatchScenarioCalculateState);

  /**
   *  //TODO: can remove the debounce if the form array sets the latest values to form and request payload is created with it
   *  Lets debounce the trigger calculation method after assignment splits are updated on the form
   */
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedTriggerCalculation = useCallback(
    debounce(() => {
      triggerPeopleSoftCalculation(true);
      dispatch(scenarioActions.setFeatchScenarioCalculate(false));
    }, 300),
    [],
  );

  /**
   * Method to invoke the field array for assignment splits
   * Do not use this FieldArray with same name "assignmentSplits" in nested components
   * use "assignmentSplits.${splitIndex}" instead
   */
  const { fields: assignmentSplits } = useFieldArray<MarginDetailsResponseScenarioSplitItem[]>({
    control,
    name: `assignmentSplits`,
  });

  //@ts-ignore
  const sortedAssignmentSplits = sortAssignmentSplits(assignmentSplits);

  useEffect(() => {
    if (!pickListData?.length) dispatch(assignmentActions.getTreeViewDataForPickList());
  }, []);

  /**
   * Debounce the trigger calculation method after assignment splits are updated on the form (initial call)
   */
  useEffect(() => {
    if (assignmentSplits?.length && shouldFeatchScenarioCalculateData) {
      debouncedTriggerCalculation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignmentSplits, shouldFeatchScenarioCalculateData]);

  return (
    <>
      {/* No Split created */}
      {sortedAssignmentSplits.length === 1 ? (
        sortedAssignmentSplits?.map((field: MarginDetailsResponseScenarioSplitItem, splitIndex: number) => (
          <AssignmentSplitItem
            key={field.id}
            field={field}
            splitIndex={splitIndex}
            noSplitCreated
            fieldsToShow={getFieldsToShow(CONSTANTS.CONTAINER.NO_SPLIT_CREATED)}
            titlesToShow={[AssignmentSplitContainerTitles.NoSplitCreatedTitle]}
          />
        ))
      ) : (
        <SplitWrapper sortedAssignmentSplits={sortedAssignmentSplits} />
      )}
    </>
  );
};
