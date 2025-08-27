/**
 * Used by: /dashboard/admin (Admin Dashboard main page)
 * Dashboard Analytics API
 *
 * Endpoint:
 *   GET /api/dashboard/admin/analytics
 *
 * Description:
 *   Returns analytics data for the admin dashboard.
 *   Uses the Supabase function 'get_dashboard_analytics'.
 *
 * Query parameters:
 *   (none)
 *
 * Response (200 OK):
 *   {
 *     data: {
 *       // Analytics fields, e.g.
 *       total_users: number,
 *       total_volume: number,
 *       ...other analytics fields
 *     }
 *   }
 *
 * Error response (400/500):
 *   {
 *     error: "Error message"
 *   }
 *
 * Notes:
 *   - No query parameters are required.
 *   - If the Supabase function fails, an error message will be returned.
 *   - The response data structure depends on the analytics function output.
 *
 * Frontend usage example (fetch):
 *   await fetch('/api/dashboard/admin/analytics');
 */
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseServer';

export async function GET() {
  // Appel de la fonction Supabase
  const { data, error } = await supabase.rpc('get_dashboard_analytics');
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ data });
}
