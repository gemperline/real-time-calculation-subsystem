import { GenericDialog, GenericDialogButton } from '@AMIEWEB/Alerts/GenericDialog';
import { Banner } from 'app/components/Common/Banner/CustomBanner';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { makeStyles } from 'tss-react/mui';
import { AddScenario } from './AddScenario';
import { useAppDispatch } from 'store/storeHooks';
import { FormProvider, useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { getDetailsByScenarioId } from '@AMIEWEB/MarginTool/helper';
import { selectUser } from 'oidc/user.selectors';
import { useHistory, useParams } from 'react-router-dom';
import { IAddScenarioForm, IAddScenarioRequestPayload } from './model';
import { usePromiseTracker } from 'react-promise-tracker';
import {
  selectDeletedSplits,
  selectMarginToolDetailsData,
  selectScenarioCreateUpdateResponse,
  selectScenarioModalState,
  selectSelectedScenario,
  selectTreeViewSelectedBookingPeriod,
} from 'store/redux-store/margin-tool/slices/add-edit-scenario/add-edit-scenario.selector';
import { scenarioActions } from 'store/redux-store/margin-tool/slices/add-edit-scenario/add-edit-scenario.redux';
import { createRequestPayload, createUpdatePayloadRequest } from './helper';
import { PayPackageOptions } from '@AMIEWEB/MarginTool/enum';
import { IMarginUpdateResponseErrorTargetTypes, IMarginUpdateResponseErrorTypes } from '../models/AddScenarioModal';
import { CircularProgress } from 'amn-ui-core';
import { BannerMessage } from '@AMIEWEB/Settings/AutoTaskManagement/common/BannerMessage';
import { PromiseTrackerKeys } from 'app/constants/PromiseTrackerKeys';

const useAddScenarioWrapperStyles = makeStyles()(theme => ({
  dialog: {
    maxWidth: '960px',
  },
  dialogContent: {
    padding: '0px !important',
  },
  dialogContentWrap: {
    padding: '20px !important',
  },
  customSubmitButton: {
    padding: '13px 15px',
    // width: '140px',
    backgroundColor: theme.palette.framework.system.navyBlue,
    color: theme.palette.common.white,
    '&:hover': {
      backgroundColor: theme.palette.framework.system.navyBlue,
    },
    minWidth: '75px',
    marginRight: '24px',
    marginLeft: '24px',
    fontSize: '10px',
    height: '24px',
    '& .MuiInputBase-root.Mui-disabled': {
      pointerEvents: 'auto',
    },
  },
  fixedBanner: {
    position: 'sticky',
    top: 0,
    backgroundColor: theme.palette.background.paper,
    zIndex: 100,
  },
}));

interface AddScenarioProps {
  handleCloseModal?: () => void;
  modalData: IAddScenarioForm;
}

export const AddScenarioModal = (props: AddScenarioProps) => {
  const { handleCloseModal } = props;
  const dispatch = useAppDispatch();
  const { classes } = useAddScenarioWrapperStyles();
  const { t } = useTranslation();
  const history = useHistory();
  const params = useParams<{ entity: string; entityId: string }>();
  const marginToolDetails = useSelector(selectMarginToolDetailsData);
  const selectedScenario = useSelector(selectSelectedScenario);
  const treeViewSelectedBookingPeriod = useSelector(selectTreeViewSelectedBookingPeriod);
  const currentUser = useSelector(selectUser);
  const deletedSplitsDetails = useSelector(selectDeletedSplits);
  const scenarioCreateUpdateResponse = useSelector(selectScenarioCreateUpdateResponse);
  const modalData = props.modalData;
  const [isSubmitStarted, setIsSubmitStarted] = React.useState(false);

  const isModalOpen = useSelector(selectScenarioModalState);

  const { promiseInProgress: isFeatchDataInProgress } = usePromiseTracker({
    area: 'get-scenario-navigation-tree-data',
    delay: 0,
  });

  const { promiseInProgress: isSaveScenarioSuccess } = usePromiseTracker({
    area: 'save-add-scenario-modal',
    delay: 0,
  });
  const isScenarioModal: Boolean =
    isModalOpen?.modalName === PayPackageOptions.AddScenario ||
    isModalOpen?.modalName === PayPackageOptions.editScenario;

  const { promiseInProgress: isUpdateScenarioSuccess } = usePromiseTracker({
    area: 'upsert-scenario-modal',
    delay: 0,
  });

  const { promiseInProgress: isModelDataLoadSuccess } = usePromiseTracker({
    area: PromiseTrackerKeys.marginTool.getAddScenarioDetailsFetchData,
    delay: 0,
  });

  const isDataLoadingInProgress =
    isFeatchDataInProgress || isSaveScenarioSuccess || isUpdateScenarioSuccess || isModelDataLoadSuccess;

  const selectedMarginToolDetails = selectedScenario?.scenarioId
    ? getDetailsByScenarioId(marginToolDetails, selectedScenario?.scenarioId)
    : null;

  const placementId =
    treeViewSelectedBookingPeriod?.placementId ??
    Number(selectedScenario?.placementId ? selectedScenario?.placementId : params?.entityId);

  const defaultValues = {
    ...modalData,
  };

  const methods = useForm<IAddScenarioForm>({
    defaultValues,
    mode: 'all',
    reValidateMode: 'onChange',
  });

  const { handleSubmit, reset, errors } = methods;

  const resetForm = () => {
    reset({});
  };

  const onCloseModal = () => {
    if (!isDataLoadingInProgress) {
      setIsSubmitStarted(false);
      resetForm();
      dispatch(scenarioActions.setDeletedScenarioSplits([]));
      handleCloseModal();
    }
  };

  const refreshPage = () => {
    history.go(0);
  };

  const onSubmit = (formData: IAddScenarioForm) => {
    setIsSubmitStarted(true);
    if (isModalOpen?.modalName === PayPackageOptions.editScenario) {
      const editPayload: IAddScenarioRequestPayload = createUpdatePayloadRequest(
        placementId,
        formData,
        currentUser,
        selectedScenario,
        selectedMarginToolDetails,
        deletedSplitsDetails,
      );
      dispatch(scenarioActions.postEditScenarioDetails(editPayload));
    } else {
      const payload = createRequestPayload(
        placementId,
        formData,
        currentUser,
        isModalOpen?.modalName,
        marginToolDetails,
        treeViewSelectedBookingPeriod?.bookingPeriodId,
        isModalOpen?.modalName === PayPackageOptions.AddExtension,
      );
      dispatch(scenarioActions.postAddScenarioDetails(payload));
    }
  };

  useEffect(() => {
    if (modalData) {
      reset({ ...modalData });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalData]);

  useEffect(() => {
    if (!isModalOpen?.modalStatus) {
      setIsSubmitStarted(false);
      onCloseModal();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isModalOpen?.modalStatus]);

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} id="add-scenario-margin-tool-form">
        <GenericDialog
          disablePortal
          disableEscapeKeyDown
          open={isModalOpen?.modalStatus}
          fullWidth
          maxWidth="md"
          variant="blue"
          classes={{
            paperFullWidth: classes.dialog,
          }}
          onClose={(e, reason: string) => {
            if (reason === 'backdropClick') return;
            onCloseModal();
          }}
          dialogTitleProps={{
            text:
              isModalOpen?.modalName === PayPackageOptions.AddScenario
                ? t('marginTool.components.addScenario')
                : isModalOpen?.modalName === PayPackageOptions.editScenario
                ? t(`marginTool.components.editScenario`, { scenarioName: selectedScenario?.scenarioName })
                : t('marginTool.components.addExtension'),
            closeButton: true,
          }}
          dialogActions={[
            {
              text: t('global.button.cancel'),
              id: 'marginTool-addScenarioModal-cancelBtn',
              variant: 'contained',
              color: 'tertiary',
              onClick: e => onCloseModal(),
              disabled: isDataLoadingInProgress,
              sx: {
                '&:focus': {
                  backgroundColor: theme => theme.palette.framework.system.darkGray,
                },
              },
            },
            {
              text: t('global.button.save'),
              id: 'marginTool-addScenarioModal-saveBtn',
              variant: 'contained',
              color: 'primary',
              disabled: (isScenarioModal && Boolean(Object.keys(errors).length)) || isDataLoadingInProgress,
              sx: {
                '&:focus': {
                  backgroundColor: theme => theme.palette.framework.system.darkBlue,
                },
              },
              // If isDataLoadingInProgress is true, show the loader inside the button
              renderer: props => (
                <GenericDialogButton
                  {...props}
                  // Render the loader when isDataLoadingInProgress is true
                  endIcon={isDataLoadingInProgress ? <CircularProgress size={16} color="inherit" /> : null}
                >
                  {t('global.button.save')}
                </GenericDialogButton>
              ),
              type: 'submit',
            },
          ]}
          dialogContentProps={{ classes: { root: classes.dialogContent } }}
        >
          {scenarioCreateUpdateResponse?.inError &&
            scenarioCreateUpdateResponse?.target === IMarginUpdateResponseErrorTargetTypes.Model &&
            (scenarioCreateUpdateResponse?.errorType === IMarginUpdateResponseErrorTypes.DateError ||
              scenarioCreateUpdateResponse?.errorType === IMarginUpdateResponseErrorTypes.PerDiemError) && (
              <div className={classes.fixedBanner}>
                <Banner message={scenarioCreateUpdateResponse?.message} severity="error" />
              </div>
            )}
          {scenarioCreateUpdateResponse?.inError &&
            scenarioCreateUpdateResponse?.target === IMarginUpdateResponseErrorTargetTypes.Model &&
            scenarioCreateUpdateResponse?.errorType === IMarginUpdateResponseErrorTypes.TimeStampError && (
              <div className={classes.fixedBanner}>
                <BannerMessage
                  refreshButton={true}
                  message={scenarioCreateUpdateResponse?.message}
                  refreshAction={refreshPage}
                  buttonProps={{
                    className: classes.customSubmitButton,
                  }}
                />
              </div>
            )}
          <div className={classes.dialogContentWrap}>
            <AddScenario />
          </div>
        </GenericDialog>
      </form>
    </FormProvider>
  );
};
