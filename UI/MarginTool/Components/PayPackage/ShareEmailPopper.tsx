import { ClickAwayListener, Grid, MenuItem, MenuList, Paper, Popper, Theme } from 'amn-ui-core';
import React from 'react';
import { makeStyles } from 'tss-react/mui';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import { getEmailTypeList } from './PayPackageHelper';
import { EnableAppScroll } from 'app/layout/Layout';
const useStyles = makeStyles()((theme: Theme) => ({
  paper: {
    padding: 0,
    margin: 0,
    width: '180px',
    float: 'right',
    marginRight: '30px',
    overflow: 'hidden',
    borderRadius: '10px 10px 10px 10px',
    boxShadow: `2px 5px 10px ${theme.palette.framework.system.semiTransparentBlack}`,
  },
  filterPopupFixed: {
    position: 'fixed',
    right: '20px !important',
    left: 'auto !important',
    top: '160px !important',
    zIndex: '1000',
  },
  mailIcon: {
    marginRight: '10px',
  },
}));

export const ShareEmailPopper = ({
  openEmailPopper,
  handleEmailModalOpen,
  setOpenEmailPopper,
  disabled,
}: {
  openEmailPopper: boolean;
  handleEmailModalOpen: (variant: string) => void;
  setOpenEmailPopper: (value: boolean) => void;
  disabled?: boolean;
}) => {
  const { classes } = useStyles();

  return (
    <div>
      <React.Fragment>
        <Popper
          anchorEl={null}
          role={undefined}
          transition
          disablePortal
          open={openEmailPopper}
          className={classes.filterPopupFixed}
          modifiers={[
            {
              options: {
                offset: {
                  enabled: true,
                },
              },
            },
          ]}
        >
          <Paper elevation={0} className={classes.paper}>
            <Grid
              item
              container
              justifyContent={'space-between'}
              alignItems="center"
              style={{ padding: 6, minWidth: 240 }}
            >
              <ClickAwayListener
                onClickAway={() => {
                  EnableAppScroll();
                  setOpenEmailPopper(false);
                }}
              >
                <MenuList>
                  {getEmailTypeList().map(emailType => (
                    <MenuItem key={emailType.id} disabled={disabled}>
                      <span
                        onClick={() => {
                          handleEmailModalOpen(emailType.type);
                        }}
                      >
                        <MailOutlineIcon className={classes.mailIcon} />
                        {emailType.name}
                      </span>
                    </MenuItem>
                  ))}
                </MenuList>
              </ClickAwayListener>
            </Grid>
          </Paper>
        </Popper>
      </React.Fragment>
    </div>
  );
};
