import { TreeViewConstants } from '@AMIEWEB/MarginTool/enum';
import { IEmailRecipients } from '@AMIEWEB/Notification/Constants';
import { missingDate, missingField } from 'app/constants';
import { AMNDivisionType } from 'app/models/enums/AMNDivisionType';
import { IEmployee, IToken } from 'app/models/Notification/Notification';
import { IPlacementDetails } from 'app/models/Placement/PlacementDetails';
import { isCandidateContractUser, userRoles } from 'oidc/userRoles';
import {
  IEmailRecipientModal,
  IEmailSenderModal,
  PayPackageStatus,
  ScenarioStatus,
  StatusTransitionButtons,
  StatusTransitionModalType,
} from 'store/redux-store/margin-tool/slices/pay-package-status/pay-package-status.model';
import { theme } from 'styles/global-styles';
import { EmailVariant } from './PayPackageHelper';
import {
  FurnitureCost,
  IPlacementMarginDetailsResponseScenarioSplitPayPackageDetailsValue,
  MarginDetailsResponse,
  MarginDetailsResponseScenario,
  MarginDetailsResponseScenarioSplitItem,
} from 'store/redux-store/margin-tool/slices/add-edit-scenario/add-edit-scenario.model';
import { IScenarioSplitItem } from './AddScenario/model';
import { isUndefined } from 'lodash';
import { formatDate, formatDateObj } from '@AMIEWEB/MarginTool/helper';
import { formatDateToStartOfDay } from 'app/helpers/dateHelper';
import i18next from 'i18next';
import { getExtensionDuration } from 'app/helpers/getExtensionDuration';
import moment from 'moment';
import { formattedNumber } from './PayPackagePreview/helper';
import { isNullOrUndefined } from 'app/helpers/objectHelpers';

export const getStatusTransitionEnabledUpdate = (statusId: number, activeUserRoles: string[], isValid?: Boolean) => {
  if (statusId === PayPackageStatus.Pending) {
    return [
      {
        button: StatusTransitionButtons.RequestApproval,
        enabled: !isValid ? !isValid : true,
        show: true,
      },
      {
        button: StatusTransitionButtons.Approve,
        enabled: isCandidateContractUser(activeUserRoles) || activeUserRoles.includes(userRoles.recruitment_Leadership),
        show: true,
      },
    ];
  } else if (statusId === PayPackageStatus.ApprovalRequested) {
    return [
      {
        button: StatusTransitionButtons.Approve,
        enabled: isCandidateContractUser(activeUserRoles) || activeUserRoles.includes(userRoles.recruitment_Leadership),
        show: true,
      },
      {
        button: StatusTransitionButtons.reset,
        enabled: true,
        show: true,
      },
    ];
  } else if (statusId === PayPackageStatus.Approved) {
    return [
      {
        button: StatusTransitionButtons.verify,
        enabled: isCandidateContractUser(activeUserRoles),
        show: true,
      },
      {
        button: StatusTransitionButtons.reset,
        enabled: true,
        show: true,
      },
    ];
  } else if (statusId === PayPackageStatus.Verified) {
    return [
      {
        button: StatusTransitionButtons.reset,
        enabled: true,
        show: true,
      },
    ];
  }
};
export const getTransitionStatusCategory = (type: StatusTransitionModalType) => {
  switch (type) {
    case StatusTransitionModalType.Deny:
      return StatusTransitionModalType.Deny;
    case StatusTransitionModalType.Approve:
    case StatusTransitionModalType.RequestApproval:
      return StatusTransitionModalType.Approve;
    default:
      return StatusTransitionModalType.None;
  }
};

export const getModalTitle = (type: StatusTransitionModalType, scenarioName: string) => {
  switch (type) {
    case StatusTransitionModalType.Approve:
      return `Approve ${scenarioName}`;
    case StatusTransitionModalType.Deny:
      return `Deny ${scenarioName}`;
    case StatusTransitionModalType.RequestApproval:
      return `Submit for Approval ${scenarioName}`;
    default:
      return '';
  }
};

