import { useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import { getRevenueSummary, type RevenueSummary } from "../../lib/adminQueries";
import {
  formatMoney,
  MetricCard,
  RecentRevenueOrders,
  RevenueChart,
} from "../Revenue/revenueUi";

export default function Home() {
  const [summary, setSummary] = useState<RevenueSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const nextSummary = await getRevenueSummary();
        if (mounted) setSummary(nextSummary);
      } catch (nextError) {
        if (mounted) {
          setError(
            nextError instanceof Error
              ? nextError.message
              : "Could not load dashboard."
          );
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void load();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <>
      <PageMeta title="Dashboard | AirConnect Admin" description="" />
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
          Dashboard
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Paid revenue, recent orders, and top-selling plans.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-600 dark:border-error-500/30 dark:bg-error-500/10 dark:text-error-400">
          {error}
        </div>
      )}

      {loading || !summary ? (
        <div className="grid grid-cols-12 gap-4 md:gap-6">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="col-span-12 h-32 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800 md:col-span-6 xl:col-span-3"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-4 md:gap-6">
          <div className="col-span-12 md:col-span-6 xl:col-span-3">
            <MetricCard
              label="Today revenue"
              value={formatMoney(summary.todayRevenue, summary.currency)}
              context="Paid orders today"
            />
          </div>
          <div className="col-span-12 md:col-span-6 xl:col-span-3">
            <MetricCard
              label="Month revenue"
              value={formatMoney(summary.monthRevenue, summary.currency)}
              context="Paid orders this month"
            />
          </div>
          <div className="col-span-12 md:col-span-6 xl:col-span-3">
            <MetricCard
              label="Paid orders"
              value={summary.paidOrders.toString()}
              context="Default revenue-counting orders"
            />
          </div>
          <div className="col-span-12 md:col-span-6 xl:col-span-3">
            <MetricCard
              label="All-time paid revenue"
              value={formatMoney(summary.totalRevenue, summary.currency)}
              context="Paid orders only"
            />
          </div>
          <div className="col-span-12 xl:col-span-7">
            <RevenueChart
              title="Revenue trend"
              labels={summary.revenueByDay.map((row) => row.label)}
              values={summary.revenueByDay.map((row) => row.revenue)}
            />
          </div>
          <div className="col-span-12 xl:col-span-5">
            <div className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
              <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
                Top plans
              </h3>
              {summary.topPlans.length === 0 ? (
                <p className="text-sm text-gray-500">No paid orders yet.</p>
              ) : (
                <div className="space-y-3">
                  {summary.topPlans.map((plan) => (
                    <div
                      key={plan.label}
                      className="flex items-center justify-between gap-3"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                          {plan.label}
                        </p>
                        <p className="text-xs text-gray-500">
                          {plan.orders} paid orders
                        </p>
                      </div>
                      <span className="text-sm font-medium text-gray-800 dark:text-white/90">
                        {formatMoney(plan.revenue, summary.currency)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="col-span-12">
            <RecentRevenueOrders orders={summary.recentOrders} />
          </div>
        </div>
      )}
    </>
  );
}
