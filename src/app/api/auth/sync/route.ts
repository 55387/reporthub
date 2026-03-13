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

    // Log user access
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ipAddress = forwardedFor ? forwardedFor.split(',')[0].trim() : request.headers.get('x-real-ip');
    const userAgent = request.headers.get('user-agent');

    const action = role === 'banned' ? 'access_denied_banned' : (role === 'pending' ? 'access_denied_pending' : 'login_success');

    const { error: logError } = await supabase.rpc('log_user_access', {
      p_uniauth_id: uniauth_id,
      p_action: action,
      p_ip_address: ipAddress || null,
      p_user_agent: userAgent || null,
    });

    if (logError) {
      console.error('Error logging user access:', logError);
      // We don't fail the sync request if logging fails
    }

    // Role will be returned as text (e.g. 'pending', 'admin', 'viewer')
    return NextResponse.json({ role });
  } catch (error) {
    console.error('API sync error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
