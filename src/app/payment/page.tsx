'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase/supabaseClient';

export default function PaymentPage() {
  const router = useRouter();

  const handleFakePayment = async () => {
    const jobData = localStorage.getItem("pendingJob");
    if (!jobData) {
      alert("No job data found.");
      return;
    }

    const job = JSON.parse(jobData);

    // Simulate payment success (replace with real Paystack/Stripe later)
    const { error } = await supabase.from("jobs").insert([job]);

    if (error) {
      alert("Error saving job.");
      return;
    }

    localStorage.removeItem("pendingJob");
    alert("Payment successful! Job posted.");
    router.push("/");
  };

  useEffect(() => {
    // In real setup, trigger Paystack or Stripe here
    handleFakePayment();
  }, []);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center">
      <h1 className="text-2xl font-bold mb-4">Processing Payment...</h1>
      <p>Please wait, posting your job.</p>
    </div>
  );
}
