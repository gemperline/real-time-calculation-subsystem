import { Autocomplete, Box, TextField, Typography, useTheme } from 'amn-ui-core';
import React, { useEffect, useMemo, useState } from 'react';
import ClearIcon from '@mui/icons-material/Clear';
import { Controller, useFormContext } from 'react-hook-form';
import { trackPromise, usePromiseTracker } from 'react-promise-tracker';
import { throttle } from 'lodash';
import { GetMomentOfDate } from 'utils/dates/moment';
import { useDispatch, useSelector } from 'react-redux';
import { scenarioActions } from 'store/redux-store/margin-tool/slices/add-edit-scenario/add-edit-scenario.redux';
import {
  selectSearchPlacement,
  selectMarginToolDetailsData,
} from 'store/redux-store/margin-tool/slices/add-edit-scenario/add-edit-scenario.selector';
import { SearchType } from 'app/models/GlobalSearch/GlobalSearch';
import { getAMIECategorySearch } from 'app/services/SharedServices/SharedServices';
import { PromiseTrackerKeys } from 'app/constants/PromiseTrackerKeys';
import { useTranslation } from 'react-i18next';
import { uniqBy } from 'lodash';

export interface ISearchOption {
  placementId: number;
  placement: string;
  candidateFirstName: string;
  candidateLastName: string;
  candidateId: string;
  facility: string;
  facilityId: string;
  placementStartDate: string;
  placementEndDate: string;
}

export const PayPackagePIDSearch = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { control } = useFormContext();
  const [options, setOptions] = useState<ISearchOption[]>([]);
  const [textEntered, setTextEntered] = React.useState('');
  const [maxCount, setMaxCount] = React.useState<boolean>(false);
  const treeViewData = useSelector(selectMarginToolDetailsData);
  const selectedPlacement = useSelector(selectSearchPlacement);
  const { promiseInProgress: placementSearchInProgress } = usePromiseTracker({
    area: PromiseTrackerKeys.global.searchCall,
    delay: 0,
  });
  const maxPlacements = useMemo(() => {
    return (
      uniqBy(
        treeViewData?.filter(treeData => treeData?.placementId),
        'placementId',
      )?.length < 5
    );
  }, [treeViewData]); 

  useEffect(() => {
    if (selectedPlacement?.removed) {
      if (selectedPlacement?.placementId && textEntered === selectedPlacement?.placementId.toString()) {
        setTextEntered('');
      }
      if (maxPlacements) {
        setMaxCount(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPlacement]);

  const getPlacementSearchLookups = async keyWordPID => {
    const payload = {
      searchType: SearchType.placement,
      keyword: `${keyWordPID}`,
      pageNumber: 1,
      pageSize: 250,
      sortedColumn: {
        column: 'placementId',
        direction: 'asc',
      },
    };
    const searchResult = await getAMIECategorySearch(payload, '');
    return searchResult?.items?.map(result => {
      const startDateMoment = GetMomentOfDate(result?.startDate);
      const endDateMoment = GetMomentOfDate(result?.endDate);
      return {
        placementId: result?.placementId,
        placement: result?.placementId?.toString(),
        candidateFirstName: result?.candidate?.firstName?.toString(),
        candidateLastName: result?.candidate?.lastName?.toString(),
        candidateId: result?.candidateId?.toString(),
        facility: result?.facility?.toString(),
        facilityId: result?.facilityId?.toString(),
        placementStartDate: startDateMoment?.isValid() ? startDateMoment?.format('MM/DD/YYYY')?.toString() : '',
        placementEndDate: endDateMoment?.isValid() ? endDateMoment?.format('MM/DD/YYYY')?.toString() : '',
      };
    });
  };
  const fetchPlacements = async (inputPID: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const inputValue = inputPID?.target?.value;
    if (inputValue?.length >= 3) {
      await getPlacementSearchLookups(inputValue).then(res => {
        setOptions(res?.filter(x => x?.placement?.startsWith(inputValue)));
      });
    }
  };

  const throttlePlacementService = useMemo(
    () => throttle(pid => trackPromise(fetchPlacements(pid), PromiseTrackerKeys.global.searchCall), 2000),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const regex = new RegExp('^[0-9]$');
    if (!regex.test(event.key)) {
      event.preventDefault();
    }
  };

const handleSelection = (selectedOPtion: ISearchOption) => {
  const selectedUser = options?.find(x => x?.placement === selectedOPtion?.placement);
  if (
    (selectedUser && maxPlacements) ||
    treeViewData?.findIndex(treeData => treeData?.placementId === selectedOPtion?.placementId) >= 0
  ) {
    setOptions([]);
    dispatch(
      scenarioActions.setSelectedSearchPlacement({
        placementId: selectedOPtion?.placementId,
        removed: false,
        candidateFirstName:selectedOPtion?.candidateFirstName,
        candidateLastName:selectedOPtion?.candidateLastName
      }),
    );
    dispatch(scenarioActions.getMarginToolDetails({ placementId: selectedOPtion?.placementId }));
  } else if (selectedUser) {
    setTextEntered('');
    setOptions([]);
    setMaxCount(!treeViewData || maxPlacements ? false : true);
  }
};


  return (
    <>
      <Controller
        name={'payPackage.placementSearchId'}
        control={control}
        render={({ ref, onChange, value, ...rest }) => (
          <>
            <Autocomplete
              id={'marginTool-marginToolDetailsPage-pidSearchField'}
              loading={placementSearchInProgress}
              inputValue={textEntered}
              onInputChange={throttlePlacementService}
              clearIcon={<ClearIcon fontSize="small" />}
              fullWidth
              freeSolo
              disablePortal
              getOptionLabel={(opt: ISearchOption) => opt.placement}
              renderOption={(params, option) => {
                return (
                  <li {...params}>
                    <Box>
                      <Typography variant={'subtitle2'}>{option?.placement}</Typography>
                      <Typography component={'span'} variant={'body1'} sx={{ wordWrap: 'break-word' }}>
                        {`${option?.candidateFirstName} ${option?.candidateLastName} (${option?.candidateId}), ${
                          option?.facility
                        } (${option?.facilityId})${
                          option?.placementStartDate && option?.placementEndDate
                            ? ', ' + option?.placementStartDate + ' - ' + option?.placementEndDate
                            : ''
                        }   `}
                      </Typography>
                    </Box>
                  </li>
                );
              }}
              renderTags={() => null}
              renderInput={params => (
                <TextField
                  {...params}
                  variant={'outlined'}
                  label={'PID'}
                  style={{ backgroundColor: theme.palette.framework.system.white }}
                  value={textEntered}
                  onChange={e => {
                    e.target.value !== '' && setTextEntered(e.target.value);
                  }}
                  onKeyPress={handleKeyPress}
                  onClick={() => setTextEntered('')}
                />
              )}
              options={options}
              onChange={(
                event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
                selectedOPtion: ISearchOption,
              ) => {
                handleSelection(selectedOPtion)
              }}
            />
            {maxCount && (
              <Typography
                component="span"
                sx={{
                  marginTop: 1,
                  color: theme.palette.framework.system.red,
                }}
                variant="body2"
              >
                {t('marginTool.payPackageStatus.message.pidSearchLimitMessage')}
              </Typography>
            )}
          </>
        )}
      />
    </>
  );
};
