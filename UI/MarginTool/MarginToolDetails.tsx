import React, { useEffect } from 'react';
import { Grid } from 'amn-ui-core';
import { FormProvider, useForm } from 'react-hook-form';
import { PayPackages } from './Components/PayPackage/PayPackages';
import { AssignmentSection } from './Components/Assignments/Assignment';
import { AddScenarioModal } from './Components/PayPackage/AddScenario/AddScenarioModal';
import { useDispatch, useSelector } from 'react-redux';
import PayPackageStatusUpdate from './Components/PayPackage/PayPackageStatusUpdate';
import { selectPayPackageStatusModalDetails } from 'store/redux-store/margin-tool/slices/pay-package-status/pay-package-status.selector';
import {
  selectAddEditScenarioModelData,
  selectPageLoadStatus,
  selectScenarioModalState,
  selectSelectedScenario,
} from 'store/redux-store/margin-tool/slices/add-edit-scenario/add-edit-scenario.selector';
import MarginToolFooter from './Components/MarginToolFooter/MarginToolFooter';
import { scenarioActions } from 'store/redux-store/margin-tool/slices/add-edit-scenario/add-edit-scenario.redux';
import { ScenarioHeader } from './Components/ScenarioHeader/ScenarioHeader';
import NoScenariosFoundIcon from 'app/assets/images/MarginTool/No_Scenarios-Found.svg';
import NoDataPlaceholder from './Common/NoDataPlaceholder';
import { useTranslation } from 'react-i18next';
import { PayPackagePreview } from './Components/PayPackage/PayPackagePreview/PayPackagePreview';
import { IPayPackageCategory } from './enum';
import { useFilterPayPackageValuesByCategoryId } from './Components/Assignments/helper';
import { getReimbursement } from './Components/Assignments/Reimbursement/helper';
import { getBonuses } from './Components/Assignments/Bonuses/helper';
import { globalActions } from 'app/ApplicationRoot/Global.redux';
import { ScenarioDetailsLoading } from './Components/ScenarioHeader/ScenarioDetailsLoading';
import { cloneDeep } from 'lodash';
import { OrderModifiedConfirmationModal } from './Common/OrderModifiedConfirmationModal';

export const ModalStatusContext = React.createContext(null);
const MarginToolDetails = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { openModal } = useSelector(selectPayPackageStatusModalDetails);
  const isModalOpen = useSelector(selectScenarioModalState);
  const reimbursementPayPackageValues = useFilterPayPackageValuesByCategoryId(IPayPackageCategory.Reimbursements);
  const bonusesPayPackageValues = useFilterPayPackageValuesByCategoryId(IPayPackageCategory.BonusType);
  const selectedScenario = useSelector(selectSelectedScenario);
  const isPageLoaded = useSelector(selectPageLoadStatus);
  const modalData = useSelector(selectAddEditScenarioModelData);

  const setIsModalOpen = (modalStatus: boolean, modalName: string) => {
    if (modalStatus) {
      //loadScenarioModalPopupLoadetails(modalName);
    }
    dispatch(scenarioActions.setScenarioModal({ modalStatus, modalName }));
  };

  const handleCloseModal = () => {
    setIsModalOpen(false, '');
    dispatch(scenarioActions.setScenarioCreateUpdateResponse(null));
    dispatch(globalActions.closeBanner());
  };

  const initialMarginToolValues = {
    payPackage: {
      placementId: selectedScenario?.placementId,
    },
    assignmentSplits: cloneDeep(selectedScenario?.splits) ?? [],
    assignment: {
      travel: selectedScenario?.assignment.travel,
      timeOffs: selectedScenario?.assignment?.timeOffs,
      reimbursementFieldArray: [],
      bonusesFieldArray: [],
    },
  };

  const methods = useForm({
    defaultValues: initialMarginToolValues,
    mode: 'onChange',
  });

  const {
    handleSubmit,
    reset,
    formState: { isDirty },
  } = methods;

  /**
   * UseEffect to render after changing scenario and also after saving a scenario
   * sets the default values for all the containers from the saved values
   */
  useEffect(() => {
    if (selectedScenario?.splits?.length > 0) {
      const savedReimbursements = getReimbursement(reimbursementPayPackageValues);
      const bonuses = getBonuses(bonusesPayPackageValues);
      reset({
        payPackage: {
          placementId: selectedScenario?.placementId,
        },
        assignmentSplits: cloneDeep(selectedScenario?.splits) || [],
        assignment: {
          travel: selectedScenario?.assignment?.travel,
          timeOffs: selectedScenario?.assignment?.timeOffs,
          reimbursementFieldArray: cloneDeep(savedReimbursements) ?? [],
          bonusesFieldArray: cloneDeep(bonuses) ?? [],
        },
      });
    }
  }, [selectedScenario?.splits]);

  const onSave = () => {
    if (isDirty) {
      // create save request payload and handle save
    }
  };

  useEffect(() => {
    dispatch(scenarioActions.getShiftDetails());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ModalStatusContext.Provider value={[isModalOpen, setIsModalOpen]}>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSave)} id="margin-tool-detail-form">
          <Grid container direction="row" spacing={2} id="marginTool-marginToolDetailsPage-parent-container">
            <Grid item width={'355px'} id="marginTool-marginToolDetailsPage-leftContainer">
              <Grid container item direction="column">
                <Grid item>
                  <PayPackages />
                </Grid>
                <Grid item>
                  <PayPackagePreview />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs id="marginTool-marginToolDetailsPage-rightContainer">
              {selectedScenario ? (
                <>
                  <ScenarioHeader />
                  <AssignmentSection />
                  <MarginToolFooter initialMarginToolValues={initialMarginToolValues} />
                </>
              ) : isPageLoaded ? (
                <NoDataPlaceholder
                  iconSrc={NoScenariosFoundIcon}
                  altText="No Scenarios Found"
                  message={
                    <>
                      {t('marginTool.labels.noScenariosCreatedComminMessageLine1')}
                      <br />
                      {t('marginTool.labels.noScenariosCreatedComminMessageLine2')}
                    </>
                  }
                />
              ) : (
                <>
                  <ScenarioDetailsLoading />
                </>
              )}
            </Grid>
          </Grid>
          {openModal && <PayPackageStatusUpdate />}
        </form>
      </FormProvider>
      {/* {openModal && <PayPackageStatusTransitionModal />} */}
      {<AddScenarioModal handleCloseModal={handleCloseModal} modalData={modalData} />}
      {<OrderModifiedConfirmationModal />}
    </ModalStatusContext.Provider>
  );
};

export default MarginToolDetails;
