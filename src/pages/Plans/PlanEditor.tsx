import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Button from "../../components/ui/button/Button";
import {
  getPlanDetails,
  listCountries,
  listRegions,
  savePlan,
  type Country,
  type NetworkType,
  type PlanFeatureInput,
  type PlanNetworkInput,
  type Region,
} from "../../lib/adminQueries";

type FieldErrors = Partial<Record<keyof PlanForm, string>>;

type PlanForm = {
  title: string;
  description: string;
  dataAmountGb: string;
  isUnlimited: boolean;
  validityDays: string;
  price: string;
  currency: string;
  providerName: string;
  activationPolicy: string;
  tetheringSupported: boolean;
  supports5g: boolean;
  isActive: boolean;
  countryIds: string[];
  regionIds: string[];
  networksText: string;
  featuresText: string;
};

const emptyForm: PlanForm = {
  title: "",
  description: "",
  dataAmountGb: "",
  isUnlimited: false,
  validityDays: "",
  price: "",
  currency: "USD",
  providerName: "AirConnect",
  activationPolicy: "",
  tetheringSupported: true,
  supports5g: false,
  isActive: true,
  countryIds: [],
  regionIds: [],
  networksText: "",
  featuresText: "",
};

function toggleValue(values: string[], value: string) {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}

function featuresToText(features: PlanFeatureInput[]) {
  return features.map((feature) => feature.label).join("\n");
}

function networksToText(networks: PlanNetworkInput[], countries: Country[]) {
  const countryById = new Map(countries.map((country) => [country.id, country]));

  return networks
    .map((network) => {
      const iso2 = countryById.get(network.country_id)?.iso2 ?? "";
      return [
        iso2,
        network.network_name,
        network.network_type,
        network.coverage_note ?? "",
      ].join(" | ");
    })
    .join("\n");
}

function parseFeatures(text: string): PlanFeatureInput[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((label, index) => ({
      icon: "check",
      label,
      sort_order: index + 1,
    }));
}

function parseNetworks(text: string, countries: Country[]): PlanNetworkInput[] {
  const countryByIso2 = new Map(
    countries.map((country) => [country.iso2.toUpperCase(), country])
  );

  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [iso2 = "", name = "", type = "4G", note = ""] = line
        .split("|")
        .map((value) => value.trim());
      const country = countryByIso2.get(iso2.toUpperCase());

      if (!country || !["4G", "5G", "LTE"].includes(type)) {
        throw new Error(
          "Networks must use: ISO2 | Network name | 4G/5G/LTE | Optional note"
        );
      }

      return {
        country_id: country.id,
        network_name: name,
        network_type: type as NetworkType,
        coverage_note: note || null,
      };
    });
}

function validateForm(form: PlanForm) {
  const errors: FieldErrors = {};

  if (!form.title.trim()) errors.title = "Title is required.";
  if (!form.validityDays || Number(form.validityDays) <= 0) {
    errors.validityDays = "Validity must be greater than 0.";
  }
  if (!form.price || Number(form.price) < 0) {
    errors.price = "Price must be 0 or greater.";
  }
  if (!form.currency.trim() || form.currency !== form.currency.toUpperCase()) {
    errors.currency = "Currency must be uppercase.";
  }
  if (!form.providerName.trim()) errors.providerName = "Provider is required.";
  if (!form.activationPolicy.trim()) {
    errors.activationPolicy = "Activation policy is required.";
  }
  if (!form.isUnlimited && Number(form.dataAmountGb) <= 0) {
    errors.dataAmountGb = "Data amount must be greater than 0.";
  }
  if (form.isUnlimited && form.dataAmountGb.trim()) {
    errors.dataAmountGb = "Unlimited plans should not include a data amount.";
  }

  return errors;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-error-500">{message}</p>;
}

