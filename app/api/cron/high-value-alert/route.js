import { NextResponse } from "next/server";
import { listRetailOrders } from "../../../../lib/retailcrm.mjs";
import { getSupabaseAdmin, mapRetailOrder, upsertOrders } from "../../../../lib/supabase.mjs";
import { sendTelegramMessage } from "../../../../lib/telegram.mjs";

export const dynamic = "force-dynamic";

const LIMIT_AMOUNT = 50000;

export async function GET() {
  try {
    const { orders } = await listRetailOrders(100, 1);
    const mapped = orders.map(mapRetailOrder);
    await upsertOrders(mapped);

    const highValue = mapped.filter((o) => Number(o.total_summ) > LIMIT_AMOUNT);
    const supabase = getSupabaseAdmin();
    let sent = 0;

    for (const order of highValue) {
      const { data: existing, error: checkError } = await supabase
        .from("telegram_notifications")
        .select("id")
        .eq("retailcrm_id", order.retailcrm_id)
        .maybeSingle();

      if (checkError) throw checkError;
      if (existing) continue;

      const customer = [order.first_name, order.last_name].filter(Boolean).join(" ").trim() || "Клиент";
      const text = [
        "<b>Новый заказ > 50 000 KZT</b>",
        `ID: ${order.retailcrm_id}`,
        `Сумма: ${Number(order.total_summ).toLocaleString("ru-RU")} ₸`,
        `Клиент: ${customer}`,
        order.phone ? `Телефон: ${order.phone}` : "",
      ]
        .filter(Boolean)
        .join("\n");

      await sendTelegramMessage(text);

      const { error: insertError } = await supabase
        .from("telegram_notifications")
        .insert({ retailcrm_id: order.retailcrm_id });
      if (insertError) throw insertError;

      sent += 1;
    }

    return NextResponse.json({ ok: true, checked: mapped.length, alertsSent: sent });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
