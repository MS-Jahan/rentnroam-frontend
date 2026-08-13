"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    q: "How does renting gear on GearUp work?",
    a: "Select your desired gear, pick your rental start and end dates, and submit a rental request. Once the provider approves your request, you can complete the secure payment via Stripe and pick up the gear at the agreed location.",
  },
  {
    q: "What payment methods are supported?",
    a: "We support all major credit cards and debit cards securely through Stripe Checkout. Payments are held safely until the provider confirms availability.",
  },
  {
    q: "What happens if gear is damaged during my rental?",
    a: "All renters agree to our Rental Agreement terms. Minor wear-and-tear is expected, but for major damage or loss, renters are responsible for repair or replacement costs as coordinated with the provider.",
  },
  {
    q: "How do I become a GearUp Provider?",
    a: "Sign up for an account, choose the Provider role during registration or in your profile, and start listing your outdoor inventory in minutes!",
  },
  {
    q: "Can I cancel my rental order?",
    a: "Yes! You can cancel any pending or placed order directly from your Customer Dashboard before payment or pickup.",
  },
];

export function HomeFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="space-y-3 max-w-3xl mx-auto">
      {faqs.map((faq, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div
            key={idx}
            className="rounded-xl border border-line bg-panel overflow-hidden transition-all shadow-xs"
          >
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : idx)}
              className="flex w-full items-center justify-between p-5 text-left font-semibold text-ink hover:text-blaze transition-colors"
            >
              <span>{faq.q}</span>
              <ChevronDown
                className={cn(
                  "h-5 w-5 text-muted transition-transform duration-200 shrink-0 ml-2",
                  isOpen && "rotate-180 text-blaze"
                )}
              />
            </button>
            {isOpen && (
              <div className="px-5 pb-5 text-sm text-muted leading-relaxed border-t border-line/40 pt-3 animate-in fade-in-50">
                {faq.a}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
