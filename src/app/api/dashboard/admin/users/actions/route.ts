/**
 * Used by: /dashboard/admin/users (Admin Users Management page)
 * Admin User Actions API
 *
 * Endpoint:
 *   POST /api/dashboard/admin/users/actions
 *
 * Description:
 *   Allows an admin to activate or suspend multiple users in bulk.
 *   The action is performed using a Supabase database function.
 *
 * Request body (JSON):
 *   {
 *     action: "activate" | "suspend", // The action to perform
 *     user_ids: string[]                // Array of user UUIDs to update
 *   }
 *
 * Example:
 *   {
 *     "action": "activate",
 *     "user_ids": ["uuid-1", "uuid-2", "uuid-3"]
 *   }
 *
 * Response (200 OK):
 *   {
 *     data: [
 *       {
 *         id: "uuid-1",
 *         full_name: "John Doe",
 *         email: "john@example.com",
 *         status: "active",
 *         ...other user fields
 *       },
 *       // ...more users
 *     ]
 *   }
 *
 * Error response (400/500):
 *   {
 *     error: "Invalid action" // or other error message
 *   }
 *
 * Notes:
 *   - Only "activate" and "suspend" actions are supported.
 *   - The user_ids array must contain valid UUIDs matching users in the database.
 *   - If no users are found, the response data will be an empty array.
 *   - If the Supabase function fails, an error message will be returned.
 *
 * Frontend usage example (fetch):
 *   await fetch('/api/dashboard/admin/users/actions', {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify({ action: 'activate', user_ids: ['uuid-1', 'uuid-2'] })
 *   });
 */
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseServer';

export async function POST(request: Request) {
  const { action, user_ids } = await request.json();
  const { data, error } = await supabase.rpc('admin_user_action', { action, user_ids });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ data });
}
