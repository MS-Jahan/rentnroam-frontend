import { Badge } from "@/components/ui/badge";

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-12 space-y-8">
      <div className="space-y-2 border-b border-line pb-6">
        <Badge variant="default">Legal Information</Badge>
        <h1 className="font-display text-3xl sm:text-5xl uppercase text-ink">Privacy Policy</h1>
        <p className="text-xs text-muted">Last updated: August 12, 2026</p>
      </div>

      <div className="space-y-6 text-sm text-ink/80 leading-relaxed">
        <section className="space-y-2">
          <h2 className="font-semibold text-lg text-ink">1. Information We Collect</h2>
          <p>
            When you register an account or place a rental order on GearUp, we collect personal information necessary to facilitate sports equipment rentals. This includes your name, email address, phone number, and account role (Customer, Provider, or Admin).
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold text-lg text-ink">2. Payment Processing via Stripe</h2>
          <p>
            GearUp integrates securely with Stripe Checkout for processing credit card payments and rental deposits. We do not store full credit card numbers or CVV codes on our servers. All transaction details are tokenized and encrypted according to PCI-DSS Level 1 compliance standards.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold text-lg text-ink">3. How We Use Your Information</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>To process rental reservations and coordinate equipment pickup/return with local shop providers.</li>
            <li>To send order status updates, payment confirmations, and account security notices.</li>
            <li>To maintain platform safety, prevent fraudulent transactions, and resolve rental disputes.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold text-lg text-ink">4. Data Sharing & Third Parties</h2>
          <p>
            We share relevant booking information (such as renter name and order dates) only with the specific equipment provider fulfilling your rental. We do not sell your personal data to third-party advertisers.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold text-lg text-ink">5. Your Data Rights</h2>
          <p>
            You have the right to access, update, or request deletion of your personal data at any time via your account profile settings or by contacting our support team at support@gearup.com.
          </p>
        </section>
      </div>
    </div>
  );
}
