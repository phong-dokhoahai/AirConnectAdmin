import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import Badge from "../../components/ui/badge/Badge";
import type { OrderStatus, RevenueOrder } from "../../lib/adminQueries";
import { localeForLanguage, useI18n, type LanguageCode } from "../../lib/i18n";

export function formatMoney(
  amount: number,
  currency: string,
  language: LanguageCode = "en"
) {
  return new Intl.NumberFormat(localeForLanguage(language), {
    style: "currency",
    currency,
  }).format(amount);
}

export function formatDate(value: string, language: LanguageCode = "en") {
  return new Intl.DateTimeFormat(localeForLanguage(language), {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function statusColor(status: OrderStatus) {
  if (status === "paid") return "success";
  if (status === "pending") return "warning";
  return "error";
}

export function MetricCard({
  label,
  value,
  context,
}: {
  label: string;
  value: string;
  context: string;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
      <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
      <h3 className="mt-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
        {value}
      </h3>
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{context}</p>
    </div>
  );
}

export function RevenueChart({
  title,
  labels,
  values,
}: {
  title: string;
  labels: string[];
  values: number[];
}) {
  const { t } = useI18n();
  const options: ApexOptions = {
    chart: { fontFamily: "Outfit, sans-serif", toolbar: { show: false } },
    colors: ["#465FFF"],
    dataLabels: { enabled: false },
    grid: { yaxis: { lines: { show: true } } },
    plotOptions: {
      bar: {
        borderRadius: 5,
        borderRadiusApplication: "end",
        columnWidth: "42%",
      },
    },
    xaxis: { categories: labels, axisBorder: { show: false } },
    yaxis: { labels: { formatter: (value) => `${Math.round(value)}` } },
    tooltip: { y: { formatter: (value) => `${value.toFixed(2)}` } },
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
      <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
        {title}
      </h3>
      {values.length === 0 ? (
        <p className="py-12 text-center text-sm text-gray-500">
          {t("revenue.noRange")}
        </p>
      ) : (
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[520px]">
            <Chart
              options={options}
              series={[{ name: t("revenue.chartSeries"), data: values }]}
              type="bar"
              height={240}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export function RecentRevenueOrders({ orders }: { orders: RevenueOrder[] }) {
  const { language, t } = useI18n();

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
      <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
        {t("dashboard.recentOrders")}
      </h3>
      {orders.length === 0 ? (
        <p className="text-sm text-gray-500">{t("revenue.noOrdersRange")}</p>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div
              key={order.id}
              className="flex flex-col justify-between gap-2 rounded-lg border border-gray-100 p-3 dark:border-gray-800 sm:flex-row sm:items-center"
            >
              <div>
                <p className="font-medium text-gray-800 dark:text-white/90">
                  {order.planTitle}
                </p>
                <p className="text-xs text-gray-500">
                  {order.traveler_email} · {formatDate(order.created_at, language)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge color={statusColor(order.status)}>
                  {t(`status.${order.status}`)}
                </Badge>
                <span className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {formatMoney(order.total_amount, order.currency, language)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
