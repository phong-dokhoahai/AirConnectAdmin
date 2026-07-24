import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "../lib/auth";

export default function ProtectedRoute() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 text-sm text-gray-500 dark:bg-gray-900 dark:text-gray-400">
        Loading admin session...
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
            This account does not have admin access.
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Sign in with an AirConnect admin account to continue.
          </p>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
