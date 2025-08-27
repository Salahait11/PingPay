/**
 * Used by: /dashboard/admin/users (Admin Users Management page)
 * Admin Users List API
 *
 * Endpoint:
 *   GET /api/dashboard/admin/users
 *
 * Description:
 *   Returns a paginated list of users for admin management, with filters for KYC, status, and search.
 *   Uses the Supabase function 'get_admin_users'.
 *
 * Query parameters:
 *   filter_kyc: string      // KYC filter (e.g. 'all', 'basic', 'full', 'business', 'unverified')
 *   filter_status: string   // Status filter (e.g. 'all', 'active', 'suspended', 'pending')
 *   page_limit: number      // Number of users per page (default: 20)
 *   page_offset: number     // Offset for pagination (default: 0)
 *   search_term: string     // Search term for user name, email, etc.
 *
 * Example:
 *   /api/dashboard/admin/users?filter_kyc=full&filter_status=active&page_limit=10&page_offset=0&search_term=john
 *
 * Response (200 OK):
 *   {
 *     data: [
 *       {
 *         id: "uuid-1",
 *         full_name: "John Doe",
 *         email: "john@example.com",
 *         kyc_level: "full",
 *         status: "active",
 *         ...other user fields
 *       },
 *       // ...more users
 *     ]
 *   }
 *
 * Error response (400/500):
 *   {
 *     error: "Error message"
 *   }
 *
 * Notes:
 *   - All query parameters are optional; defaults are used if missing.
 *   - Pagination is controlled by page_limit and page_offset.
 *   - If no users match, data will be an empty array.
 *   - If the Supabase function fails, an error message will be returned.
 *
 * Frontend usage example (fetch):
 *   await fetch('/api/dashboard/admin/users?filter_kyc=full&filter_status=active&page_limit=10&page_offset=0&search_term=john');
 */

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
