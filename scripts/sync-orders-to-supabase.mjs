import { listRetailOrders } from "../lib/retailcrm.mjs";
import { mapRetailOrder, upsertOrders } from "../lib/supabase.mjs";

async function main() {
  let page = 1;
  const limit = 100;
  let totalPages = 1;
  let totalOrders = 0;

  while (page <= totalPages) {
    const { orders, pagination } = await listRetailOrders(limit, page);
    totalPages = pagination.totalPageCount ?? 1;

    const mapped = orders.map(mapRetailOrder);
    await upsertOrders(mapped);

    totalOrders += mapped.length;
    console.log(`Synced page ${page}/${totalPages}, orders: ${mapped.length}`);
    page += 1;
  }

  console.log(`Done. Synced ${totalOrders} orders to Supabase.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
