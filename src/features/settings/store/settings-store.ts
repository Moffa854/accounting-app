// Settings Store - Zustand state management
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SettingsState, ExchangeRates } from "../types";
import { fetchSettings, updateExchangeRates } from "../services/settings-service";
import { fetchExchangeRates as fetchRatesFromApi } from "../services/exchange-rate-api";

interface SettingsStore extends SettingsState {
  fetchSettings: (userId: string) => Promise<void>;
  updateExchangeRatesFromApi: (userId: string) => Promise<void>;
  updateExchangeRatesManual: (userId: string, rates: Omit<ExchangeRates, "lastUpdated">) => Promise<void>;
  getExchangeRates: () => { EGP: number; USD: number; GBP: number };
  shouldUpdateRates: () => boolean;
}

// Default exchange rates (fallback)
const DEFAULT_RATES = {
  EGP: 1,
  USD: 50,
  GBP: 65,
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      settings: null,
      isLoading: false,
      error: null,

      fetchSettings: async (userId: string) => {
        set({ isLoading: true, error: null });
        try {
          const settings = await fetchSettings(userId);
          set({ settings, isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Failed to fetch settings",
            isLoading: false
          });
        }
      },

      updateExchangeRatesFromApi: async (userId: string) => {
        set({ isLoading: true, error: null });
        try {
          // Fetch latest rates from API
          const rates = await fetchRatesFromApi();

          // Update in Firestore
          await updateExchangeRates(userId, rates);

          // Fetch updated settings
          const settings = await fetchSettings(userId);
          set({ settings, isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Failed to update exchange rates",
            isLoading: false
          });
          throw error;
        }
      },

      updateExchangeRatesManual: async (userId: string, rates: Omit<ExchangeRates, "lastUpdated">) => {
        set({ isLoading: true, error: null });
        try {
          // Update in Firestore
          await updateExchangeRates(userId, rates);

          // Fetch updated settings
          const settings = await fetchSettings(userId);
          set({ settings, isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Failed to update exchange rates",
            isLoading: false
          });
          throw error;
        }
      },

      getExchangeRates: () => {
        const { settings } = get();
        if (settings?.exchangeRates) {
          return {
            EGP: settings.exchangeRates.EGP,
            USD: settings.exchangeRates.USD,
            GBP: settings.exchangeRates.GBP,
          };
        }
        return DEFAULT_RATES;
      },

      shouldUpdateRates: () => {
        const { settings } = get();
        if (!settings?.exchangeRates?.lastUpdated) {
          return true; // No rates stored, need to update
        }

        const lastUpdated = settings.exchangeRates.lastUpdated;
        const now = new Date();
        const diffInHours = (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60);

        // Update if more than 24 hours have passed
        return diffInHours >= 24;
      },
    }),
    {
      name: "settings-storage",
      partialize: (state) => ({
        settings: state.settings,
      }),
    }
  )
);
