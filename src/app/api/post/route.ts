import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '10');
  
  // 페이지네이션 계산
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabase
    .from('posts')
    .select(`
      id,
      title,
      content,
      banner_url,
      created_at,
      tags,
      author:profiles!fk_author(name, avatar_url)
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) return NextResponse.json({ error }, { status: 500 })

  return NextResponse.json({
    data,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil((count || 0) / limit),
      totalItems: count
    }
  })
}

export async function POST(req: Request) {
  const { data: session } = await supabase.auth.getUser()
  
  if (!session.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const body = await req.json()

  const { title, content, banner_url, tags } = body

  if (!title || !content) {
    return NextResponse.json({ error: "Title and content are required" }, { status: 400 })
  }

  const { data, error } = await supabase.from('posts').insert({
    title,
    content,
    banner_url,
    tags: Array.isArray(tags) ? tags : [],
    author: session.user.id,
  }).select();

  if (error) return NextResponse.json({ error }, { status: 500 })

  return NextResponse.json(data, { status: 201 })
}