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
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ error: 'Email required' }, { status: 400 });
  }

  // ✅ 1. Check if email already exists
  const { data: existing, error: fetchError } = await supabase
    .from('emails')
    .select('id')
    .eq('email', email)
    .single();

  if (existing) {
    return NextResponse.json({ message: 'Already subscribed' }); // silent success
  }

  // ✅ 2. Insert new email
  const { error: insertError } = await supabase
    .from('emails')
    .insert([{ email }]);

  if (insertError) {
    console.error('Insert error:', insertError);
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
  }

  // ✅ 3. Send welcome email (but continue even if it fails)
  try {
    await resend.emails.send({
      from: 'RemoteJobBay <noreply@remotejobbay.com>',
      to: email,
      subject: 'Welcome to Remote Job Bay!',
      html: `
        <p>🎉 Thank you for subscribing to Remote Job Bay!</p>
        <p>We’ll send you great remote jobs you can apply to from anywhere.</p>
        <p>Visit <a href="https://www.remotejobbay.com">RemoteJobBay.com</a></p>
      `,
    });

    console.log(`✅ Welcome email sent to: ${email}`);
  } catch (emailError) {
    console.error('Welcome email send failed:', emailError);
  }

  return NextResponse.json({ message: 'Subscribed successfully' });
}
