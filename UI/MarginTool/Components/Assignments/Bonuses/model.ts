export interface IAddBonusProps {
  append: (obj: object | object[], focusOptions?) => void;
}
export interface IBonusCategory {
  name: string;
  userChecked: boolean;
  value: number;
}
export interface IFieldItem {
  id: string;
  name: string;
  userChecked: boolean;
  value: number;
  bonusAmount: string;
  description: string;
}
export interface BonusesItemProps {
  index: number;
  item: IFieldItem;
  handleBonusesDelete: (index: number) => void;
  totalItems: number | string;
}

export enum BonusesFieldCategoryName {
  AMNFindAndFill = 'AMN Find and Fill',
}