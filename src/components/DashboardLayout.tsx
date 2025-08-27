"use client";

import React, { useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';

import Header from './Header';
import Sidebar from './Sidebar';

interface UserInfo {
  full_name?: string;
  email?: string;
  role?: string;
}

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [userInfo, setUserInfo] = useState<UserInfo | undefined>();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const fetchUserData = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (session?.user) {
        const user = session.user;
        let role = 'user';
        try {
          const { data } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single();
          if (data && data.role) {
            role = data.role;
          }
        } catch {}
        setUserInfo({
          full_name: user.user_metadata?.full_name,
          email: user.email,
          role: role
        });
      } else {
        setUserInfo(undefined);
      }
      setLoading(false);
    };

    fetchUserData();

    let lastUserId: string | undefined = undefined;
    const authSubscription = supabase.auth.onAuthStateChange(async (_event, session) => {
      const user = session?.user;
      // Ne lance le loader que si le user change vraiment
      if (user?.id !== lastUserId) {
        setLoading(true);
        lastUserId = user?.id;
        if (user) {
          let role = 'user';
          try {
            const { data } = await supabase
              .from('users')
              .select('role')
              .eq('id', user.id)
              .single();
            if (data && data.role) {
              role = data.role;
            }
          } catch {}
          setUserInfo({
            full_name: user.user_metadata?.full_name,
            email: user.email,
            role: role
          });
        } else {
          setUserInfo(undefined);
        }
        setLoading(false);
      }
    });

    return () => {
      if (authSubscription && authSubscription.data && authSubscription.data.subscription) {
        authSubscription.data.subscription.unsubscribe();
      }
    };
  }, []);

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar 
        userInfo={userInfo} 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
      <div className="flex-1 flex flex-col">
        <Header 
          userInfo={userInfo} 
          onToggleSidebar={handleToggleSidebar}
          isSidebarOpen={isSidebarOpen}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          {children ? (
            children
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <h1 className="text-3xl font-bold mb-4">Page non trouvée</h1>
              <p className="text-gray-500 mb-6">Cette page n&apos;existe pas ou n&apos;est pas accessible.</p>
              <a href="/dashboard" className="px-4 py-2 bg-black text-white rounded-lg">Retour au dashboard</a>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;