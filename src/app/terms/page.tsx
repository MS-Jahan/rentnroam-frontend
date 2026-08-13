import { Badge } from "@/components/ui/badge";

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-12 space-y-8">
      <div className="space-y-2 border-b border-line pb-6">
        <Badge variant="default">Rental Agreement</Badge>
        <h1 className="font-display text-3xl sm:text-5xl uppercase text-ink">Terms of Rental</h1>
        <p className="text-xs text-muted">Last updated: August 12, 2026</p>
      </div>

      <div className="space-y-6 text-sm text-ink/80 leading-relaxed">
        <section className="space-y-2">
          <h2 className="font-semibold text-lg text-ink">1. Equipment Inspection & Pickup</h2>
          <p>
            Renters are required to inspect equipment (bikes, kayaks, tents, climbing gear) at the time of pickup. Any pre-existing damage must be reported to the provider immediately before taking possession.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold text-lg text-ink">2. Care and Responsible Use</h2>
          <p>
            Renters agree to use all rented equipment safely and solely for its intended purpose. Safety equipment (helmets, life jackets, harnesses) must be worn at all times during relevant activities.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold text-lg text-ink">3. Damage and Loss Responsibility</h2>
          <p>
            Normal wear-and-tear from customary use is accepted. However, major damage resulting from neglect, misuse, or theft during the rental period is the financial responsibility of the renter.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold text-lg text-ink">4. On-Time Returns</h2>
          <p>
            Equipment must be returned to the provider by the agreed end date and time. Late returns without prior provider extension approval may incur additional daily rental fees.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold text-lg text-ink">5. Cancellation Policy</h2>
          <p>
            Orders can be cancelled free of charge prior to provider confirmation or payment. Once confirmed and paid, cancellations are subject to provider approval in accordance with our platform refund guidelines.
          </p>
        </section>
      </div>
    </div>
  );
}
