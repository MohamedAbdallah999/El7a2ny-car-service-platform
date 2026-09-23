import { useEffect, useState } from "react";
import type { BusinessSummary } from "@car-platform/types";
import { businessesApi } from "../../lib/api";

export function useManagedBusiness() {
  const [business, setBusiness] = useState<BusinessSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void businessesApi
      .listMine({ limit: 1 })
      .then(async ({ items }) => {
        if (!items[0]) return null;
        return businessesApi
          .getById(items[0].id)
          .then(({ business: item }) => item);
      })
      .then((item) => {
        if (active) setBusiness(item);
      })
      .catch(() => {
        if (active) setError("Could not load your business.");
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return { business, error, isLoading, setBusiness };
}
