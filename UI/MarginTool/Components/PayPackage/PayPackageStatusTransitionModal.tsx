import { GenericDialog } from '@AMIEWEB/Alerts/GenericDialog';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FormProvider, useForm } from 'react-hook-form';
import PayPackageStatusTransition from './PayPackageStatusTransition';
import { usePayPackageStatusTransitionModalStyles } from './PayPackageStatusTransitionModalStyles.styles';
import { Cancel } from '@AMIEWEB/Common';
import { getModalTitle, getPayPackageStatusName } from './helper';
import { selectPayPackageStatusModalDetails } from 'store/redux-store/margin-tool/slices/pay-package-status/pay-package-status.selector';
import { selectSelectedScenario } from 'store/redux-store/margin-tool/slices/add-edit-scenario/add-edit-scenario.selector';
import { PayPackageField } from 'store/redux-store/margin-tool/slices/pay-package-status/pay-package-status.model';
import { payPackageStatusActions } from 'store/redux-store/margin-tool/slices/pay-package-status/pay-package-status.redux';

export const PayPackageContext = React.createContext(null);

const PayPackageStatusTransitionModal = () => {
  const dispatch = useDispatch();
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [expanded, setExpanded] = React.useState<boolean>(false);
  const { openModal, type } = useSelector(selectPayPackageStatusModalDetails);
  const headerData = useSelector(selectSelectedScenario);

  const { classes } = usePayPackageStatusTransitionModalStyles({ isExpanded: expanded });

  const contextValue = {
    type,
    currentStatus: getPayPackageStatusName(headerData?.scenarioStatusId),
  };

  const formMethods = useForm({
    defaultValues: {
      [PayPackageField.AssignedTo]: [],
    },
    mode: 'onChange',
  });
  const {
    formState: { isDirty },
    trigger,
  } = formMethods;

  const handleModalClose = () => {
    dispatch(
      payPackageStatusActions.setPayPackageStatusTransitionModalDetails({
        openModal: false,
        type: type,
      }),
    );
  };
  const onCloseModal = (e, reason) => {
    if (reason === 'backdropClick') return;
    //TODO: isDirty check
    if (isDirty) {
      setCancelModalOpen(true);
    } else {
      onCloseCall();
    }
  };
  const onCloseCall = () => {
    setCancelModalOpen(false);
    handleModalClose();
  };

  const onSubmit = async data => {
    // Validate all fields
    const isValid = await trigger();
    if (isValid) {
      handleModalClose();
    } else {
      //TODO:Future sprint - show error message
    }
  };
  return (
    <>
      <GenericDialog
        variant="blue"
        className={classes.modalContainer}
        draggable
        open={openModal}
        onClose={onCloseModal}
        dialogTitleProps={{
          text: getModalTitle(type, headerData?.scenarioName),
          closeButton: true,
          expandable: true,
          onExpandChange: expand => {
            setExpanded(expand);
          },
        }}
        dialogActions={[
          {
            text: 'Cancel',
            variant: 'contained',
            color: 'tertiary',
            onClick: e => onCloseModal(e, 'cancel'),
          },
          {
            text: 'Save',
            variant: 'contained',
            onClick: e => {
              onSubmit(e);
            },
          },
        ]}
      >
        <FormProvider {...formMethods}>
          <PayPackageContext.Provider value={contextValue}>
            <form>
              <PayPackageStatusTransition />
            </form>
          </PayPackageContext.Provider>
        </FormProvider>
      </GenericDialog>
      <Cancel
        openDialog={cancelModalOpen}
        handleConfirmAction={() => onCloseCall()}
        handleCancelAction={() => {
          setCancelModalOpen(false);
        }}
      />
    </>
  );
};
export default PayPackageStatusTransitionModal;
