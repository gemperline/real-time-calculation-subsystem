interface IChildReimbursementCategory {
  name: string;
  userChecked: boolean;
  value: number;
}

export interface IParentReimbursementCategory {
  name: string;
  userChecked: boolean;
  value: number;
  children?: IChildReimbursementCategory[];
}

export interface IBookingPeriodData {
  bookingPeriodStartDate: Date;
  bookingPeriodEndDate: Date;
}
