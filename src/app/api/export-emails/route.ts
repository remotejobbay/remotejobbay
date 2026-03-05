// src/app/api/export-emails/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization');
  const secret = process.env.EXPORT_SECRET_TOKEN;

  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('emails')
    .select('email, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }

  const rows = data ?? [];
  const csvLines = ['email,created_at', ...rows.map((row) => `${row.email},${row.created_at ?? ''}`)];
  const csv = csvLines.join('\n');

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename=subscribers.csv',
    },
  });
}