export const getPayPackageStatusChipColor = (val: number) => {
  switch (val) {
    case 1:
      return `${theme.palette.framework?.system?.lightOrange}`;
    case 2:
    case 3:
      return `${theme.palette.framework?.system?.lightViolet}`;
    case 4:
      return `${theme.palette.framework?.system?.lightGreen}`;
    default:
      return `${theme.palette.framework?.system?.lightOrange}`;
  }
};

export const getPayPackageStatusChipTextColor = (val: number) => {
  switch (val) {
    case 1:
      return `${theme.palette?.system?.orangeBrown}`;
    case 2:
    case 3:
      return `${theme.palette.framework?.system?.violet}`;
    case 4:
      return `${theme.palette?.system?.irishGreen}`;
    default:
      return `${theme.palette?.system?.orangeBrown}`;
  }
};

// temporary function to fetch the status name. Will be removed once pay package scenario data will be integrated
export const getPayPackageStatusName = (val: number) => {
  switch (val) {
    case 1:
      return 'Pending';
    case 2:
      return 'Approval Requested';
    case 3:
      return 'Approved';
    case 4:
      return 'Verified';
    default:
      return 'Pending';
  }
};

export const getStatusIdForUpdate = (type: StatusTransitionModalType) => {
  if (type === StatusTransitionModalType.Approve) {
    return PayPackageStatus.Approved;
  } else if (type === StatusTransitionModalType.RequestApproval) {
    return PayPackageStatus.ApprovalRequested;
  } else if (type === StatusTransitionModalType.Verify) {
    return PayPackageStatus.Verified;
  } else if (type === StatusTransitionModalType.Reset) {
    return PayPackageStatus.Pending;
  } else {
    return PayPackageStatus.Pending;
  }
};

export const getScenarioSplits = (selectedScenario: MarginDetailsResponseScenario): IScenarioSplitItem[] => {
  return selectedScenario?.splits?.map(split => ({
    splitId: split?.splitId,
    mode: 2,
    startDate: formatDateToStartOfDay(split?.effectiveStartDate),
    endDate: formatDateToStartOfDay(split?.effectiveEndDate),
    shiftId: split?.shiftId,
    hoursPerWeek: split?.hoursPerWeek,
    hoursPerShift: split?.hoursPerShift,
  }));
};

export const convertToPercentage = (value: number) => {
  if (value === null || value === undefined) return `${missingField}%`;
  const percentage = value * 100;
  const rounded = Math.round(percentage * 100) / 100;
  return `${rounded.toFixed(2)}%`;
};

export const getAddScenarioButtonState = (
  placementIdParam,
  treeViewSelectedBookingPeriod,
  selectedBookingPeriod,
  t,
) => {
  let isDisabled = false;
  let tooltipMessage = '';
  let hasValidPlacementId = false;
  if (treeViewSelectedBookingPeriod?.placementId > 0) {
    hasValidPlacementId = true;
  }
  if (!hasValidPlacementId && placementIdParam > 0) {
    hasValidPlacementId = true;
  }
  if (!hasValidPlacementId) {
    return {
      state: true,
      message: t('marginTool.tooltip.disabledAddScenarioDueToPlacementIdNotAvailable'),
    };
  }

  if (selectedBookingPeriod) {
    if (selectedBookingPeriod?.scenarios?.length < TreeViewConstants.MAX_NUM_SCENARIOS) {
      selectedBookingPeriod?.scenarios?.forEach(each => {
        if (each?.scenarioStatusId !== PayPackageStatus.Pending) {
          isDisabled = true;
          tooltipMessage = t('marginTool.tooltip.disabledAddScenarioDueToStatus');
        }
      });
    } else if (selectedBookingPeriod?.scenarios?.length >= TreeViewConstants.MAX_NUM_SCENARIOS) {
      isDisabled = true;
      tooltipMessage = t('marginTool.tooltip.disabledAddScenarioDueToLimit');
    }
  }

  return { state: isDisabled, message: tooltipMessage };
};

