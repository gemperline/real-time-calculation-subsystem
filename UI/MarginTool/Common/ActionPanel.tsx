import React from 'react';
import { Box, IconButton, SvgIconProps } from 'amn-ui-core';
import CallSplitIcon from '@mui/icons-material/CallSplit';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { makeStyles } from 'tss-react/mui';
import CreateOutlinedIcon from '@mui/icons-material/CreateOutlined';
import {
  selectOrderIdModifiedConfirmationStatus,
  selectSelectedScenario,
} from 'store/redux-store/margin-tool/slices/add-edit-scenario/add-edit-scenario.selector';
import { useDispatch, useSelector } from 'react-redux';
import { PayPackageStatus } from 'store/redux-store/margin-tool/slices/pay-package-status/pay-package-status.model';
import { CustomTooltip } from '@AMIEWEB/Common';
import { useTranslation } from 'react-i18next';
import RefreshIcon from '@mui/icons-material/Refresh';
import { scenarioActions } from 'store/redux-store/margin-tool/slices/add-edit-scenario/add-edit-scenario.redux';

const useActionPanelCardStyles = makeStyles()(theme => ({
  editIcon: {
    height: '20px',
    width: '20px',
  },
  splitIcon: {
    transform: 'rotate(90deg)',
    height: '20px',
    width: '20px',
  },
  refreshIcon: {
    color: theme.palette.framework.system.tertiaryGrey,
    transform: 'rotate(5deg) scaleX(-1)',
    '&:hover': {
      color: theme.palette.framework.system.main,
    },
  },
  disabledRefreshIcon: {
    pointerEvents: 'none',
    cursor: 'default',
  },
}));

export const ActionPanel = ({
  icon,
  isCustomIcon,
  setExpanded,
  id,
  onRefresh,
  showRefreshButton,
}: {
  icon: React.ComponentType<SvgIconProps>;
  isCustomIcon: boolean;
  setExpanded: Function;
  id: string;
  onRefresh?: () => void;
  showRefreshButton?: boolean;
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const selectedScenario = useSelector(selectSelectedScenario);
  const { classes } = useActionPanelCardStyles();
  //const [, setIsModalOpen] = useContext(ModalStatusContext);
  const isScenarioStatusPending = selectedScenario?.scenarioStatusId === PayPackageStatus.Pending;
  const orderIdModifiedConfirmationStatus = useSelector(selectOrderIdModifiedConfirmationStatus);

  return (
    <Box sx={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }} component="span">
      {isCustomIcon && showRefreshButton ? (
        <>
          {showRefreshButton && (
            <CustomTooltip tooltipContent={isScenarioStatusPending ? t('marginTool.tooltip.refresh') : ''}>
              <IconButton
                disabled={!isScenarioStatusPending}
                className={isScenarioStatusPending ? classes.refreshIcon : classes.disabledRefreshIcon}
              >
                <RefreshIcon
                  onClick={() => {
                    if (orderIdModifiedConfirmationStatus) {
                      dispatch(scenarioActions.setShowOrderIdModifiedDialogStatus(true));
                    } else {
                      onRefresh && onRefresh();
                    }
                  }}
                />
              </IconButton>
            </CustomTooltip>
          )}
          {icon}
        </>
      ) : showRefreshButton ? (
        <>
          {showRefreshButton && (
            <CustomTooltip tooltipContent={isScenarioStatusPending ? t('marginTool.tooltip.refresh') : ''}>
              <IconButton
                disabled={!isScenarioStatusPending}
                className={isScenarioStatusPending ? classes.refreshIcon : classes.disabledRefreshIcon}
              >
                <RefreshIcon
                  onClick={() => {
                    if (orderIdModifiedConfirmationStatus) {
                      dispatch(scenarioActions.setShowOrderIdModifiedDialogStatus(true));
                    } else {
                      onRefresh && onRefresh();
                    }
                  }}
                />
              </IconButton>
            </CustomTooltip>
          )}
        </>
      ) : isCustomIcon ? (
        icon
      ) : (
        <>
          <CustomTooltip
            tooltipContent={!isScenarioStatusPending ? t('marginTool.tooltip.payPackageStatusDisabled') : ''}
          >
            <IconButton disabled={!isScenarioStatusPending}>
              <CreateOutlinedIcon
                className={classes.editIcon}
                onClick={() => {
                  if (orderIdModifiedConfirmationStatus) {
                    dispatch(scenarioActions.setShowOrderIdModifiedDialogStatus(true));
                  } else {
                    // marginToolCard id from Assignment.tsx
                    if (id === 'assignment-card-marginTool') {
                      dispatch(scenarioActions.openMarginToolEditDetails());
                      //setIsModalOpen(true, PayPackageOptions.editScenario);
                    }
                  }
                }}
              />
            </IconButton>
          </CustomTooltip>
          <CustomTooltip
            tooltipContent={!isScenarioStatusPending ? t('marginTool.tooltip.payPackageStatusDisabled') : ''}
          >
            <IconButton disabled={!isScenarioStatusPending}>
              <CallSplitIcon
                className={classes.splitIcon}
                onClick={() => {
                  if (orderIdModifiedConfirmationStatus) {
                    dispatch(scenarioActions.setShowOrderIdModifiedDialogStatus(true));
                  } else {
                    // marginToolCard id from Assignment.tsx
                    if (id === 'assignment-card-marginTool') {
                      dispatch(scenarioActions.openMarginToolEditDetails());
                      //setIsModalOpen(true, PayPackageOptions.editScenario);
                    }
                  }
                }}
              />
            </IconButton>
          </CustomTooltip>
          <IconButton
            onClick={() => {
              if (orderIdModifiedConfirmationStatus) {
                dispatch(scenarioActions.setShowOrderIdModifiedDialogStatus(true));
              } else {
                setExpanded(prevState => !prevState);
              }
            }}
          >
            <ExpandMoreIcon />
          </IconButton>
        </>
      )}
    </Box>
  );
};
