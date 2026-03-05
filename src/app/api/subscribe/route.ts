// src/app/api/subscribe/route.ts

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';

  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
  }

  const { data: existing } = await supabase
    .from('emails')
    .select('id')
    .eq('email', email)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ message: 'Already subscribed' });
  }

  const { error: insertError } = await supabase
    .from('emails')
    .insert([{ email }]);

  if (insertError) {
    console.error('Insert error:', insertError);
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
  }

  try {
    await resend.emails.send({
      from: 'RemoteJobBay <noreply@remotejobbay.com>',
      to: email,
      subject: 'Welcome to Remote Job Bay!',
      html: `
        <p>Thank you for subscribing to Remote Job Bay.</p>
        <p>We will send you high-quality remote job updates.</p>
        <p>Visit <a href="https://www.remotejobbay.com">RemoteJobBay.com</a></p>
      `,
    });
  } catch (emailError) {
    console.error('Welcome email send failed:', emailError);
  }

  return NextResponse.json({ message: 'Subscribed successfully' });
}
