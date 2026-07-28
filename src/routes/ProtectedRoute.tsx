import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "../lib/auth";
import { useI18n } from "../lib/i18n";

export default function ProtectedRoute() {
  const { status } = useAuth();
  const { t } = useI18n();
  const location = useLocation();

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 text-sm text-gray-500 dark:bg-gray-900 dark:text-gray-400">
        {t("auth.checkingSession")}
      </div>
    );
  }

  if (status === "unauthenticated") {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  if (status === "unauthorized") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6 text-center dark:bg-gray-900">
        <div>
          <h1 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
            {t("auth.adminAccessTitle")}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t("auth.adminAccessBody")}
          </p>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
