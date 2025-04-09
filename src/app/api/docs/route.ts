import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
    const type = request.nextUrl.searchParams.get('type');

    if (!type || !['privacy', 'terms'].includes(type)) {
        return NextResponse.json({ error: 'Invalid document type' }, { status: 400 });
    }

    try {
        const { data, error } = await supabase
            .from('docs')
            .select('*')
            .eq('type', type)
            .single();

        console.log(`GET request for ${type} document:`, data ? 'Found' : 'Not found');

        if (error || !data) {
            return NextResponse.json({ content: '' }, { status: 200 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Failed to fetch document:', error);
        return NextResponse.json({ error: 'Failed to fetch document' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const { type, content, password } = await request.json();

        if (!type || !content || !password) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const correctPassword = process.env.ADMIN_PASSWORD || 'pw';
        if (password !== correctPassword) {
            return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
        }

        const { data: existing, error: fetchError } = await supabase
            .from('docs')
            .select('*')
            .eq('type', type)
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
            console.error('Error checking existing document:', fetchError);
            return NextResponse.json({ error: 'Failed to check existing document' }, { status: 500 });
        }

        let response;
        if (existing) {
            const { data, error } = await supabase
                .from('docs')
                .update({
                    content,
                    updated_at: new Date().toISOString()
                })
                .eq('type', type)
                .select();

            if (error) throw error;

            response = {
                success: true,
                message: `${type === 'privacy' ? '개인정보처리방침' : '이용약관'}이 수정되었습니다.`
            };
        } else {
            const { data, error } = await supabase
                .from('docs')
                .insert({
                    type,
                    content,
                    updated_at: new Date().toISOString()
                })
                .select();

            if (error) throw error;

            response = {
                success: true,
                message: `${type === 'privacy' ? '개인정보처리방침' : '이용약관'}이 새로 추가되었습니다.`
            };
        }

        return NextResponse.json(response);
    } catch (error) {
        console.error('Failed to save document:', error);
        return NextResponse.json({ error: 'Failed to save document' }, { status: 500 });
    }
}
