import { makeStyles } from 'tss-react/mui';

export const useScenarioTreeViewStyles = makeStyles()(theme => ({
  scenarioHeader: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    flexWrap: 'nowrap',
    paddingLeft: '40px',
    color: theme.palette.framework.system.charcoal,
    alignItems: 'Center',
  },
  scenarioMainHeader: {
    padding: '3px 0px',
    width: '100%',
    textAlign: 'left',
    font: 'normal normal nomral 14px/18px Roboto',
    letterSpacing: '0px',
    color: theme.palette.framework.system.charcoal,
    opacity: 1,
    display: 'flex',
    alignItems: 'Center',
    justifyContent: 'space-between',
    overflow:'hidden'
  },
  ScenarioSecondaryHeader: {
    padding: '3px 0px',
    paddingLeft: '6px',
    width: '100%',
    textAlign: 'left',
    font: 'normal normal normal 14px/18px Roboto',
    letterSpacing: '0px',
    color: theme.palette.framework.system.charcoal,
    opacity: 1,
    display: 'flex',
    alignItems: 'Center',
  },
  overFlowTooltipScenario: {
    maxWidth: '163px',
  },
  tooltipContent: {
    textAlign: 'left',
    font: 'normal normal normal 14px/20px Roboto',
    letterSpacing: '0px',
    color: theme.palette.framework.system.charcoal,
    opacity: 1,
  },
  overFlowTooltipCandidateName: {
    maxWidth: '150px',
  },

  icon: {
    color: theme.palette.framework.system.tertiaryGrey,
    margin: '0px',
    padding: '-2px',
    '&:hover': {
      color: `${theme.palette.framework.system.main}`,
    },
  },
  secondaryContainer: {
    display: 'flex',
    alignItems: 'center',
    marginRight: '-8px',
  },
  secondaryText: {
    color: theme.palette.framework.system.silver,
    margin: '0px 2px',
  },
  treeItem: {
    marginLeft: '-20px',
    textAlign: 'left',
    font: 'normal normal normal 14px/18px Roboto',
    letterSpacing: '0px',
    color: theme.palette.framework.system.charcoal,
    opacity: 1,
    '& .MuiTreeItem-content:hover': {
      backgroundColor: 'transparent',
    },
    '& .MuiTreeItem-content.Mui-selected': {
      backgroundColor: theme.palette.framework.system.paleSkyBlue,
      fontWeight: 'bold !important',
      position: 'relative',
      width: '100%',
      '& *': {
        fontWeight: 'bold !important',
      },
    },
  },

  nodeTreeItem: {
    textAlign: 'left',
    font: 'normal normal normal 14px/18px Roboto',
    letterSpacing: '0px',
    opacity: 1,
    color: theme.palette.framework.system.charcoal,
    '& .MuiTreeItem-content:hover': {
      backgroundColor: 'transparent',
    },
    '& .MuiTreeItem-content.Mui-selected': {
      backgroundColor: theme.palette.framework.system.paleSkyBlue,
      fontWeight: 'bold !important',
      position: 'relative',
      width: '100%',
      '& *': {
        fontWeight: 'bold !important',
      },
    },
  },

  treeContent: {
    marginLeft: '-40px',
    '& .MuiTreeItem-content.Mui-selected': {
      backgroundColor: theme.palette.framework.system.paleSkyBlue,
      fontWeight: 'bold !important',
      position: 'relative',
      width: '100%',
      '& .MuiSvgIcon-root': {
        color: theme.palette.framework.system.main,
      },
      '& *': {
        fontWeight: 'bold !important',
      },
    },
  },
  content: {
    paddingLeft: '20px',
  },
  label: {
    paddingLeft: '5px',
  },
  scenarioNavigationContainer: {
    height: '259px',
    backgroundColor: theme.palette.common.white,
    margin: '0 12px 12px 12px',
    border: `1px solid ${theme.palette.framework.system.silver}`,
    alignItems: 'center',
    alignContent: 'center',
    borderRadius: ' 4px',
  },
  customTooltipWithoutArrow: {
    backgroundColor: theme.palette.framework.system.white,
    boxShadow: `0px 3px 6px ${theme.palette.system.darkBlackBlue}`,
    border: `1px solid ${theme.palette.system.veryLightGray}`,
    textAlign: 'left',
    font: 'normal normal normal 14px/20px Roboto',
    letterSpacing: '0px',
    color: theme.palette.framework.system.charcoal,
    opacity: 1,
    width: '265px',
    lineHeight: '1.5',
    ' & .MuiTooltip-arrow': { display: 'none !important' },
  },
  scenarioNavigationEmptyContainer: {
    height: '259px',
    backgroundColor: theme.palette.common.white,
    margin: '12px',
    border: `1px solid ${theme.palette.framework.system.silver}`,
    borderRadius: ' 4px',
    paddingTop: '12px',
  },
  skeletonBody: {
    width: '300px',
    margin: '12px',
    height: '15px',
  },
  emptyScenarioMessageContainer: {
    textAlign: 'center',
    color: theme.palette.framework.system.charcoal,
    font: 'italic normal normal 14px/18px Roboto !important',
    letterSpacing: '0px',
    opacity: 1,
  },
  sceanrioTreeViewContainer: {
    height: '259px',
    backgroundColor: theme.palette.common.white,
    margin: '0 12px 12px 12px',
    paddingTop: '12px',
    border: `1px solid ${theme.palette.framework.system.silver}`,
    borderRadius: '4px',
    overflowY: 'auto',
  },
  menu: {
    width: '165px',
    background: `${theme.palette.common.white} 0% 0% no-repeat padding-box`,
    boxShadow: `0px 2px 8px ${theme.palette.framework.system.semiTransparentBlack}`,
    borderRadius: '4px',
    opacity: '1',
    position: 'relative',
    marginRight: '3rem',
    marginTop: '-1rem',
    zIndex: 999,
    padding: '10px 0px',
  },
  menuItem: {
    width: '100%',
    height: '40px',
    gap: '10px',
    justifyContent: 'flex-start',
    fontSize: '14px',
    padding: '0px',
    paddingLeft: '20px',
    color: theme.palette.framework.system.charcoal,
    '& .MuiSvgIcon-root': {
      color: theme.palette.framework.system.tertiaryGrey,
    },
  },
  disabledButton: {
    pointerEvents: 'none',
    opacity: '0.6',
  },
}));
