export enum IMarginUpdateResponseErrorTypes {
  Generic = 1,
  DateError = 2,
  TimeStampError = 3,
  ScenarioNameError = 4,
  PerDiemError = 5,
  DivideByZeroError = 6,
  BaseDetailsModifiedError = 7,
}

export enum IMarginUpdateResponseErrorTargetTypes {
  Model = 1,
  View = 2,
}

export interface IMarginUpdateResponse {
  status: number;
  inError: boolean;
  errorType?: IMarginUpdateResponseErrorTypes | null;
  target?: IMarginUpdateResponseErrorTargetTypes | IMarginUpdateResponseErrorTargetTypes.Model;
  scenarioId?: number | null;
  message: string;
  payload?: any | null;
}

export interface PostMarginToolResult {
  data: any | null | undefined;
}
