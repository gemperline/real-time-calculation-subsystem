export interface IGSARequestPayload {
  bookingPeriodId: number;
  facilityId: number;
  startDate: Date;
  endDate: Date;
  userId: number;
  autoSave: boolean;
}

export interface IGsaHousingDetailsSuymmaryResponse {
  housing?: IGsaHousingCostItem;
  gsaItems?: IGsaHousingDetailsResponseItem[];
  minWageItems?: IGsaHousingDetailsResponseItem[];
}

export interface IGsaHousingCostItem {
  noHousing?: IGsaSpecificPricing;
  clientHousing?: IGsaSpecificPricing;
  private1Bedroom?: IGsaSpecificPricing;
  private2Bedroom?: IGsaSpecificPricing;
  private3Bedroom?: IGsaSpecificPricing;
  privateStudio?: IGsaSpecificPricing;
  companyHotel?: IGsaSpecificPricing;
  shared1Bedroom?: IGsaSpecificPricing;
  shared2Bedroom?: IGsaSpecificPricing;
  shared3Bedroom?: IGsaSpecificPricing;
  sharedStudio?: IGsaSpecificPricing;
}

export interface IGsaSpecificPricing {
  originalRentCost?: number;
  originalUtilitiesCost?: number;
  originalFurnitureCost?: number;
}

export interface IGsaHousingDetailsResponseItem {
  facilityId?: number;
  bookingPeriodId?: number;

  effectiveDate?: Date;
  month?: number;
  year?: number;

  category?: string;
  subCategory?: string;
  categoryId?: number;
  amount?: number;
}

export interface IBookingPeriodGsaValue {
  bookingGsaRateId?: number;
  gsaType?: string;
  gsaTypeId?: number;
  month?: number;
  rate?: number;
  scenarioId?: number;
  splitId?: number;
  year?: number;
}
