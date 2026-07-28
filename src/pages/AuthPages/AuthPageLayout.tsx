import React from "react";
import GridShape from "../../components/common/GridShape";
import { Link } from "react-router";
import ThemeTogglerTwo from "../../components/common/ThemeTogglerTwo";
import { languageOptions, useI18n } from "../../lib/i18n";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { language, setLanguage, t } = useI18n();

  return (
    <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
      <div className="relative flex flex-col justify-center w-full h-screen lg:flex-row dark:bg-gray-900 sm:p-0">
        {children}
        <div className="items-center hidden w-full h-full lg:w-1/2 bg-brand-950 dark:bg-white/5 lg:grid">
          <div className="relative flex items-center justify-center z-1">
            {/* <!-- ===== Common Grid Shape Start ===== --> */}
            <GridShape />
            <div className="flex flex-col items-center max-w-xs">
              <Link to="/" className="block mb-4">
                <img
                  width={80}
                  height={80}
                  src="/icon.png"
                  alt="AirConnect"
                  className="mx-auto rounded-2xl"
                />
              </Link>
              <p className="text-center text-2xl font-semibold text-white dark:text-white/90">
                AirConnect
              </p>
            </div>
          </div>
        </div>
        <div className="fixed z-50 hidden bottom-6 right-6 sm:flex sm:items-center sm:gap-3">
          <label className="sr-only" htmlFor="auth-language">
            {t("common.language")}
          </label>
          <select
            id="auth-language"
            value={language}
            onChange={(event) => setLanguage(event.target.value as typeof language)}
            className="h-11 rounded-full border border-gray-200 bg-white px-3 text-sm text-gray-700 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400"
          >
            {languageOptions.map((option) => (
              <option key={option.code} value={option.code}>
                {option.label}
              </option>
            ))}
          </select>
          <ThemeTogglerTwo />
        </div>
      </div>
    </div>
  );
}
