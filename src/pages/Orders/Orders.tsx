import { useEffect, useMemo, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Badge from "../../components/ui/badge/Badge";
import Button from "../../components/ui/button/Button";
import {
  listRevenueOrders,
  type OrderStatus,
  type RevenueOrder,
} from "../../lib/adminQueries";
import { formatDate, formatMoney, statusColor } from "../Revenue/revenueUi";

const statuses: OrderStatus[] = ["paid", "pending", "failed", "canceled"];
const pageSize = 10;

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

function revenueEligibility(order: RevenueOrder) {
  return order.status === "paid" ? "Counts toward revenue" : "Not counted";
}

export default function Orders() {
  const [orders, setOrders] = useState<RevenueOrder[]>([]);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState(todayInput(-30));
  const [endDate, setEndDate] = useState(todayInput(0));
  const [selectedStatuses, setSelectedStatuses] = useState<OrderStatus[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOrders = async () => {
    setLoading(true);
    setError("");

    try {
      setOrders(
        await listRevenueOrders({
          startDate,
          endDate,
          statuses: selectedStatuses,
        })
      );
      setPage(1);
    } catch (nextError) {
      setError(
        nextError instanceof Error ? nextError.message : "Could not load orders."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredOrders = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) return orders;

    return orders.filter(
      (order) =>
        order.id.toLowerCase().includes(value) ||
        order.traveler_email.toLowerCase().includes(value)
    );
  }, [orders, search]);

  const pageCount = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
  const pageOrders = filteredOrders.slice((page - 1) * pageSize, page * pageSize);

  const clearFilters = () => {
    setSearch("");
    setSelectedStatuses([]);
    setStartDate(todayInput(-30));
    setEndDate(todayInput(0));
    setPage(1);
  };

  return (
    <>
      <PageMeta title="Orders | AirConnect Admin" description="" />
      <PageBreadcrumb pageTitle="Orders" />

      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr_1fr_2fr_auto] xl:items-end">
          <label>
            <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Search
            </span>
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Email or order ID"
              className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 dark:border-gray-700 dark:text-white/90"
            />
          </label>
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
          <Button size="sm" onClick={loadOrders} disabled={loading}>
            Apply
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-600 dark:border-error-500/30 dark:bg-error-500/10 dark:text-error-400">
          {error}
        </div>
      )}

      <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="hidden overflow-x-auto md:block">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500">
                  Order
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500">
                  Customer
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500">
                  Plan
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500">
                  Amount
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500">
                  Status
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500">
                  Revenue
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {loading &&
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index}>
                    <td colSpan={7} className="px-5 py-4">
                      <div className="h-5 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
                    </td>
                  </tr>
                ))}
              {!loading &&
                pageOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-5 py-4 text-xs text-gray-500">
                      {order.id.slice(0, 8)}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {order.traveler_email}
                    </td>
                    <td className="px-5 py-4 text-sm font-medium text-gray-800 dark:text-white/90">
                      {order.planTitle}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {formatMoney(order.total_amount, order.currency)}
                    </td>
                    <td className="px-5 py-4">
                      <Badge color={statusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {revenueEligibility(order)}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500">
                      {formatDate(order.created_at)}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-800 md:hidden">
          {loading &&
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="p-4">
                <div className="h-28 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
              </div>
            ))}
          {!loading &&
            pageOrders.map((order) => (
              <div key={order.id} className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white/90">
                      {order.planTitle}
                    </p>
                    <p className="text-xs text-gray-500">
                      {order.traveler_email}
                    </p>
                  </div>
                  <Badge color={statusColor(order.status)}>{order.status}</Badge>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {formatMoney(order.total_amount, order.currency)} ·{" "}
                  {formatDate(order.created_at)}
                </p>
                <p className="text-sm text-gray-500">
                  {revenueEligibility(order)}
                </p>
                <p className="text-xs text-gray-400">Order {order.id}</p>
              </div>
            ))}
        </div>

        {!loading && filteredOrders.length === 0 && (
          <div className="p-8 text-center">
            <h3 className="font-medium text-gray-800 dark:text-white/90">
              No orders match these filters.
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Search value and filters are preserved.
            </p>
            <button
              onClick={clearFilters}
              className="mt-3 text-sm text-brand-500 hover:text-brand-600"
            >
              Clear filters
            </button>
          </div>
        )}

        {!loading && filteredOrders.length > 0 && (
          <div className="flex flex-col gap-3 border-t border-gray-200 px-5 py-4 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-gray-500">
              Showing {(page - 1) * pageSize + 1}-
              {Math.min(page * pageSize, filteredOrders.length)} of{" "}
              {filteredOrders.length}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setPage((value) => Math.min(pageCount, value + 1))
                }
                disabled={page === pageCount}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
