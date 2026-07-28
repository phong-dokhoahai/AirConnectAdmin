import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Badge from "../../components/ui/badge/Badge";
import Button from "../../components/ui/button/Button";
import { Modal } from "../../components/ui/modal";
import {
  listPlans,
  setPlanActive,
  type PlanSummary,
} from "../../lib/adminQueries";
import {
  localeForLanguage,
  useI18n,
  type LanguageCode,
} from "../../lib/i18n";

type StatusFilter = "all" | "active" | "hidden";

function formatMoney(
  amount: number,
  currency: string,
  language: LanguageCode
) {
  return new Intl.NumberFormat(localeForLanguage(language), {
    style: "currency",
    currency,
  }).format(amount);
}

function formatData(plan: PlanSummary, unlimitedLabel: string) {
  return plan.is_unlimited ? unlimitedLabel : `${plan.data_amount_gb ?? 0}GB`;
}

export default function PlansList() {
  const { language, t } = useI18n();
  const [plans, setPlans] = useState<PlanSummary[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [planToHide, setPlanToHide] = useState<PlanSummary | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const loadPlans = async () => {
    setLoading(true);
    setError("");
    try {
      setPlans(await listPlans());
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : t("error.plans"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadPlans();
  }, []);

  const filteredPlans = useMemo(() => {
    return plans.filter((plan) => {
      const matchesSearch = plan.title
        .toLowerCase()
        .includes(search.trim().toLowerCase());
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && plan.is_active) ||
        (statusFilter === "hidden" && !plan.is_active);

      return matchesSearch && matchesStatus;
    });
  }, [plans, search, statusFilter]);

  const confirmHide = async () => {
    if (!planToHide) return;

    setIsSaving(true);
    setError("");

    try {
      await setPlanActive(planToHide.id, false);
      setPlanToHide(null);
      await loadPlans();
    } catch (nextError) {
      setError(
        nextError instanceof Error ? nextError.message : t("error.hidePlan")
      );
    } finally {
      setIsSaving(false);
    }
  };

  const activatePlan = async (plan: PlanSummary) => {
    setIsSaving(true);
    setError("");

    try {
      await setPlanActive(plan.id, true);
      await loadPlans();
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : t("error.activatePlan")
      );
    } finally {
      setIsSaving(false);
    }
  };

  const statusLabel = (plan: PlanSummary) =>
    plan.is_active ? t("common.active") : t("common.hidden");

  return (
    <>
      <PageMeta title="eSIM Plans | AirConnect Admin" description="" />
      <PageBreadcrumb pageTitle={t("plans.title")} />

      <div className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t("plans.search")}
              className="h-11 rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white/90"
            />
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as StatusFilter)
              }
              className="h-11 rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            >
              <option value="all">{t("common.allStatuses")}</option>
              <option value="active">{t("common.active")}</option>
              <option value="hidden">{t("common.hidden")}</option>
            </select>
          </div>
          <Link to="/plans/new">
            <Button size="sm">{t("plans.create")}</Button>
          </Link>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-600 dark:border-error-500/30 dark:bg-error-500/10 dark:text-error-400">
            {error}
          </div>
        )}

        <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
          <table className="hidden min-w-full divide-y divide-gray-200 dark:divide-gray-800 md:table">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                {[
                  "common.plan",
                  "common.coverage",
                  "common.data",
                  "common.validity",
                  "plans.price",
                  "common.status",
                  "plans.actions",
                ].map((key, index) => (
                  <th
                    key={key}
                    className={`px-5 py-3 text-xs font-medium text-gray-500 ${
                      index === 6 ? "text-right" : "text-left"
                    }`}
                  >
                    {t(key)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {loading &&
                Array.from({ length: 4 }).map((_, index) => (
                  <tr key={index}>
                    <td colSpan={7} className="px-5 py-4">
                      <div className="h-5 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
                    </td>
                  </tr>
                ))}
              {!loading &&
                filteredPlans.map((plan) => (
                  <tr key={plan.id}>
                    <td className="px-5 py-4 text-sm font-medium text-gray-800 dark:text-white/90">
                      {plan.title}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500">
                      {plan.coverageSummary}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500">
                      {formatData(plan, t("common.unlimited"))}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500">
                      {plan.validity_days} {t("common.days")}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500">
                      {formatMoney(plan.price, plan.currency, language)}
                    </td>
                    <td className="px-5 py-4">
                      <Badge color={plan.is_active ? "success" : "warning"}>
                        {statusLabel(plan)}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-right text-sm">
                      <PlanActions
                        plan={plan}
                        isSaving={isSaving}
                        onActivate={activatePlan}
                        onHide={setPlanToHide}
                      />
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>

          <div className="divide-y divide-gray-200 dark:divide-gray-800 md:hidden">
            {loading &&
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="p-4">
                  <div className="h-24 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
                </div>
              ))}
            {!loading &&
              filteredPlans.map((plan) => (
                <div key={plan.id} className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-medium text-gray-800 dark:text-white/90">
                        {plan.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {plan.coverageSummary}
                      </p>
                    </div>
                    <Badge color={plan.is_active ? "success" : "warning"}>
                      {statusLabel(plan)}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500">
                    {formatData(plan, t("common.unlimited"))} ·{" "}
                    {plan.validity_days} {t("common.days")} ·{" "}
                    {formatMoney(plan.price, plan.currency, language)}
                  </p>
                  <PlanActions
                    plan={plan}
                    isSaving={isSaving}
                    onActivate={activatePlan}
                    onHide={setPlanToHide}
                  />
                </div>
              ))}
          </div>

          {!loading && filteredPlans.length === 0 && (
            <div className="p-8 text-center">
              <h3 className="font-medium text-gray-800 dark:text-white/90">
                {plans.length === 0 ? t("plans.noPlans") : t("plans.noMatch")}
              </h3>
              {plans.length === 0 ? (
                <Link to="/plans/new" className="mt-3 inline-block">
                  <Button size="sm">{t("plans.create")}</Button>
                </Link>
              ) : (
                <button
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("all");
                  }}
                  className="mt-3 text-sm text-brand-500 hover:text-brand-600"
                >
                  {t("common.clearFilters")}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={Boolean(planToHide)}
        onClose={() => setPlanToHide(null)}
        className="max-w-md p-6"
        showCloseButton={false}
      >
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {t("plans.hideConfirmTitle")}
        </h2>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {t("plans.hideConfirmBody", { title: planToHide?.title ?? "" })}
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPlanToHide(null)}
            disabled={isSaving}
          >
            {t("common.cancel")}
          </Button>
          <Button size="sm" onClick={confirmHide} disabled={isSaving}>
            {isSaving ? t("plans.hideSaving") : t("plans.hideSubmit")}
          </Button>
        </div>
      </Modal>
    </>
  );
}

function PlanActions({
  plan,
  isSaving,
  onActivate,
  onHide,
}: {
  plan: PlanSummary;
  isSaving: boolean;
  onActivate: (plan: PlanSummary) => void;
  onHide: (plan: PlanSummary) => void;
}) {
  const { t } = useI18n();

  return (
    <div className="flex gap-4 text-sm md:justify-end">
      <Link to={`/plans/${plan.id}`} className="text-brand-500 hover:text-brand-600">
        {t("common.edit")}
      </Link>
      {plan.is_active ? (
        <button
          onClick={() => onHide(plan)}
          disabled={isSaving}
          className="text-warning-600 hover:text-warning-700"
        >
          {t("common.hide")}
        </button>
      ) : (
        <button
          onClick={() => onActivate(plan)}
          disabled={isSaving}
          className="text-success-600 hover:text-success-700"
        >
          {t("common.activate")}
        </button>
      )}
    </div>
  );
}
