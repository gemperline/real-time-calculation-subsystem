import { MarginDetailsResponseScenario } from 'store/redux-store/margin-tool/slices/add-edit-scenario/add-edit-scenario.model';
import { AssignmentSplitContainerTitles } from '../enum';
import { IBookingPeriodData } from '../Reimbursement/model';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'amn-ui-core';
import { customAssignmentTitle, customSplitTitle } from '../helper';

interface IUseContainerTitleProps {
  selectedScenario: MarginDetailsResponseScenario;
  splitIndex: number;
  titlesToShow: Array<AssignmentSplitContainerTitles>;
  bookingPeriodData: IBookingPeriodData;
  noSplitCreated?: boolean;
}

interface ITitleMetadata {
  title: string;
  subTitle: string | JSX.Element;
}

export const useContainerTitle = ({
  selectedScenario,
  splitIndex,
  titlesToShow,
  bookingPeriodData,
  noSplitCreated,
}: IUseContainerTitleProps): Record<string, ITitleMetadata> => {
  const { t } = useTranslation();
  const theme = useTheme();

  // Determine the custom title
  const title = (() => {
    if (
      titlesToShow.includes(AssignmentSplitContainerTitles.AssignmentTitle) ||
      titlesToShow.includes(AssignmentSplitContainerTitles.NoSplitCreatedTitle)
    ) {
      return t('marginTool.components.assignment.title'); // This will only return title
    } else {
      return `Split ${splitIndex + 1}`;
    }
  })();

  // Determine the custom sub-title
  const subTitle = (() => {
    switch (true) {
      case titlesToShow.includes(AssignmentSplitContainerTitles.AssignmentTitle):
        return customAssignmentTitle(bookingPeriodData, theme); // This will only return title
      case titlesToShow.includes(AssignmentSplitContainerTitles.SplitTitle):
      case titlesToShow.includes(AssignmentSplitContainerTitles.NoSplitCreatedTitle):
        return customSplitTitle({
          selectedScenario,
          splitIndex,
          bookingPeriodData,
          noSplitCreated,
          t,
          theme,
        });
      default:
        return '';
    }
  })();

  return { container: { title, subTitle } };
};
