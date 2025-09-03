import { OverflowTooltip } from '@AMIEWEB/Common';
import { useScenarioTreeViewStyles } from '@AMIEWEB/MarginTool/Components/PayPackage/ScenarioNavigationTree/ScenarioNavigationTree.styles';
import { formatDateObj } from '@AMIEWEB/MarginTool/helper';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Skeleton, TreeItem, TreeView } from '@mui/lab';
import { Box, CircularProgress, Grid, IconButton, Typography } from 'amn-ui-core';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePromiseTracker } from 'react-promise-tracker';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { scenarioActions } from 'store/redux-store/margin-tool/slices/add-edit-scenario/add-edit-scenario.redux';
import {
  selectMarginToolDetailsData,
  selectSelectedScenario,
} from 'store/redux-store/margin-tool/slices/add-edit-scenario/add-edit-scenario.selector';
import { convertToPercentage } from '../helper';
import { getSelectedTreeValues } from './scenarioTreeHelper';
import { MoreActionMenu } from './MoreActionMenu';
import { DeleteConfirmationModal } from '../../ScenarioHeader/DeleteConfirmationModal';
import { CloseOutlined } from '@mui/icons-material';
import { globalActions } from 'app/ApplicationRoot/Global.redux';
import {
  findMostRecentScenarioCycleLogic,
  getSelectedBookingPeriodAndLatestScenario,
  updatedMarginDetailsWithDefaultScenario,
} from '../AddScenario/helper';
import { PromiseTrackerKeys } from 'app/constants/PromiseTrackerKeys';
import { MarginEntityType } from 'store/redux-store/margin-tool/slices/add-edit-scenario/add-edit-scenario.model';

