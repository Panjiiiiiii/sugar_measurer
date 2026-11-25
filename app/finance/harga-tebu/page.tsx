// /finance/* resolves to the static app/finance tree (FinanceSidebar layout),
// not app/[role], so finance needs its own route file. Reuse the shared page.
export { default } from "@/app/[role]/harga-tebu/page";