export const formatEmailRecipientsList = (
  scenarioStatus: number,
  selectEmailRecipients: IEmailRecipientModal,
  sender: IEmployee,
  nextScenario: number,
) => {
  const isAMNNurse = selectEmailRecipients?.divisionId === AMNDivisionType.amnNurse;

  const emailRecipients: IEmailRecipients = {};
  if (scenarioStatus === PayPackageStatus.Pending) {
    switch (nextScenario) {
      case PayPackageStatus.ApprovalRequested:
        if (isAMNNurse) {
          emailRecipients.to = [getSenderObject(selectEmailRecipients?.recruiterDirector)];
          emailRecipients.cc = [
            getSenderObject(selectEmailRecipients?.propelApprovers),
            getSenderObject(selectEmailRecipients?.candidateContract),
          ];
          emailRecipients.bcc = [sender];
        } else {
          emailRecipients.to = [getSenderObject(selectEmailRecipients?.recruiterDirector)];
          emailRecipients.cc = [];
          emailRecipients.bcc = [sender];
        }

        break;

      case PayPackageStatus.Approved:
        if (isAMNNurse) {
          emailRecipients.to = [getSenderObject(selectEmailRecipients?.propelApprovers)];
          emailRecipients.cc = [getSenderObject(selectEmailRecipients?.recruiter)];
          emailRecipients.bcc = [sender];
        } else {
          emailRecipients.to = [
            getSenderObject(selectEmailRecipients?.propelApprovers),
            getSenderObject(selectEmailRecipients?.candidateContract),
          ];
          emailRecipients.cc = [
            getSenderObject(selectEmailRecipients?.accountManager),
            getSenderObject(selectEmailRecipients?.clientContractAdmin),
            getSenderObject(selectEmailRecipients?.recruiter),
          ];
          emailRecipients.bcc = [sender];
        }
        break;
      default:
    }
  } else if (scenarioStatus === PayPackageStatus.ApprovalRequested) {
    if (isAMNNurse) {
      emailRecipients.to = [
        getSenderObject(selectEmailRecipients?.propelApprovers),
        getSenderObject(selectEmailRecipients?.candidateContract),
      ];
      emailRecipients.cc = [getSenderObject(selectEmailRecipients?.recruiter)];
      emailRecipients.bcc = [sender];
    } else {
      emailRecipients.to = [
        getSenderObject(selectEmailRecipients?.propelApprovers),
        getSenderObject(selectEmailRecipients?.candidateContract),
      ];
      emailRecipients.cc = [
        getSenderObject(selectEmailRecipients?.accountManager),
        getSenderObject(selectEmailRecipients?.clientContractAdmin),
        getSenderObject(selectEmailRecipients?.recruiter),
      ];
      emailRecipients.bcc = [sender];
    }
  }
  return emailRecipients;
};

