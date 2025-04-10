import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  const { sha, message } = await req.json();

  const { error } = await supabase.from('build_info').insert([
    { sha, message }
  ]);

  if (error) return NextResponse.json({ success: false, error }, { status: 500 });

  return NextResponse.json({ success: true });
}
