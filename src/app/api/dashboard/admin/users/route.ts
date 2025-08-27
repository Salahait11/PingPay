
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseServer';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const filter_kyc = searchParams.get('filter_kyc') || '';
  const filter_status = searchParams.get('filter_status') || '';
  const page_limit = Number(searchParams.get('page_limit')) || 20;
  const page_offset = Number(searchParams.get('page_offset')) || 0;
  const search_term = searchParams.get('search_term') || '';

  const { data, error } = await supabase.rpc('get_admin_users', {
    filter_kyc,
    filter_status,
    page_limit,
    page_offset,
    search_term
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ data });
}
