import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabase } from '@/utils/supabase/supabaseClient';

export async function POST(req: NextRequest) {
  /* ── 1. Read raw body for HMAC ── */
  const rawBody   = await req.text();
  const signature = req.headers.get('x-paystack-signature');
  const secret    = process.env.PAYSTACK_SECRET_KEY!;   // sk_test_… in dev, sk_live_… in prod

  /* ── 2. Verify signature ── */
  const hash = crypto.createHmac('sha512', secret).update(rawBody).digest('hex');
  if (hash !== signature) {
    return NextResponse.json({ ok: false, message: 'Invalid signature' }, { status: 401 });
  }

  /* ── 3. Parse event ── */
  const event = JSON.parse(rawBody);

  if (event.event === 'charge.success' && event.data.status === 'success') {
    const reference = event.data.reference as string;
    const jobId     = event.data.metadata?.jobId as number | undefined;

    if (!jobId) {
      console.warn('Webhook received without jobId metadata');
      return NextResponse.json({ ok: true, warning: 'No jobId' });
    }

    /* ── 4. Publish the job in Supabase ── */
    const { error } = await supabase
      .from('jobs')
      .update({ published: true, paymentRef: reference })
      .eq('id', jobId);

    if (error) {
      console.error('Supabase update error:', error);
      return NextResponse.json({ ok: false }, { status: 500 });
    }

    return NextResponse.json({ received: true });
  }

  return NextResponse.json({ ok: true });
}
