// Ce composant doit s'exécuter côté client pour les hooks de base et les animations.
"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Import de toutes les icônes nécessaires
import { 
  LayoutDashboard, Users, CreditCard, BarChart3, Settings, Server, Shield, HelpCircle, 
  ChevronRight, TrendingUp, Database, UserCheck, Activity, AlertTriangle, FileText, 
  Bell, Upload, CheckCircle, Building2, User, LogOut, X 
} from "lucide-react";

// Interfaces TypeScript pour la structure des données
interface UserInfo {
  full_name?: string;
  email?: string;
  role?: string;
}

interface MenuItemChild {
  title: string;
  href: string;
  badge?: string;
}

interface MenuItem {
  id: string;
  title: string;
  icon: React.ElementType;
  href?: string;
  expandable?: boolean;
  badge?: string;
  children?: MenuItemChild[];
}

// Props pour le composant Sidebar
interface VisualSidebarProps {
  isOpen: boolean;
  onClose: () => void; // onClose est conservé pour la vue mobile
  userInfo?: UserInfo; // Reçoit les informations de l'utilisateur
}

const VisualSidebar: React.FC<VisualSidebarProps> = ({ isOpen, onClose, userInfo }) => {
  const userRole = userInfo?.role || 'user';
  const pathname = usePathname();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Cette fonction retourne les éléments de menu corrects basés sur le rôle
  // C'est la seule logique nécessaire : déterminer QUOI afficher.
  const getMenuItems = useCallback((): MenuItem[] => {
    // --- MENU ADMIN ---
    if (userRole === 'admin') {
      return [
        { id: "dashboard", title: "Dashboard", icon: LayoutDashboard, href: "/dashboard/admin" },
        { id: "users", title: "Users", icon: Users, href: "/dashboard/admin/users" },
        { id: "transactions", title: "Transactions", icon: CreditCard, href: "/dashboard/admin/transactions" },
        { id: "financial", title: "Financial", icon: TrendingUp, href: "/dashboard/admin/financial" },
        { id: "analytics", title: "Analytics", icon: BarChart3, href: "/dashboard/admin/analytics" },
        { id: "system", title: "System", icon: Server, href: "/dashboard/admin/system" },
        { id: "settings", title: "Settings", icon: Settings, href: "/dashboard/admin/settings" },
        { id: "help", title: "Help", icon: HelpCircle, href: "/dashboard/admin/help" },
      ];
    }
    // --- MENU BUSINESS ---
    else if (userRole === 'business') {
      return [
        { id: "dashboard", title: "Dashboard", icon: LayoutDashboard, href: "/dashboard/business" },
        { id: "team", title: "Team Management", icon: Users, expandable: true, children: [ /* ... */ ], href: "/dashboard/business/team" },
        { id: "transactions", title: "Corporate Transactions", icon: CreditCard, expandable: true, children: [ /* ... */ ], href: "/dashboard/business/transactions" },
        { id: "approvals", title: "Approval Workflow", icon: CheckCircle, href: "/dashboard/business/approvals" },
        { id: "analytics", title: "Financial Analytics", icon: BarChart3, expandable: true, children: [ /* ... */ ], href: "/dashboard/business/analytics" },
        { id: "settings", title: "Business Settings", icon: Settings, href: "/dashboard/business/settings" },
      ];
    }
    // --- MENU UTILISATEUR PAR DÉFAUT ---
    else {
      return [
        { id: "dashboard", title: "Dashboard", icon: LayoutDashboard, href: "/dashboard/user" },
        { id: "transactions", title: "Transactions", icon: CreditCard, href: "/dashboard/user/transactions" },
        { id: "profile", title: "Profile", icon: User, href: "/dashboard/user/profile" },
        { id: "payment-methods", title: "Payment Methods", icon: CreditCard, href: "/dashboard/user/payment-methods" },
        { id: "notifications", title: "Notifications", icon: Bell, href: "/dashboard/user/notifications" },
        { id: "settings", title: "Settings", icon: Settings, href: "/dashboard/user/settings" },
      ];
    }
  }, [userRole]);

  const menuItems = getMenuItems();

  return (
    <>
      {/* Superposition pour la vue mobile */}
      <div className={`fixed inset-0 bg-black/20 z-40 lg:hidden ${isOpen ? 'block' : 'hidden'}`} onClick={onClose} />
      
      {/* Barre Latérale */}
      <aside
        className={`fixed top-0 left-0 h-screen w-72 bg-white border-r z-50 transform transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:relative lg:translate-x-0 lg:z-auto lg:sticky`}
        style={{ borderColor: "rgba(171, 184, 223, 0.3)" }}
      >
        <div className="flex flex-col h-full">
          {/* Section Logo */}
          <div className="px-4 h-24 flex-shrink-0 flex flex-col justify-center">
            <div className="flex flex-col items-start gap-2">
<Image
                 src="/pingpay-logo-small-Black-Transparent.png"
                 alt="PingPay Logo"
                 width={112}
                 height={112}
                 className="object-contain"
                 priority
               />
                <p className="text-xs text-black font-semibold" style={{marginLeft: '4px'}}>
                {userRole === 'admin' && 'Admin Dashboard'}
                {userRole === 'business' && 'Business Dashboard'}
                {userRole === 'user' && 'User Dashboard'}
              </p>
            </div>
          </div>

          {/* Navigation (Statique) */}
          <nav className="flex-1 p-4 space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.id}
                  href={item.href!}
                  className={`w-full flex items-center justify-between p-3 rounded-lg text-left cursor-pointer transition-colors ${isActive ? 'bg-black text-white font-bold' : 'bg-white text-black'}`}
                  style={isActive ? { boxShadow: '0 0 0 2px #000' } : {}}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-5 h-5" />
                    <span>{item.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.expandable && (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Pied de page (Statique) */}
          <div className="p-4 border-t" style={{ borderColor: "rgba(171, 184, 223, 0.3)" }}>
            {userRole === 'admin' ? (
              // Pied de page spécial pour les Admins
              <div>
                <div className="rounded-lg p-4 border mb-3" style={{ borderColor: "#000000" }}>
                  <div className="flex items-center gap-3 mb-2"><Shield className="w-4 h-4 text-black" /> <p className="text-sm font-medium text-black">System Status</p></div>
                  <p className="text-xs text-green-600">All systems operational</p>
                </div>
                <button
                  className="w-full flex items-center justify-center gap-2 p-3 text-sm font-medium rounded-lg border border-black text-black hover:bg-red-50 hover:text-red-700 transition"
                  onClick={async () => {
                    setIsLoggingOut(true);
                    await supabase.auth.signOut();
                    window.location.href = '/';
                  }}
                  disabled={isLoggingOut}
                >
                  <LogOut className="w-4 h-4" /><span>Emergency Logout</span>
                </button>
              </div>
            ) : (
              // Pied de page standard pour Business et Utilisateur
              <div>
                <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-black truncate">{userInfo?.full_name || 'User Name'}</p>
                  <p className="text-xs text-gray-500 capitalize">{userInfo?.role}</p>
                </div>
                <button
                  className="w-full flex items-center justify-center gap-2 p-3 text-sm font-medium rounded-lg border border-black text-black hover:bg-red-50 hover:text-red-700 transition"
                  onClick={async () => {
                    setIsLoggingOut(true);
                    await supabase.auth.signOut();
                    window.location.href = '/login';
                  }}
                  disabled={isLoggingOut}
                >
                  <LogOut className="w-4 h-4" /><span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      {isLoggingOut && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-[100] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
        </div>
      )}
      </aside>
    </>
  );
};

export default VisualSidebar;