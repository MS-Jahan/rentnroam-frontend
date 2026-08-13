"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn, tapExpand } from "@/lib/utils";

const faqs = [
  {
    q: "How does renting gear on RentNRoam work?",
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
    q: "How do I become a RentNRoam Provider?",
    a: "Sign up for an account, choose the Provider role during registration or in your profile, and start listing your outdoor inventory in minutes!",
  },
  {
    q: "Can I cancel my rental order?",
    a: "Yes! You can cancel any pending or placed order directly from your Customer Dashboard before payment or pickup.",
  },
];

function FaqPanel({ open, children }: { open: boolean; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "grid transition-[grid-template-rows] duration-500 ease-out",
        open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
      )}
    >
      <div className="overflow-hidden">
        <div className="border-t border-line/40 px-5 pb-5 pt-3 text-sm leading-relaxed text-muted">
          {children}
        </div>
      </div>
    </div>
  );
}

export function HomeFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="mx-auto max-w-3xl space-y-3">
      {faqs.map((faq, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div
            key={idx}
            className={cn(
              "overflow-hidden rounded-xl border shadow-xs transition-all duration-500",
              isOpen
                ? "border-blaze/35 bg-panel"
                : "border-line bg-panel/90 hover:border-blaze/20"
            )}
          >
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : idx)}
              className={cn(
                "flex w-full items-center justify-between p-5 text-left font-semibold text-ink transition-colors hover:text-blaze",
                tapExpand
              )}
              aria-expanded={isOpen}
            >
              <span>{faq.q}</span>
              <ChevronDown
                className={cn(
                  "ml-2 h-5 w-5 shrink-0 text-muted transition-transform duration-500",
                  isOpen && "rotate-180 text-blaze"
                )}
              />
            </button>
            <FaqPanel open={isOpen}>{faq.a}</FaqPanel>
          </div>
        );
      })}
    </div>
  );
}