export const formatManualRecipientList = (
  scenarioStatus: number,
  selectEmailRecipients: IEmailRecipientModal,
  sender: IEmployee,
  variant: string,
  candidateDetails: IEmailSenderModal,
) => {
  const isAMNNurse = selectEmailRecipients?.divisionId === AMNDivisionType.amnNurse;

  const emailRecipients: IEmailRecipients = {};
  if (variant === EmailVariant.Internal) {
    switch (scenarioStatus) {
      case PayPackageStatus.Pending:
        emailRecipients.to = [];
        emailRecipients.cc = [];
        emailRecipients.bcc = [sender];
        break;
      case PayPackageStatus.ApprovalRequested:
        if (isAMNNurse) {
          emailRecipients.to = [getSenderObject(selectEmailRecipients?.recruiterDirector)];
          emailRecipients.cc = [
            getSenderObject(selectEmailRecipients?.propelApprovers),
            getSenderObject(selectEmailRecipients?.candidateContract),
          ];
          emailRecipients.bcc = [sender];
        } else {
          emailRecipients.to = [getSenderObject(selectEmailRecipients?.recruiterDirector)];
          emailRecipients.cc = [];
          emailRecipients.bcc = [sender];
        }

        break;

      case PayPackageStatus.Approved:
        if (isAMNNurse) {
          emailRecipients.to = [
            getSenderObject(selectEmailRecipients?.propelApprovers),
            getSenderObject(selectEmailRecipients?.candidateContract),
          ];
          emailRecipients.cc = [getSenderObject(selectEmailRecipients?.recruiter)];
          emailRecipients.bcc = [sender];
        } else {
          emailRecipients.to = [
            getSenderObject(selectEmailRecipients?.propelApprovers),
            getSenderObject(selectEmailRecipients?.candidateContract),
          ];
          emailRecipients.cc = [
            getSenderObject(selectEmailRecipients?.accountManager),
            getSenderObject(selectEmailRecipients?.clientContractAdmin),
            getSenderObject(selectEmailRecipients?.recruiter),
          ];
          emailRecipients.bcc = [sender];
        }
        break;
      case PayPackageStatus.Verified:
        emailRecipients.to = [];
        emailRecipients.cc = [];
        emailRecipients.bcc = [sender];
        break;
      default:
    }
  } else if (variant === EmailVariant.Candidate) {
    emailRecipients.to = [candidateDetails];
    emailRecipients.cc = [];
    emailRecipients.bcc = [sender];
  }
  //There will be additional checks in furure hence added else if
  return emailRecipients;
};

export const getSenderObject = user => {
  if (!user) return null;
  const sender: IEmailSenderModal = {
    name: user?.firstName + ' ' + user?.lastName,
    email: user?.email,
    senderId: `${user?.employeeId}`,
    userId: `${user?.employeeId}`,
    editFlag: true,
  };
  return sender;
};

export const getCandidateDetails = (placementDetails: IPlacementDetails) => {
  if (!placementDetails?.header?.candidate?.id) return null;
  const user = placementDetails?.header;
  const sender: IEmailSenderModal = {
    name: user?.candidate?.firstName + ' ' + user?.candidate?.lastName,
    email: user?.candidatePrimaryEmail,
    senderId: ``,
    userId: ``,
    editFlag: true,
  };
  return sender;
};

export const getTotalReimbursement = (selectedScenario: MarginDetailsResponseScenario) => {
  const pickListTotal = selectedScenario?.assignment?.payPackageDetailsValues?.reduce((acc, item) => {
    let total = acc;
    if (item?.payPackageValues['amount']) {
      if (!isNullOrUndefined(item?.payPackageValues?.amount) && item?.payPackageValues?.amount !== 0) {
        total = acc + item?.payPackageValues?.amount;
      }
    }
    return total;
  }, 0);
  const travelDetail = selectedScenario?.assignment?.travel;
  return (
    travelDetail?.arrivingTravel +
    travelDetail?.endingTravel +
    travelDetail?.interimTravel +
    travelDetail?.amnFlight +
    travelDetail?.amnRentalCar +
    pickListTotal
  );
};

export const getSubstitutions = values => {
  const substitutions: IToken[] = [
    {
      name: 'Signature',
      input: '{{signature}}',
    },
    {
      name: 'FirstName',
      input: '{{firstName}}',
      value: values?.firstName,
    },
    {
      name: 'LastName',
      input: '{{lastName}}',
      value: values?.lastName,
    },
    {
      name: 'Assignment',
      input: '{{assignment}}',
      value: values?.assignment,
    },
    {
      name: 'Shift',
      input: '{{shift}}',
      value: values?.shift,
    },
    {
      name: 'Location',
      input: '{{location}}',
      value: values?.location,
    },
    {
      name: 'Benefit',
      input: '{{benefitStatus}}',
      value: values?.benefit,
    },
    {
      name: 'Arriving Travel',
      input: '{{arrivingTravel}}',
      value: values?.arrivingTravel ? String(values?.arrivingTravel) : undefined,
    },
    {
      name: 'Ending Travel',
      input: '{{endingTravel}}',
      value: values?.endingTravel ? String(values?.endingTravel) : undefined,
    },
    {
      name: 'Interim Travel',
      input: '{{interimTravel}}',
      value: values?.interimTravel ? String(values?.interimTravel) : undefined,
    },
    {
      name: 'AMN Flight',
      input: '{{flight}}',
      value: values?.flight ? String(values?.flight) : undefined,
    },
    {
      name: 'AMN Rental Car',
      input: '{{rentalCar}}',
      value: values?.rentalCar ? String(values?.rentalCar) : undefined,
    },
    {
      name: 'Total',
      input: '{{total}}',
      value: values?.total,
    },
    {
      name: 'Total Reimbursement',
      input: '{{totalReimbursement}}',
      value: values?.totalReimbursement,
    },
    {
      name: 'Total Weekly Gross',
      input: '{{totalWeeklyGross}}',
      value: values?.totalWeeklyGross,
    },
    {
      name: 'Est. Total Net Pay',
      input: '{{estimatedTotalNetPay}}',
      value: values?.estimatedTotalNetPay,
    },
  ];
  return substitutions;
};

