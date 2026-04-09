import { createClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "./config.mjs";

export function getSupabaseAdmin() {
  const { url, serviceRoleKey } = getSupabaseConfig();
  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  });
}

export function mapRetailOrder(order) {
  const itemTotal = Array.isArray(order.items)
    ? order.items.reduce((acc, item) => {
        const qty = Number(item.quantity || 0);
        const price = Number(item.initialPrice || item.purchasePrice || 0);
        return acc + qty * price;
      }, 0)
    : 0;

  const totalSumm = Number(order.totalSumm || itemTotal || 0);

  return {
    retailcrm_id: order.id,
    number: order.number ?? null,
    created_at: order.createdAt ?? null,
    status: order.status ?? null,
    first_name: order.firstName ?? null,
    last_name: order.lastName ?? null,
    phone: order.phone ?? null,
    email: order.email ?? null,
    city: order.delivery?.address?.city ?? null,
    total_summ: totalSumm,
    raw: order,
  };
}

export async function upsertOrders(rows) {
  if (!rows.length) return;
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("orders")
    .upsert(rows, { onConflict: "retailcrm_id" });
  if (error) throw error;
}
