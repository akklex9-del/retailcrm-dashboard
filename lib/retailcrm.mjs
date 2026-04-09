import { getRetailCrmConfig } from "./config.mjs";

function makeUrl(path, params = {}) {
  const { baseUrl, apiKey } = getRetailCrmConfig();
  const normalizedBase = baseUrl.replace(/\/$/, "");
  const url = new URL(`${normalizedBase}${path}`);
  url.searchParams.set("apiKey", apiKey);

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value));
    }
  }
  return url;
}

export async function createRetailOrder(order, site = "default") {
  const url = makeUrl("/api/v5/orders/create", { site });
  const body = new URLSearchParams();
  body.set("order", JSON.stringify(order));

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(`RetailCRM create order failed: ${JSON.stringify(data)}`);
  }
  return data;
}

export async function listRetailOrders(limit = 100, page = 1, site = "default") {
  const url = makeUrl("/api/v5/orders", { limit, page, site });
  const res = await fetch(url);
  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(`RetailCRM list orders failed: ${JSON.stringify(data)}`);
  }

  return {
    orders: data.orders ?? [],
    pagination: data.pagination ?? { currentPage: page, totalPageCount: 1 },
  };
}
