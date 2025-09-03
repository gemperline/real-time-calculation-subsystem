import { IScenarioSplitItem } from '@AMIEWEB/MarginTool/Components/PayPackage/AddScenario/model';

export enum StatusTransitionModalType {
  None,
  Approve,
  Deny,
  RequestApproval,
  Verify,
  Reset,
}

export enum PayPackageField {
  NewStatus = 'newStatus',
  RejectReasons = 'rejectReasons',
  OtherReasons = 'otherReasons',
  DueDate = 'dueDate',
  AssignedTo = 'assignedTo',
  CC = 'cc',
  Attachments = 'attachments',
  AdditionalDetails = 'additionalDetails',
}

export enum PayPackageStatus {
  Pending = 1,
  ApprovalRequested = 2,
  Approved = 3,
  Verified = 4,
}

export enum StatusTransitionButtons {
  Approve = 'APPROVE',
  RequestApproval = 'REQUEST APPROVAL',
  Deny = 'DENY',
  reset = 'RESET',
  verify = 'VERIFY',
}

export enum ScenarioStatus {
  Accepted = 'Accepted',
  Declined = 'Declined',
}

export interface IPayPackageStatusTransitionModalDetails {
  openModal: boolean;
  type: StatusTransitionModalType;
}

export interface IInitiatePayPacketStatusTransition extends IPayPackageStatusTransitionModalDetails {
  statusId?: number;
}

export interface IStatusOptions {
  id: number;
  name: string;
  description: string;
  rejectionReasons: IStatusOptions[] | null;
}

export interface IPayPackageStatus {
  payPackageStatusTransitionModalDetails: IPayPackageStatusTransitionModalDetails;
  payPackageStatusOptions: IStatusOptions[];
  recentStatusUpdatedScenarioId?: number;
  isEmailModalOpen: IEmailModalType;
  emailRecipients: IEmailRecipientModal;
}

export interface IEmailModalType {
  openEmailModal: boolean;
  emailType: string;
  emailVariant?: string;
}

export interface IUpdatePayPackageStatusPayload {
  statusId: number;
  payPackageId: number;
  placementId: number;
  bookingPeriodId: number;
  notes?: string;
  userId: number;
  openEmailModal?: boolean;
  timestamp?: string;
  bookingPeriodStartDate?: Date | string;
  bookingPeriodEndDate?: Date | string;
  scenarioSplitItemList?: IScenarioSplitItem[];
}

export interface IDeleteScenarioDetailsPayload {
  scenarioId: number;
  timestamp?: string;
}

export interface IDeleteMarginToolDetailsPayload {
  placementId: number;
}

export interface IEmail {
  firstName: string;
  lastName: string;
  employeeId: number;
  email: string;
}

export interface IEmailRecipientModal {
  recruiterDirector: IEmail;
  recruiter: IEmail;
  accountManager: IEmail;
  candidateContract: IEmail;
  clientContractAdmin: IEmail;
  propelApprovers: IEmail;
  divisionId: number;
  division: string;
}

export interface IEmailSenderModal {
  name: string;
  email: string;
  senderId: string;
  userId: string;
  editFlag?: boolean;
}
