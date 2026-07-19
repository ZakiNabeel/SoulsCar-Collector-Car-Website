"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { Button } from "@/components/ui-bits";

// SoulCars Platform Terms & Conditions — transcribed from
// SoulCars_Platform_Introduction_and_Terms.pdf. This is a legal document; edit
// the text here (not a spreadsheet) so wording stays under version control.
const INTRO =
  "Welcome to SoulCars.pk — Pakistan's first curated collector-cars marketplace. SoulCars operates as a digital introduction and facilitation platform for vetted collector vehicles and is not a general classifieds forum. By receiving these Terms electronically, listing a vehicle, making an inquiry, communicating through SoulCars, or otherwise engaging with the Platform, you confirm that you have read, understood and agreed to these Terms in full.";

const SECTIONS: { title: string; paras?: string[]; bullets?: string[] }[] = [
  {
    title: "1. Definitions",
    bullets: [
      '"Buyer" — any person who inquires about, negotiates for, or purchases a vehicle introduced or facilitated through SoulCars.',
      '"Seller" — any person who lists, offers, or sells a vehicle through or following an introduction or facilitation by SoulCars.',
      '"Platform" — SoulCars.pk and its associated digital channels, communications and facilitation processes.',
      '"Successful Sale" — completion of any sale, transfer, or materially equivalent arrangement between a Buyer and Seller where the transaction is materially connected with an introduction, listing, referral or facilitation through SoulCars.',
      '"Materially Connected" — any transaction where the Buyer and Seller were introduced, referred, connected or made aware of each other through SoulCars, directly or indirectly, within 12 (twelve) months preceding the transaction, regardless of whether the transaction is ultimately completed through the Platform or directly between the parties.',
    ],
  },
  {
    title: "2. Nature of Service",
    paras: [
      "SoulCars operates exclusively as a digital introduction, marketing and facilitation platform. SoulCars is not a registered motor dealer, auction house, escrow agent, legal representative, title verifier, mechanical certifier, insurer, guarantor or fiduciary of either party. SoulCars does not own, possess or hold any interest in any listed vehicle. All payments, transfer documents, registration, taxes and related compliance remain the sole responsibility of the Buyer and Seller.",
    ],
  },
  {
    title: "3. Acceptance of Terms",
    paras: [
      'A Buyer or Seller who receives these Terms and thereafter elects to proceed with SoulCars, a listed vehicle, an introduced party, a negotiation, inspection, offer, payment or sale shall be deemed to have accepted these Terms by electronic communication and/or conduct. No wet-ink signature is required for acceptance, provided acceptance is evidenced through electronic correspondence, messaging or conduct consistent with these Terms. SoulCars recommends that each party acknowledge receipt by replying "Confirmed" or equivalent through the official communication channel; such reply shall constitute conclusive evidence of acceptance and awareness of these Terms.',
    ],
  },
  {
    title: "4. Brokerage Commission",
    paras: [
      "A standard Platform commission of 2% (two percent) of the final agreed sale price is payable separately by both the Seller and the Buyer upon Successful Sale. Both parties independently undertake to pay their respective 2% commission to SoulCars; one party's obligation is not conditional on the other's payment. Commission shall be paid to SoulCars before or at the time of vehicle handover. SoulCars may also issue a formal invoice; payment shall be completed no later than the earlier of (a) vehicle handover or (b) 3 business days of invoice, unless otherwise agreed in writing by SoulCars. The commission is calculated on the actual final agreed sale price — concealment, understatement or misrepresentation of the sale price constitutes material breach entitling SoulCars to recover the unpaid balance together with lawful costs of recovery. SoulCars may offer a discounted commission rate, valid only if confirmed in writing by SoulCars or stated on the issued invoice. Where a deposit or advance payment is exchanged between parties whose transaction is Materially Connected with SoulCars and the transaction does not complete due to either party's default, SoulCars reserves the right to recover a facilitation fee not exceeding 1% (one percent) of the deposit amount from the defaulting party. Parties shall not bypass, circumvent or exclude SoulCars for the purpose of avoiding commission where the transaction is Materially Connected with SoulCars' introduction or facilitation. The 12-month circumvention window applies from the date of first introduction between the parties through SoulCars.",
    ],
  },
  {
    title: "5. Seller Responsibilities",
    bullets: [
      "All vehicle information provided (year, make, model, engine, mileage, condition, history, documents) is true, complete and not misleading.",
      "The Seller is the lawful owner or is duly authorised to list and sell the vehicle.",
      "All material defects, encumbrances, loans, non-original specifications and missing documents must be disclosed.",
      "The Seller remains solely liable for the accuracy of all information supplied to SoulCars or any Buyer. SoulCars' good-faith presentation of Seller-provided information does not constitute adoption or endorsement of such information.",
      "SoulCars must be notified immediately once a price is agreed, a deposit is received, or the sale is concluded.",
    ],
  },
  {
    title: "6. Buyer Responsibilities",
    bullets: [
      "The Buyer shall independently verify the vehicle, title, ownership, registration, condition, documents, mileage and authenticity before any commitment or payment.",
      "Physical inspection and qualified mechanical assessment are strongly advised prior to purchase.",
      "All sale terms are agreed directly between Buyer and Seller; SoulCars provides no guarantee on any vehicle.",
      "The Buyer confirms the 2% Buyer-side commission payable to SoulCars has been made known and shall be paid upon Successful Sale, before or at the time of vehicle handover.",
    ],
  },
  {
    title: "7. No Warranty or Representation",
    paras: [
      "All listings are provided on an \"as-is, as-described-by-Seller\" basis. SoulCars makes no representation or warranty — express, implied or statutory — regarding any vehicle's condition, title, mileage, authenticity, roadworthiness, compliance, value or fitness for purpose. SoulCars' good-faith presentation of Seller-provided information shall not constitute adoption or endorsement of such information. The Seller remains solely liable for the accuracy and completeness of all information supplied. SoulCars shall not be responsible for any statement, omission, concealment, defect, fraud or misrepresentation by either Buyer or Seller.",
    ],
  },
  {
    title: "8. Identity Data",
    paras: [
      "SoulCars may request, receive or retain CNIC and identity details for transaction identity verification, invoicing, record keeping and facilitation purposes. Such information is retained only where received (invoices, electronic correspondence, documents) and shall not be shared with unrelated third parties except where required for the transaction, authorised by the relevant party, required by applicable law, or necessary for lawful enforcement of these Terms.",
    ],
  },
  {
    title: "9. Limitation of Liability",
    paras: [
      "SoulCars shall not be liable for any loss, damage, claim, fraud, non-payment, documentation issue, ownership dispute, tax liability, mechanical defect, title issue, NADRA or MTMIS complication, government action, court order, regulatory matter or any other dispute arising from any transaction between Buyer and Seller. SoulCars is not a party to any vehicle sale agreement. SoulCars' aggregate liability to any party shall not exceed the commission actually received from that party in the relevant transaction. Nothing in these Terms excludes any liability which cannot lawfully be excluded under applicable law.",
    ],
  },
  {
    title: "10. Force Majeure",
    paras: [
      "SoulCars shall not be liable for any failure or delay in performing its facilitation role arising from circumstances beyond its reasonable control, including but not limited to government action, court orders, NADRA or MTMIS system failures, regulatory restrictions, natural disaster, civil unrest, or any other event of force majeure. In such circumstances SoulCars shall notify the affected parties and resume performance as soon as reasonably practicable.",
    ],
  },
  {
    title: "11. Dispute Resolution",
    paras: [
      "The first forum for resolution of any dispute, controversy or claim arising out of or in connection with these Terms shall be Mediation. A party raising a dispute shall issue written notice to the other party and to SoulCars, briefly setting out the nature of the dispute and relief sought. Parties shall attempt to resolve the matter in good faith within 14 days of notice. If the parties cannot agree on a mediator within 5 business days of the notice of dispute, either party may proceed directly to the competent court without further obligation to mediate. If mediation fails or does not result in settlement within 14 days, either party may initiate court proceedings. Nothing in this clause prevents a party from seeking urgent interim, injunctive, protective or preservatory relief from a competent court where reasonably necessary.",
    ],
  },
  {
    title: "12. Governing Law & Jurisdiction",
    paras: [
      "These Terms are governed by and construed in accordance with the laws of the Islamic Republic of Pakistan. Subject to the mediation requirement in Clause 11, disputes may be brought before the competent civil court of proper territorial and pecuniary jurisdiction under Pakistani law. SoulCars may elect to bring proceedings in the courts of Lahore or Islamabad, at SoulCars' sole election.",
    ],
  },
  {
    title: "13. Amendments",
    paras: [
      "SoulCars may update these Terms at any time. Updated terms will be published on SoulCars.pk or communicated electronically. Continued engagement with SoulCars after communication of updated terms constitutes acceptance. No variation of these Terms is binding on SoulCars unless expressly agreed in writing by SoulCars.",
    ],
  },
  {
    title: "14. Vehicle Inspection Service",
    paras: [
      'SoulCars may, at its discretion and upon request, offer a vehicle inspection service conducted by SoulCars and/or its designated team ("Inspection Service"). The following terms govern all engagements under the Inspection Service:',
    ],
    bullets: [
      "Inspection Fee: A flat fee of PKR 10,000 (ten thousand) is payable by the requesting party (Buyer or Seller) upon confirmation of the inspection appointment. Where the inspected vehicle is subsequently purchased through SoulCars by the requesting party, the inspection fee shall be absorbed into and set off against the commission payable by that party. Where no Successful Sale results, the inspection fee is non-refundable regardless of the outcome of the inspection or the requesting party's decision not to proceed.",
      "Scope of Inspection: The SoulCars inspection is a general condition assessment conducted visually and through basic operational checks. It is not a certified mechanical inspection, engineering survey, structural analysis, chassis inspection, or roadworthiness certificate. The inspection report reflects observations made at the time of inspection only and does not account for latent, hidden, internal or subsequently developed defects.",
      "No Warranty or Guarantee: SoulCars makes no warranty, representation or guarantee — express or implied — regarding the accuracy, completeness or fitness for purpose of any inspection report. The inspection report is provided for general informational purposes only and shall not be relied upon as a substitute for an independent qualified mechanical inspection. Buyers are strongly advised to conduct their own independent technical assessment before committing to any purchase.",
      "No Post-Purchase Liability: SoulCars shall not be held liable for any defect, condition, mechanical failure, structural issue, latent fault, accident history, title issue or any other matter relating to the vehicle that is discovered or arises after the date of purchase, whether or not such matter was observed, noted, missed or omitted in the inspection report. The Buyer's decision to proceed with any purchase following an inspection is made solely at the Buyer's own risk and judgement.",
      "Report Ownership and Distribution: The inspection report shall be shared with both the Buyer and the Seller. SoulCars retains the right to use, reference or reproduce the inspection report for its own Platform and facilitation purposes. Neither party may reproduce, publish or commercially exploit the inspection report without SoulCars' prior written consent.",
      "Cancellation: Where an inspection appointment is confirmed and the requesting party cancels or fails to present the vehicle within 24 hours of the scheduled appointment without reasonable cause, the inspection fee shall remain payable in full. SoulCars may reschedule at its discretion.",
      "Limitation of Liability: SoulCars' total liability arising from or in connection with the Inspection Service shall in no event exceed the inspection fee of PKR 10,000 actually received from the requesting party for the relevant inspection.",
    ],
  },
  {
    title: "15. Final Acknowledgement",
    bullets: [
      "I have read, understood and agreed to these Terms in full.",
      "I shall remain bound by these Terms in respect of any Platform-facilitated or Materially Connected transaction.",
      "I shall pay the applicable 2% commission to SoulCars upon Successful Sale, before or at the time of vehicle handover.",
      "I shall first attempt mediation in accordance with Clause 11 in case of any dispute.",
      "I shall not circumvent SoulCars or deny commission where the transaction is Materially Connected with SoulCars' introduction or facilitation within the 12-month window.",
      "Where I have requested the SoulCars Inspection Service, I acknowledge that the inspection fee of PKR 10,000 is payable regardless of whether I proceed with any purchase, and that SoulCars bears no post-purchase liability arising from the inspection report.",
      "My acceptance may be evidenced electronically and/or by conduct; no wet-ink signature is required for these Platform Terms.",
    ],
  },
];

