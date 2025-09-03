import React from 'react';
import { useTranslation } from 'react-i18next';
import { ClickAwayListener, MenuItem, MenuList, Popper } from 'amn-ui-core';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectOrderIdModifiedConfirmationStatus,
  selectSelectedScenario,
} from 'store/redux-store/margin-tool/slices/add-edit-scenario/add-edit-scenario.selector';
import { PayPackageStatus } from 'store/redux-store/margin-tool/slices/pay-package-status/pay-package-status.model';
import { scenarioActions } from 'store/redux-store/margin-tool/slices/add-edit-scenario/add-edit-scenario.redux';

export const MoreActionMenu = ({ classes, anchorEl, setAnchorEl, setDeleteConfirmOpen }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const selectedScenario = useSelector(selectSelectedScenario);
  const orderIdModifiedConfirmationStatus = useSelector(selectOrderIdModifiedConfirmationStatus);
  //const [, setIsModalOpen] = useContext(ModalStatusContext);
  const isScenarioStatusPending = selectedScenario?.scenarioStatusId === PayPackageStatus.Pending;

  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  return (
    <Popper
      open={Boolean(anchorEl)}
      anchorEl={anchorEl}
      role={undefined}
      style={{ zIndex: '999' }}
      className={classes.menu}
      placement={'bottom-end'}
    >
      <ClickAwayListener onClickAway={() => handleMenuClose()}>
        <MenuList>
          <MenuItem
            className={`${classes.menuItem} ${!isScenarioStatusPending ? classes.disabledButton : ''}`}
            onClick={e => {
              if (orderIdModifiedConfirmationStatus) {
                dispatch(scenarioActions.setShowOrderIdModifiedDialogStatus(true));
              } else {
                dispatch(scenarioActions.openMarginToolEditDetails());
                //setIsModalOpen(true, PayPackageOptions.editScenario);
              }
              handleMenuClose();
            }}
          >
            <EditOutlinedIcon />
            {t('marginTool.scenarioNavigationTree.moreMenu.edit')}
          </MenuItem>
          <MenuItem
            className={`${classes.menuItem} ${
              selectedScenario?.isMostRecentBookingPeriod && isScenarioStatusPending ? '' : classes.disabledButton
            }`}
            onClick={e => {
              if (orderIdModifiedConfirmationStatus) {
                dispatch(scenarioActions.setShowOrderIdModifiedDialogStatus(true));
              } else {
                setDeleteConfirmOpen(true);
              }
              handleMenuClose();
            }}
          >
            <DeleteOutlinedIcon />
            {t('marginTool.scenarioNavigationTree.moreMenu.delete')}
          </MenuItem>
        </MenuList>
      </ClickAwayListener>
    </Popper>
  );
};
