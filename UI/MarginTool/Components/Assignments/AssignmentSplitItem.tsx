import MarginToolCard from '@AMIEWEB/MarginTool/Common/MarginToolCard';
import { MarginToolCardTitle } from '@AMIEWEB/MarginTool/Common/MarginToolCardTitle';
import { useTheme, AccordionDetails, Grid } from 'amn-ui-core';
import React, { useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { MarginDetailsResponseScenarioSplitItem } from 'store/redux-store/margin-tool/slices/add-edit-scenario/add-edit-scenario.model';
import {
  selectSelectedScenario,
  selectBookingPeriod,
} from 'store/redux-store/margin-tool/slices/add-edit-scenario/add-edit-scenario.selector';
import { AdditionalCosts } from './AdditionalCosts/AdditionalCosts';
import { AllowancesPerDiem } from './AllowancesPerDiems/AllowancesPerDiem';
import { Benefits } from './Benefits';
import { BillRates } from './BillRates/BillRates';
import { Bonuses } from './Bonuses/Bonuses';
import { AssignmentSplitContainerFields, AssignmentSplitContainerTitles } from './enum';
import { Housing } from './Housing/Housing';
import { PayRates } from './PayRates/PayRates';
import { Reimbursement } from './Reimbursement/Reimbursement';
import { RequestedTimeOff } from './RequestedTimeOff/TimeOff';
import { Travel } from './Travel';
import { useContainerTitle } from './CustomHooks/useContainerTitle';
import { registerNonFormFieldValues } from './helper';
import { useFormContext } from 'react-hook-form';

/**
 * Component rendered on each Assignment iteration
 */

export const AssignmentSplitItem = ({
  splitIndex,
  noSplitCreated,
  fieldsToShow,
  field,
  titlesToShow,
  sortedAssignmentSplits = [],
}: {
  splitIndex?: number;
  noSplitCreated?: boolean;
  fieldsToShow?: AssignmentSplitContainerFields[];
  field?: MarginDetailsResponseScenarioSplitItem;
  titlesToShow?: Array<AssignmentSplitContainerTitles>;
  sortedAssignmentSplits?: MarginDetailsResponseScenarioSplitItem[];
}) => {
  const theme = useTheme();
  const selectedScenario = useSelector(selectSelectedScenario);
  const bookingPeriodDetails = useSelector(selectBookingPeriod);

  const { title, subTitle } = useContainerTitle({
    selectedScenario,
    splitIndex,
    titlesToShow,
    bookingPeriodData: {
      bookingPeriodStartDate: bookingPeriodDetails?.bookingPeriodStartDate,
      bookingPeriodEndDate: bookingPeriodDetails?.bookingPeriodEndDate,
    },
    noSplitCreated,
  }).container;

  const { register, setValue } = useFormContext();
  const currentSplit = `assignmentSplits.${splitIndex}`;

  useEffect(() => {
    if (splitIndex > -1) registerNonFormFieldValues(register, setValue, currentSplit, field);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [splitIndex]);

  const componentMap = {
    [AssignmentSplitContainerFields.RequestedTimeOff]: <RequestedTimeOff />,
    [AssignmentSplitContainerFields.Travel]: <Travel />,
    [AssignmentSplitContainerFields.Benefits]: (
      <Benefits splitIndex={splitIndex} field={field} sortedAssignmentSplits={sortedAssignmentSplits} />
    ),
    [AssignmentSplitContainerFields.Reimbursements]: <Reimbursement />,
    [AssignmentSplitContainerFields.Bonuses]: <Bonuses />,
    [AssignmentSplitContainerFields.BillRates]: <BillRates splitIndex={splitIndex} field={field} />,
    [AssignmentSplitContainerFields.PayRates]: <PayRates splitIndex={splitIndex} field={field} />,
    [AssignmentSplitContainerFields.AllowancesPerDiem]: <AllowancesPerDiem splitIndex={splitIndex} field={field} />,
    [AssignmentSplitContainerFields.Housing]: <Housing splitIndex={splitIndex} field={field} />,
    [AssignmentSplitContainerFields.AdditionalCosts]: <AdditionalCosts splitIndex={splitIndex} field={field} />,
  };


  return (
    <MarginToolCard
      title={<MarginToolCardTitle title={title} customSubtitle={subTitle} />}
      id="assignment-card-marginTool"
    >
      <AccordionDetails
        sx={{
          bgcolor: theme.palette.components.accordion.secondary.backgroundColor,
          pt: '12px',
          borderRadius: '0px 0px 4px 4px',
        }}
      >
        <Grid container item direction="column" rowGap={2}>
          {fieldsToShow.map((fieldType, index) => {
            const Component = componentMap[fieldType];
            if (!Component) return null;
            return (
              <Grid item key={index}>
                {Component}
              </Grid>
            );
          })}
        </Grid>
      </AccordionDetails>
    </MarginToolCard>
  );
};