const getTotalGross = (item: MarginDetailsResponseScenarioSplitItem) => {
  const totalGross =
    item?.payRate * item?.hoursPerWeek +
    item?.mealPerDiem * 7 +
    item?.lodgingPerDiem * 7 +
    item?.tlaCarAllowance * item?.hoursPerShift +
    item?.tlaMealAllowance * (item?.hoursPerWeek / item?.hoursPerShift);
  const cellPhoneStipend = item?.cellPhoneStipend
    ? item?.cellPhoneStipend * 7
    : item?.tlaCellPhoneStipend * (item?.hoursPerWeek / item?.hoursPerShift);

  return totalGross + cellPhoneStipend;
};

const getTLASumAmount = (tlaItem: number, tlaEnabled: boolean, hoursPerWeek: number, hoursPerShift: number) => {
  if (
    tlaEnabled &&
    !isNullOrUndefined(tlaItem) &&
    !isNullOrUndefined(hoursPerWeek) &&
    !isNullOrUndefined(hoursPerShift)
  ) {
    return String(formattedNumber((tlaItem * (hoursPerWeek / hoursPerShift))?.toFixed(2)));
  } else {
    return undefined;
  }
};

const getSplitRate = (item: number) => {
  return !isNullOrUndefined(item) ? String(item.toFixed(2)) : undefined;
};

const getTLASplitRate = (item: number, tlaEnabled: boolean) => {
  return tlaEnabled && !isNullOrUndefined(item) ? String(item.toFixed(2)) : undefined;
};

