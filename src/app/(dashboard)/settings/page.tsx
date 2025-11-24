"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { useSettingsStore } from "@/features/settings/store/settings-store";
import { CompanySettingsForm } from "@/features/settings/components/CompanySettingsForm";
import { ExchangeRatesForm } from "@/features/settings/components/ExchangeRatesForm";

export default function SettingsPage() {
  const { user } = useAuthStore();
  const {
    settings,
    companySettings,
    isLoading,
    fetchSettings,
    updateExchangeRatesFromApi,
    updateExchangeRatesManual,
    fetchCompanySettings,
    updateCompanySettings,
  } = useSettingsStore();

  useEffect(() => {
    if (user) {
      fetchSettings(user.uid);
      fetchCompanySettings(user.uid);
    }
  }, [user, fetchSettings, fetchCompanySettings]);

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center text-muted-foreground">
          يرجى تسجيل الدخول للوصول إلى الإعدادات
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">الإعدادات</h1>

      <div className="space-y-8">
        <CompanySettingsForm
          companySettings={companySettings}
          userId={user.uid}
          onSave={async (data) => {
            await updateCompanySettings(user.uid, data);
          }}
        />

        <ExchangeRatesForm
          settings={settings}
          userId={user.uid}
          onAutoUpdate={async () => {
            await updateExchangeRatesFromApi(user.uid);
          }}
          onManualUpdate={async (rates) => {
            await updateExchangeRatesManual(user.uid, rates);
          }}
        />
      </div>
    </div>
  );
}
