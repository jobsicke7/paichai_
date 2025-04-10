// app/api/build-info/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  const { data, error } = await supabase
    .from('build_info')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) return NextResponse.json({ error }, { status: 500 });

  return NextResponse.json(data);
}
