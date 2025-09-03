import React from 'react';
import RequestApprovalIcon from 'assets/images/MarginTool/Pay_Package/RequestApprovalIcon.svg';
import ResetIcon from 'assets/images/MarginTool/Pay_Package/ResetIcon.svg';
import ApproveIcon from 'assets/images/MarginTool/Pay_Package/ApproveIcon.svg';
import VerifyIcon from 'assets/images/MarginTool/Pay_Package/VerifyIcon.svg';
import i18next from 'i18next';
import { theme } from 'styles/global-styles';
import {
  PayPackageStatus,
  StatusTransitionButtons,
} from 'store/redux-store/margin-tool/slices/pay-package-status/pay-package-status.model';
import { MarginDetailsResponseScenario } from 'store/redux-store/margin-tool/slices/add-edit-scenario/add-edit-scenario.model';
import moment from 'moment-timezone';

export const getPayPackageStatusTooltip = (val: number, scenarioHeaderDetails: MarginDetailsResponseScenario) => {
  if (val === PayPackageStatus.Approved) {
    return (
      <span
        style={{
          font: 'normal normal normal 12px/20px Roboto',
          letterSpacing: '0px',
          color: theme.palette.system.doveGray,
          opacity: '1',
        }}
      >
        <ul>
          <li>
            {i18next.t('marginTool.payPackageStatus.headerButtonStatus.approvedBy', {
              approvedByName: `${scenarioHeaderDetails?.approvedUserFirst} ${scenarioHeaderDetails?.approvedUserLast}`,
            })}
          </li>
          <li>
            {i18next.t('marginTool.payPackageStatus.headerButtonStatus.approvedOn', {
              approvedOn: `${moment
                .tz(scenarioHeaderDetails?.approvedDateAt, 'UTC')
                .tz('America/Los_Angeles')
                .format('L hh:mm A')}`,
            })}
          </li>
        </ul>
      </span>
    );
  } else if (val === PayPackageStatus.Verified) {
    return (
      <span
        style={{
          font: 'normal normal normal 12px/20px Roboto',
          letterSpacing: '0px',
          color: theme.palette.system.doveGray,
          opacity: '1',
        }}
      >
        <ul>
          <li>
            {i18next.t('marginTool.payPackageStatus.headerButtonStatus.verifiedBy', {
              verifiedByName: `${scenarioHeaderDetails?.verifiedUserFirst} ${scenarioHeaderDetails?.verifiedUserLast}`,
            })}
          </li>
          <li>
            {i18next.t('marginTool.payPackageStatus.headerButtonStatus.verifiedOn', {
              verifiedOn: `${moment
                .tz(scenarioHeaderDetails?.verifiedDateAt, 'UTC')
                .tz('America/Los_Angeles')
                .format('L hh:mm A')}`,
            })}
          </li>
        </ul>
        <ul>
          <li>
            {i18next.t('marginTool.payPackageStatus.headerButtonStatus.approvedBy', {
              approvedByName: `${scenarioHeaderDetails?.approvedUserFirst} ${scenarioHeaderDetails?.approvedUserLast}`,
            })}
          </li>
          <li>
            {i18next.t('marginTool.payPackageStatus.headerButtonStatus.approvedOn', {
              approvedOn: `${moment
                .tz(scenarioHeaderDetails?.approvedDateAt, 'UTC')
                .tz('America/Los_Angeles')
                .format('L hh:mm A')}`,
            })}
          </li>
        </ul>
      </span>
    );
  } else {
    return '';
  }
};

export const fetchStatusIcon = (
  button: StatusTransitionButtons,
  enabled: boolean,
  isIconHovered: {
    buttonName?: StatusTransitionButtons;
    isHovered: boolean;
  },
  isValid?: boolean,
) => {
  switch (button) {
    case StatusTransitionButtons.Approve:
      return (
        <img
          src={ApproveIcon}
          alt="Approve Icon"
          style={{
            opacity: !enabled ? 0.5 : 1,
            pointerEvents: !enabled ? 'none' : 'auto',
            filter:
              isIconHovered?.buttonName === StatusTransitionButtons.Approve && isIconHovered?.isHovered
                ? 'brightness(0) saturate(100%) invert(45%) sepia(95%) saturate(750%) hue-rotate(182deg) brightness(91%) contrast(91%)'
                : 'brightness(1) saturate(100%)',
            transition: 'filter 0.3s',
          }}
        />
      );
    case StatusTransitionButtons.RequestApproval:
      return (
        <img
          src={RequestApprovalIcon}
          alt="Request Approval Icon"
          style={{
            opacity: !isValid ? 0.5 : 1,
            pointerEvents: !isValid ? 'none' : 'auto',
            filter:
              isIconHovered?.buttonName === StatusTransitionButtons.RequestApproval && isIconHovered?.isHovered
                ? 'brightness(0) saturate(100%) invert(45%) sepia(95%) saturate(750%) hue-rotate(182deg) brightness(96%) contrast(85%)'
                : 'brightness(1) saturate(100%)',
            transition: 'filter 0.3s',
          }}
        />
      );
    case StatusTransitionButtons.reset:
      return (
        <img
          src={ResetIcon}
          alt="Reset Icon"
          style={{
            opacity: !enabled ? 0.5 : 1,
            pointerEvents: !enabled ? 'none' : 'auto',
            filter:
              isIconHovered?.buttonName === StatusTransitionButtons.reset && isIconHovered?.isHovered
                ? 'brightness(0) saturate(100%) invert(45%) sepia(95%) saturate(750%) hue-rotate(182deg) brightness(91%) contrast(91%)'
                : 'brightness(1) saturate(100%)',
            transition: 'filter 0.3s',
          }}
        />
      );
    case StatusTransitionButtons.verify:
      return (
        <img
          src={VerifyIcon}
          alt="Verify Icon"
          style={{
            opacity: !enabled ? 0.5 : 1,
            pointerEvents: !enabled ? 'none' : 'auto',
            filter:
              isIconHovered?.buttonName === StatusTransitionButtons.verify && isIconHovered?.isHovered
                ? 'brightness(0) saturate(100%) invert(45%) sepia(95%) saturate(750%) hue-rotate(182deg) brightness(91%) contrast(91%)'
                : 'brightness(1) saturate(100%)',
            transition: 'filter 0.3s',
          }}
        />
      );
    default:
      return <></>;
  }
};

export const getStatusUpdateButtonDisabledTooltip = () => {
  return (
    <span
      style={{
        display: 'flex',
        flexDirection: 'column',
        font: 'normal normal normal 12px/20px Roboto',
        letterSpacing: '0px',
        color: theme.palette.system.doveGray,
        opacity: '1',
      }}
    >
      <span>{`${i18next.t('marginTool.tooltip.statusButtonDisabledTooltipHeader')} ${i18next.t(
        'marginTool.tooltip.roleBasedAccessRestriction',
      )}`}</span>
    </span>
  );
};

export enum EmailVariant {
  Internal = 'Internal',
  Candidate = 'Candidate',
}

export const getEmailTypeList = () => {
  return [
    {
      id: 1,
      name: i18next.t('marginTool.payPackageStatus.emailModal.emailCandidate'),
      type: EmailVariant.Candidate,
    },
    {
      id: 2,
      name: i18next.t('marginTool.payPackageStatus.emailModal.emailInternal'),
      type: EmailVariant.Internal,
    },
  ];
};

export enum MarginTemplateTitle {
  ApprovalProcess = 'Approval Process',
  CandidatePayQuote = 'Candidate Pay Quote',
}
