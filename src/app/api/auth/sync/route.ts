import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { uniauth_id, email, nickname, avatar_url } = body;

    if (!uniauth_id) {
      return NextResponse.json({ error: 'Missing uniauth_id' }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();
    
    // Call our custom PostgreSQL function to upsert the user and return the role
    const { data: role, error } = await supabase.rpc('sync_reporthub_user', {
      p_uniauth_id: uniauth_id,
      p_email: email || '',
      p_nickname: nickname || '',
      p_avatar_url: avatar_url || '',
    });

    if (error) {
      console.error('Error syncing user:', error);
      return NextResponse.json({ error: 'Failed to sync user' }, { status: 500 });
    }

    // Role will be returned as text (e.g. 'pending', 'admin', 'viewer')
    return NextResponse.json({ role });
  } catch (error) {
    console.error('API sync error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