export const getSplitData = (splits: MarginDetailsResponseScenarioSplitItem[], tlaEnabled: boolean) => {
  const splitResults = splits?.map((item, index) => {
    const assignmentStartDate = !isUndefined(item?.effectiveStartDate)
      ? formatDateObj(item?.effectiveStartDate)
      : formatDate(missingDate);
    const assignmentEndDate = !isUndefined(item?.effectiveEndDate)
      ? formatDateObj(item?.effectiveEndDate)
      : formatDate(missingDate);
    const totalWeeklyGross = getTotalGross(item);
    let phoneRate = undefined;
    let phoneStipend = undefined;
    if (item?.cellPhoneStipend) {
      phoneRate = getSplitRate(item?.cellPhoneStipend);
      phoneStipend = String((item?.cellPhoneStipend * 7).toFixed(2));
    } else if (item?.tlaCellPhoneStipend) {
      phoneRate = getTLASplitRate(item?.tlaCellPhoneStipend, tlaEnabled);
      phoneStipend = getTLASumAmount(item?.tlaCellPhoneStipend, tlaEnabled, item?.hoursPerWeek, item?.hoursPerShift);
    }

    return {
      paySplitNumber: String(index + 1),
      assignment: assignmentStartDate + ' - ' + assignmentEndDate,
      shift: item?.shift,
      hourPerWeek: String(item?.hoursPerWeek),
      hourPerShift: String(item?.hoursPerShift),
      hourlyRate: getSplitRate(item?.payRate),
      hourlyPayRate: item?.payRate
        ? String(formattedNumber((item?.payRate * item?.hoursPerWeek)?.toFixed(2)))
        : undefined,
      mealRate: getSplitRate(item?.mealPerDiem),
      mealPerDiem: item?.mealPerDiem ? String(formattedNumber((item?.mealPerDiem * 7)?.toFixed(2))) : undefined,
      lodgingRate: getSplitRate(item?.lodgingPerDiem),
      lodgingPerDiam: item?.lodgingPerDiem
        ? String(formattedNumber((item?.lodgingPerDiem * 7)?.toFixed(2)))
        : undefined,
      carRate: getTLASplitRate(item?.tlaCarAllowance, tlaEnabled),
      carAllowance: getTLASumAmount(item?.tlaCarAllowance, tlaEnabled, item?.hoursPerWeek, item?.hoursPerShift),
      mealAllowanceRate: getTLASplitRate(item?.tlaMealAllowance, tlaEnabled),
      mealAllowance: getTLASumAmount(item?.tlaMealAllowance, tlaEnabled, item?.hoursPerWeek, item?.hoursPerShift),
      shiftCompletionBonus: getTLASplitRate(item?.tlaShiftCompletionBonus, tlaEnabled),
      completionBonus: getTLASumAmount(
        item?.tlaShiftCompletionBonus,
        tlaEnabled,
        item?.hoursPerWeek,
        item?.hoursPerShift,
      ),
      cellPhoneRate: phoneRate,
      cellPhoneStipend: phoneStipend,
      totalWeeklyGross: String(formattedNumber(totalWeeklyGross?.toFixed(2))),
      weeklyNet: String(formattedNumber((totalWeeklyGross * 0.75)?.toFixed(2))),
      housingType: item?.housingType,
      standardFurniture: item?.standardFurniture > 0 ? String(item?.standardFurniture) : undefined,
      additionalFurnitureCount:
        getStandardFurniture(item?.furnitureCosts) > 0 ? String(getStandardFurniture(item?.furnitureCosts)) : undefined,
      showPaySplit: splits?.length > 1 ? String(item?.splitId) : undefined,
    };
  });
  return splitResults;
};

export const getReimbursement = (
  payPackageDetailsValues: IPlacementMarginDetailsResponseScenarioSplitPayPackageDetailsValue[],
) => {
  const reimbursementValues = payPackageDetailsValues?.map(
    (item: IPlacementMarginDetailsResponseScenarioSplitPayPackageDetailsValue) => {
      return {
        pickListLabel: item?.pickListDescription,
        pickListValue: item?.payPackageValues?.amount
          ? String(formattedNumber(item?.payPackageValues?.amount?.toFixed(2)))
          : undefined,
      };
    },
  );
  return reimbursementValues;
};

export const totalWeeklyGross = (splits: MarginDetailsResponseScenarioSplitItem[]) => {
  return splits?.reduce((acc, item) => {
    const duration = getExtensionDuration(moment(item?.effectiveStartDate), item?.effectiveEndDate);
    const weeklyTotal = getTotalGross(item) * duration;
    return acc + weeklyTotal;
  }, 0);
};

export const getStandardFurniture = (standardFurniture: FurnitureCost[]) => {
  return standardFurniture?.reduce((acc, item) => {
    return acc + item?.quantity;
  }, 0);
};

