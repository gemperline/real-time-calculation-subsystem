/* eslint-disable tss-unused-classes/unused-classes */
import { makeStyles } from 'tss-react/mui';

export const usePayPackagePreviewStyles = makeStyles()(theme => ({
  formStyle: {
    borderRadius: '4px',
    border: `1px solid ${theme.palette.framework.system.lightGrey}`,
    opacity: 1,
    background: `${theme.palette.framework.system.smoke}`,
    marginBottom: '12px',
    width: '100%',
  },
  headerContainer: {
    margin: '12px',
  },
  container: {
    backgroundColor: theme.palette.common.white,
    margin: '0 12px 12px 12px',
    border: `1px solid ${theme.palette.framework.system.silver}`,
    borderRadius: '4px',
    overflowY: 'auto',
  },
  secondContainer: {
    padding: '6px 12px',
  },
  helperContainer: {
    borderBottom: `1px solid ${theme.palette.framework.system.silver}`,
    padding: 12,
  },
  helperContent: {
    paddingTop: '4px',
    paddingLeft: '12px',
  },
  contentValue: {
    paddingTop: 2,
    float: 'right',
    fontSize: 14,
  },
  headerTitle: {
    fontSize: '1rem',
    fontWeight: 'bold',
  },
  headerValue: {
    paddingLeft: 0,
    fontSize: '1rem',
    fontWeight: 'bold',
    float: 'right',
  },
  contentTitle: {
    paddingLeft: 12,
    paddingTop: 2,
    fontSize: 12,
    fontWeight: 'bold',
  },

  divider: {
    padding: 6,
    width: '100%',
  },
  insurance: {
    padding: '12px 12px 6px 12px',
  },
  individualContainer: {
    padding: '6px 12px',
    alignItems: 'center',
    justifyContent: 'center',
  },
  individualContainerWeekly: {
    padding: '0px 12px',
    alignItems: 'center',
    justifyContent: 'center',
  },
  individualContainerHousing: {
    padding: '0px 12px 12px 0px',
    alignItems: 'center',
    justifyContent: 'center',
  },

  PayPackageContainer: {
    borderRadius: '4px',
    border: `1px 0px 1px 0px solid ${theme.palette.framework.system.lightGrey}`,
    background: `${theme.palette.framework.system.whisper}`,
    padding: '12px 12px',
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
  }
}));
