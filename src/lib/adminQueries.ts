import { supabase } from "./supabase";

export type Country = {
  id: string;
  name: string;
  iso2: string;
};

export type Region = {
  id: string;
  name: string;
};

export type NetworkType = "4G" | "5G" | "LTE";

export type Plan = {
  id: string;
  title: string;
  description: string | null;
  data_amount_gb: number | null;
  is_unlimited: boolean;
  validity_days: number;
  price: number;
  currency: string;
  provider_name: string;
  activation_policy: string;
  tethering_supported: boolean;
  supports_5g: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type PlanSummary = Plan & {
  coverageSummary: string;
};

export type PlanNetworkInput = {
  country_id: string;
  network_name: string;
  network_type: NetworkType;
  coverage_note: string | null;
};

export type PlanFeatureInput = {
  icon: string;
  label: string;
  sort_order: number;
};

export type PlanDetails = {
  plan: Plan;
  countryIds: string[];
  regionIds: string[];
  networks: PlanNetworkInput[];
  features: PlanFeatureInput[];
};

export type PlanInput = Omit<Plan, "id" | "created_at" | "updated_at"> & {
  id?: string;
  countryIds: string[];
  regionIds: string[];
  networks: PlanNetworkInput[];
  features: PlanFeatureInput[];
};

export type OrderStatus = "paid" | "pending" | "failed" | "canceled";

export type RevenueOrder = {
  id: string;
  plan_id: string;
  status: OrderStatus;
  traveler_email: string;
  payment_method: string;
  total_amount: number;
  currency: string;
  created_at: string;
  planTitle: string;
};

export type RevenueSummary = {
  currency: string;
  totalRevenue: number;
  todayRevenue: number;
  monthRevenue: number;
  paidOrders: number;
  recentOrders: RevenueOrder[];
  topPlans: { label: string; revenue: number; orders: number }[];
  revenueByDay: { label: string; revenue: number }[];
  revenueByStatus: { label: string; revenue: number; orders: number }[];
  revenueByCoverage: { label: string; revenue: number; orders: number }[];
};

type PlanCountryJoin = {
  plan_id: string;
  countries: Country | null;
};

type PlanRegionJoin = {
  plan_id: string;
  regions: Region | null;
};

type OrderWithPlan = Omit<RevenueOrder, "planTitle"> & {
  esim_plans: { title: string } | null;
};

function assertNoError(error: { message: string } | null) {
  if (error) {
    throw new Error(error.message);
  }
}

export async function listPlans(): Promise<PlanSummary[]> {
  const { data: plans, error: plansError } = await supabase
    .from("esim_plans")
    .select("*")
    .order("updated_at", { ascending: false });
  assertNoError(plansError);

  const planRows = (plans ?? []) as Plan[];
  const planIds = planRows.map((plan) => plan.id);

  if (planIds.length === 0) {
    return [];
  }

  const [{ data: countryRows }, { data: regionRows }] = await Promise.all([
    supabase
      .from("plan_countries")
      .select("plan_id, countries(id, name, iso2)")
      .in("plan_id", planIds),
    supabase
      .from("plan_regions")
      .select("plan_id, regions(id, name)")
      .in("plan_id", planIds),
  ]);

  const coverageByPlan = new Map<string, string[]>();

  ((countryRows ?? []) as unknown as PlanCountryJoin[]).forEach((row) => {
    if (row.countries) {
      const values = coverageByPlan.get(row.plan_id) ?? [];
      values.push(row.countries.iso2);
      coverageByPlan.set(row.plan_id, values);
    }
  });

  ((regionRows ?? []) as unknown as PlanRegionJoin[]).forEach((row) => {
    if (row.regions) {
      const values = coverageByPlan.get(row.plan_id) ?? [];
      values.push(row.regions.name);
      coverageByPlan.set(row.plan_id, values);
    }
  });

  return planRows.map((plan) => ({
    ...plan,
    coverageSummary: coverageByPlan.get(plan.id)?.join(", ") || "No coverage",
  }));
}

export async function listCountries(): Promise<Country[]> {
  const { data, error } = await supabase
    .from("countries")
    .select("id, name, iso2")
    .order("name");
  assertNoError(error);
  return (data ?? []) as Country[];
}

export async function listRegions(): Promise<Region[]> {
  const { data, error } = await supabase
    .from("regions")
    .select("id, name")
    .order("name");
  assertNoError(error);
  return (data ?? []) as Region[];
}

export async function getPlanDetails(id: string): Promise<PlanDetails> {
  const [
    { data: plan, error: planError },
    { data: countries, error: countriesError },
    { data: regions, error: regionsError },
    { data: networks, error: networksError },
    { data: features, error: featuresError },
  ] = await Promise.all([
    supabase.from("esim_plans").select("*").eq("id", id).single(),
    supabase.from("plan_countries").select("country_id").eq("plan_id", id),
    supabase.from("plan_regions").select("region_id").eq("plan_id", id),
    supabase
      .from("plan_networks")
      .select("country_id, network_name, network_type, coverage_note")
      .eq("plan_id", id),
    supabase
      .from("plan_features")
      .select("icon, label, sort_order")
      .eq("plan_id", id)
      .order("sort_order"),
  ]);

  assertNoError(planError);
  assertNoError(countriesError);
  assertNoError(regionsError);
  assertNoError(networksError);
  assertNoError(featuresError);

  return {
    plan: plan as Plan,
    countryIds: ((countries ?? []) as { country_id: string }[]).map(
      (row) => row.country_id
    ),
    regionIds: ((regions ?? []) as { region_id: string }[]).map(
      (row) => row.region_id
    ),
    networks: (networks ?? []) as PlanNetworkInput[],
    features: (features ?? []) as PlanFeatureInput[],
  };
}

export async function savePlan(input: PlanInput): Promise<string> {
  const { countryIds, regionIds, networks, features, id, ...planValues } = input;
  const saveQuery = id
    ? supabase.from("esim_plans").update(planValues).eq("id", id).select("id")
    : supabase.from("esim_plans").insert(planValues).select("id");
  const { data, error } = await saveQuery.single();
  assertNoError(error);

  const planId = (data as { id: string }).id;

  await Promise.all([
    supabase.from("plan_countries").delete().eq("plan_id", planId),
    supabase.from("plan_regions").delete().eq("plan_id", planId),
    supabase.from("plan_networks").delete().eq("plan_id", planId),
    supabase.from("plan_features").delete().eq("plan_id", planId),
  ]);

  const writes = [];

  if (countryIds.length > 0) {
    writes.push(
      supabase.from("plan_countries").insert(
        countryIds.map((countryId) => ({
          plan_id: planId,
          country_id: countryId,
        }))
      )
    );
  }

  if (regionIds.length > 0) {
    writes.push(
      supabase.from("plan_regions").insert(
        regionIds.map((regionId) => ({
          plan_id: planId,
          region_id: regionId,
        }))
      )
    );
  }

  if (networks.length > 0) {
    writes.push(
      supabase.from("plan_networks").insert(
        networks.map((network) => ({
          plan_id: planId,
          ...network,
        }))
      )
    );
  }

  if (features.length > 0) {
    writes.push(
      supabase.from("plan_features").insert(
        features.map((feature) => ({
          plan_id: planId,
          ...feature,
        }))
      )
    );
  }

  const results = await Promise.all(writes);
  results.forEach((result) => assertNoError(result.error));

  return planId;
}

export async function setPlanActive(id: string, isActive: boolean) {
  const { error } = await supabase
    .from("esim_plans")
    .update({ is_active: isActive })
    .eq("id", id);
  assertNoError(error);
}

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function startOfMonth() {
  const date = new Date();
  date.setDate(1);
  date.setHours(0, 0, 0, 0);
  return date;
}

function dateKey(value: string) {
  return new Date(value).toISOString().slice(0, 10);
}

function sum(rows: RevenueOrder[]) {
  return rows.reduce((total, order) => total + Number(order.total_amount), 0);
}

function groupRevenue(
  rows: RevenueOrder[],
  labelFor: (order: RevenueOrder) => string
) {
  const map = new Map<string, { label: string; revenue: number; orders: number }>();

  rows.forEach((order) => {
    const label = labelFor(order);
    const current = map.get(label) ?? { label, revenue: 0, orders: 0 };
    current.revenue += Number(order.total_amount);
    current.orders += 1;
    map.set(label, current);
  });

  return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue);
}

