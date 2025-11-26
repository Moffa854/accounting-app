"use client";

import Image from "next/image";
import { useSettingsStore } from "@/features/settings/store/settings-store";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { useEffect } from "react";

export function InvoiceFooter() {
  const { user } = useAuthStore();
  const { companySettings, fetchCompanySettings } = useSettingsStore();

  useEffect(() => {
    if (user && !companySettings) {
      fetchCompanySettings(user.uid);
    }
  }, [user, companySettings, fetchCompanySettings]);

  // Don't show footer if no WhatsApp QR
  if (!companySettings?.whatsappQRCode) {
    return null;
  }

  return (
    <div className="border-t-2 border-slate-200 mt-6 pt-6">
      {/* Center - WhatsApp QR Code */}
      <div className="flex flex-col items-center justify-center">
        <p className="text-sm text-slate-600 font-medium mb-3">تواصل معنا عبر واتساب</p>
        <div className="bg-white p-3 rounded-xl border-2 border-slate-300 shadow-sm">
          <div className="relative w-32 h-32">
            <Image
              src={companySettings.whatsappQRCode}
              alt="رمز QR للواتساب"
              fill
              className="object-contain"
            />
          </div>
        </div>
      </div>

      {/* Bottom Text */}
      <div className="text-center mt-4 pt-4 border-t border-slate-100">
        <p className="text-xs text-slate-500">
          شكراً لتعاملكم معنا • نتطلع لخدمتكم دائماً
        </p>
      </div>
    </div>
  );
}
