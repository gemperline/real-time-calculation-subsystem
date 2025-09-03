import { call, getContext, put, select, takeLatest } from 'redux-saga/effects';

import { PayPackageStatus } from '../pay-package-status/pay-package-status.model';
import moment from 'moment';
import { ConsolidatedPlacementTargetEndpoints } from 'app/services/PlacementServices/utils';
import { PlacementService } from 'app/services/PlacementServices/placement-service';
import { applyDataToTemplate, GetTemplatesByCategory } from 'app/services/NotificationServices/TemplateService';
import { PlacementModsService } from 'app/services/PlacementModsServices/placementmods-service';
import { getOrderDetailsById } from 'app/services/OrderServices/OrderServices';
import {
  getApprovalVariantEmailSubstitutions,
  getLatestSentDateForClientConfirmation,
  getProcessedSplits,
} from '@AMIEWEB/MarginTool/emailHelper';
import { sortAssignmentSplits } from '@AMIEWEB/MarginTool/Components/Assignments/helper';
import { searchNotificationData, signatureSubstitutionToken } from '@AMIEWEB/GlobalSearch/helper';
import {
  formatEmailRecipientsList,
  formatManualRecipientList,
  getApprovalEmailSubject,
  getCandidateDetails,
  getCandidateEmailSubject,
  getReimbursement,
  getSplitData,
  getSubstitutions,
  getSubstitutionValues,
} from '@AMIEWEB/MarginTool/Components/PayPackage/helper';
import { EmailVariant, MarginTemplateTitle } from '@AMIEWEB/MarginTool/Components/PayPackage/PayPackageHelper';
import { IEmailType, IEmployee, InitiationPoints } from 'app/models/Notification/Notification';
import { Concatenate } from 'utils/string/string';
import { SendType, UseSubType, UseType } from '@AMIEWEB/Notification/Constants';
import { notificationDataActions } from 'store/redux-store/notification/notification.redux';
import { EmailDefaultValues } from 'app/models/Email/IEmail';
import { payPackageStatusActions } from '../pay-package-status/pay-package-status.redux';
import { marginToolEmailAction } from './margin-tool-email.redux';
import { httpSuccess } from 'app/services/serviceHelpers';
import { selectUser } from 'oidc/user.selectors';
import { selectUserPreference } from 'oidc/UserDevicePreference/userPreference.selectors';
import {
  selectEmailRecipientsList,
  selectStatusUpdatedEmailModalOpen,
} from '../pay-package-status/pay-package-status.selector';
import {
  selectBookingPeriod,
  selectMarginToolDetailsData,
  selectSelectedScenario,
} from '../add-edit-scenario/add-edit-scenario.selector';
import { getDefaultSender } from '@AMIEWEB/Candidate/CandidateProfile/CandidateHeader/NotificationHelper';
import { selectPlacementDetails } from 'store/redux-store/placement-details/selectors';
import { manuallyIncrementPromiseCounter, manuallyResetPromiseCounter, trackPromise } from 'react-promise-tracker';
import { PromiseTrackerKeys } from 'app/constants/PromiseTrackerKeys';
import { trackException } from 'app-insights/appInsightsTracking';
import { ExceptionType } from 'app/enums/Common';
import { findMarginDetailByBookingPeriodId } from '@AMIEWEB/MarginTool/Components/PayPackage/AddScenario/helper';

export const TrackMarginToolTemplate = (fn, ...args) =>
  trackPromise(fn(...args), PromiseTrackerKeys.marginTool.marginToolTemplate);
export const TrackFetchplacementHeader = (fn, ...args) =>
  trackPromise(fn(...args), PromiseTrackerKeys.marginTool.fetchplacementHeader);
export const TrackFetchOrderDetails = (fn, ...args) =>
  trackPromise(fn(...args), PromiseTrackerKeys.marginTool.fetchOrderDetails);
export const TrackFetchPlacementDocs = (fn, ...args) =>
  trackPromise(fn(...args), PromiseTrackerKeys.marginTool.fetchPlacementDocs);
export const TrackFetchBillRateMod = (fn, ...args) =>
  trackPromise(fn(...args), PromiseTrackerKeys.marginTool.fetchBillRateMod);
export const TrackMarginToolPreview = (fn, ...args) =>
  trackPromise(fn(...args), PromiseTrackerKeys.marginTool.marginToolPreview);

