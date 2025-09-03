import { IToken } from 'app/models/Notification/Notification';
import { PayPackageDetailsValuesSubCategory } from './enum';
import moment from 'moment';
import {
  MarginDetailsResponse,
  MarginDetailsResponseScenario,
  MarginDetailsResponseScenarioSplitItem,
} from 'store/redux-store/margin-tool/slices/add-edit-scenario/add-edit-scenario.model';
import { DocStatus, PlacementDocument, PlacementDocumentType } from 'store/redux-store/placement-documents/types';
import { formatToDecimal } from './helper';
import { convertToPercentage } from './Components/PayPackage/helper';

const baseUrl = globalThis?.app?.env?.REACT_APP_BASE_URL;

export interface IEmailVariantData {
  subject: string;
  body: string;
  substitutions: IToken[];
}

interface IMarginToolSpecialty {
  specialtyAbbr?: string;
}

export interface IMarginToolSkillset {
  disciplineAbbr?: string;
  specialties?: IMarginToolSpecialty[];
}

export function getLatestSentDateForClientConfirmation(docs: PlacementDocument[]) {
  const clientConfirmations = docs?.filter(
    doc =>
      doc?.document?.toLowerCase() === PlacementDocumentType.clientConfirmation.toLowerCase() &&
      doc?.status === DocStatus.Sent,
  );

  if (clientConfirmations?.length === 0) {
    return null;
  }

  const latestDocument = clientConfirmations.reduce((latest, current) => {
    return new Date(latest.sent) > new Date(current.sent) ? latest : current;
  });

  return latestDocument?.sent;
}

export const formatSkillsets = (skillsets: IMarginToolSkillset[]) => {
  return skillsets
    ?.map(skillset =>
      skillset?.specialties?.map(specialty => `${skillset.disciplineAbbr}-${specialty.specialtyAbbr}`).join('/'),
    )
    .join(' / ');
};