const ScenarioTreeView = () => {
  const { t } = useTranslation();
  const { classes } = useScenarioTreeViewStyles();
  const dispatch = useDispatch();
  const params = useParams<{ entity: string; entityId: string }>();
  const selectedMarginToolDetails = useSelector(selectMarginToolDetailsData);
  const selectScenario = useSelector(selectSelectedScenario);
  const [selected, setSelected] = useState<string[]>();
  const [scenarioSelected, setScenarioSelected] = useState<string[]>();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [isDeleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [defaultSelectedScenarioId, setDefaultSelectedScenarioId] = useState<string>('0');
  const [expandedNodes, setExpandedNodes] = useState<string[]>([]);

  const { promiseInProgress: flagVariationInProgress } = usePromiseTracker({
    area: PromiseTrackerKeys.marginTool.peopleSoftCallMarginTool,
    delay: 0,
  });

  const handleClick = event => {
    setAnchorEl(event.currentTarget);
  };

  const { promiseInProgress: isScenarioDataLoading } = usePromiseTracker({
    area: PromiseTrackerKeys.marginTool.scenarioNavigationData,
    delay: 0,
  });

  const popperModfierScenarios = {
    modifiers: [
      {
        name: 'offset',
        options: {
          offset: [25, 0],
        },
      },
    ],
  };

  const popperModfierCandidateName = {
    modifiers: [
      {
        name: 'offset',
        options: {
          offset: [35, 0],
        },
      },
    ],
  };

  const handleSelect = (event, nodeId) => {
    setSelected(nodeId);
    if (nodeId[0]?.split('-')[0] === 'Scenario') {
      setScenarioSelected(nodeId);
      const { selectedBookingPeriod, selectedScenario } = getSelectedTreeValues(
        nodeId[0]?.split('-')[1],
        selectedMarginToolDetails,
      );
      dispatch(scenarioActions.setBookingPeriod(selectedBookingPeriod));
      dispatch(scenarioActions.setScenario(selectedScenario));
      dispatch(scenarioActions.getGSAcalculatedValues({ autoSave: false }));
      dispatch(
        scenarioActions.setTreeViewBookingPeriod({
          placementId: selectedBookingPeriod.placementId,
          bookingPeriodId: selectedBookingPeriod.bookingPeriodId,
        }),
      );
    } else {
      if (nodeId[0].includes('-')) {
        const parts = nodeId[0]?.split('-');
        const pid = parts[0];
        const bookingPeriodId = parts[1];
        if (bookingPeriodId !== 'null' && !isNaN(bookingPeriodId) && bookingPeriodId > 0) {
          //find most recent scenario for the booking period
          const { selectedBookingPeriod, latestScenario } = getSelectedBookingPeriodAndLatestScenario(
            selectedMarginToolDetails,
            bookingPeriodId,
          );
          if (latestScenario) {
            dispatch(scenarioActions.setBookingPeriod(selectedBookingPeriod));
            dispatch(scenarioActions.setScenario(latestScenario));
            dispatch(scenarioActions.getGSAcalculatedValues({ autoSave: false }));
          } else {
            dispatch(scenarioActions.setBookingPeriod(null));
            dispatch(scenarioActions.setScenario(null));
          }
        } else {
          setScenarioSelected([]);
          dispatch(scenarioActions.setBookingPeriod(null));
          dispatch(scenarioActions.setScenario(null));
        }
        dispatch(
          scenarioActions.setTreeViewBookingPeriod({
            placementId: Number.parseInt(pid),
            bookingPeriodId:
              bookingPeriodId !== 'null' && !isNaN(bookingPeriodId) ? Number.parseInt(bookingPeriodId) : null,
          }),
        );
      }
      expandedNodes?.includes(nodeId[0])
        ? setExpandedNodes(expandedNodes?.filter(node => node !== nodeId[0]))
        : setExpandedNodes([...expandedNodes, nodeId[0]]);
    }
    //if (recentStatusUpdatedScenarioId) dispatch(payPackageStatusActions.setRecentStatusUpdatedScenarioId(0));
  };

  const triggerNewSelection = groupedData => {
    setDefaultSelectedScenarioId(selectScenario?.scenarioId?.toString());

    const newExpandedNodes = [];

    groupedData.forEach(placement => {
      const placementNodeId = `${placement.placementId}`;
      newExpandedNodes.push(placementNodeId);

      placement.bookingPeriods.forEach((bookingPeriod, bpIdx) => {
        const bookingPeriodIdIsValid =
          bookingPeriod.bookingPeriodId !== null && bookingPeriod.bookingPeriodId !== undefined;
        const hasScenarios = bookingPeriod.scenarios?.length > 0;

        // Only add the bookingPeriodNodeId if bookingPeriodId is valid or there are scenarios
        if (bookingPeriodIdIsValid || hasScenarios) {
          const bookingPeriodNodeId = bookingPeriodIdIsValid
            ? `${placement.placementId}-${bookingPeriod.bookingPeriodId}-${bpIdx}`
            : `${placement.placementId}-${bpIdx}`;
          newExpandedNodes.push(bookingPeriodNodeId);

          // If there are scenarios, add each scenario node
          if (hasScenarios) {
            bookingPeriod.scenarios.forEach(scenario => {
              if (scenario.scenarioId != null) {
                const scenarioNodeId = `Scenario-${scenario.scenarioId}`;
                newExpandedNodes.push(scenarioNodeId);
              }
            });
          }
        }
      });
    });

    setExpandedNodes([...new Set(newExpandedNodes)]); // Ensure uniqueness

    // Select the specified scenario
    if (selectScenario?.scenarioId > 0) {
      setScenarioSelected([`Scenario-${selectScenario?.scenarioId}`]);
      setSelected([`Scenario-${selectScenario?.scenarioId}`]);
    } else {
      setScenarioSelected([]);
      //setSelected([]);
    }
  };

  const handleRemove = removingPlcementNode => {
    if (Number(removingPlcementNode) !== 0) {
      const removingPlcement = Number.parseInt(removingPlcementNode);
      const exstingSelectedMarginToolDetails = selectedMarginToolDetails;
      const withoutDeletedRecords = selectedMarginToolDetails?.filter(x => x?.placementId !== removingPlcement);
      dispatch(
        scenarioActions.setSelectedSearchPlacement({
          placementId: null,
          removed: false,
        }),
      );
      const mostRecentScenario = findMostRecentScenarioCycleLogic(exstingSelectedMarginToolDetails, removingPlcement);
      const updatedScenarios = updatedMarginDetailsWithDefaultScenario(withoutDeletedRecords, mostRecentScenario, null);
      dispatch(scenarioActions.setMarginDetailResponse(updatedScenarios));

      const selectedScenario = updatedScenarios
        ?.map(item => item?.scenarios?.find(scenario => scenario.isDefaultScenario))
        ?.filter(Boolean)[0];
      dispatch(scenarioActions.setScenario(selectedScenario));

      if (selectedScenario?.scenarioId > 0) {
        const selectedBookingPeriod = updatedScenarios?.find(item => item.scenarios.includes(selectedScenario));
        if (selectedBookingPeriod) {
          dispatch(scenarioActions.setBookingPeriod(selectedBookingPeriod));
          dispatch(
            scenarioActions.setTreeViewBookingPeriod({
              placementId: selectedScenario.placementId,
              bookingPeriodId: selectedBookingPeriod.bookingPeriodId,
            }),
          );
        } else {
          dispatch(
            scenarioActions.setTreeViewBookingPeriod({
              placementId: selectedScenario.placementId,
              bookingPeriodId: null,
            }),
          );
        }
        setScenarioSelected([`Scenario-${selectedScenario.scenarioId}`]);
        setSelected([`Scenario-${selectedScenario.scenarioId}`]);
      } else {
        if (updatedScenarios?.length > 0) {
          dispatch(
            scenarioActions.setTreeViewBookingPeriod({
              placementId: updatedScenarios[0].placementId,
              bookingPeriodId: null,
            }),
          );
          setScenarioSelected([]);
          setSelected([`${updatedScenarios[0].placementId}-null`]);
        } else {
          dispatch(
            scenarioActions.setTreeViewBookingPeriod({
              placementId: null,
              bookingPeriodId: null,
            }),
          );
          setScenarioSelected([]);
          setSelected([]);
        }
      }
      dispatch(
        globalActions.setSnackBar({
          message: `PID - ${removingPlcement} has been removed`,
          severity: 'success',
        }),
      );
    }
  };

  const handleDelete = () => {
    setDeleteConfirmOpen(false);
    dispatch(
      scenarioActions.deleteSingleScenario({
        scenarioId: selectScenario?.scenarioId,
        timestamp: selectScenario?.timestamp,
      }),
    );
  };

  const groupedData = useMemo(() => {
    const placementIdToExclude =
      params.entityId && params.entity === MarginEntityType.Placement ? Number(params.entityId) : null;

    // Group data by `placementId`
    const placementsMap = selectedMarginToolDetails?.reduce((acc, item) => {
      if (!acc[item.placementId]) {
        acc[item.placementId] = {
          placementId: item.placementId,
          candidateNameFirst: item.candidateNameFirst,
          candidateNameLast: item.candidateNameLast,
          bookingPeriods: [],
        };
      }

      acc[item.placementId].bookingPeriods.push({
        bookingPeriodId: item.bookingPeriodId,
        packageName: item.packageName,
        bookingPeriodStartDate: item.bookingPeriodStartDate,
        bookingPeriodEndDate: item.bookingPeriodEndDate,
        scenarios: item.scenarios,
      });

      return acc;
    }, {});

    // Convert the map to an array while maintaining the order of `placementId` from `selectedMarginToolDetails`
    const orderedData = Object.keys(placementsMap)
      .sort((a, b) => {
        const indexA = selectedMarginToolDetails.findIndex(item => item.placementId === parseInt(a));
        const indexB = selectedMarginToolDetails.findIndex(item => item.placementId === parseInt(b));
        return indexA - indexB;
      })
      .map(key => placementsMap[key]);

    // Apply the exclusion logic
    return orderedData.filter(placement => {
      const isMatchingPlacement = placementIdToExclude === placement.placementId;
      if (isMatchingPlacement) {
        const hasScenarios = placement.bookingPeriods.some(period => period.scenarios && period.scenarios.length > 0);
        return hasScenarios; // Only include if there are scenarios
      }
      return true;
    });
  }, [selectedMarginToolDetails, params.entityId, params.entity]);

  useEffect(() => {
    if (groupedData?.length > 0) {
      triggerNewSelection(groupedData);
    }
  }, [groupedData, selectScenario]);

  return (
    <>
      {!isScenarioDataLoading ? (
        !groupedData || groupedData?.length === 0 ? (
          <Box className={classes.scenarioNavigationContainer}>
            <Grid item>
              <Typography className={classes.emptyScenarioMessageContainer} variant="subtitle1">
                {t('marginTool.scenarioNavigationTree.emptyScenario')}
              </Typography>
            </Grid>
          </Box>
        ) : (
          <Box
            className={classes.sceanrioTreeViewContainer}
            id="marginTool-marginToolDetailsPage-scenarioNavigationTreeView"
          >
            <TreeView
              selected={[`${selected}`, `${scenarioSelected}`]}
              multiSelect
              onNodeSelect={handleSelect}
              aria-label="multi-select"
              defaultCollapseIcon={<ExpandMoreIcon />}
              defaultExpandIcon={<ChevronRightIcon />}
              defaultSelected={[`Scenario-${defaultSelectedScenarioId}`]}
              expanded={expandedNodes}
              sx={{ flexGrow: 1, maxWidth: 400, overflowY: 'auto', padding: '0px', marginTop: '0px' }}
            >
              {groupedData.map((eachTreeView, idx) => (
                <TreeItem
                  key={eachTreeView.placementId}
                  nodeId={`${eachTreeView?.placementId}`}
                  label={
                    <Box className={classes.scenarioMainHeader}>
                      <OverflowTooltip
                        value={`${eachTreeView?.candidateNameFirst} ${eachTreeView?.candidateNameLast}`}
                        tooltipContent={`${eachTreeView?.candidateNameFirst} ${eachTreeView?.candidateNameLast}`}
                        contentClass={classes.overFlowTooltipCandidateName}
                        customTooltipClass={classes.customTooltipWithoutArrow}
                        modifyPopper={popperModfierCandidateName}
                      />
                      <Box className={classes.secondaryContainer} sx={{ flex: 'auto' }}>
                        <Typography className={classes.secondaryText}>{'|'}</Typography>
                        <Typography>{`PID ${eachTreeView.placementId}`}</Typography>
                      </Box>
                      <Box className={classes.secondaryContainer} sx={{ marginRight: '-6px !important' }}>
                        {eachTreeView?.placementId !== Number(params?.entityId) && (
                          <IconButton
                            color="primary"
                            disabled={flagVariationInProgress}
                            onClick={e => {
                              handleRemove(eachTreeView?.placementId);
                            }}
                            size="small"
                          >
                            <CloseOutlined sx={{ height: '0.8em', width: '0.8em' }} className={classes.icon} />
                          </IconButton>
                        )}
                      </Box>
                    </Box>
                  }
                  className={classes.nodeTreeItem}
                >
                  {eachTreeView.bookingPeriods.map((bookingPeriod, bpIdx) => (
                    <TreeItem
                      key={bookingPeriod.bookingPeriodId}
                      nodeId={`${eachTreeView?.placementId}-${bookingPeriod.bookingPeriodId}-${bpIdx}`}
                      label={
                        <Box className={classes.ScenarioSecondaryHeader}>
                          <Typography>
                            {bookingPeriod.packageName}
                            {` ${formatDateObj(bookingPeriod.bookingPeriodStartDate)} - ${formatDateObj(
                              bookingPeriod.bookingPeriodEndDate,
                            )}`}
                          </Typography>
                        </Box>
                      }
                      classes={{ root: classes.treeItem, iconContainer: classes.content }}
                    >
                      {bookingPeriod.scenarios.map(scenario => (
                        <TreeItem
                          key={scenario?.scenarioId}
                          nodeId={`Scenario-${scenario?.scenarioId}`}
                          label={
                            <Box className={classes.scenarioHeader}>
                              {scenario?.scenarioId && (
                                <>
                                  <OverflowTooltip
                                    value={scenario?.scenarioName}
                                    tooltipContent={scenario?.scenarioName}
                                    contentClass={classes.overFlowTooltipScenario}
                                    customTooltipClass={classes.customTooltipWithoutArrow}
                                    modifyPopper={popperModfierScenarios}
                                  />
                                  <Box className={classes.secondaryContainer}>
                                    {flagVariationInProgress && scenario.scenarioId === selectScenario?.scenarioId ? (
                                      <Box position="absolute" top={4} right={18}>
                                        <CircularProgress size={16} color="inherit" />
                                      </Box>
                                    ) : (
                                      <Typography>{`(${convertToPercentage(scenario?.grossMargin)})`}</Typography>
                                    )}
                                    <IconButton
                                      color="primary"
                                      onClick={handleClick}
                                      disabled={flagVariationInProgress}
                                      size="small"
                                    >
                                      <MoreVertIcon
                                        className={classes.icon}
                                        sx={{
                                          cursor: flagVariationInProgress ? 'not-allowed' : 'pointer',
                                        }}
                                      />
                                    </IconButton>
                                  </Box>
                                </>
                              )}
                            </Box>
                          }
                          className={classes.treeContent}
                        />
                      ))}
                    </TreeItem>
                  ))}
                </TreeItem>
              ))}
            </TreeView>
            <MoreActionMenu
              classes={classes}
              setAnchorEl={setAnchorEl}
              anchorEl={anchorEl}
              setDeleteConfirmOpen={setDeleteConfirmOpen}
            />
            {isDeleteConfirmOpen && (
              <DeleteConfirmationModal
                open={isDeleteConfirmOpen}
                setDialogOpen={setDeleteConfirmOpen}
                handleProceed={handleDelete}
              />
            )}
          </Box>
        )
      ) : (
        <Box
          className={classes.scenarioNavigationEmptyContainer}
          id="marginTool-marginToolDetailsPage-scenarioNavigationTree"
        >
          <Skeleton variant="rectangular" className={classes.skeletonBody} />
          <Skeleton variant="rectangular" className={classes.skeletonBody} />
          <Skeleton variant="rectangular" className={classes.skeletonBody} />
          <Skeleton variant="rectangular" className={classes.skeletonBody} />
          <Skeleton variant="rectangular" className={classes.skeletonBody} />
        </Box>
      )}
    </>
  );
};

export default ScenarioTreeView;
