"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Purchase, Currency, CURRENCY_LABELS } from "../types";
import { usePurchasesStore } from "../store/purchases-store";

interface EditPurchaseDialogProps {
  purchase: Purchase;
  open: boolean;
  onClose: () => void;
}

export function EditPurchaseDialog({
  purchase,
  open,
  onClose,
}: EditPurchaseDialogProps) {
  const { updatePurchase, isLoading } = usePurchasesStore();
  const [formData, setFormData] = useState({
    productName: purchase.productName,
    quantity: purchase.quantity,
    purchasePrice: purchase.purchasePrice,
    sellingPrice: purchase.sellingPrice,
    currency: purchase.currency,
  });

  useEffect(() => {
    setFormData({
      productName: purchase.productName,
      quantity: purchase.quantity,
      purchasePrice: purchase.purchasePrice,
      sellingPrice: purchase.sellingPrice,
      currency: purchase.currency,
    });
  }, [purchase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updatePurchase(purchase.id, formData);
      onClose();
    } catch (error) {
      console.error("Update error:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>تعديل السلعة</DialogTitle>
          <DialogDescription>قم بتعديل بيانات السلعة</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Product Name */}
          <div className="space-y-2">
            <Label htmlFor="edit-productName">اسم السلعة</Label>
            <Input
              id="edit-productName"
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
            <Label htmlFor="edit-quantity">الكمية</Label>
            <Input
              id="edit-quantity"
              type="number"
              min="1"
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
            <Label htmlFor="edit-currency">العملة</Label>
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
            <Label htmlFor="edit-purchasePrice">سعر الشراء</Label>
            <Input
              id="edit-purchasePrice"
              type="number"
              min="0"
              step="0.01"
              value={formData.purchasePrice}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  purchasePrice: Number(e.target.value),
                })
              }
              disabled={isLoading}
              required
            />
          </div>

          {/* Selling Price */}
          <div className="space-y-2">
            <Label htmlFor="edit-sellingPrice">سعر البيع</Label>
            <Input
              id="edit-sellingPrice"
              type="number"
              min="0"
              step="0.01"
              value={formData.sellingPrice}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  sellingPrice: Number(e.target.value),
                })
              }
              disabled={isLoading}
              required
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? "جاري الحفظ..." : "حفظ التغييرات"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              إلغاء
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
