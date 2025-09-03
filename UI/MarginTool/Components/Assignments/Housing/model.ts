export const defaultTimeFormat = 'YYYY-MM-DDTHH:mm:ss';

export enum HousingTypeOptions {
  noHousing = 'No Housing',
  clientHousing = 'Client Housing',
  companyHotel = 'Company Hotel',
  private1Bedroom = 'Private 1 Bedroom',
  private2Bedroom = 'Private 2 Bedroom',
  private3Bedroom = 'Private 3 Bedroom',
  privateStudio = 'Private Studio',
  shared1Bedroom = 'Shared 1 Bedroom',
  shared2Bedroom = 'Shared 2 Bedroom',
  shared3Bedroom = 'Shared 3 Bedroom',
  sharedStudio = 'Shared Studio',
}
export enum CheckInTypes {
  earlyMoveIn = 'earlyMoveIn',
  lateMoveOut = 'lateMoveOut',
}
export interface IEarlyOrLateDateChange {
  inputValue: any;
  valueToSet: string;
  conditionType: string;
}
