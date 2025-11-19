"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { usePurchasesStore } from "@/features/purchases/store/purchases-store";

interface SupplierReport {
  supplierName: string;
  totalPurchases: number;
  totalAmount: number;
  totalQuantity: number;
  purchaseCount: number;
}

export default function SuppliersReportPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { purchases, isLoading, fetchPurchases } = usePurchasesStore();

  useEffect(() => {
    if (user) {
      fetchPurchases(user.uid);
    }
  }, [user, fetchPurchases]);

  // Group purchases by supplier
  const supplierReports = useMemo<SupplierReport[]>(() => {
    const grouped = new Map<string, SupplierReport>();

    purchases.forEach((purchase) => {
      const existing = grouped.get(purchase.supplierName);
      // purchasePrice is already the total (unitPrice * quantity)
      const purchaseTotal = purchase.purchasePrice;

      if (existing) {
        existing.totalAmount += purchaseTotal;
        existing.totalQuantity += purchase.quantity;
        existing.purchaseCount += 1;
      } else {
        grouped.set(purchase.supplierName, {
          supplierName: purchase.supplierName,
          totalPurchases: purchaseTotal,
          totalAmount: purchaseTotal,
          totalQuantity: purchase.quantity,
          purchaseCount: 1,
        });
      }
    });

    return Array.from(grouped.values()).sort((a, b) =>
      a.supplierName.localeCompare(b.supplierName, "ar")
    );
  }, [purchases]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-4 text-slate-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-full">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">تقارير الموردين</h1>
        <p className="text-slate-600 mt-1">عرض جميع الموردين وتفاصيل المشتريات</p>
      </div>

      {/* Suppliers Table */}
      {supplierReports.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
          <svg
            className="w-16 h-16 mx-auto text-slate-300 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-slate-500 text-lg">لا توجد مشتريات بعد</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200" dir="rtl">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b-2 border-slate-200">
                <tr>
                  <th className="text-center px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm font-semibold text-slate-700 uppercase tracking-wider">
                    #
                  </th>
                  <th className="text-right px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm font-semibold text-slate-700 uppercase tracking-wider">
                    اسم المورد
                  </th>
                  <th className="text-center px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm font-semibold text-slate-700 uppercase tracking-wider hidden sm:table-cell">
                    عدد المشتريات
                  </th>
                  <th className="text-center px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm font-semibold text-slate-700 uppercase tracking-wider hidden md:table-cell">
                    إجمالي الكمية
                  </th>
                  <th className="text-center px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm font-semibold text-slate-700 uppercase tracking-wider">
                    إجمالي المبلغ
                  </th>
                  <th className="text-center px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm font-semibold text-slate-700 uppercase tracking-wider">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {supplierReports.map((supplier, index) => (
                    <tr
                      key={supplier.supplierName}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-3 md:px-6 py-3 md:py-4 text-center text-xs md:text-sm font-medium text-slate-900">
                        {index + 1}
                      </td>
                      <td className="px-3 md:px-6 py-3 md:py-4 text-right text-xs md:text-sm font-semibold text-slate-900">
                        {supplier.supplierName}
                      </td>
                      <td className="px-3 md:px-6 py-3 md:py-4 text-center text-xs md:text-sm text-slate-900 hidden sm:table-cell">
                        {supplier.purchaseCount}
                      </td>
                      <td className="px-3 md:px-6 py-3 md:py-4 text-center text-xs md:text-sm text-slate-900 hidden md:table-cell">
                        {supplier.totalQuantity}
                      </td>
                      <td className="px-3 md:px-6 py-3 md:py-4 text-center text-xs md:text-sm font-semibold text-green-600">
                        {supplier.totalAmount.toFixed(2)} ج.م
                      </td>
                      <td className="px-3 md:px-6 py-3 md:py-4 text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <svg
                                className="w-5 h-5"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                              </svg>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                              onClick={() => {
                                router.push(`/reports/suppliers/payment?name=${encodeURIComponent(supplier.supplierName)}`);
                              }}
                              className="cursor-pointer"
                            >
                              <svg
                                className="w-4 h-4 ml-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                                />
                              </svg>
                              تسديد مبلغ
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                router.push(`/reports/suppliers/statement?name=${encodeURIComponent(supplier.supplierName)}`);
                              }}
                              className="cursor-pointer"
                            >
                              <svg
                                className="w-4 h-4 ml-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                              </svg>
                              كشف الحساب
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