export const getProcessedSplits = (
  splits: MarginDetailsResponseScenarioSplitItem[],
  billRateMod: any,
  headerData: MarginDetailsResponseScenario,
) => {
  let modData;
  if (!!billRateMod) {
    modData = {
      approval_details: `(Approved:  ${
        moment(billRateMod?.approvalDate)?.isValid() ? moment(billRateMod?.approvalDate)?.format('MM/DD/YYYY') : ''
      } ${
        billRateMod?.approvalDate && (billRateMod?.approvedByFirstName || billRateMod?.approvedByLastName) ? 'by ' : ''
      }${billRateMod?.approvedByFirstName ?? ''} ${billRateMod?.approvedByLastName ?? ''})`,

      bill_rate_current_mod: billRateMod?.regularRate ? `${formatToDecimal(billRateMod.regularRate, 5, 2)}` : '',
      additional_overtime_rate_current_mod: billRateMod?.overtimeRate
        ? `${formatToDecimal(billRateMod.overtimeRate, 5, 2)}`
        : '',
      overtime_factor_current_mod: billRateMod?.overtimeFactor
        ? `${formatToDecimal(billRateMod.overtimeFactor, 3, 2)}`
        : '',
      additional_call_back_rate_current_mod: billRateMod?.overtimeRate
        ? `${formatToDecimal(billRateMod.overtimeRate, 5, 2)}`
        : '',
      call_back_factor_current_mod: billRateMod?.callBackFactor
        ? `${formatToDecimal(billRateMod.callBackFactor, 3, 2)}`
        : '',
      additional_double_time_rate_current_mod: billRateMod?.doubleTimeRate
        ? `${formatToDecimal(billRateMod.doubleTimeRate, 5, 2)}`
        : '',
      double_time_factor_current_mod: billRateMod?.doubletimeFactor
        ? `${formatToDecimal(billRateMod.doubletimeFactor, 3, 2)}`
        : '',
      additional_holiday_rate_current_mod: billRateMod?.holidayRate
        ? `${formatToDecimal(billRateMod.holidayRate, 5, 2)}`
        : '',
      holiday_factor_current_mod: billRateMod?.holidayFactor
        ? `${formatToDecimal(billRateMod.holidayFactor, 3, 2)}`
        : '',
      on_call_rate_current_mod: billRateMod?.onCallRate ? `${formatToDecimal(billRateMod.onCallRate, 5, 2)}` : '',
      charge_rate_current_mod: billRateMod?.chargePremium ? `${formatToDecimal(billRateMod.chargePremium, 5, 2)}` : '',
      amount_per_mile_current_mod: billRateMod?.amountPerMile
        ? `${formatToDecimal(billRateMod.amountPerMile, 0, 3)}`
        : '',
      guaranteed_hours_current_mod: billRateMod?.hoursPerPayCycle
        ? `${formatToDecimal(billRateMod.hoursPerPayCycle, 2, 2)}`
        : '',
      preceptor_rate_current_mod: billRateMod?.preceptorRate
        ? `${formatToDecimal(billRateMod.preceptorRate, 5, 2)}`
        : '',
      orientation_rate_current_mod: billRateMod?.orientationRate
        ? `${formatToDecimal(billRateMod.orientationRate, 5, 2)}`
        : '',
      orientation_factor_current_mod: billRateMod?.orientationFactor
        ? `${formatToDecimal(billRateMod.orientationFactor, 1, 2)}`
        : '',
    };
  }
  const additionalPremiumPay = headerData?.assignment?.payPackageDetailsValues?.find(
    payPackage => payPackage?.subCategory === PayPackageDetailsValuesSubCategory.additionalPremiumPay,
  )?.pickListDescription;

  const splitData = splits?.map((split, splitIndex: number) => {
    const orientation = split?.isVoidOrientationHours
      ? `${formatToDecimal(split?.orientationHours, 5, 2) ?? ''}` +
        (split?.orientationHours ? ' - ' : '') +
        `&lt;Voided&gt;` +
        (split?.orientationOverrideDate ? ` - ${split.orientationOverrideDate}` : '') +
        (split?.orientationOverrideFirst || split?.orientationOverrideLast ? ' by ' : '') +
        `${split?.orientationOverrideFirst ?? ''} ${split?.orientationOverrideLast ?? ''}`
      : `${formatToDecimal(split?.orientationHours, 5, 2) ?? ''}`;

    const marginValue = {
      split_index: `${splitIndex + 1}`,
      split_start_date: split?.effectiveStartDate ? moment(split?.effectiveStartDate)?.format('MM/DD/YYYY') : '',
      split_end_date: split?.effectiveEndDate ? moment(split?.effectiveEndDate)?.format('MM/DD/YYYY') : '',

      bill_rate_margin_value: split?.billRate ? `${formatToDecimal(split.billRate, 5, 2)}` : '',
      additional_overtime_rate_margin_value: split?.overtime ? `${formatToDecimal(split.overtime, 5, 2)}` : '',
      overtime_factor_margin_value: split?.billOvertimeFactor
        ? `${formatToDecimal(split.billOvertimeFactor, 3, 2)}`
        : '',
      additional_call_back_rate_margin_value: split?.callback ? `${formatToDecimal(split.callback, 5, 2)}` : '',
      call_back_factor_margin_value: split?.billCallBackFactor
        ? `${formatToDecimal(split.billCallBackFactor, 3, 2)}`
        : '',
      additional_double_time_rate_margin_value: split?.billDoubletimeRate
        ? `${formatToDecimal(split.billDoubletimeRate, 5, 2)}`
        : '',
      double_time_factor_margin_value: split?.billDoubletimeFactor
        ? `${formatToDecimal(split.billDoubletimeFactor, 3, 2)}`
        : '',
      additional_holiday_rate_margin_value: split?.holiday ? `${formatToDecimal(split.holiday, 5, 2)}` : '',
      holiday_factor_margin_value: split?.billHolidayFactor ? `${formatToDecimal(split.billHolidayFactor, 3, 2)}` : '',
      on_call_rate_margin_value: split?.billOnCallRate ? `${formatToDecimal(split.billOnCallRate, 5, 2)}` : '',
      charge_rate_margin_value: split?.billCharge ? `${formatToDecimal(split.billCharge, 5, 2)}` : '',
      amount_per_mile_margin_value: split?.billAmountPerMile ? `${formatToDecimal(split.billAmountPerMile, 0, 2)}` : '',
      guaranteed_hours_margin_value: split?.billGuaranteedHours
        ? `${formatToDecimal(split.billGuaranteedHours, 2, 2)}`
        : '',
      preceptor_rate_margin_value: split?.billPreceptor ? `${formatToDecimal(split.billPreceptor, 5, 2)}` : '',
      orientation_rate_margin_value: split?.orientationRate ? `${formatToDecimal(split.orientationRate, 5, 2)}` : '',
      orientation_factor_margin_value: split?.orientationFactor
        ? `${formatToDecimal(split.orientationFactor, 1, 2)}`
        : '',

      orientation_hours_value: orientation,

      pay_rate_value: split?.payRate ? `${formatToDecimal(split.payRate, 5, 2)}` : '',
      overtime_factor_value: split?.payOvertimeFactor ? `${formatToDecimal(split.payOvertimeFactor, 3, 2)}` : '',
      call_back_factor_value: split?.payCallBackFactor ? `${formatToDecimal(split.payCallBackFactor, 3, 2)}` : '',
      holiday_factor_value: split?.payHolidayFactor ? `${formatToDecimal(split.payHolidayFactor, 3, 2)}` : '',
      double_time_factor_value: split?.payDoubletimeFactor ? `${formatToDecimal(split.payDoubletimeFactor, 3, 2)}` : '',
      on_call_rate_value: split?.payOnCallRate ? `${formatToDecimal(split.payOnCallRate, 5, 2)}` : '',
      amount_per_mile_value: split?.payAmountPerMile ? `${formatToDecimal(split.payAmountPerMile, 5, 3)}` : '',
      guaranteed_hours_value: split?.payGuaranteedHours ? `${formatToDecimal(split.payGuaranteedHours, 2, 2)}` : '',
      charge_value: split?.payCharge ? `${formatToDecimal(split.payCharge, 5, 2)}` : '',
      preceptor_value: split?.payPreceptor ? `${formatToDecimal(split.payPreceptor, 5, 2)}` : '',
      additional_premium_pay_value:
        additionalPremiumPay && !isNaN(parseFloat(additionalPremiumPay))
          ? `${parseFloat(additionalPremiumPay)?.toFixed(2)}`
          : '',
    };

    const matchValue = {
      bill_rate_match:
        modData?.bill_rate_current_mod || marginValue?.bill_rate_margin_value
          ? modData?.bill_rate_current_mod === marginValue?.bill_rate_margin_value
            ? 'Yes'
            : 'No'
          : '',
      additional_overtime_rate_match:
        modData?.additional_overtime_rate_current_mod || marginValue?.additional_overtime_rate_margin_value
          ? modData?.additional_overtime_rate_current_mod === marginValue?.additional_overtime_rate_margin_value
            ? 'Yes'
            : 'No'
          : '',
      overtime_factor_match:
        modData?.overtime_factor_current_mod || marginValue?.overtime_factor_margin_value
          ? modData?.overtime_factor_current_mod === marginValue?.overtime_factor_margin_value
            ? 'Yes'
            : 'No'
          : '',
      additional_call_back_rate_match:
        modData?.additional_call_back_rate_current_mod || marginValue?.additional_call_back_rate_margin_value
          ? modData?.additional_call_back_rate_current_mod === marginValue?.additional_call_back_rate_margin_value
            ? 'Yes'
            : 'No'
          : '',
      call_back_factor_match:
        modData?.call_back_factor_current_mod || marginValue?.call_back_factor_margin_value
          ? modData?.call_back_factor_current_mod === marginValue?.call_back_factor_margin_value
            ? 'Yes'
            : 'No'
          : '',
      additional_double_time_rate_match:
        modData?.additional_double_time_rate_current_mod || marginValue?.additional_double_time_rate_margin_value
          ? modData?.additional_double_time_rate_current_mod === marginValue?.additional_double_time_rate_margin_value
            ? 'Yes'
            : 'No'
          : '',
      double_time_factor_match:
        modData?.double_time_factor_current_mod || marginValue?.double_time_factor_margin_value
          ? modData?.double_time_factor_current_mod === marginValue?.double_time_factor_margin_value
            ? 'Yes'
            : 'No'
          : '',
      additional_holiday_rate_match:
        modData?.additional_holiday_rate_current_mod || marginValue?.additional_holiday_rate_margin_value
          ? modData?.additional_holiday_rate_current_mod === marginValue?.additional_holiday_rate_margin_value
            ? 'Yes'
            : 'No'
          : '',
      holiday_factor_match:
        modData?.holiday_factor_current_mod || marginValue?.holiday_factor_margin_value
          ? modData?.holiday_factor_current_mod === marginValue?.holiday_factor_margin_value
            ? 'Yes'
            : 'No'
          : '',
      on_call_rate_match:
        modData?.on_call_rate_current_mod || marginValue?.on_call_rate_margin_value
          ? modData?.on_call_rate_current_mod === marginValue?.on_call_rate_margin_value
            ? 'Yes'
            : 'No'
          : '',
      charge_rate_match:
        modData?.charge_rate_current_mod || marginValue?.charge_rate_margin_value
          ? modData?.charge_rate_current_mod === marginValue?.charge_rate_margin_value
            ? 'Yes'
            : 'No'
          : '',
      amount_per_mile_match:
        modData?.amount_per_mile_current_mod || marginValue?.amount_per_mile_margin_value
          ? modData?.amount_per_mile_current_mod === marginValue?.amount_per_mile_margin_value
            ? 'Yes'
            : 'No'
          : '',
      guaranteed_hours_match:
        modData?.guaranteed_hours_current_mod || marginValue?.guaranteed_hours_margin_value
          ? modData?.guaranteed_hours_current_mod === marginValue?.guaranteed_hours_margin_value
            ? 'Yes'
            : 'No'
          : '',
      preceptor_rate_match:
        modData?.preceptor_rate_current_mod || marginValue?.preceptor_rate_margin_value
          ? modData?.preceptor_rate_current_mod === marginValue?.preceptor_rate_margin_value
            ? 'Yes'
            : 'No'
          : '',
      orientation_rate_match:
        modData?.orientation_rate_current_mod || marginValue?.orientation_rate_margin_value
          ? modData?.orientation_rate_current_mod === marginValue?.orientation_rate_margin_value
            ? 'Yes'
            : 'No'
          : '',
      orientation_factor_match:
        modData?.orientation_factor_current_mod || marginValue?.orientation_factor_margin_value
          ? modData?.orientation_factor_current_mod === marginValue?.orientation_factor_margin_value
            ? 'Yes'
            : 'No'
          : '',
    };

    return {
      ...marginValue,
      ...modData,
      ...matchValue,
    };
  });
  return splitData;
};

