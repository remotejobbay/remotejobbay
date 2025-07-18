'use client';

import { useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface Props {
  email: string;
  jobId: number; // ✅ changed from string to number
  onSuccess: (reference: string) => void;
  onClose: () => void;
}

export default function PaystackInlineButton({
  email,
  jobId,
  onSuccess,
  onClose,
}: Props) {
  /* ── Keys & refs ─────────────────────────────────────── */
  const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_KEY!;
  const reference = `job_${jobId}_${uuidv4()}`;

  /* ── Load Paystack script once ───────────────────────── */
  useEffect(() => {
    const id = 'paystack-inline-js';
    if (!document.getElementById(id)) {
      const s = document.createElement('script');
      s.id = id;
      s.src = 'https://js.paystack.co/v1/inline.js';
      s.async = true;
      document.body.appendChild(s);
    }
  }, []);

  /* ── Trigger payment ─────────────────────────────────── */
  const pay = () => {
    // @ts-ignore PaystackPop global provided by script
    const handler = window.PaystackPop.setup({
      key: publicKey,
      email,
      amount: 150000, // ₵1 500 in pesewas (≈ $100)
      currency: 'GHS',
      reference,
      metadata: { jobId },
      callback: (resp: any) => onSuccess(resp.reference),
      onClose,
    });
    handler.openIframe();
  };

  return (
    <button
      onClick={pay}
      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow transition-colors"
    >
      Pay $100
    </button>
  );
}