interface TermsGateProps {
  onAgree: () => void;
  onDecline: () => void;
}

// Blocking terms-and-conditions dialog. The user must scroll to the bottom of
// the terms before the "I have read…" checkbox unlocks, and tick it before
// "Agree & Continue" unlocks.
export function TermsGate({ onAgree, onDecline }: TermsGateProps) {
  const [scrolledToEnd, setScrolledToEnd] = useState(false);
  const [checked, setChecked] = useState(false);
  // The portal can only render in the browser — document doesn't exist during
  // SSR, and this component mounts with the page (not on user interaction).
  const [mounted, setMounted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  // If the list is short enough to fit without scrolling, unlock immediately.
  useEffect(() => {
    if (!mounted) return;
    const el = scrollRef.current;
    if (el && el.scrollHeight <= el.clientHeight + 8) setScrolledToEnd(true);
  }, [mounted]);

  // Lock the page behind the dialog.
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 8) setScrolledToEnd(true);
  };

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/40 backdrop-blur-sm">
      <div className="bg-background border border-border w-full max-w-lg relative max-h-[90dvh] flex flex-col">
        <button
          onClick={onDecline}
          aria-label="Close"
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="p-6 sm:p-8 pb-0">
          <div className="eyebrow mb-2">Before you continue</div>
          <h2 className="font-serif text-2xl">Platform Terms &amp; Conditions</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Please read through to the end, then confirm to continue.
          </p>
        </div>

        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="mt-5 mx-6 sm:mx-8 border border-border overflow-y-auto flex-1 min-h-32 max-h-[45dvh] p-5 space-y-5 text-sm leading-relaxed text-foreground/90"
        >
          <p>{INTRO}</p>
          {SECTIONS.map((s) => (
            <div key={s.title} className="space-y-2">
              <h3 className="font-medium text-foreground">{s.title}</h3>
              {s.paras?.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
              {s.bullets && (
                <ul className="list-disc pl-5 space-y-1.5">
                  {s.bullets.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
          <p className="text-muted-foreground">
            For queries, invoices or Platform-related communications, contact SoulCars through
            SoulCars.pk or the official communication channel used for the relevant transaction. ©
            2026 SoulCars.pk. All rights reserved.
          </p>
        </div>

        {!scrolledToEnd && (
          <p className="mx-6 sm:mx-8 mt-2 text-xs text-muted-foreground">
            Scroll to the end of the terms to continue ↓
          </p>
        )}

        <div className="p-6 sm:p-8 pt-4 space-y-4">
          <label
            className={`flex items-start gap-3 text-sm select-none ${
              scrolledToEnd ? "cursor-pointer" : "opacity-40 cursor-not-allowed"
            }`}
          >
            <input
              type="checkbox"
              disabled={!scrolledToEnd}
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-current"
            />
            <span>I have read and understood the terms &amp; conditions.</span>
          </label>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={onDecline} type="button">
              Cancel
            </Button>
            <Button
              className="flex-1 disabled:opacity-40 disabled:cursor-not-allowed"
              disabled={!checked}
              onClick={onAgree}
              type="button"
            >
              Agree &amp; Continue
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