function* handleMarginToolEmailCreation() {
  try {
    const user = yield select(selectUser);
    const userPreference = yield select(selectUserPreference);
    const selectEmailRecipients = yield select(selectEmailRecipientsList);
    const headerData = yield select(selectSelectedScenario);
    const marginData = yield select(selectMarginToolDetailsData);
    const bookingData = yield select(selectBookingPeriod);
    const foundPlacement = yield select(selectPlacementDetails);
    const isStatusUpdatedEmailModalOpen = yield select(selectStatusUpdatedEmailModalOpen);
    const selectedScenario = yield select(selectSelectedScenario);

    const sender: IEmployee = getDefaultSender(user);
    const statusId = headerData?.scenarioStatusId;
    const orderId = bookingData?.orderId;
    const placementId = headerData?.placementId;
    const placementService: PlacementService = yield getContext('placementService');
    const placementModService: PlacementModsService = yield getContext('placementModsService');

    manuallyIncrementPromiseCounter(PromiseTrackerKeys.marginTool.marginToolTemplate);
    const templates = yield call(TrackMarginToolTemplate, GetTemplatesByCategory, 'Margin Tool', 'email');
    manuallyResetPromiseCounter(PromiseTrackerKeys.marginTool.marginToolTemplate);

    const isCandidateEmail = isStatusUpdatedEmailModalOpen?.emailVariant === EmailVariant.Candidate;
    const currentMarginData = findMarginDetailByBookingPeriodId(marginData, selectedScenario?.bookingPeriodId);

    let body = '';
    let useType = UseType.General;
    let subject = '';
    let templateSubstitutions = [];
    if (isCandidateEmail) {
      const payQuoteTemplate = templates?.filter(data => data.title === MarginTemplateTitle.CandidatePayQuote);
      const splitData = getSplitData(headerData?.splits, headerData?.tla);
      const reimbursementData = getReimbursement(headerData?.assignment?.payPackageDetailsValues);
      templateSubstitutions = getSubstitutions(getSubstitutionValues(currentMarginData, headerData));

      const tableData = {
        splits: {
          partialTemplateName: 'split',
          partialTemplate: '{{#if showPaySplit}}\r\n<div style=\"margin-top: 20px;\">\r\n  <p style=\"text-align: left; font-weight: bold; font-size: 18px; line-height: 24px; font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; color: #003c69; text-transform: uppercase; margin-bottom: 8px;\">\r\n    PAY SPLIT {{paySplitNumber}}\r\n  <\/p>\r\n  <table style=\"border: 0;\">\r\n    <tr>\r\n      <td style=\"padding: 5px; padding-left: 0px; font-size: 12px; font-weight: normal; text-align: left; border: 0;\">Assignment<\/td>\r\n      <td style=\"padding: 5px; padding-left: 25px; font-size: 14px; text-align: left; border: 0; font-weight: normal; color: #CCCCCC;\">\r\n        <span style=\"color: #333333;\">{{assignment}}<\/span> |\r\n      <\/td>\r\n      <td style=\"padding: 5px; font-size: 12px; font-weight: normal; text-align: left; border: 0;\">Shift:<\/td>\r\n      <td style=\"padding: 5px; font-size: 14px; text-align: left; border: 0; font-weight: normal; color: #CCCCCC;\">\r\n        <span style=\"color: #333333;\">{{shift}}<\/span> |\r\n      <\/td>\r\n      <td style=\"padding: 5px; font-size: 12px; font-weight: normal; text-align: left; border: 0;\">Hr per Week:<\/td>\r\n      <td style=\"padding: 5px; font-size: 14px; text-align: left; border: 0; font-weight: normal; color: #CCCCCC;\">\r\n        <span style=\"color: #333333;\">{{hourPerWeek}}<\/span> |\r\n      <\/td>\r\n      <td style=\"padding: 5px; font-size: 12px; font-weight: normal; text-align: left; border: 0;\">Hr per Shift:<\/td>\r\n      <td style=\"padding: 5px; font-size: 14px; text-align: left; border: 0; font-weight: normal;\">\r\n        {{hourPerShift}}\r\n      <\/td>\r\n    <\/tr>\r\n  <\/table>\r\n<\/div>\r\n{{\/if}}\r\n<div>\r\n  <div style=\"width: calc(100% - 40px); margin-left: 20px;\">\r\n    <p style=\"text-align: left; font-weight: bold; font-size: 18px; line-height: 24px; font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; color: #003c69; text-transform: uppercase; margin-bottom: 8px;\">\r\n      WEEKLY PAY\r\n    <\/p>\r\n    <table style=\"border-collapse: collapse; width: 50%; text-align: left; margin-bottom: 5px; color: #333333; border: 0;\">\r\n      {{#if hourlyRate}}\r\n      <tr>\r\n        <th style=\"padding: 5px; padding-left: 0px; font-size: 12px; font-weight: normal; border: 0; text-align: left;\">Hourly Pay Rate (${{hourlyRate}}\/hour)<\/th>\r\n        <td style=\"padding: 5px; font-size: 14px; text-align: right; border: 0; font-weight: normal;\">${{hourlyPayRate}}<\/td>\r\n      <\/tr>\r\n      {{\/if}}\r\n      {{#if mealRate}}\r\n      <tr>\r\n        <th style=\"padding: 5px; padding-left: 0px; font-size: 12px; font-weight: normal; border: 0; text-align: left;\">Meal Per Diem (${{mealRate}}\/day)<\/th>\r\n        <td style=\"padding: 5px; font-size: 14px; text-align: right; border: 0; font-weight: normal;\">${{mealPerDiem}}<\/td>\r\n      <\/tr>\r\n      {{\/if}}\r\n      {{#if lodgingRate}}\r\n      <tr>\r\n        <th style=\"padding: 5px; padding-left: 0px; font-size: 12px; font-weight: normal; border: 0; text-align: left;\">Lodging Per Diem (${{lodgingRate}}\/day)<\/th>\r\n        <td style=\"padding: 5px; font-size: 14px; text-align: right; border: 0; font-weight: normal;\">${{lodgingPerDiam}}<\/td>\r\n      <\/tr>\r\n      {{\/if}}\r\n      {{#if carRate}}\r\n      <tr>\r\n        <th style=\"padding: 5px; padding-left: 0px; font-size: 12px; font-weight: normal; border: 0; text-align: left;\">Car Allowance (${{carRate}}\/shift)<\/th>\r\n        <td style=\"padding: 5px; font-size: 14px; text-align: right; border: 0; font-weight: normal;\">${{carAllowance}}<\/td>\r\n      <\/tr>\r\n      {{\/if}}\r\n      {{#if mealAllowanceRate}}\r\n      <tr>\r\n        <th style=\"padding: 5px; padding-left: 0px; font-size: 12px; font-weight: normal; border: 0; text-align: left;\">Meal Allowance (${{mealAllowanceRate}}\/shift)<\/th>\r\n        <td style=\"padding: 5px; font-size: 14px; text-align: right; border: 0; font-weight: normal;\">${{mealAllowance}}<\/td>\r\n      <\/tr>\r\n      {{\/if}}\r\n      {{#if shiftCompletionBonus}}\r\n      <tr>\r\n        <th style=\"padding: 5px; padding-left: 0px; font-size: 12px; font-weight: normal; border: 0; text-align: left;\">Shift Completion Bonus (${{shiftCompletionBonus}}\/shift)<\/th>\r\n        <td style=\"padding: 5px; font-size: 14px; text-align: right; border: 0; font-weight: normal;\">${{completionBonus}}<\/td>\r\n      <\/tr>\r\n      {{\/if}}\r\n      {{#if cellPhoneRate}}\r\n      <tr>\r\n        <th style=\"padding: 5px; padding-left: 0px; font-size: 12px; font-weight: normal; border: 0; text-align: left;\">Cell Phone Stipend (${{cellPhoneRate}}\/day)<\/th>\r\n        <td style=\"padding: 5px; font-size: 14px; text-align: right; border: 0; font-weight: normal;\">${{cellPhoneStipend}}<\/td>\r\n      <\/tr>\r\n      {{\/if}}\r\n    <\/table>\r\n\r\n    <table style=\"padding: 5px; border-collapse: collapse; width: 50%; text-align: left; color: #333333; border-top: 1px solid #333333; border-right: 0; border-bottom: 0; border-left: 0;\">\r\n      <tr>\r\n        <th style=\"padding: 5px; padding-left: 0px; padding-top: 10px; font-size: 16px; font-weight: bold; border: 0; text-align: left;\">Total Weekly Gross<\/th>\r\n        <td style=\"padding: 5px; font-size: 16px; padding-top: 10px; text-align: right; border: 0; font-weight: bold;\">${{totalWeeklyGross}}<\/td>\r\n      <\/tr>\r\n      <tr>\r\n        <th style=\"padding: 5px; padding-left: 0px; font-size: 12px; font-weight: normal; border: 0; text-align: left;\">Est Weekly Net (at 25% Tax)<\/th>\r\n        <td style=\"padding: 5px; font-size: 14px; text-align: right; border: 0; font-weight: normal;\">${{weeklyNet}}<\/td>\r\n      <\/tr>\r\n    <\/table>\r\n\r\n    <table style=\"padding: 5px; border-collapse: collapse; width: 50%; text-align: left; color: #333333; border: 0;\">\r\n      <p style=\"text-align: left; font-weight: bold; font-size: 18px; line-height: 24px; font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; color: #003c69; text-transform: uppercase; margin-bottom: 8px;\">\r\n        AMN Housing\r\n      <\/p>\r\n      {{#if housingType}}\r\n      <tr>\r\n        <th style=\"padding: 5px; padding-left: 0px; font-size: 12px; font-weight: normal; border: 0; text-align: left;\">Housing Type<\/th>\r\n        <td style=\"padding: 5px; font-size: 14px; text-align: right; border: 0; font-weight: normal;\">{{housingType}}<\/td>\r\n      <\/tr>\r\n      {{\/if}}\r\n      {{#if standardFurniture}}\r\n      <tr>\r\n        <th style=\"padding: 5px; padding-left: 0px; font-size: 12px; font-weight: normal; border: 0; text-align: left;\">Standard Furniture<\/th>\r\n        <td style=\"padding: 5px; font-size: 14px; text-align: right; border: 0; font-weight: normal;\">${{standardFurniture}}<\/td>\r\n      <\/tr>\r\n      {{\/if}}\r\n      {{#if additionalFurnitureCount}}\r\n      <tr>\r\n        <th style=\"padding: 5px; padding-left: 0px; font-size: 12px; font-weight: normal; border: 0; text-align: left;\">Additional Furniture<\/th>\r\n        <td style=\"padding: 5px; font-size: 14px; text-align: right; border: 0; font-weight: normal;\">{{additionalFurnitureCount}}<\/td>\r\n      <\/tr>\r\n      {{\/if}}\r\n    <\/table>\r\n  <\/div>\r\n<\/div>',
          partialData: splitData,
        },
        reimbursements: {
          partialTemplateName: 'reimbursement',
          partialTemplate: '{{#if pickListValue}}\r\n<tr style=\"padding: 5px; border-collapse: collapse; width: 100%;\">\r\n<th style=\"padding: 5px; padding-left: 0px; border-collapse: collapse; width: 60%; font-size: 12px; font-weight: normal; border: 0; text-align: left; \">{{pickListLabel}}<\/th>\r\n<td style=\"padding: 5px; border-collapse: collapse; width: 40%; font-size: 14px; border: 0; text-align: right;\">${{pickListValue}}<\/td>\r\n<\/tr>\r\n{{\/if}}',
          partialData: reimbursementData,
        },
      };

      const previewRequestData = {
        body: payQuoteTemplate[0]?.body ? `${payQuoteTemplate[0]?.body}` : '',
        brand: user?.userInfo?.companyBrandName,
        signatureSubstitutions: signatureSubstitutionToken(user, userPreference),
        substitutions: templateSubstitutions.reduce((acc, item) => {
          if (item.name !== 'Signature') {
            acc[item.input.slice(2, -2)] = item.value || '';
          }
          return acc;
        }, {}),
        tableData: tableData,
        id: null,
        skipSignatureSubstitution: true,
      };

      manuallyIncrementPromiseCounter(PromiseTrackerKeys.marginTool.marginToolPreview);
      body = yield call(TrackMarginToolPreview, applyDataToTemplate, previewRequestData);
      manuallyResetPromiseCounter(PromiseTrackerKeys.marginTool.marginToolPreview);
      useType = UseType.PayPackage;
      subject = getCandidateEmailSubject(currentMarginData);
    } else {
      manuallyIncrementPromiseCounter(PromiseTrackerKeys.marginTool.fetchplacementHeader);
      const placementHeaderResponse = yield call(
        TrackFetchplacementHeader,
        placementService.getConsolidatedPlacementDetails,
        {
          placementId: placementId,
          targetEndpoints: [ConsolidatedPlacementTargetEndpoints.HeaderDetails],
        },
      );
      manuallyResetPromiseCounter(PromiseTrackerKeys.marginTool.fetchplacementHeader);

      manuallyIncrementPromiseCounter(PromiseTrackerKeys.marginTool.fetchOrderDetails);
      const orderData = yield call(TrackFetchOrderDetails, getOrderDetailsById, `${orderId}`);
      manuallyResetPromiseCounter(PromiseTrackerKeys.marginTool.fetchOrderDetails);

      manuallyIncrementPromiseCounter(PromiseTrackerKeys.marginTool.fetchPlacementDocs);
      const placementDocsResponse = yield call(
        TrackFetchPlacementDocs,
        placementService.getPlacementDocuments,
        placementId,
      );
      manuallyResetPromiseCounter(PromiseTrackerKeys.marginTool.fetchPlacementDocs);

      manuallyIncrementPromiseCounter(PromiseTrackerKeys.marginTool.fetchBillRateMod);
      const latestBillRate = yield call(
        TrackFetchBillRateMod,
        placementModService.getBillRateModLatestApproved,
        `${placementId}`,
      );
      manuallyResetPromiseCounter(PromiseTrackerKeys.marginTool.fetchBillRateMod);

      const billRateMod = httpSuccess(latestBillRate?.status) && latestBillRate?.data;
      const template = templates?.filter(data => data.title === MarginTemplateTitle.ApprovalProcess);
      const placementHeaderData = placementHeaderResponse?.data?.header?.data;

      const candidateName = `${placementHeaderData?.candidate?.firstName} ${placementHeaderData?.candidate?.lastName}`;
      const recruiterName = `${currentMarginData?.recruiter?.firstName} ${currentMarginData?.recruiter?.lastName}`;
      const recruiterEmail = `${currentMarginData?.recruiter?.email}`;
      const accountManagerName = `${currentMarginData?.accountManager?.firstName} ${currentMarginData?.accountManager?.lastName}`;
      const accountManagerEmail = `${currentMarginData?.accountManager?.email}`;
      const latestSentDate = getLatestSentDateForClientConfirmation(placementDocsResponse?.data);
      const formattedLatestSentDate = moment(latestSentDate)?.isValid() ? moment(latestSentDate)?.format('MM/DD/YYYY hh:mm:ss a') : '';

      const sortedSplits = sortAssignmentSplits(headerData?.splits);
      const splitPartialData = getProcessedSplits(sortedSplits, billRateMod, headerData);

      const tableData = {
        splits: {
          partialTemplateName: 'split',
          partialData: splitPartialData,
          partialTemplate:
            '<div> \r\n  <h3>Split {{split_index}} ({{split_start_date}} - {{split_end_date}})</h3>\r\n   <h3>Bill Rate:</h3>\r\n   \r\n  <table class="common-table" style="padding: 5px; border:1px solid black; border-collapse: collapse; width:100%;">\r\n    <tr>\r\n      <th style="padding: 5px; border: 1px solid black; border-collapse: collapse; width: 30%;"></th>\r\n      <th style="padding: 5px; border: 1px solid black; border-collapse: collapse; width: 24%;">Margin Value</th>\r\n      <th style="padding: 5px; border: 1px solid black; border-collapse: collapse; width: 24%;">Current Bill Rate Mod {{approval_details}}</th>\r\n      <th style="padding: 5px; border: 1px solid black; border-collapse: collapse; width: 22%;">Match</th>\r\n    </tr>\r\n    <tr style="padding: 5px; border:1px solid black; border-collapse: collapse; width:100%;">\r\n      <th style="padding: 5px; border: 1px solid black; border-collapse: collapse; width: 30%;">Bill Rate</th>\r\n      <td style="padding: 5px; border:1px solid black; border-collapse: collapse; width:24%;">{{bill_rate_margin_value}}</td>\r\n      <td style="padding: 5px; border:1px solid black; border-collapse: collapse; width:24%;">{{bill_rate_current_mod}}</td>\r\n      <td style="padding: 5px; border:1px solid black; border-collapse: collapse; width:22%;">{{bill_rate_match}}</td>\r\n    </tr>\r\n    <tr style="padding: 5px; border:1px solid black; border-collapse: collapse; width:100%;">\r\n      <th style="padding: 5px; border: 1px solid black; border-collapse: collapse; width: 30%;">Additional Overtime Rate</th>\r\n      <td style="padding: 5px; border:1px solid black; border-collapse: collapse; width:24%;">{{additional_overtime_rate_margin_value}}</td>\r\n      <td style="padding: 5px; border:1px solid black; border-collapse: collapse; width:24%;">{{additional_overtime_rate_current_mod}}</td>\r\n      <td style="padding: 5px; border:1px solid black; border-collapse: collapse; width:22%;">{{additional_overtime_rate_match}}</td>\r\n    </tr>\r\n    <tr style="padding: 5px; border:1px solid black; border-collapse: collapse; width:100%;">\r\n      <th style="padding: 5px; border: 1px solid black; border-collapse: collapse; width: 30%;">Overtime Factor</th>\r\n      <td style="padding: 5px; border:1px solid black; border-collapse: collapse; width:24%;">{{overtime_factor_margin_value}}</td>\r\n      <td style="padding: 5px; border:1px solid black; border-collapse: collapse; width:24%;">{{overtime_factor_current_mod}}</td>\r\n      <td style="padding: 5px; border:1px solid black; border-collapse: collapse; width:22%;">{{overtime_factor_match}}</td>\r\n    </tr>\r\n    <tr style="padding: 5px; border:1px solid black; border-collapse: collapse; width:100%;">\r\n      <th style="padding: 5px; border: 1px solid black; border-collapse: collapse; width: 30%;">Additional Call Back Rate</th>\r\n      <td style="padding: 5px; border:1px solid black; border-collapse: collapse; width:24%;">{{additional_call_back_rate_margin_value}}</td>\r\n      <td style="padding: 5px; border:1px solid black; border-collapse: collapse; width:24%;">{{additional_call_back_rate_current_mod}}</td>\r\n      <td style="padding: 5px; border:1px solid black; border-collapse: collapse; width:22%;">{{additional_call_back_rate_match}}</td>\r\n    </tr>\r\n    <tr style="padding: 5px; border:1px solid black; border-collapse: collapse; width:100%;">\r\n       <th style="padding: 5px; border: 1px solid black; border-collapse: collapse; width: 30%;">Call Back Factor</th>\r\n      <td style="padding: 5px; border:1px solid black; border-collapse: collapse; width:24%;">{{call_back_factor_margin_value}}</td>\r\n      <td style="padding: 5px; border:1px solid black; border-collapse: collapse; width:24%;">{{call_back_factor_current_mod}}</td>\r\n      <td style="padding: 5px; border:1px solid black; border-collapse: collapse; width:22%;">{{call_back_factor_match}}</td>\r\n    </tr>\r\n    <tr style="padding: 5px; border:1px solid black; border-collapse: collapse; width:100%;">\r\n      <th style="padding: 5px; border: 1px solid black; border-collapse: collapse; width: 30%;">Additional Double Time Rate</th>\r\n      <td style="padding: 5px; border:1px solid black; border-collapse: collapse; width:24%;">{{additional_double_time_rate_margin_value}}</td>\r\n      <td style="padding: 5px; border:1px solid black; border-collapse: collapse; width:24%;">{{additional_double_time_rate_current_mod}}</td>\r\n      <td style="padding: 5px; border:1px solid black; border-collapse: collapse; width:22%;">{{additional_double_time_rate_match}}</td>\r\n    </tr>\r\n    <tr style="padding: 5px; border:1px solid black; border-collapse: collapse; width:100%;">\r\n      <th style="padding: 5px; border: 1px solid black; border-collapse: collapse; width: 30%;">Double Time Factor</th>\r\n      <td style="padding: 5px; border:1px solid black; border-collapse: collapse; width:24%;">{{double_time_factor_margin_value}}</td>\r\n      <td style="padding: 5px; border:1px solid black; border-collapse: collapse; width:24%;">{{double_time_factor_current_mod}}</td>\r\n      <td style="padding: 5px; border:1px solid black; border-collapse: collapse; width:22%;">{{double_time_factor_match}}</td>\r\n    </tr>\r\n    <tr style="padding: 5px; border:1px solid black; border-collapse: collapse; width:100%;">\r\n      <th style="padding: 5px; border: 1px solid black; border-collapse: collapse; width: 30%;">Additional Holiday Rate</th>\r\n      <td style="padding: 5px; border:1px solid black; border-collapse: collapse; width:24%;">{{additional_holiday_rate_margin_value}}</td>\r\n      <td style="padding: 5px; border:1px solid black; border-collapse: collapse; width:24%;">{{additional_holiday_rate_current_mod}}</td>\r\n      <td style="padding: 5px; border:1px solid black; border-collapse: collapse; width:22%;">{{additional_holiday_rate_match}}</td>\r\n    </tr>\r\n    <tr style="padding: 5px; border:1px solid black; border-collapse: collapse; width:100%;">\r\n      <th style="padding: 5px; border: 1px solid black; border-collapse: collapse; width: 30%;">Holiday Factor</th>\r\n      <td style="padding: 5px; border:1px solid black; border-collapse: collapse; width:24%;">{{holiday_factor_margin_value}}</td>\r\n      <td style="padding: 5px; border:1px solid black; border-collapse: collapse; width:24%;">{{holiday_factor_current_mod}}</td>\r\n      <td style="padding: 5px; border:1px solid black; border-collapse: collapse; width:22%;">{{holiday_factor_match}}</td>\r\n    </tr>\r\n    <tr style="padding: 5px; border:1px solid black; border-collapse: collapse; width:100%;">\r\n      <th style="padding: 5px; border: 1px solid black; border-collapse: collapse; width: 30%;">On Call Rate</th>\r\n      <td style="padding: 5px; border:1px solid black; border-collapse: collapse; width:24%;">{{on_call_rate_margin_value}}</td>\r\n      <td style="padding: 5px; border:1px solid black; border-collapse: collapse; width:24%;">{{on_call_rate_current_mod}}</td>\r\n      <td style="padding: 5px; border:1px solid black; border-collapse: collapse; width:22%;">{{on_call_rate_match}}</td>\r\n    </tr>\r\n    <tr style="padding: 5px; border:1px solid black; border-collapse: collapse; width:100%;">\r\n      <th style="padding: 5px; border: 1px solid black; border-collapse: collapse; width: 30%;">Charge Rate</th>\r\n      <td style="padding: 5px; border:1px solid black; border-collapse: collapse; width:24%;">{{charge_rate_margin_value}}</td>\r\n      <td style="padding: 5px; border:1px solid black; border-collapse: collapse; width:24%;">{{charge_rate_current_mod}}</td>\r\n      <td style="padding: 5px; border:1px solid black; border-collapse: collapse; width:22%;">{{charge_rate_match}}</td>\r\n    </tr>\r\n    <tr style="padding: 5px; border:1px solid black; border-collapse: collapse; width:100%;">\r\n      <th style="padding: 5px; border: 1px solid black; border-collapse: collapse; width: 30%;">Amount Per Mile</th>\r\n      <td style="padding: 5px; border:1px solid black; border-collapse: collapse; width:24%;">{{amount_per_mile_margin_value}}</td>\r\n      <td style="padding: 5px; border:1px solid black; border-collapse: collapse; width:24%;">{{amount_per_mile_current_mod}}</td>\r\n      <td style="padding: 5px; border:1px solid black; border-collapse: collapse; width:22%;">{{amount_per_mile_match}}</td>\r\n    </tr>\r\n    <tr style="padding: 5px; border:1px solid black; border-collapse: collapse; width:100%;">\r\n      <th style="padding: 5px; border: 1px solid black; border-collapse: collapse; width: 30%;">Guaranteed Hours</th>\r\n      <td style="padding: 5px; border:1px solid black; border-collapse: collapse; width:24%;">{{guaranteed_hours_margin_value}}</td>\r\n      <td style="padding: 5px; border:1px solid black; border-collapse: collapse; width:24%;">{{guaranteed_hours_current_mod}}</td>\r\n      <td style="padding: 5px; border:1px solid black; border-collapse: collapse; width:22%;">{{guaranteed_hours_match}}</td>\r\n    </tr>\r\n    <tr style="padding: 5px; border:1px solid black; border-collapse: collapse; width:100%;">\r\n      <th style="padding: 5px; border: 1px solid black; border-collapse: collapse; width: 30%;">Preceptor Rate</th>\r\n      <td style="padding: 5px; border:1px solid black; border-collapse: collapse; width:24%;">{{preceptor_rate_margin_value}}</td>\r\n      <td style="padding: 5px; border:1px solid black; border-collapse: collapse; width:24%;">{{preceptor_rate_current_mod}}</td>\r\n      <td style="padding: 5px; border:1px solid black; border-collapse: collapse; width:22%;">{{preceptor_rate_match}}</td>\r\n    </tr>\r\n    <tr style="padding: 5px; border:1px solid black; border-collapse: collapse; width:100%;">\r\n      <th style="padding: 5px; border: 1px solid black; border-collapse: collapse; width: 30%;">Orientation Rate</th>\r\n      <td style="padding: 5px; border:1px solid black; border-collapse: collapse; width:24%;">{{orientation_rate_margin_value}}</td>\r\n      <td style="padding: 5px; border:1px solid black; border-collapse: collapse; width:24%;">{{orientation_rate_current_mod}}</td>\r\n      <td style="padding: 5px; border:1px solid black; border-collapse: collapse; width:22%;">{{orientation_rate_match}}</td>\r\n    </tr>\r\n    <tr style="padding: 5px; border:1px solid black; border-collapse: collapse; width:100%;">\r\n      <th style="padding: 5px; border: 1px solid black; border-collapse: collapse; width: 30%;">Orientation Factor</th>\r\n      <td style="padding: 5px; border:1px solid black; border-collapse: collapse; width:24%;">{{orientation_factor_margin_value}}</td>\r\n      <td style="padding: 5px; border:1px solid black; border-collapse: collapse; width:24%;">{{orientation_factor_current_mod}}</td>\r\n      <td style="padding: 5px; border:1px solid black; border-collapse: collapse; width:22%;">{{orientation_factor_match}}</td>\r\n    </tr>\r\n  </table>\r\n  <br>\r\n  \r\n  <table class="common-table orientation-hours" cellspacing="0" cellpadding="0" style="padding: 5px; border:1px solid black; border-collapse: collapse; width:100%;">\r\n    <tr style="padding: 5px; border:1px solid black; border-collapse: collapse; width:100%;">\r\n      <th style="padding: 5px; border:1px solid black; border-collapse: collapse; width:30%;">Orientation Hours</th>\r\n      <td style="padding: 5px; border:1px solid black; border-collapse: collapse; width:70%;">{{orientation_hours_value}}</td>\r\n    </tr>\r\n  </table>\r\n  \r\n  \r\n   <h3>Pay Rate :</h3>\r\n   \r\n  <table class="common-table pay-rate" style="padding: 5px; border:1px solid black; border-collapse: collapse; width:100%;">\r\n    <tr style="padding: 5px; border:1px solid black; border-collapse: collapse;">\r\n      <th style="padding: 5px; border:1px solid black; border-collapse: collapse; width:30%;">Pay Rate</th>\r\n      <td style="padding: 5px; border:1px solid black; border-collapse: collapse; width:70%;">{{pay_rate_value}}</td>\r\n    </tr>\r\n    <tr style="padding: 5px; border:1px solid black; border-collapse: collapse;">\r\n      <th style="padding: 5px; border:1px solid black; border-collapse: collapse; width:30%;">Overtime Factor</th>\r\n      <td style="padding: 5px; border:1px solid black; border-collapse: collapse; width:70%;">{{overtime_factor_value}}</td>\r\n    </tr>\r\n    <tr style="padding: 5px; border:1px solid black; border-collapse: collapse;">\r\n      <th style="padding: 5px; border:1px solid black; border-collapse: collapse; width:30%;">Call Back Factor</th>\r\n      <td style="padding: 5px; border:1px solid black; border-collapse: collapse; width:70%;">{{call_back_factor_value}}</td>\r\n    </tr>\r\n    <tr style="padding: 5px; border:1px solid black; border-collapse: collapse;">\r\n      <th style="padding: 5px; border:1px solid black; border-collapse: collapse; width:30%;">Holiday Factor</th>\r\n      <td style="padding: 5px; border:1px solid black; border-collapse: collapse; width:70%;">{{holiday_factor_value}}</td>\r\n    </tr>\r\n    <tr style="padding: 5px; border:1px solid black; border-collapse: collapse;">\r\n      <th style="padding: 5px; border:1px solid black; border-collapse: collapse; width:30%;">Double Time Factor</th>\r\n      <td style="padding: 5px; border:1px solid black; border-collapse: collapse; width:70%;">{{double_time_factor_value}}</td>\r\n    </tr>\r\n    <tr style="padding: 5px; border:1px solid black; border-collapse: collapse;">\r\n      <th style="padding: 5px; border:1px solid black; border-collapse: collapse; width:30%;">On Call Rate</th>\r\n      <td style="padding: 5px; border:1px solid black; border-collapse: collapse; width:70%;">{{on_call_rate_value}}</td>\r\n    </tr>\r\n    <tr style="padding: 5px; border:1px solid black; border-collapse: collapse;">\r\n      <th style="padding: 5px; border:1px solid black; border-collapse: collapse; width:30%;">Amount Per Mile</th>\r\n      <td style="padding: 5px; border:1px solid black; border-collapse: collapse; width:70%;">{{amount_per_mile_value}}</td>\r\n    </tr>\r\n    <tr style="padding: 5px; border:1px solid black; border-collapse: collapse;">\r\n      <th style="padding: 5px; border:1px solid black; border-collapse: collapse; width:30%;">Guaranteed Hours</th>\r\n      <td style="padding: 5px; border:1px solid black; border-collapse: collapse; width:70%;">{{guaranteed_hours_value}}</td>\r\n    </tr>\r\n    <tr style="padding: 5px; border:1px solid black; border-collapse: collapse;">\r\n      <th style="padding: 5px; border:1px solid black; border-collapse: collapse; width:30%;">Charge</th>\r\n      <td style="padding: 5px; border:1px solid black; border-collapse: collapse; width:70%;">{{charge_value}}</td>\r\n    </tr>\r\n    <tr style="padding: 5px; border:1px solid black; border-collapse: collapse;">\r\n      <th style="padding: 5px; border:1px solid black; border-collapse: collapse; width:30%;">Preceptor</th>\r\n      <td style="padding: 5px; border:1px solid black; border-collapse: collapse; width:70%;">{{preceptor_value}}</td>\r\n    </tr>\r\n    <tr style="padding: 5px; border:1px solid black; border-collapse: collapse;">\r\n      <th style="padding: 5px; border:1px solid black; border-collapse: collapse; width:30%;">Additional Premium Pay</th>\r\n      <td style="padding: 5px; border:1px solid black; border-collapse: collapse; width:70%;">{{additional_premium_pay_value}}</td>\r\n    </tr>\r\n  </table>\r\n  <br>',
        },
      };

      const extensionOfPriorPlacementId = currentMarginData?.extensionOfPriorPlacementId;

      templateSubstitutions = getApprovalVariantEmailSubstitutions(
        currentMarginData,
        extensionOfPriorPlacementId,
        placementHeaderData,
        orderData,
        candidateName,
        recruiterName,
        recruiterEmail,
        accountManagerName,
        accountManagerEmail,
        formattedLatestSentDate,
        headerData,
        bookingData,
      );

      const payload = {
        body: template[0]?.body ? `${template[0]?.body}` : '',
        tableData: tableData,
        substitutions: templateSubstitutions.reduce((acc, item) => {
          if (item.name !== 'Signature') {
            acc[item.input.slice(2, -2)] = item.value || '';
          }
          return acc;
        }, {}),
        signatureSubstitutions: signatureSubstitutionToken(user.userInfo, userPreference),
        brand: user.userInfo?.companyBrandName,
        id: null,
        skipSignatureSubstitution: true,
      };

      subject = getApprovalEmailSubject(headerData, placementHeaderData);
      manuallyIncrementPromiseCounter(PromiseTrackerKeys.marginTool.marginToolPreview);
      body = yield call(TrackMarginToolPreview, applyDataToTemplate, payload);
      manuallyResetPromiseCounter(PromiseTrackerKeys.marginTool.marginToolPreview);
    }

    const candidateDetails = getCandidateDetails(foundPlacement);
    const recipientList =
      isStatusUpdatedEmailModalOpen?.emailType === IEmailType.Manual
        ? formatManualRecipientList(
            statusId,
            selectEmailRecipients,
            sender,
            isStatusUpdatedEmailModalOpen?.emailVariant,
            candidateDetails,
          )
        : formatEmailRecipientsList(statusId - 1, selectEmailRecipients, sender, statusId);
    const notificationUser = searchNotificationData({ userInfo: user.userInfo });

    const emailData = {
      useType,
      body,
      subject,
      sender,
      substitutions: templateSubstitutions,
      emailType: SendType.one_to_one,
      associatedRecords: [],
      tos: recipientList.to?.filter(value => value),
      ccs: recipientList.cc?.filter(value => value),
      bccs: recipientList.bcc?.filter(value => value),
      userRole: Concatenate(user.userInfo?.roles || [], ','),
      isInternal: !isCandidateEmail,
      initiationPoint: !isCandidateEmail
        ? InitiationPoints.marginToolInternalEmail
        : InitiationPoints.marginToolCandidateEmail,
    };

    if (isCandidateEmail) {
      emailData['useSubType'] = UseSubType.Ouote;
    }

    yield put(
      notificationDataActions.setEmailData({
        data: {
          ...EmailDefaultValues(),
          ...notificationUser,
          ...emailData,
          populateEmpListForMarginTool: isCandidateEmail,
        },
        open: true,
        minimized: true,
      }),
    );
    yield put(payPackageStatusActions.setStatusUpdatedEmailModalOpen({ openEmailModal: false, emailType: '' }));
  } catch (error) {
    yield put(payPackageStatusActions.setStatusUpdatedEmailModalOpen({ openEmailModal: false, emailType: '' }));

    manuallyResetPromiseCounter(PromiseTrackerKeys.marginTool.marginToolTemplate);
    manuallyResetPromiseCounter(PromiseTrackerKeys.marginTool.fetchplacementHeader);
    manuallyResetPromiseCounter(PromiseTrackerKeys.marginTool.fetchOrderDetails);
    manuallyResetPromiseCounter(PromiseTrackerKeys.marginTool.fetchPlacementDocs);
    manuallyResetPromiseCounter(PromiseTrackerKeys.marginTool.fetchBillRateMod);
    manuallyResetPromiseCounter(PromiseTrackerKeys.marginTool.marginToolPreview);

    trackException({
      exception: error,
      properties: {
        name: ExceptionType.APIRequestError,
        functionName: 'handleMarginToolEmailCreation',
        area: 'src/store/redux-store/margin-tool/slices/margin-tool-email/margin-tool-email.saga.ts',
      },
    });
  }
}

export function* marginToolEmailSaga() {
  yield takeLatest(marginToolEmailAction.handleMarginToolEmailCreation.type, handleMarginToolEmailCreation);
}
