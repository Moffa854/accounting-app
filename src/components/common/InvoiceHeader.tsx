"use client";

import Image from "next/image";
import { useSettingsStore } from "@/features/settings/store/settings-store";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { useEffect } from "react";

interface InvoiceHeaderProps {
  title: string;
  subtitle?: string;
  rightContent?: React.ReactNode;
}

export function InvoiceHeader({ title, subtitle, rightContent }: InvoiceHeaderProps) {
  const { user } = useAuthStore();
  const { companySettings, fetchCompanySettings } = useSettingsStore();

  useEffect(() => {
    if (user && !companySettings) {
      fetchCompanySettings(user.uid);
    }
  }, [user, companySettings, fetchCompanySettings]);

  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 print:bg-blue-600">
      <div className="flex justify-between items-start">
        {/* Left Side - Logo and Company Name */}
        <div className="flex items-start gap-4">
          {companySettings?.companyLogo && (
            <div className="bg-white p-2 rounded-lg border-2 border-white shadow-md flex-shrink-0">
              <div className="relative w-16 h-16">
                <Image
                  src={companySettings.companyLogo}
                  alt={companySettings.companyName || "شعار الشركة"}
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          )}
          <div className="flex flex-col">
            {companySettings?.companyName && (
              <h2 className="text-xl font-bold mb-1">{companySettings.companyName}</h2>
            )}
            <h1 className="text-2xl font-bold">{title}</h1>
            {subtitle && (
              <p className="text-base text-blue-100 mt-1">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Right Side - Additional Info (can be customized per invoice) */}
        {rightContent && (
          <div className="shrink-0">
            {rightContent}
          </div>
        )}
      </div>
    </div>
  );
}