export default function PlanEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const titleRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<PlanForm>(emptyForm);
  const [countries, setCountries] = useState<Country[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [pageError, setPageError] = useState("");
  const [savedMessage, setSavedMessage] = useState("");
  const [loading, setLoading] = useState(Boolean(id));
  const [saving, setSaving] = useState(false);

  const isEditing = Boolean(id);

  useEffect(() => {
    let mounted = true;

    async function loadOptions() {
      setPageError("");
      try {
        const [nextCountries, nextRegions] = await Promise.all([
          listCountries(),
          listRegions(),
        ]);

        if (!mounted) return;
        setCountries(nextCountries);
        setRegions(nextRegions);

        if (id) {
          const details = await getPlanDetails(id);
          if (!mounted) return;

          setForm({
            title: details.plan.title,
            description: details.plan.description ?? "",
            dataAmountGb: details.plan.data_amount_gb?.toString() ?? "",
            isUnlimited: details.plan.is_unlimited,
            validityDays: details.plan.validity_days.toString(),
            price: details.plan.price.toString(),
            currency: details.plan.currency,
            providerName: details.plan.provider_name,
            activationPolicy: details.plan.activation_policy,
            tetheringSupported: details.plan.tethering_supported,
            supports5g: details.plan.supports_5g,
            isActive: details.plan.is_active,
            countryIds: details.countryIds,
            regionIds: details.regionIds,
            networksText: networksToText(details.networks, nextCountries),
            featuresText: featuresToText(details.features),
          });
        }
      } catch (nextError) {
        setPageError(
          nextError instanceof Error ? nextError.message : "Could not load plan."
        );
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void loadOptions();

    return () => {
      mounted = false;
    };
  }, [id]);

  const firstErrorKey = useMemo(() => Object.keys(errors)[0], [errors]);

  useEffect(() => {
    if (firstErrorKey === "title") {
      titleRef.current?.focus();
    }
  }, [firstErrorKey]);

  const updateForm = <Key extends keyof PlanForm>(
    key: Key,
    value: PlanForm[Key]
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSavedMessage("");
    setPageError("");

    const nextErrors = validateForm(form);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setSaving(true);

    try {
      await savePlan({
        id,
        title: form.title.trim(),
        description: form.description.trim() || null,
        data_amount_gb: form.isUnlimited ? null : Number(form.dataAmountGb),
        is_unlimited: form.isUnlimited,
        validity_days: Number(form.validityDays),
        price: Number(form.price),
        currency: form.currency.trim().toUpperCase(),
        provider_name: form.providerName.trim(),
        activation_policy: form.activationPolicy.trim(),
        tethering_supported: form.tetheringSupported,
        supports_5g: form.supports5g,
        is_active: form.isActive,
        countryIds: form.countryIds,
        regionIds: form.regionIds,
        networks: parseNetworks(form.networksText, countries),
        features: parseFeatures(form.featuresText),
      });
      setSavedMessage("Plan saved.");

      if (!isEditing) {
        navigate("/plans", { replace: true });
      }
    } catch (nextError) {
      setPageError(
        nextError instanceof Error ? nextError.message : "Could not save plan."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageMeta
        title={`${isEditing ? "Edit" : "Create"} eSIM Plan | AirConnect Admin`}
        description=""
      />
      <PageBreadcrumb pageTitle={isEditing ? "Edit eSIM Plan" : "Create Plan"} />

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]"
      >
        {pageError && (
          <div className="rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-600 dark:border-error-500/30 dark:bg-error-500/10 dark:text-error-400">
            {pageError}
          </div>
        )}
        {savedMessage && (
          <div className="rounded-lg border border-success-200 bg-success-50 px-4 py-3 text-sm text-success-600 dark:border-success-500/30 dark:bg-success-500/10 dark:text-success-400">
            {savedMessage}
          </div>
        )}

        {loading ? (
          <div className="h-80 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />
        ) : (
          <>
            <section>
              <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
                Basics
              </h2>
              <div className="grid gap-4 lg:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Title
                  </span>
                  <input
                    ref={titleRef}
                    value={form.title}
                    onChange={(event) => updateForm("title", event.target.value)}
                    className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 dark:border-gray-700 dark:text-white/90"
                  />
                  <FieldError message={errors.title} />
                </label>
                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Provider
                  </span>
                  <input
                    value={form.providerName}
                    onChange={(event) =>
                      updateForm("providerName", event.target.value)
                    }
                    className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 dark:border-gray-700 dark:text-white/90"
                  />
                  <FieldError message={errors.providerName} />
                </label>
                <label className="block lg:col-span-2">
                  <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Description
                  </span>
                  <textarea
                    value={form.description}
                    onChange={(event) =>
                      updateForm("description", event.target.value)
                    }
                    rows={3}
                    className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 dark:border-gray-700 dark:text-white/90"
                  />
                </label>
              </div>
            </section>

            <section>
              <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
                Coverage
              </h2>
              <div className="grid gap-6 lg:grid-cols-2">
                <div>
                  <h3 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Countries
                  </h3>
                  <div className="grid max-h-56 gap-2 overflow-y-auto rounded-lg border border-gray-200 p-3 dark:border-gray-800 sm:grid-cols-2">
                    {countries.map((country) => (
                      <label
                        key={country.id}
                        className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
                      >
                        <input
                          type="checkbox"
                          checked={form.countryIds.includes(country.id)}
                          onChange={() =>
                            updateForm(
                              "countryIds",
                              toggleValue(form.countryIds, country.id)
                            )
                          }
                        />
                        {country.name} ({country.iso2})
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Regions
                  </h3>
                  <div className="grid gap-2 rounded-lg border border-gray-200 p-3 dark:border-gray-800">
                    {regions.map((region) => (
                      <label
                        key={region.id}
                        className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
                      >
                        <input
                          type="checkbox"
                          checked={form.regionIds.includes(region.id)}
                          onChange={() =>
                            updateForm(
                              "regionIds",
                              toggleValue(form.regionIds, region.id)
                            )
                          }
                        />
                        {region.name}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
                Pricing
              </h2>
              <div className="grid gap-4 lg:grid-cols-3">
                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Price
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={(event) => updateForm("price", event.target.value)}
                    className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 dark:border-gray-700 dark:text-white/90"
                  />
                  <FieldError message={errors.price} />
                </label>
                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Currency
                  </span>
                  <input
                    value={form.currency}
                    onChange={(event) =>
                      updateForm("currency", event.target.value.toUpperCase())
                    }
                    className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 dark:border-gray-700 dark:text-white/90"
                  />
                  <FieldError message={errors.currency} />
                </label>
                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Validity days
                  </span>
                  <input
                    type="number"
                    min="1"
                    value={form.validityDays}
                    onChange={(event) =>
                      updateForm("validityDays", event.target.value)
                    }
                    className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 dark:border-gray-700 dark:text-white/90"
                  />
                  <FieldError message={errors.validityDays} />
                </label>
              </div>
            </section>

            <section>
              <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
                Availability
              </h2>
              <div className="grid gap-4 lg:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Data amount GB
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.dataAmountGb}
                    onChange={(event) =>
                      updateForm("dataAmountGb", event.target.value)
                    }
                    disabled={form.isUnlimited}
                    className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 disabled:opacity-50 dark:border-gray-700 dark:text-white/90"
                  />
                  <FieldError message={errors.dataAmountGb} />
                </label>
                <div className="grid gap-3 pt-7">
                  {[
                    ["isUnlimited", "Unlimited data"],
                    ["tetheringSupported", "Tethering supported"],
                    ["supports5g", "5G supported"],
                    ["isActive", "Active in customer catalog"],
                  ].map(([key, label]) => (
                    <label
                      key={key}
                      className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
                    >
                      <input
                        type="checkbox"
                        checked={Boolean(form[key as keyof PlanForm])}
                        onChange={() =>
                          updateForm(
                            key as keyof PlanForm,
                            !form[key as keyof PlanForm] as never
                          )
                        }
                      />
                      {label}
                    </label>
                  ))}
                </div>
                <label className="block lg:col-span-2">
                  <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Activation policy
                  </span>
                  <textarea
                    value={form.activationPolicy}
                    onChange={(event) =>
                      updateForm("activationPolicy", event.target.value)
                    }
                    rows={3}
                    className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 dark:border-gray-700 dark:text-white/90"
                  />
                  <FieldError message={errors.activationPolicy} />
                </label>
                <label className="block lg:col-span-2">
                  <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Networks
                  </span>
                  <textarea
                    value={form.networksText}
                    onChange={(event) =>
                      updateForm("networksText", event.target.value)
                    }
                    rows={4}
                    placeholder="JP | NTT Docomo | 5G | Strong urban coverage"
                    className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 dark:border-gray-700 dark:text-white/90"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    One per line: ISO2 | Network name | 4G/5G/LTE | Optional note
                  </p>
                </label>
                <label className="block lg:col-span-2">
                  <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Features
                  </span>
                  <textarea
                    value={form.featuresText}
                    onChange={(event) =>
                      updateForm("featuresText", event.target.value)
                    }
                    rows={4}
                    placeholder={"Instant QR activation\nTethering supported"}
                    className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 dark:border-gray-700 dark:text-white/90"
                  />
                  <p className="mt-1 text-xs text-gray-500">One label per line.</p>
                </label>
              </div>
            </section>

            <div className="sticky bottom-0 -mx-5 flex justify-end gap-3 border-t border-gray-200 bg-white px-5 py-4 dark:border-gray-800 dark:bg-gray-900">
              <Link to="/plans">
                <Button variant="outline" size="sm" disabled={saving}>
                  Cancel
                </Button>
              </Link>
              <Button type="submit" size="sm" disabled={saving}>
                {saving ? "Saving..." : "Save plan"}
              </Button>
            </div>
          </>
        )}
      </form>
    </>
  );
}
