// Settings Feature Types

export interface ExchangeRates {
  EGP: number;
  USD: number;
  GBP: number;
  lastUpdated: Date;
}

export interface Settings {
  id: string;
  exchangeRates: ExchangeRates;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SettingsState {
  settings: Settings | null;
  isLoading: boolean;
  error: string | null;
}

export interface ExchangeRateApiResponse {
  result: string;
  conversion_rates: {
    EGP: number;
    USD: number;
    GBP: number;
  };
}
