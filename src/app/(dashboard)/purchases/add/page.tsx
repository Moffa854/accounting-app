"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { usePurchasesStore } from "@/features/purchases/store/purchases-store";
import { Currency, CURRENCY_LABELS } from "@/features/purchases/types";

export default function AddPurchasePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { createPurchase, isLoading } = usePurchasesStore();

  const [formData, setFormData] = useState({
    productName: "",
    quantity: 1,
    purchasePrice: 0,
    sellingPrice: 0,
    currency: "EGP" as Currency,
  });

  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user) {
      setError("يجب تسجيل الدخول أولاً");
      return;
    }

    // Validation
    if (!formData.productName.trim()) {
      setError("يرجى إدخال اسم السلعة");
      return;
    }

    if (formData.quantity < 1) {
      setError("الكمية يجب أن تكون 1 على الأقل");
      return;
    }

    if (formData.purchasePrice <= 0 || formData.sellingPrice <= 0) {
      setError("الأسعار يجب أن تكون أكبر من صفر");
      return;
    }

    try {
      await createPurchase(formData, user.uid);
      router.push("/purchases");
    } catch (err: any) {
      setError(err.message || "فشل في إضافة السلعة");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push("/purchases")}
          className="mb-4"
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

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">إضافة سلعة جديدة</CardTitle>
          <CardDescription>أدخل بيانات السلعة المشتراة</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}

            {/* Product Name */}
            <div className="space-y-2">
              <Label htmlFor="productName">
                اسم السلعة <span className="text-red-500">*</span>
              </Label>
              <Input
                id="productName"
                placeholder="مثال: كمبيوتر محمول"
                value={formData.productName}
                onChange={(e) =>
                  setFormData({ ...formData, productName: e.target.value })
                }
                disabled={isLoading}
                required
              />
            </div>

            {/* Quantity */}
            <div className="space-y-2">
              <Label htmlFor="quantity">
                الكمية <span className="text-red-500">*</span>
              </Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                placeholder="1"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: Number(e.target.value) })
                }
                disabled={isLoading}
                required
              />
            </div>

            {/* Currency */}
            <div className="space-y-2">
              <Label htmlFor="currency">
                العملة <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.currency}
                onValueChange={(value: Currency) =>
                  setFormData({ ...formData, currency: value })
                }
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CURRENCY_LABELS).map(([code, label]) => (
                    <SelectItem key={code} value={code}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Purchase Price */}
            <div className="space-y-2">
              <Label htmlFor="purchasePrice">
                السعر الكلي للشراء <span className="text-red-500">*</span>
              </Label>
              <Input
                id="purchasePrice"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={formData.purchasePrice || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    purchasePrice: Number(e.target.value),
                  })
                }
                disabled={isLoading}
                required
              />
              <p className="text-sm text-slate-500">
                السعر الإجمالي الذي تم دفعه لشراء السلعة
              </p>
            </div>

            {/* Selling Price */}
            <div className="space-y-2">
              <Label htmlFor="sellingPrice">
                السعر الخاص بالبيع <span className="text-red-500">*</span>
              </Label>
              <Input
                id="sellingPrice"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={formData.sellingPrice || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    sellingPrice: Number(e.target.value),
                  })
                }
                disabled={isLoading}
                required
              />
              <p className="text-sm text-slate-500">
                السعر الذي تريد بيع السلعة به
              </p>
            </div>

            {/* Profit Preview */}
            {formData.purchasePrice > 0 && formData.sellingPrice > 0 && (
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-sm font-medium text-slate-700 mb-2">
                  معاينة الربح
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">الربح المتوقع:</span>
                  <span
                    className={`font-semibold ${
                      formData.sellingPrice - formData.purchasePrice > 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {(formData.sellingPrice - formData.purchasePrice).toFixed(
                      2
                    )}{" "}
                    {CURRENCY_LABELS[formData.currency]}
                  </span>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1" disabled={isLoading}>
                {isLoading ? "جاري الإضافة..." : "إضافة السلعة"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/purchases")}
                disabled={isLoading}
              >
                إلغاء
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