export const getSubstitutionValues = (
  currentMarginData: MarginDetailsResponse,
  headerData: MarginDetailsResponseScenario,
) => {
  const scenarioStartDate = !isUndefined(currentMarginData?.bookingPeriodStartDate)
    ? formatDateObj(currentMarginData?.bookingPeriodStartDate)
    : formatDate(missingDate);
  const scenarioEndDate = !isUndefined(currentMarginData?.bookingPeriodEndDate)
    ? formatDateObj(currentMarginData?.bookingPeriodEndDate)
    : formatDate(missingDate);
  const totalReimbursement = getTotalReimbursement(headerData);
  const assignmentWeek = currentMarginData?.bookingPeriodDuration;
  const isAccepted = headerData?.splits?.some(item => item?.healthInsuranceTypeId === PayPackageStatus.Pending);
  const benefitStatus = isAccepted ? ScenarioStatus.Accepted : ScenarioStatus.Declined;
  const facilityLocation = `${currentMarginData?.facility?.facilityName}, ${
    currentMarginData?.facility?.facilityAddress1
  }, ${currentMarginData?.facility?.facilityAddress2 ? currentMarginData?.facility?.facilityAddress2 + ',' : ''} ${
    currentMarginData?.facility?.facilityCity
  }, ${currentMarginData?.facility?.facilityState}, ${currentMarginData?.facility?.facilityCountry}, ${
    currentMarginData?.facility?.facilityZip ? currentMarginData?.facility?.facilityZip : ''
  }`;
  const weeklyGross = totalWeeklyGross(headerData?.splits);
  const shift = headerData?.splits
    ?.filter(item => item?.hoursPerWeek)
    .map(item => ` ${item?.shift} / ${item?.hoursPerWeek} ${i18next.t('marginTool.labels.hrPerweek')}`);
  const filteredShift = [...new Set(shift)];

  const substitutionValues = {
    firstName: currentMarginData?.candidateNameFirst,
    lastName: currentMarginData?.candidateNameLast,
    assignment:
      scenarioStartDate + ' - ' + scenarioEndDate + ` (${assignmentWeek} ${i18next.t('marginTool.labels.weeks')}) `,
    shift: filteredShift?.toString(),
    location: facilityLocation,
    benefit: benefitStatus,
    arrivingTravel: formattedNumber(headerData?.assignment?.travel?.arrivingTravel?.toFixed(2)),
    endingTravel: formattedNumber(headerData?.assignment?.travel?.endingTravel?.toFixed(2)),
    interimTravel: formattedNumber(headerData?.assignment?.travel?.interimTravel?.toFixed(2)),
    flight: formattedNumber(headerData?.assignment?.travel?.amnFlight?.toFixed(2)),
    rentalCar: formattedNumber(headerData?.assignment?.travel?.amnRentalCar?.toFixed(2)),
    total: totalReimbursement > 0 ? String(formattedNumber(totalReimbursement?.toFixed(2))) : undefined,
    totalReimbursement: String(formattedNumber(totalReimbursement?.toFixed(2))),
    totalWeeklyGross: String(formattedNumber(weeklyGross?.toFixed(2))),
    estimatedTotalNetPay: String(formattedNumber((weeklyGross * 0.75)?.toFixed(2))),
  };
  return substitutionValues;
};

export const getCandidateEmailSubject = (currentMarginData: MarginDetailsResponse) => {
  return `AMN Pay Quote for ${currentMarginData?.facility?.facilityName}, ${currentMarginData?.facility?.facilityCity}, ${currentMarginData?.facility?.facilityState}`;
};

export const getApprovalEmailSubject = (headerData: MarginDetailsResponseScenario, placementHeaderData: any) => {
  const candidateName = `${placementHeaderData?.candidate?.firstName} ${placementHeaderData?.candidate?.lastName}`;

  return (
    `Booking ${PayPackageStatus[headerData?.scenarioStatusId]}` +
    (headerData?.placementId ? ` for PID #${headerData.placementId}` : '') +
    (candidateName ? ` - ${candidateName}` : '') +
    (placementHeaderData?.candidate?.id ? ` (${placementHeaderData.candidate.id})` : '') +
    (placementHeaderData?.facility?.name ? ` - ${placementHeaderData.facility.name}` : '') +
    (placementHeaderData?.facility?.id ? ` (${placementHeaderData.facility.id})` : '') +
    (placementHeaderData?.technologyVendorName ? ` - ${placementHeaderData.technologyVendorName}` : '') +
    (placementHeaderData?.vmsReqNo ? `: #${placementHeaderData.vmsReqNo}` : '')
  );
};
