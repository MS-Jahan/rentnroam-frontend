import Link from "next/link";
import { HelpCircle, Mail, MessageSquare, BookOpen, ShieldCheck } from "lucide-react";
import { HomeFaq } from "@/components/home-faq";
import { Badge } from "@/components/ui/badge";

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <Badge variant="default" className="mx-auto">Support Center</Badge>
        <h1 className="font-display text-4xl sm:text-5xl uppercase text-ink">
          Help & Frequently Asked Questions
        </h1>
        <p className="text-sm text-muted leading-relaxed">
          Find answers to common questions about booking, payments, cancellations, and listing gear.
        </p>
      </div>

      {/* Support Quick Links */}
      <div className="grid gap-6 sm:grid-cols-3 max-w-4xl mx-auto">
        <div className="p-6 rounded-2xl border border-line bg-panel space-y-2 text-center shadow-xs">
          <BookOpen className="h-6 w-6 text-blaze mx-auto" />
          <h3 className="font-semibold text-base text-ink">Rental Guidelines</h3>
          <p className="text-xs text-muted">Learn how pickup, inspection, and returns work.</p>
          <Link href="/terms" className="inline-block text-xs font-semibold text-blaze pt-1">
            Read Terms →
          </Link>
        </div>

        <div className="p-6 rounded-2xl border border-line bg-panel space-y-2 text-center shadow-xs">
          <ShieldCheck className="h-6 w-6 text-emerald-500 mx-auto" />
          <h3 className="font-semibold text-base text-ink">Stripe Protection</h3>
          <p className="text-xs text-muted">Understand security, holds, and refund policies.</p>
          <Link href="/privacy" className="inline-block text-xs font-semibold text-blaze pt-1">
            Privacy Info →
          </Link>
        </div>

        <div className="p-6 rounded-2xl border border-line bg-panel space-y-2 text-center shadow-xs">
          <Mail className="h-6 w-6 text-moss dark:text-fern mx-auto" />
          <h3 className="font-semibold text-base text-ink">Contact Support</h3>
          <p className="text-xs text-muted">Need personal assistance? Send our team a message.</p>
          <Link href="/contact" className="inline-block text-xs font-semibold text-blaze pt-1">
            Open Contact Form →
          </Link>
        </div>
      </div>

      {/* Interactive FAQ Section */}
      <div className="space-y-6 pt-4">
        <div className="text-center max-w-xl mx-auto">
          <h2 className="font-display text-2xl uppercase text-ink">Rental Knowledge Base</h2>
          <p className="text-xs text-muted mt-1">Click a question to view full details.</p>
        </div>
        <HomeFaq />
      </div>
    </div>
  );
}
