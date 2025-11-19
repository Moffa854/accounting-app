"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { usePurchasesStore } from "@/features/purchases/store/purchases-store";

interface GroupedProduct {
  productName: string;
  totalQuantity: number;
  purchaseCount: number;
}

export default function InventoryPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { purchases, isLoading, fetchPurchases } = usePurchasesStore();

  useEffect(() => {
    if (user) {
      fetchPurchases(user.uid);
    }
  }, [user, fetchPurchases]);

  // Group purchases by product name
  const groupedProducts = useMemo(() => {
    const groups = new Map<string, GroupedProduct>();

    purchases.forEach((purchase) => {
      const existing = groups.get(purchase.productName);
      if (existing) {
        existing.totalQuantity += purchase.quantity;
        existing.purchaseCount += 1;
      } else {
        groups.set(purchase.productName, {
          productName: purchase.productName,
          totalQuantity: purchase.quantity,
          purchaseCount: 1,
        });
      }
    });

    return Array.from(groups.values()).sort((a, b) =>
      a.productName.localeCompare(b.productName, "ar")
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">إجمالي الكميات</h1>
          <p className="text-slate-600 mt-1">
            عرض تفصيلي لكميات كل منتج
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => router.push("/purchases")}
        >
          <svg
            className="w-5 h-5 ml-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          رجوع إلى المشتريات
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg border border-slate-200">
          <p className="text-sm text-slate-600">إجمالي الكميات</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {purchases.reduce((sum, p) => sum + p.quantity, 0)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-slate-200">
          <p className="text-sm text-slate-600">عدد المنتجات المختلفة</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {groupedProducts.length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-slate-200">
          <p className="text-sm text-slate-600">إجمالي عمليات الشراء</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {purchases.length}
          </p>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg border border-slate-200" dir="rtl">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-center px-6 py-4 text-sm font-semibold text-slate-700 uppercase tracking-wider">
                  #
                </th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-slate-700 uppercase tracking-wider">
                  اسم المنتج
                </th>
                <th className="text-center px-6 py-4 text-sm font-semibold text-slate-700 uppercase tracking-wider">
                  الكمية الإجمالية
                </th>
                <th className="text-center px-6 py-4 text-sm font-semibold text-slate-700 uppercase tracking-wider hidden md:table-cell">
                  عدد عمليات الشراء
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {groupedProducts.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-12 text-center text-slate-500"
                  >
                    لا توجد منتجات
                  </td>
                </tr>
              ) : (
                groupedProducts.map((product, index) => (
                  <tr
                    key={product.productName}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-center text-sm text-slate-900">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="text-sm font-medium text-slate-900">
                        {product.productName}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                        {product.totalQuantity}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-slate-600 hidden md:table-cell">
                      {product.purchaseCount} عملية شراء
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
