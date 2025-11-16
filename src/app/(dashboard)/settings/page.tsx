"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { useSettingsStore } from "@/features/settings/store/settings-store";

export default function SettingsPage() {
  const { user } = useAuthStore();
  const {
    settings,
    isLoading,
    fetchSettings,
    updateExchangeRatesFromApi,
    updateExchangeRatesManual,
  } = useSettingsStore();

  const [usdRate, setUsdRate] = useState("50");
  const [gbpRate, setGbpRate] = useState("65");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (user) {
      fetchSettings(user.uid);
    }
  }, [user, fetchSettings]);

  useEffect(() => {
    if (settings?.exchangeRates) {
      setUsdRate(settings.exchangeRates.USD.toString());
      setGbpRate(settings.exchangeRates.GBP.toString());
    }
  }, [settings]);

  const handleAutoUpdate = async () => {
    if (!user) return;

    setIsUpdating(true);
    try {
      await updateExchangeRatesFromApi(user.uid);
      alert("تم تحديث أسعار الصرف بنجاح!");
    } catch (error) {
      alert("فشل تحديث أسعار الصرف. حاول مرة أخرى.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleManualUpdate = async () => {
    if (!user) return;

    const usd = parseFloat(usdRate);
    const gbp = parseFloat(gbpRate);

    if (isNaN(usd) || isNaN(gbp) || usd <= 0 || gbp <= 0) {
      alert("يرجى إدخال أسعار صحيحة");
      return;
    }

    setIsUpdating(true);
    try {
      await updateExchangeRatesManual(user.uid, {
        EGP: 1,
        USD: usd,
        GBP: gbp,
      });
      alert("تم تحديث أسعار الصرف يدوياً بنجاح!");
    } catch (error) {
      alert("فشل تحديث أسعار الصرف. حاول مرة أخرى.");
    } finally {
      setIsUpdating(false);
    }
  };

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
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">الإعدادات</h1>
        <p className="text-slate-600 mt-1">إدارة إعدادات التطبيق وأسعار الصرف</p>
      </div>

      {/* Exchange Rates Section */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900 mb-2">
            أسعار الصرف
          </h2>
          <p className="text-sm text-slate-600">
            يتم تحديث أسعار الصرف تلقائياً مرة واحدة يومياً
          </p>
          {settings?.exchangeRates?.lastUpdated && (
            <p className="text-xs text-slate-500 mt-1">
              آخر تحديث:{" "}
              {new Date(settings.exchangeRates.lastUpdated).toLocaleString("ar-EG")}
            </p>
          )}
        </div>

        {/* Auto Update Button */}
        <div className="mb-6">
          <Button
            onClick={handleAutoUpdate}
            disabled={isUpdating}
            className="w-full sm:w-auto"
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
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            {isUpdating ? "جاري التحديث..." : "تحديث الأسعار تلقائياً"}
          </Button>
        </div>

        <div className="border-t border-slate-200 pt-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            تحديث يدوي
          </h3>

          <div className="space-y-4">
            {/* USD Rate */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                سعر الدولار الأمريكي (USD) مقابل الجنيه المصري
              </label>
              <div className="flex items-center gap-2">
                <span className="text-slate-600">1 USD =</span>
                <input
                  type="number"
                  value={usdRate}
                  onChange={(e) => setUsdRate(e.target.value)}
                  className="flex-1 max-w-xs px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  step="0.01"
                  min="0"
                />
                <span className="text-slate-600">ج.م</span>
              </div>
            </div>

            {/* GBP Rate */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                سعر الجنيه الإسترليني (GBP) مقابل الجنيه المصري
              </label>
              <div className="flex items-center gap-2">
                <span className="text-slate-600">1 GBP =</span>
                <input
                  type="number"
                  value={gbpRate}
                  onChange={(e) => setGbpRate(e.target.value)}
                  className="flex-1 max-w-xs px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  step="0.01"
                  min="0"
                />
                <span className="text-slate-600">ج.م</span>
              </div>
            </div>

            {/* Manual Update Button */}
            <div className="pt-2">
              <Button
                onClick={handleManualUpdate}
                disabled={isUpdating}
                variant="outline"
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
                    d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                  />
                </svg>
                حفظ التحديثات اليدوية
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg
            className="w-5 h-5 text-blue-600 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <p className="text-sm font-medium text-blue-900">
              معلومات هامة
            </p>
            <p className="text-sm text-blue-700 mt-1">
              يتم استخدام أسعار الصرف لحساب إجمالي الأرباح بالجنيه المصري. يتم
              تحديث الأسعار تلقائياً مرة واحدة يومياً، أو يمكنك تحديثها يدوياً في
              أي وقت.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
