import { useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Button from "../../components/ui/button/Button";
import {
  getRevenueSummary,
  type OrderStatus,
  type RevenueSummary,
} from "../../lib/adminQueries";
import { formatMoney, MetricCard, RevenueChart } from "./revenueUi";

const statuses: OrderStatus[] = ["paid", "pending", "failed", "canceled"];

function todayInput(offsetDays: number) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().slice(0, 10);
}

function toggleStatus(values: OrderStatus[], status: OrderStatus) {
  return values.includes(status)
    ? values.filter((value) => value !== status)
    : [...values, status];
}

export default function Revenue() {
  const [startDate, setStartDate] = useState(todayInput(-30));
  const [endDate, setEndDate] = useState(todayInput(0));
  const [selectedStatuses, setSelectedStatuses] = useState<OrderStatus[]>([
    "paid",
  ]);
  const [summary, setSummary] = useState<RevenueSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadRevenue = async () => {
    setLoading(true);
    setError("");

    try {
      setSummary(
        await getRevenueSummary({
          startDate,
          endDate,
          statuses: selectedStatuses,
        })
      );
    } catch (nextError) {
      setError(
        nextError instanceof Error ? nextError.message : "Could not load revenue."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadRevenue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <PageMeta title="Revenue | AirConnect Admin" description="" />
      <PageBreadcrumb pageTitle="Revenue" />

      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="grid gap-4 lg:grid-cols-[1fr_1fr_2fr_auto] lg:items-end">
          <label>
            <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Start date
            </span>
            <input
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 dark:border-gray-700 dark:text-white/90"
            />
          </label>
          <label>
            <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              End date
            </span>
            <input
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 dark:border-gray-700 dark:text-white/90"
            />
          </label>
          <div>
            <span className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Payment status
            </span>
            <div className="flex flex-wrap gap-3">
              {statuses.map((status) => (
                <label
                  key={status}
                  className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
                >
                  <input
                    type="checkbox"
                    checked={selectedStatuses.includes(status)}
                    onChange={() =>
                      setSelectedStatuses(toggleStatus(selectedStatuses, status))
                    }
                  />
                  {status}
                </label>
              ))}
            </div>
          </div>
          <Button size="sm" onClick={loadRevenue} disabled={loading}>
            Apply
          </Button>
        </div>
        <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
          Revenue defaults to paid orders. Other statuses are included only when
          checked.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-600 dark:border-error-500/30 dark:bg-error-500/10 dark:text-error-400">
          {error}
        </div>
      )}

      {loading || !summary ? (
        <div className="grid grid-cols-12 gap-4 md:gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="col-span-12 h-32 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800 md:col-span-6"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-4 md:gap-6">
          <div className="col-span-12 md:col-span-4">
            <MetricCard
              label="Filtered revenue"
              value={formatMoney(summary.totalRevenue, summary.currency)}
              context={`${startDate} to ${endDate}`}
            />
          </div>
          <div className="col-span-12 md:col-span-4">
            <MetricCard
              label="Paid orders"
              value={summary.paidOrders.toString()}
              context="Revenue-counting by default"
            />
          </div>
          <div className="col-span-12 md:col-span-4">
            <MetricCard
              label="Included statuses"
              value={selectedStatuses.length.toString()}
              context={selectedStatuses.join(", ") || "None selected"}
            />
          </div>
          <div className="col-span-12 xl:col-span-7">
            <RevenueChart
              title="Revenue by day"
              labels={summary.revenueByDay.map((row) => row.label)}
              values={summary.revenueByDay.map((row) => row.revenue)}
            />
          </div>
          <div className="col-span-12 xl:col-span-5">
            <RevenueChart
              title="Revenue by status"
              labels={summary.revenueByStatus.map((row) => row.label)}
              values={summary.revenueByStatus.map((row) => row.revenue)}
            />
          </div>
          <div className="col-span-12 xl:col-span-6">
            <div className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
              <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
                Revenue by plan
              </h3>
              {summary.topPlans.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No revenue in this date range.
                </p>
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
                          {plan.orders} orders
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
          <div className="col-span-12 xl:col-span-6">
            <div className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
              <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
                Revenue by coverage
              </h3>
              {summary.revenueByCoverage.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No coverage contribution for this range.
                </p>
              ) : (
                <div className="space-y-3">
                  {summary.revenueByCoverage.map((coverage) => (
                    <div
                      key={coverage.label}
                      className="flex items-center justify-between gap-3"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                          {coverage.label}
                        </p>
                        <p className="text-xs text-gray-500">
                          {coverage.orders} orders
                        </p>
                      </div>
                      <span className="text-sm font-medium text-gray-800 dark:text-white/90">
                        {formatMoney(coverage.revenue, summary.currency)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
