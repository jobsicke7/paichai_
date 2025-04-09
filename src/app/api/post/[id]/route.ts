import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {

  const { data, error } = await supabase
    .from('posts')
    .select(`
      id,
      title,
      content,
      created_at,
      banner_url,
      tags,
      profiles (
        name,
        avatar_url
      )
    `)
    .eq('id', (await params).id)
    .single()

  if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json(data)
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { data: session } = await supabase.auth.getUser()

  const body = await req.json()
  const { title, content, banner_url, tags } = body

  const { error } = await supabase
    .from('posts')
    .update({ title, content, banner_url, tags })
    .eq('id', (await params).id)
    .eq('author', session.user?.id)

  if (error) return NextResponse.json({ error }, { status: 500 })

  return NextResponse.json({ ok: true })
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { data: session } = await supabase.auth.getUser()

  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', (await params).id)

  if (error) return NextResponse.json({ error }, { status: 500 })

  return NextResponse.json({ ok: true })
}
