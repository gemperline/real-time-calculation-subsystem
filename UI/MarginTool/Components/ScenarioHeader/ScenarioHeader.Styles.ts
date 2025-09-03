/* eslint-disable tss-unused-classes/unused-classes */
import { makeStyles } from 'tss-react/mui';

export const useScenarioHeaderStyles = makeStyles()(theme => ({
  container: {
    border: `1px solid ${theme.palette.system.lightGrey}`,
    background: theme.palette.components.grid.content.backgroundColor,
    borderRadius: '4px',
  },
  header: {
    height: '44px',
    borderRadius: '3px 3px 0px 0px',
    background: `${theme.palette.system.lightGrey2}`,
    borderBottom: `1px solid ${theme.palette.system.lightGrey}`,
    padding: '10px 12px',
    display: 'flex',
    justifyContent: 'space-between',
  },
  headerLeftSection: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: '12px',
  },
  headerRightSection: {
    display: 'flex',
    alignItems: 'center',
  },
  headerTitle: {
    color: `${theme.palette.system.darkGray}`,
    fontSize: '18px',
    fontWeight: '500',
  },
  headerTooltip: {
    fontSize: '14px',
  },
  headerButton: {
    height: '28px',
  },
  detailCard: {
    height: 'auto',
  },
  deleteSection: {
    color: theme.palette.framework.system.tertiaryGrey,
    padding: '6px',
    fontSize: '12px !important',
    '&:hover': {
      color: `${theme.palette.system.lightBlue}`,
      cursor: 'pointer',
    },
  },
  statusText: {
    fontSize: '14px',
    lineHeight: '13px',
    fontWeight: 500,
    fontFamily: 'Roboto',
    textAlign: 'left',
    opacity: 1,
  },
  denyBtn: {
    width: '69px',
    height: '24px',
    color: '#333333',
    '&:hover': {
      color: `${theme.palette.system.lightBlue}`,
      cursor: 'pointer',
    },
  },
  statusBtn: {
    height: '24px',
    color: '#333333',
    '&:hover': {
      color: `${theme.palette.system.lightBlue}`,
      cursor: 'pointer',
    },
    '&.Mui-disabled': {
      cursor: 'pointer',
      pointerEvents: 'none',
    },
  },
  approvalBtn: {
    height: '24px',
    color: '#333333',
    '&:hover': {
      color: `${theme.palette.system.lightBlue}`,
      cursor: 'pointer',
    },
    '&.Mui-disabled': {
      cursor: 'pointer',
      pointerEvents: 'none',
    },
  },
  shareIcon: {
    '& .icon': {
      fill: theme.palette.framework.system.tertiaryGrey,
      transition: 'fill 0.3s ease',
    },
    '&:hover .icon': {
      fill: theme.palette.system.lightBlue,
    },
    '&:hover': {
      cursor: 'pointer',
    },
  },

  btnText: {
    fontSize: '12px',
    lineHeight: '14px',
    fontFamily: 'Roboto',
    marginTop: '1px',
    marginLeft: '-3px',
  },
  disabledButton: {
    pointerEvents: 'none',
    opacity: '0.6',
  },
  detailsTooltip: {
    backgroundColor: theme.palette.components.tooltip.backgroundColor,
    border: `1px solid ${theme.palette.system.borderColor}`,
    color: theme.palette.system.errorRed,
    fontWeight: 'normal',
    padding: '0px 24px 0px 0px !important',
  },
  arrow: {
    '&:before': {
      border: `1px solid ${theme.palette.system.borderColor}`,
    },
    color: theme.palette.components.tooltip.arrowColor,
  },
  customTooltipWithoutArrow: {
    backgroundColor: theme.palette.framework.system.white,
    boxShadow: `0px 3px 6px ${theme.palette.framework.system.dimFadedBlack}`,
    border: `1px solid ${theme.palette.framework.system.lightGray}`,
    textAlign: 'left',
    fontSize: '14px',
    font: 'normal normal normal 14px/20px Roboto',
    letterSpacing: '0.00938em',
    color: theme.palette.framework.system.charcoal,
    opacity: 1,
    width: '265px',
    lineHeight: '1.5',
    ' & .MuiTooltip-arrow': { display: 'none !important' },
    maxHeight: 500,
    overflow: 'auto',
  },
  scenarioHeaderEmptyContainer: {
    height: '259px',
    backgroundColor: theme.palette.framework.system.white,
    margin: '12px',
    border: `1px solid ${theme.palette.framework.system.silver}`,
    borderRadius: ' 4px',
    paddingTop: '12px',
  },
  skeletonBody: {
    width: '300px',
    margin: '12px',
    padding: '12px',
  },
  separator: {
    color: theme.palette.framework.system.silver,
    margin: '0px 6px',
  },
}));
