import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../lib/supabase.mjs";

export const dynamic = "force-dynamic";

function toAlmatyDay(isoDate) {
  // Asia/Almaty: UTC+6, без переходов на летнее время.
  // Делаем детерминированный формат YYYY-MM-DD без зависимости от ICU/локали среды.
  const utcMs = new Date(isoDate).getTime();
  const almatyMs = utcMs + 6 * 60 * 60 * 1000;
  return new Date(almatyMs).toISOString().slice(0, 10);
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from"); // YYYY-MM-DD
  const to = searchParams.get("to"); // YYYY-MM-DD

  const supabase = getSupabaseAdmin();
  let query = supabase
    .from("orders")
    .select("created_at,total_summ")
    .order("created_at", { ascending: true });

  if (from) query = query.gte("created_at", `${from}T00:00:00.000Z`);
  if (to) query = query.lte("created_at", `${to}T23:59:59.999Z`);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }

  const byDay = new Map();
  for (const row of data ?? []) {
    if (!row.created_at) continue;
    const day = toAlmatyDay(row.created_at);
    const prev = byDay.get(day) ?? { day, orders_count: 0, revenue: 0 };
    prev.orders_count += 1;
    prev.revenue += Number(row.total_summ || 0);
    byDay.set(day, prev);
  }

  return NextResponse.json(
    { rows: [...byDay.values()] },
    { headers: { "Cache-Control": "no-store" } },
  );
}
