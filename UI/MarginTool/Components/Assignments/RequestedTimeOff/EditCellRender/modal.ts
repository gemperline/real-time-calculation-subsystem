import { GridCellParams } from '@mui/x-data-grid-pro';
import { MarginDetailsResponseScenarioSplitItem } from 'store/redux-store/margin-tool/slices/add-edit-scenario/add-edit-scenario.model';

export type CustomGridCellParams = {
  editCell: GridCellParams;
  error: string;
};

export interface ITimeOffProps {
  splitIndex: number;
  field: MarginDetailsResponseScenarioSplitItem;
}

export const dateTimeFormat = 'YYYY-MM-DDTHH:mm:ss'
export const dateTimeLabelFormat = 'MM/DD/YYYY'