// Sales Firebase Service
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Sale, SaleFormData, Customer } from "../types";

const SALES_COLLECTION = "sales";
const CUSTOMERS_COLLECTION = "customers";

// ============= Sales Operations =============

export const salesService = {
  /**
   * Create a new sale/invoice
   */
  async createSale(
    saleData: SaleFormData,
    userId: string
  ): Promise<string> {
    try {
      const now = Timestamp.now();

      const docData = {
        ...saleData,
        userId,
        createdAt: now,
        updatedAt: now,
      };

      const docRef = await addDoc(collection(db, SALES_COLLECTION), docData);
      return docRef.id;
    } catch (error) {
      console.error("Error creating sale:", error);
      throw new Error("فشل في إنشاء الفاتورة");
    }
  },

  /**
   * Fetch all sales for a specific user
   */
  async fetchSales(userId: string): Promise<Sale[]> {
    try {
      const q = query(
        collection(db, SALES_COLLECTION),
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
      );

      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Sale;
      });
    } catch (error) {
      console.error("Error fetching sales:", error);
      throw new Error("فشل في جلب المبيعات");
    }
  },

  /**
   * Update an existing sale
   */
  async updateSale(
    saleId: string,
    saleData: Partial<SaleFormData>
  ): Promise<void> {
    try {
      const saleRef = doc(db, SALES_COLLECTION, saleId);
      await updateDoc(saleRef, {
        ...saleData,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error("Error updating sale:", error);
      throw new Error("فشل في تحديث الفاتورة");
    }
  },

  /**
   * Delete a sale
   */
  async deleteSale(saleId: string): Promise<void> {
    try {
      const saleRef = doc(db, SALES_COLLECTION, saleId);
      await deleteDoc(saleRef);
    } catch (error) {
      console.error("Error deleting sale:", error);
      throw new Error("فشل في حذف الفاتورة");
    }
  },
};

// ============= Customer Operations =============

export const customersService = {
  /**
   * Create or update a customer
   */
  async upsertCustomer(
    customerData: {
      name: string;
      phone: string;
      totalBalance: number;
    },
    userId: string,
    customerId?: string
  ): Promise<string> {
    try {
      const now = Timestamp.now();

      // If customerId is provided, update existing customer
      if (customerId) {
        const customerRef = doc(db, CUSTOMERS_COLLECTION, customerId);
        await updateDoc(customerRef, {
          ...customerData,
          updatedAt: now,
        });
        return customerId;
      }

      // Otherwise, create new customer
      const docData = {
        ...customerData,
        userId,
        createdAt: now,
        updatedAt: now,
      };

      const docRef = await addDoc(
        collection(db, CUSTOMERS_COLLECTION),
        docData
      );
      return docRef.id;
    } catch (error) {
      console.error("Error upserting customer:", error);
      throw new Error("فشل في حفظ بيانات العميل");
    }
  },

  /**
   * Fetch all customers for a specific user
   */
  async fetchCustomers(userId: string): Promise<Customer[]> {
    try {
      const q = query(
        collection(db, CUSTOMERS_COLLECTION),
        where("userId", "==", userId),
        orderBy("name", "asc")
      );

      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Customer;
      });
    } catch (error) {
      console.error("Error fetching customers:", error);
      throw new Error("فشل في جلب العملاء");
    }
  },

  /**
   * Get customer by name and phone
   */
  async getCustomerByNameAndPhone(
    name: string,
    phone: string,
    userId: string
  ): Promise<Customer | null> {
    try {
      const q = query(
        collection(db, CUSTOMERS_COLLECTION),
        where("userId", "==", userId),
        where("name", "==", name),
        where("phone", "==", phone)
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return null;
      }

      const doc = querySnapshot.docs[0];
      const data = doc.data();

      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Customer;
    } catch (error) {
      console.error("Error getting customer:", error);
      return null;
    }
  },

  /**
   * Update customer balance
   */
  async updateCustomerBalance(
    customerId: string,
    newBalance: number
  ): Promise<void> {
    try {
      const customerRef = doc(db, CUSTOMERS_COLLECTION, customerId);
      await updateDoc(customerRef, {
        totalBalance: newBalance,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error("Error updating customer balance:", error);
      throw new Error("فشل في تحديث رصيد العميل");
    }
  },

  /**
   * Delete a customer
   */
  async deleteCustomer(customerId: string): Promise<void> {
    try {
      const customerRef = doc(db, CUSTOMERS_COLLECTION, customerId);
      await deleteDoc(customerRef);
    } catch (error) {
      console.error("Error deleting customer:", error);
      throw new Error("فشل في حذف العميل");
    }
  },
};
