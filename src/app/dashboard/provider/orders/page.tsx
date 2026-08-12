import { redirect } from "next/navigation";

export default function ProviderOrdersRedirectPage() {
  redirect("/dashboard/provider?tab=orders");
}
