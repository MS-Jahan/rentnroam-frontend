import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PaymentCancelPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8">
        <h1 className="font-display text-4xl uppercase text-amber-950">
          Payment cancelled
        </h1>
        <p className="mt-3 text-amber-900/80">
          No charge was made. You can try again from your rental order.
        </p>
        <Link href="/dashboard/customer" className="mt-6 inline-block">
          <Button variant="secondary">Back to dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
