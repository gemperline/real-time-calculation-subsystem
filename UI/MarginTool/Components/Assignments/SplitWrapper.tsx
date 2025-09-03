import React from 'react';
import { CONSTANTS, getFieldsToShow } from './helper';
import { MarginDetailsResponseScenarioSplitItem } from 'store/redux-store/margin-tool/slices/add-edit-scenario/add-edit-scenario.model';
import { AssignmentSplitItem } from './AssignmentSplitItem';
import { AssignmentSplitContainerTitles } from './enum';

export const SplitWrapper = ({
  sortedAssignmentSplits,
}: {
  sortedAssignmentSplits: MarginDetailsResponseScenarioSplitItem[];
}) => {
  return (
    <>
      {sortedAssignmentSplits.length && (
        <AssignmentSplitItem
          fieldsToShow={getFieldsToShow(CONSTANTS.CONTAINER.IS_ASSIGNMENT_CONTAINER)}
          titlesToShow={[AssignmentSplitContainerTitles.AssignmentTitle]}
        />
      )}
      {sortedAssignmentSplits.length > 1 &&
        sortedAssignmentSplits?.map((field: MarginDetailsResponseScenarioSplitItem, splitIndex: number) => (
          <AssignmentSplitItem
            key={field.id}
            field={field}
            splitIndex={splitIndex}
            sortedAssignmentSplits={sortedAssignmentSplits}
            fieldsToShow={getFieldsToShow(CONSTANTS.CONTAINER.IS_SPLIT)}
            titlesToShow={[AssignmentSplitContainerTitles.SplitTitle]}
          />
        ))}
    </>
  );
};
