import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseServer';

export async function POST(request: Request) {
  const { action, userIds } = await request.json();
  const { data, error } = await supabase.rpc('admin_user_action', { action, user_ids: userIds });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ data });
}
