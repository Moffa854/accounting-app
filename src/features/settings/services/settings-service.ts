// Settings Service - Firebase Firestore operations
import {
  collection,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/firestore";
import type { Settings, ExchangeRates, CompanySettings, CompanySettingsFormData } from "../types";

const COLLECTION_NAME = "settings";
const COMPANY_SETTINGS_COLLECTION = "company_settings";

/**
 * Converts Firestore document to Settings object
 */
function convertToSettings(id: string, data: any): Settings {
  return {
    id,
    exchangeRates: {
      EGP: data.exchangeRates.EGP,
      USD: data.exchangeRates.USD,
      GBP: data.exchangeRates.GBP,
      lastUpdated: data.exchangeRates.lastUpdated instanceof Timestamp
        ? data.exchangeRates.lastUpdated.toDate()
        : new Date(data.exchangeRates.lastUpdated),
    },
    userId: data.userId,
    createdAt: data.createdAt instanceof Timestamp
      ? data.createdAt.toDate()
      : new Date(data.createdAt),
    updatedAt: data.updatedAt instanceof Timestamp
      ? data.updatedAt.toDate()
      : new Date(data.updatedAt),
  };
}

/**
 * Fetches user settings from Firestore
 */
export async function fetchSettings(userId: string): Promise<Settings | null> {
  try {
    const docRef = doc(db, COLLECTION_NAME, userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return convertToSettings(docSnap.id, docSnap.data());
    }

    return null;
  } catch (error) {
    console.error("Error fetching settings:", error);
    throw new Error("Failed to fetch settings");
  }
}

/**
 * Updates exchange rates in user settings
 */
export async function updateExchangeRates(
  userId: string,
  rates: Omit<ExchangeRates, "lastUpdated">
): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, userId);
    const docSnap = await getDoc(docRef);

    const now = new Date();

    if (docSnap.exists()) {
      // Update existing settings
      await setDoc(
        docRef,
        {
          exchangeRates: {
            ...rates,
            lastUpdated: now,
          },
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } else {
      // Create new settings document
      await setDoc(docRef, {
        exchangeRates: {
          ...rates,
          lastUpdated: now,
        },
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error("Error updating exchange rates:", error);
    throw new Error("Failed to update exchange rates");
  }
}

/**
 * Fetches company settings from Firestore
 */
export async function fetchCompanySettings(userId: string): Promise<CompanySettings | null> {
  try {
    const docRef = doc(db, COMPANY_SETTINGS_COLLECTION, userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        companyName: data.companyName || "",
        companyPhone: data.companyPhone || "",
        whatsappQRCode: data.whatsappQRCode || "",
        companyLogo: data.companyLogo || "",
        userId: data.userId,
        createdAt: data.createdAt instanceof Timestamp
          ? data.createdAt.toDate()
          : new Date(data.createdAt),
        updatedAt: data.updatedAt instanceof Timestamp
          ? data.updatedAt.toDate()
          : new Date(data.updatedAt),
      };
    }

    return null;
  } catch (error) {
    console.error("Error fetching company settings:", error);
    throw new Error("Failed to fetch company settings");
  }
}

/**
 * Updates or creates company settings
 */
export async function updateCompanySettings(
  userId: string,
  settingsData: CompanySettingsFormData
): Promise<void> {
  try {
    const docRef = doc(db, COMPANY_SETTINGS_COLLECTION, userId);

    await setDoc(
      docRef,
      {
        ...settingsData,
        userId,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error("Error updating company settings:", error);
    throw new Error("Failed to update company settings");
  }
}

/**
 * Creates initial company settings
 */
export async function createCompanySettings(
  userId: string,
  settingsData: CompanySettingsFormData
): Promise<void> {
  try {
    const docRef = doc(db, COMPANY_SETTINGS_COLLECTION, userId);

    await setDoc(docRef, {
      ...settingsData,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error creating company settings:", error);
    throw new Error("Failed to create company settings");
  }
}
