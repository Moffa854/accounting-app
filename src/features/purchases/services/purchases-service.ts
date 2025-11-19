// Purchases Service Layer
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/firestore";
import { Purchase, PurchaseFormData } from "../types";

const COLLECTION_NAME = "purchases";

export const purchasesService = {
  /**
   * Create a new purchase
   */
  async createPurchase(
    purchaseData: PurchaseFormData,
    userId: string
  ): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...purchaseData,
        userId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      return docRef.id;
    } catch (error: any) {
      throw new Error(error.message || "Failed to create purchase");
    }
  },

  /**
   * Fetch all purchases for a user
   */
  async fetchPurchases(userId: string): Promise<Purchase[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          // Handle old purchases that don't have unitPurchasePrice
          unitPurchasePrice: data.unitPurchasePrice || (data.purchasePrice / data.quantity) || 0,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        } as Purchase;
      });
    } catch (error: any) {
      throw new Error(error.message || "Failed to fetch purchases");
    }
  },

  /**
   * Update a purchase
   */
  async updatePurchase(
    purchaseId: string,
    purchaseData: Partial<PurchaseFormData>
  ): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, purchaseId);
      await updateDoc(docRef, {
        ...purchaseData,
        updatedAt: Timestamp.now(),
      });
    } catch (error: any) {
      throw new Error(error.message || "Failed to update purchase");
    }
  },

  /**
   * Delete a purchase
   */
  async deletePurchase(purchaseId: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, purchaseId);
      await deleteDoc(docRef);
    } catch (error: any) {
      throw new Error(error.message || "Failed to delete purchase");
    }
  },
};