export const getApprovalVariantEmailSubstitutions = (
  currentMarginData: MarginDetailsResponse,
  extensionOfPriorPlacementId: number | string,
  placementHeaderData: any,
  orderData: any,
  candidateName: string,
  recruiterName: string,
  recruiterEmail: string,
  accountManagerName: string,
  accountManagerEmail: string,
  formattedLatestSentDate: string,
  headerData: MarginDetailsResponseScenario,
  bookingData: MarginDetailsResponse,
) => {
  const extension = currentMarginData?.isScenarioExtention
    ? `Yes (<a href='${baseUrl}/placement/${extensionOfPriorPlacementId}'> PlacementID ${extensionOfPriorPlacementId}</a> )`
    : 'No';

  const formattedSkillsets = formatSkillsets(placementHeaderData?.skillsets);

  const formattedAddress = `${bookingData?.facility?.facilityAddress1 || ''}${
    bookingData?.facility?.facilityAddress2 ? ` ${bookingData?.facility?.facilityAddress2}` : ''
  }${bookingData?.facility?.facilityCity ? `, ${bookingData?.facility?.facilityCity}` : ''}${
    bookingData?.facility?.facilityCounty ? `, ${bookingData?.facility?.facilityCounty}` : ''
  }${bookingData?.facility?.facilityState ? `, ${bookingData?.facility?.facilityState}` : ''}${
    bookingData?.facility?.facilityZip ? `, ${bookingData?.facility?.facilityZip}` : ''
  }`
    .trim()
    .replace(/^,|,$/g, '');

  const bookingPeriod =
    `${
      moment(bookingData?.bookingPeriodStartDate)?.isValid()
        ? moment(bookingData?.bookingPeriodStartDate)?.format('MM/DD/YYYY')
        : ''
    }` +
    (moment(bookingData?.bookingPeriodStartDate)?.isValid() && moment(bookingData?.bookingPeriodEndDate)?.isValid()
      ? ' - '
      : '') +
    `${
      moment(bookingData?.bookingPeriodEndDate)?.isValid()
        ? moment(bookingData?.bookingPeriodEndDate)?.format('MM/DD/YYYY')
        : ''
    }` +
    (bookingData?.bookingPeriodDuration ? ` (${bookingData?.bookingPeriodDuration})` : '');

  const placementDates =
    `${
      moment(placementHeaderData?.placementStartDate)?.isValid()
        ? moment(placementHeaderData.placementStartDate)?.format('MM/DD/YYYY')
        : ''
    }` +
    (moment(placementHeaderData?.placementStartDate)?.isValid() &&
    moment(placementHeaderData?.placementEndDate)?.isValid()
      ? ' - '
      : '') +
    `${
      moment(placementHeaderData?.placementEndDate)?.isValid()
        ? moment(placementHeaderData.placementEndDate)?.format('MM/DD/YYYY')
        : ''
    }` +
    (placementHeaderData?.duration ? ` (${placementHeaderData?.duration})` : '');

  const substitutions: IToken[] = [];

  const substitutionData = [
    { name: 'Signature', input: '{{signature}}' },
    { name: 'Notes', input: '{{notes}}', value: `${headerData?.notes ?? ''}` },
    {
      name: 'Margin Url',
      input: '{{margin_url}}',
      value: `${baseUrl}/margin/placement/${headerData?.placementId}`,
    },
    { name: 'Mods Url', input: '{{mods_url}}', value: `${baseUrl}/placement/${headerData?.placementId}?tab=3` },
    {
      name: 'Confirmations Url',
      input: '{{confirmations_url}}',
      value: `${baseUrl}/placement/${headerData?.placementId}?tab=4&view=client-confirmation-editor&default_selection=draft`,
    },
    {
      name: 'Gross Margin Value',
      input: '{{gross_margin_value}}',
      value: headerData?.grossMargin ? `${convertToPercentage(headerData?.grossMargin)}` : '',
    },
    {
      name: 'Gross Profit Value',
      input: '{{gross_profit_value}}',
      value: headerData?.grossProfit ? `$${headerData.grossProfit.toFixed(2)}` : '',
    },
    {
      name: 'Net Contributed Margin Value',
      input: '{{net_contributed_margin_value}}',
      value: headerData?.negotiatedContributionMargin
        ? `$${parseFloat(headerData.negotiatedContributionMargin).toFixed(2)}`
        : '',
    },
    { name: 'Placement ID', input: '{{placement_id}}', value: `${headerData?.placementId}` },
    {
      name: 'Placement Link',
      input: '{{placement_url}}',
      value: `${baseUrl}/placement/${headerData?.placementId}`,
    },
    {
      name: 'VMS',
      input: '{{vms}}',
      value:
        `${placementHeaderData?.vmsReqNo ?? ''}` +
        (placementHeaderData?.vmsReqNo && placementHeaderData?.technologyVendorName ? ' | ' : '') +
        (orderData?.webLink
          ? `<a href="${orderData.webLink}">${placementHeaderData?.technologyVendorName ?? ''}</a>`
          : placementHeaderData?.technologyVendorName ?? ''),
    },
    { name: 'Candidate Name', input: '{{candidate_name}}', value: `${candidateName}` },
    {
      name: 'Candidate Link',
      input: '{{candidate_url}}',
      value: `${baseUrl}/candidate/${placementHeaderData?.candidate?.id}/${placementHeaderData?.brandId}`,
    },
    { name: 'Recruiter', input: '{{recruiter}}', value: `${recruiterName || ''}` },
    { name: 'Recruiter Mail', input: '{{recruiter_mail}}', value: `${!!recruiterEmail ? recruiterEmail : ''}` },
    { name: 'Account Manager', input: '{{account_manager}}', value: `${accountManagerName}` },
    {
      name: 'Account Manager Mail',
      input: '{{account_manager_mail}}',
      value: `${!!accountManagerEmail ? accountManagerEmail : ''}`,
    },
    { name: 'Facility Name', input: '{{facility_name}}', value: `${placementHeaderData?.facility?.name || ''}` },
    {
      name: 'Facility Link',
      input: '{{facility_url}}',
      value: `${baseUrl}/facility/${orderData?.facility?.facilityId}`,
    },
    { name: 'Unit', input: '{{unit_name}}', value: `${orderData?.unit?.name}` },
    {
      name: 'Unit Link',
      input: '{{unit_url}}',
      value: `${baseUrl}/facility/${orderData?.facility?.facilityId}/unit/${orderData?.unit?.unitId}`,
    },
    { name: 'Location', input: '{{location}}', value: formattedAddress },
    {
      name: 'Placement Dates',
      input: '{{placement_dates}}',
      value: placementDates,
    },
    { name: 'Placement Skill Set', input: '{{placement_skillset}}', value: `${formattedSkillsets}` },
    { name: 'Last Confirmation Sent', input: '{{last_confirmation_sent}}', value: `${formattedLatestSentDate}` },
    {
      name: 'Booking Period Dates',
      input: '{{booking_period_dates}}',
      value: bookingPeriod,
    },
    { name: 'Extension Placement Copy', input: '{{extension_placement_copy}}', value: `${extension}` },
    { name: 'TLA', input: '{{tla}}', value: `${headerData?.tla ? 'Yes' : 'No'}` },
  ];

  substitutionData.forEach(substitution => substitutions.push(substitution));
  return substitutionData;
};