async function coverageByPlan(planIds: string[]) {
  if (planIds.length === 0) return new Map<string, string>();

  const [{ data: countryRows }, { data: regionRows }] = await Promise.all([
    supabase
      .from("plan_countries")
      .select("plan_id, countries(id, name, iso2)")
      .in("plan_id", planIds),
    supabase
      .from("plan_regions")
      .select("plan_id, regions(id, name)")
      .in("plan_id", planIds),
  ]);

  const map = new Map<string, string[]>();

  ((countryRows ?? []) as unknown as PlanCountryJoin[]).forEach((row) => {
    if (row.countries) {
      const values = map.get(row.plan_id) ?? [];
      values.push(row.countries.iso2);
      map.set(row.plan_id, values);
    }
  });

  ((regionRows ?? []) as unknown as PlanRegionJoin[]).forEach((row) => {
    if (row.regions) {
      const values = map.get(row.plan_id) ?? [];
      values.push(row.regions.name);
      map.set(row.plan_id, values);
    }
  });

  return new Map(
    Array.from(map.entries()).map(([planId, values]) => [
      planId,
      values.join(", "),
    ])
  );
}

export async function listRevenueOrders(options?: {
  startDate?: string;
  endDate?: string;
  statuses?: OrderStatus[];
}): Promise<RevenueOrder[]> {
  let query = supabase
    .from("orders")
    .select(
      "id, plan_id, status, traveler_email, payment_method, total_amount, currency, created_at, esim_plans(title)"
    )
    .order("created_at", { ascending: false });

  if (options?.startDate) {
    query = query.gte("created_at", `${options.startDate}T00:00:00.000Z`);
  }

  if (options?.endDate) {
    query = query.lte("created_at", `${options.endDate}T23:59:59.999Z`);
  }

  if (options?.statuses && options.statuses.length > 0) {
    query = query.in("status", options.statuses);
  }

  const { data, error } = await query;
  assertNoError(error);

  return ((data ?? []) as unknown as OrderWithPlan[]).map((order) => ({
    id: order.id,
    plan_id: order.plan_id,
    status: order.status,
    traveler_email: order.traveler_email,
    payment_method: order.payment_method,
    total_amount: Number(order.total_amount),
    currency: order.currency,
    created_at: order.created_at,
    planTitle: order.esim_plans?.title ?? "Unknown plan",
  }));
}

