/* eslint-disable tss-unused-classes/unused-classes */
import { makeStyles } from 'tss-react/mui';

export const useMarginToolFooterStyles = makeStyles()(theme => ({
  marginToolFooter: {
    position: 'absolute',
    left: '0',
    bottom: '0',
    width: '100%',
    height: '64px',
    zIndex: 1203,
    boxShadow: `0px -1px 3px ${theme.palette.framework.system.lightGray2}`,
    borderRadius: '0 0 4px 4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px 0 86px',
    background: 'rgba(255, 255, 255, 0.6)',
    backdropFilter: 'blur(2px)',
  },
  marginToolFooterGrossMargin: {
    height: '40px',
    background: `${theme.palette.framework.system.white}`,
    boxShadow: `0px 2px 4px ${theme.palette.framework.system.lightGray2}`,
    color: `${theme.palette.framework.system.doveGray}`,
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    padding: '0 12px',
    font: 'normal normal bold 16px/17px Roboto'
  },
  marginToolFooterButton: {
    height: '40px',
    width: '90px',
  },
}));
