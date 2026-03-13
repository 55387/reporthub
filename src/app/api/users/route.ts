import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const callerId = searchParams.get('callerId');

  if (!callerId) {
    return NextResponse.json({ error: 'Missing callerId' }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();
  const { data: users, error } = await supabase
    .rpc('get_all_reporthub_users', { p_caller_id: callerId });

  if (error) {
    console.error('users fetch error:', error);
    if (error.message?.includes('Forbidden')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Failed to query users' }, { status: 500 });
  }

  return NextResponse.json(users);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { callerId, targetId, newRole } = body;

    if (!callerId || !targetId || !newRole) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();
    const { error } = await supabase
      .rpc('update_reporthub_user_role', { 
        p_caller_id: callerId, 
        p_target_id: targetId, 
        p_new_role: newRole 
      });

    if (error) {
      console.error('user update error:', error);
      if (error.message?.includes('Forbidden')) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      return NextResponse.json({ error: 'Failed to update role' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
