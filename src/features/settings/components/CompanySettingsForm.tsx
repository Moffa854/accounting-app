"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { uploadToCloudinary } from "@/lib/cloudinary/upload";
import { toast } from "sonner";
import Image from "next/image";
import type { CompanySettings } from "../types";

interface CompanySettingsFormProps {
  companySettings: CompanySettings | null;
  userId: string;
  onSave: (data: {
    companyName: string;
    companyPhone: string;
    companyLogo: string;
    whatsappQRCode: string;
  }) => Promise<void>;
}

export function CompanySettingsForm({
  companySettings,
  userId,
  onSave,
}: CompanySettingsFormProps) {
  const [companyName, setCompanyName] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [qrFile, setQrFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [qrPreview, setQrPreview] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState(false);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const qrInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (companySettings) {
      setCompanyName(companySettings.companyName || "");
      setCompanyPhone(companySettings.companyPhone || "");
      setLogoPreview(companySettings.companyLogo || "");
      setQrPreview(companySettings.whatsappQRCode || "");
    }
  }, [companySettings]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleQrChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setQrFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setQrPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!companyName.trim()) {
      toast.error("يرجى إدخال اسم الشركة");
      return;
    }

    if (!companyPhone.trim()) {
      toast.error("يرجى إدخال رقم الهاتف");
      return;
    }

    setIsUpdating(true);
    try {
      let logoUrl = companySettings?.companyLogo || "";
      let qrUrl = companySettings?.whatsappQRCode || "";

      if (logoFile) {
        toast.info("جاري رفع الشعار...");
        logoUrl = await uploadToCloudinary(logoFile, "company-logos");
      }

      if (qrFile) {
        toast.info("جاري رفع رمز الاستجابة السريعة...");
        qrUrl = await uploadToCloudinary(qrFile, "whatsapp-qr");
      }

      await onSave({
        companyName: companyName.trim(),
        companyPhone: companyPhone.trim(),
        companyLogo: logoUrl,
        whatsappQRCode: qrUrl,
      });

      toast.success("تم حفظ معلومات الشركة بنجاح!");
      setLogoFile(null);
      setQrFile(null);
    } catch (error: any) {
      toast.error(error.message || "فشل حفظ معلومات الشركة. حاول مرة أخرى.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="rounded-lg border bg-card p-6">
      <h2 className="text-2xl font-bold mb-6">معلومات الشركة</h2>

      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="companyName">اسم الشركة *</Label>
            <Input
              id="companyName"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="أدخل اسم الشركة"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyPhone">رقم الهاتف *</Label>
            <Input
              id="companyPhone"
              value={companyPhone}
              onChange={(e) => setCompanyPhone(e.target.value)}
              placeholder="أدخل رقم الهاتف"
            />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="logo">شعار الشركة</Label>
            <div className="flex flex-col gap-4">
              {logoPreview && (
                <div className="relative h-32 w-32 rounded-lg border overflow-hidden">
                  <Image
                    src={logoPreview}
                    alt="Company Logo"
                    fill
                    className="object-contain"
                  />
                </div>
              )}
              <Input
                id="logo"
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                ref={logoInputRef}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="qr">رمز الاستجابة السريعة للواتساب</Label>
            <div className="flex flex-col gap-4">
              {qrPreview && (
                <div className="relative h-32 w-32 rounded-lg border overflow-hidden">
                  <Image
                    src={qrPreview}
                    alt="WhatsApp QR Code"
                    fill
                    className="object-contain"
                  />
                </div>
              )}
              <Input
                id="qr"
                type="file"
                accept="image/*"
                onChange={handleQrChange}
                ref={qrInputRef}
              />
            </div>
          </div>
        </div>

        <Button onClick={handleSave} disabled={isUpdating} className="w-full md:w-auto">
          {isUpdating ? "جاري الحفظ..." : "حفظ معلومات الشركة"}
        </Button>
      </div>
    </div>
  );
}
