'use client';

import { useEffect } from 'react';

interface Props {
  email: string;
  jobId: number;
  onSuccess: () => void;
  onClose: () => void;
}

export default function PaystackInlineButton({ email, jobId, onSuccess, onClose }: Props) {
  const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_KEY!;
  const reference = `job_${jobId}_${Date.now()}`;

  useEffect(() => {
    const id = 'paystack-inline-js';
    if (!document.getElementById(id)) {
      const s = document.createElement('script');
      s.id = id;
      s.src = 'https://js.paystack.co/v2/inline.js';
      s.async = true;
      document.body.appendChild(s);
    }
  }, []);

  const pay = () => {
    // @ts-ignore
    const ps = window.PaystackPop?.setup({
      key: publicKey,
      email,
      amount: 150000,      // 💰 1 500 GHS in pesewas (= $100 approx)
      currency: 'GHS',     // must be GHS for Ghana merchant
      reference,
      metadata: { jobId },
      callback: onSuccess,
      onClose,
    });
    ps?.openIframe();
  };

  return (
    <button
      onClick={pay}
      className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-md shadow"
    >
      Pay $100 (GHS 1 500)
    </button>
  );
}
