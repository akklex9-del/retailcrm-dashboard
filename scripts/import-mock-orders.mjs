import { readFile } from "node:fs/promises";
import { createRetailOrder } from "../lib/retailcrm.mjs";

async function main() {
  const raw = await readFile(new URL("../mock_orders.json", import.meta.url), "utf8");
  const orders = JSON.parse(raw);

  let success = 0;
  let failed = 0;

  for (let i = 0; i < orders.length; i += 1) {
    const input = orders[i];
    // В разных аккаунтах RetailCRM могут отличаться коды типов заказа.
    // Для тестовой загрузки безопаснее не передавать orderType вообще.
    const { orderType: _omit, ...order } = input ?? {};
    try {
      await createRetailOrder(order);
      success += 1;
      console.log(`Created order ${i + 1}/${orders.length}`);
    } catch (error) {
      failed += 1;
      console.error(`Failed order ${i + 1}:`, error.message);
    }
  }

  console.log(`Done. Success: ${success}, failed: ${failed}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
