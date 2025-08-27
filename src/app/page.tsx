"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Récupère le rôle depuis la table users
        let role = 'user';
        try {
          const { data } = await supabase
            .from('users')
            .select('role')
            .eq('id', session.user.id)
            .single();
          if (data && data.role) {
            role = data.role;
          }
        } catch {}
        if (role === 'admin') router.replace('/dashboard/admin');
        else if (role === 'business') router.replace('/dashboard/business');
        else router.replace('/dashboard/user');
      } else {
        router.replace('/login');
      }
    };
    checkSession();
  }, [router]);

  return null;
}