export async function getRevenueSummary(options?: {
  startDate?: string;
  endDate?: string;
  statuses?: OrderStatus[];
}): Promise<RevenueSummary> {
  const orders = await listRevenueOrders(options);
  const paidOrders = orders.filter((order) => order.status === "paid");
  const countedOrders = options?.statuses?.length ? orders : paidOrders;
  const today = startOfToday();
  const month = startOfMonth();
  const coverage = await coverageByPlan([
    ...new Set(countedOrders.map((order) => order.plan_id)),
  ]);

  return {
    currency: countedOrders[0]?.currency ?? "USD",
    totalRevenue: sum(countedOrders),
    todayRevenue: sum(
      paidOrders.filter((order) => new Date(order.created_at) >= today)
    ),
    monthRevenue: sum(
      paidOrders.filter((order) => new Date(order.created_at) >= month)
    ),
    paidOrders: paidOrders.length,
    recentOrders: orders.slice(0, 5),
    topPlans: groupRevenue(countedOrders, (order) => order.planTitle).slice(0, 5),
    revenueByDay: Array.from(
      groupRevenue(countedOrders, (order) => dateKey(order.created_at))
        .sort((a, b) => a.label.localeCompare(b.label))
        .map(({ label, revenue }) => ({ label, revenue }))
    ),
    revenueByStatus: groupRevenue(orders, (order) => order.status),
    revenueByCoverage: groupRevenue(
      countedOrders,
      (order) => coverage.get(order.plan_id) ?? "No coverage"
    ).slice(0, 5),
  };
}
