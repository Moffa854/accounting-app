// Sales Zustand Store
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Sale, Customer, SaleFormData, SalesState } from "../types";
import {
  salesService,
  customersService,
} from "../services/sales-service";

interface SalesStore extends SalesState {
  // Sales Actions
  fetchSales: (userId: string) => Promise<void>;
  createSale: (saleData: SaleFormData, userId: string) => Promise<void>;
  updateSale: (saleId: string, saleData: Partial<SaleFormData>) => Promise<void>;
  deleteSale: (saleId: string) => Promise<void>;

  // Customers Actions
  fetchCustomers: (userId: string) => Promise<void>;
  getCustomerByNameAndPhone: (
    name: string,
    phone: string,
    userId: string
  ) => Promise<Customer | null>;
  updateCustomerBalance: (customerId: string, newBalance: number) => Promise<void>;
  addPaymentToCustomer: (customerId: string, paymentAmount: number) => Promise<void>;
  deleteCustomer: (customerId: string, userId: string) => Promise<void>;

  // Utility
  clearError: () => void;
}

export const useSalesStore = create<SalesStore>()(
  persist(
    (set, get) => ({
      // Initial State
      sales: [],
      customers: [],
      isLoading: false,
      error: null,

      // ============= Sales Actions =============

      /**
       * Fetch all sales for a user
       */
      fetchSales: async (userId: string) => {
        set({ isLoading: true, error: null });
        try {
          const sales = await salesService.fetchSales(userId);
          set({ sales, isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      /**
       * Create a new sale
       */
      createSale: async (saleData: SaleFormData, userId: string) => {
        set({ isLoading: true, error: null });
        try {
          // 1. Create or update customer
          let customerId = saleData.customerId;

          if (!customerId) {
            // Check if customer exists
            const existingCustomer = await customersService.getCustomerByNameAndPhone(
              saleData.customerName,
              saleData.customerPhone,
              userId
            );

            if (existingCustomer) {
              customerId = existingCustomer.id;
              // Update existing customer balance
              await customersService.updateCustomerBalance(
                customerId,
                saleData.currentBalance
              );
            } else {
              // Create new customer
              customerId = await customersService.upsertCustomer(
                {
                  name: saleData.customerName,
                  phone: saleData.customerPhone,
                  totalBalance: saleData.currentBalance,
                },
                userId
              );
            }
          } else {
            // Update existing customer balance
            await customersService.updateCustomerBalance(
              customerId,
              saleData.currentBalance
            );
          }

          // 2. Create sale with customerId
          const saleId = await salesService.createSale(
            { ...saleData, customerId },
            userId
          );

          // 3. Refresh sales and customers
          await Promise.all([
            get().fetchSales(userId),
            get().fetchCustomers(userId),
          ]);

          set({ isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      /**
       * Update an existing sale
       */
      updateSale: async (saleId: string, saleData: Partial<SaleFormData>) => {
        set({ isLoading: true, error: null });
        try {
          await salesService.updateSale(saleId, saleData);

          // Update local state
          const sales = get().sales.map((sale) =>
            sale.id === saleId ? { ...sale, ...saleData } : sale
          );
          set({ sales, isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      /**
       * Delete a sale
       */
      deleteSale: async (saleId: string) => {
        set({ isLoading: true, error: null });
        try {
          // Find the sale to get customer info before deleting
          const sale = get().sales.find((s) => s.id === saleId);

          if (sale && sale.customerId) {
            // Find the customer
            const customer = get().customers.find((c) => c.id === sale.customerId);

            if (customer) {
              // Reduce customer balance by the current balance from this sale
              const newBalance = customer.totalBalance - sale.currentBalance;
              await customersService.updateCustomerBalance(sale.customerId, newBalance);

              // Update customers in local state
              const customers = get().customers.map((c) =>
                c.id === sale.customerId
                  ? { ...c, totalBalance: newBalance }
                  : c
              );
              set({ customers });
            }
          }

          // Delete the sale from Firebase
          await salesService.deleteSale(saleId);

          // Update local state
          const sales = get().sales.filter((s) => s.id !== saleId);
          set({ sales, isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      // ============= Customers Actions =============

      /**
       * Fetch all customers for a user
       */
      fetchCustomers: async (userId: string) => {
        set({ isLoading: true, error: null });
        try {
          const customers = await customersService.fetchCustomers(userId);
          set({ customers, isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      /**
       * Get customer by name and phone
       */
      getCustomerByNameAndPhone: async (
        name: string,
        phone: string,
        userId: string
      ) => {
        try {
          return await customersService.getCustomerByNameAndPhone(
            name,
            phone,
            userId
          );
        } catch (error: any) {
          console.error("Error getting customer:", error);
          return null;
        }
      },

      /**
       * Update customer balance
       */
      updateCustomerBalance: async (customerId: string, newBalance: number) => {
        try {
          await customersService.updateCustomerBalance(customerId, newBalance);

          // Update local state
          const customers = get().customers.map((customer) =>
            customer.id === customerId
              ? { ...customer, totalBalance: newBalance }
              : customer
          );
          set({ customers });
        } catch (error: any) {
          set({ error: error.message });
          throw error;
        }
      },

      /**
       * Add payment to customer (reduce their balance and create payment invoice)
       */
      addPaymentToCustomer: async (customerId: string, paymentAmount: number) => {
        try {
          const customer = get().customers.find((c) => c.id === customerId);
          if (!customer) {
            throw new Error("العميل غير موجود");
          }

          // Get customer's last invoice number to generate next one
          const customerSales = get().sales.filter((s) => s.customerId === customerId);
          let nextInvoiceNumber = "1";

          if (customerSales.length > 0) {
            // Sort by invoice number and get the last one
            const sortedSales = [...customerSales].sort((a, b) => {
              const numA = parseInt(a.invoiceNumber) || 0;
              const numB = parseInt(b.invoiceNumber) || 0;
              return numB - numA;
            });

            const lastInvoiceNum = parseInt(sortedSales[0].invoiceNumber) || 0;
            nextInvoiceNumber = (lastInvoiceNum + 1).toString();
          }

          // Create payment invoice
          const paymentInvoice = {
            invoiceNumber: nextInvoiceNumber,
            customerId: customer.id,
            customerName: customer.name,
            customerPhone: customer.phone,
            invoiceType: "payment" as const,
            items: [], // No items for payment invoice
            totalAmount: -paymentAmount, // Negative to indicate payment
            paidAmount: paymentAmount,
            deferredAmount: 0,
            previousBalance: customer.totalBalance,
            currentBalance: customer.totalBalance - paymentAmount,
          };

          // Get user from auth (we need userId)
          const userId = customer.userId;

          // Create the payment invoice in Firebase
          await salesService.createSale(paymentInvoice, userId);

          // Update customer balance
          const newBalance = customer.totalBalance - paymentAmount;
          await customersService.updateCustomerBalance(customerId, newBalance);

          // Refresh sales to get the new invoice
          const updatedSales = await salesService.fetchSales(userId);

          // Update local state
          const customers = get().customers.map((c) =>
            c.id === customerId ? { ...c, totalBalance: newBalance } : c
          );
          set({ customers, sales: updatedSales });
        } catch (error: any) {
          set({ error: error.message });
          throw error;
        }
      },

      /**
       * Delete a customer and all their invoices
       */
      deleteCustomer: async (customerId: string, userId: string) => {
        set({ isLoading: true, error: null });
        try {
          // Find all sales for this customer
          const customerSales = get().sales.filter((s) => s.customerId === customerId);

          // Delete all customer invoices first
          for (const sale of customerSales) {
            await salesService.deleteSale(sale.id);
          }

          // Delete the customer from Firebase
          await customersService.deleteCustomer(customerId);

          // Update local state - remove customer and their sales
          const customers = get().customers.filter((c) => c.id !== customerId);
          const sales = get().sales.filter((s) => s.customerId !== customerId);

          set({ customers, sales, isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      // ============= Utility =============

      clearError: () => set({ error: null }),
    }),
    {
      name: "sales-store",
      partialize: (state) => ({
        sales: state.sales,
        customers: state.customers,
      }),
    }
  )
);
