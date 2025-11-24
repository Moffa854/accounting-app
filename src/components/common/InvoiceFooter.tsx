"use client";

import Image from "next/image";
import { useSettingsStore } from "@/features/settings/store/settings-store";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { useEffect } from "react";
import { Phone } from "lucide-react";

export function InvoiceFooter() {
  const { user } = useAuthStore();
  const { companySettings, fetchCompanySettings } = useSettingsStore();

  useEffect(() => {
    if (user && !companySettings) {
      fetchCompanySettings(user.uid);
    }
  }, [user, companySettings, fetchCompanySettings]);

  // Don't show footer if no company settings
  if (!companySettings || (!companySettings.whatsappQRCode && !companySettings.companyPhone)) {
    return null;
  }

  return (
    <div className="border-t-2 border-slate-200 mt-6 pt-4">
      <div className="flex justify-between items-center">
        {/* Left Side - WhatsApp QR Code */}
        <div className="flex-1 flex justify-start">
          {companySettings.whatsappQRCode && (
            <div className="text-center">
              <div className="bg-white p-2 rounded-lg border-2 border-slate-300 inline-block">
                <div className="relative w-24 h-24">
                  <Image
                    src={companySettings.whatsappQRCode}
                    alt="رمز QR للواتساب"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
              <p className="text-xs text-slate-600 mt-2 font-medium">تواصل معنا عبر واتساب</p>
            </div>
          )}
        </div>

        {/* Right Side - Phone Number */}
        <div className="flex-1 flex justify-end">
          {companySettings.companyPhone && (
            <div className="text-left">
              <div className="flex items-center gap-2 bg-slate-50 px-4 py-3 rounded-lg border border-slate-200">
                <Phone className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-xs text-slate-600">للتواصل</p>
                  <p className="text-lg font-bold text-slate-900 dir-ltr">
                    {companySettings.companyPhone}
                  </p>
                </div>
              </div>
            </div>
          )}
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
