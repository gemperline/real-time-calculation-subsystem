import React, { useState } from 'react';
import { Accordion, AccordionDetails, AccordionSummary, Grid } from 'amn-ui-core';
import { makeStyles } from 'tss-react/mui';
import { ActionPanel } from './ActionPanel';

const useMarginToolCardStyles = makeStyles<{ customBackGroundColor: string }>()((theme, { customBackGroundColor }) => ({
  wrapper: {
    border: `1px solid ${theme.palette.framework.system.lightGrey}`,
    opacity: 1,
    boxShadow: 'none',
    borderRadius: '4px',
  },
  summary: {
    backgroundColor: theme.palette.framework.system.lightSkyBlue,
    minHeight: '48px !important',
    maxHeight: '48px !important',
    borderRadius: '4px 4px 0px 0px',
    borderBottom: `1px solid ${theme.palette.framework.system.lightGrey}`,
  },
  headerContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  detailContainer: {
    backgroundColor: customBackGroundColor ?? theme.palette.components.accordion.secondary.backgroundColor,
    borderRadius: '4px',
  },
}));

/**
 * Component that renders the container for margin tool
 */
const MarginToolCard = ({
  title,
  id,
  icon = <></>,
  children,
  isCustomIcon = false,
  isActionPanelHidden = false,
  isCollapsible = true,
  customBackGroundColor,
  isAuthorized,
  onRefresh,
  showRefreshButton,
}: {
  title: string | React.ReactNode;
  id?: string;
  icon?;
  children;
  isCustomIcon?: boolean;
  isActionPanelHidden?: boolean;
  isCollapsible?: boolean;
  customBackGroundColor?: string;
  isAuthorized?: boolean;
  onRefresh?: () => void;
  showRefreshButton?: boolean;
}) => {
  const { classes } = useMarginToolCardStyles({ customBackGroundColor: customBackGroundColor });
  const [expanded, setExpanded] = useState<boolean>(isCollapsible);

  return (
    <Accordion data-testId="margin-tool-container" expanded={expanded} id={id} className={classes.wrapper}>
      <AccordionSummary aria-controls="margin-tool-header-content" id="margin-tool-header" className={classes.summary}>
        <Grid item container className={classes.headerContainer}>
          <Grid item>{title}</Grid>
          <Grid item>
            {!isActionPanelHidden && (
              <ActionPanel
                icon={icon}
                isCustomIcon={isCustomIcon}
                setExpanded={setExpanded}
                id={id}
                onRefresh={onRefresh}
                showRefreshButton={showRefreshButton}
              />
            )}
          </Grid>
        </Grid>
      </AccordionSummary>
      <AccordionDetails className={classes.detailContainer} id={`${id}-detail`} sx={{ p: 0 }}>
        {children}
      </AccordionDetails>
    </Accordion>
  );
};

export default MarginToolCard;
