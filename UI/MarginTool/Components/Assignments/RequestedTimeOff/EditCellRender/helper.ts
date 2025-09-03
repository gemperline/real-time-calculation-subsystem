import { missingField } from 'app/constants';
import moment from 'moment';
import { differenceInDays, isBefore, isSameDay, isValid, isWithinInterval } from 'date-fns';

export const isNumber = (value: number | string) => {
  return typeof value === 'number';
};

export const isInValidHours = hours => {
  return !isNumber(hours) || hours?.toString() === missingField;
};

export const isInValidStartDate = params => {
  return (
    !params.row?.startDate ||
    params.row.startDate === missingField ||
    moment(params?.row.startDate) > moment(params?.row.endDate)
  );
};

export const isInValidEndDate = params => {
  return (
    !params.row?.endDate ||
    params.row.endDate === missingField ||
    moment(params?.row.startDate) > moment(params?.row.endDate)
  );
};
export const checkOverlapForArray = (timeOffEditRequests, params) => {
  const existingRangeArray = timeOffEditRequests
    ?.filter(
      item =>
        item?.startDate &&
        item?.endDate &&
        params?.row?.id !== item?.id &&
        !isBefore(new Date(item?.endDate), new Date(item?.startDate)) &&
        !isSameDay(new Date(item?.endDate), new Date(item?.startDate)),
    )
    ?.map(item => ({
      startDate: new Date(item?.startDate),
      endDate: new Date(item?.endDate),
    }));
  const newRange = { startDate: new Date(params?.row?.startDate), endDate: new Date(params?.row?.endDate) };
  if (existingRangeArray?.length > 0) {
    for (let eachRange of existingRangeArray) {
      if (isValid(newRange?.startDate) && !isValid(newRange?.endDate)) {
        const overlap = isWithinInterval(newRange?.startDate, {
          start: eachRange?.startDate,
          end: eachRange?.endDate,
        });
        if (overlap) {
          return true;
        }
      } else if (!isValid(newRange?.startDate) && isValid(newRange?.endDate)) {
        const overlap = isWithinInterval(newRange?.endDate, {
          start: eachRange?.startDate,
          end: eachRange?.endDate,
        });
        if (overlap) {
          return true;
        }
      } else if (isValid(newRange?.startDate) && isValid(newRange?.endDate)) {
        const overlap =
          isWithinInterval(eachRange?.endDate, {
            start: newRange?.startDate,
            end: newRange?.endDate,
          }) ||
          isWithinInterval(eachRange?.startDate, {
            start: newRange?.startDate,
            end: newRange?.endDate,
          }) ||
          isWithinInterval(newRange?.endDate, {
            start: eachRange?.startDate,
            end: eachRange?.endDate,
          }) ||
          isWithinInterval(newRange?.startDate, {
            start: eachRange?.startDate,
            end: eachRange?.endDate,
          });
        if (overlap) {
          return true;
        }
      }
    }
    return false;
  }
  return false;
};

export const checkOverlapForAllRecords = timeOffEditRequests => {
  const existingRangeArray = [];
  const hasOverlap = timeOffEditRequests?.map(x => {
    const newRange = { startDate: new Date(x?.startDate), endDate: new Date(x?.endDate) };
    if (existingRangeArray?.length > 0) {
      for (let eachRange of existingRangeArray) {
        if (isValid(newRange?.startDate) && !isValid(newRange?.endDate)) {
          const overlap = isWithinInterval(newRange?.startDate, {
            start: eachRange?.startDate,
            end: eachRange?.endDate,
          });
          if (overlap) {
            return true;
          }
        } else if (!isValid(newRange?.startDate) && isValid(newRange?.endDate)) {
          const overlap = isWithinInterval(newRange?.endDate, {
            start: eachRange?.startDate,
            end: eachRange?.endDate,
          });
          if (overlap) {
            return true;
          }
        } else if (isValid(newRange?.startDate) && isValid(newRange?.endDate)) {
          const overlap =
            isWithinInterval(eachRange?.endDate, {
              start: newRange?.startDate,
              end: newRange?.endDate,
            }) ||
            isWithinInterval(eachRange?.startDate, {
              start: newRange?.startDate,
              end: newRange?.endDate,
            }) ||
            isWithinInterval(newRange?.endDate, {
              start: eachRange?.startDate,
              end: eachRange?.endDate,
            }) ||
            isWithinInterval(newRange?.startDate, {
              start: eachRange?.startDate,
              end: eachRange?.endDate,
            });
          if (overlap) {
            return true;
          }
        }
      }
    }
    if (
      !existingRangeArray.some(
        range =>
          range.startDate.getTime() === newRange.startDate.getTime() &&
          range.endDate.getTime() === newRange.endDate.getTime(),
      )
    ) {
      existingRangeArray.push(newRange);
    }
    return false;
  });
  return hasOverlap?.includes(true);
};

export const getFormattedTimeOff = (timeOffRequests: any) => {
  return timeOffRequests?.map((item, index) => {
    const data = {
      id: `${index}`,
      timeOffId: item?.timeOffId,
      startDate: item?.startDate ? item?.startDate : '',
      endDate: item?.endDate ? item?.endDate : '',
      days:
        !isValid(new Date(item?.startDate)) ||
        !isValid(new Date(item?.endDate)) ||
        isBefore(new Date(item?.endDate), new Date(item?.startDate))
          ? null
          : differenceInDays(new Date(item?.endDate), new Date(item?.startDate)) + 1,
      hours: isNumber(item?.hours) ? item?.hours : null,
      scenarioId: item?.scenarioId,
      splitId: item?.splitId,
      approvedBy: item?.approvedBy ? item?.approvedBy : '',
    };
    return data;
  });
};

export const hasApprovedByValue = value => {
  return !!value && value !== missingField;;
};