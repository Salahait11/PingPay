import React, { useState } from 'react';
import { Bell, Search, Settings, User, LogOut, Menu, X, ChevronDown, Home, Shield } from "lucide-react";
import { supabase } from '@/lib/supabase'; // Assurez-vous que ce chemin est correct

interface UserInfo {
  full_name?: string;
  email?: string;
  role?: string;
}

interface HeaderProps {
  userInfo?: UserInfo;
  onToggleSidebar?: () => void; // Prop pour contrôler la sidebar sur mobile
  isSidebarOpen?: boolean; // Pour savoir quelle icône afficher (Menu ou X)
}

const Header: React.FC<HeaderProps> = ({ userInfo, onToggleSidebar, isSidebarOpen }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Notifications : à connecter à une API réelle si besoin
  const notifications = [];
  const unreadCount = 0;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Search:", searchTerm);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await supabase.auth.signOut();
    window.location.href = '/login'; // Redirige vers la page de connexion
  };

  return (
    <header className="bg-white sticky top-0 z-30 shadow-sm flex-shrink-0">
      {isLoggingOut && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-[100] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
        </div>
      )}
      <div className="flex items-center justify-between px-6 h-16">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleSidebar} // Action pour ouvrir/fermer la sidebar
            className="lg:hidden p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Toggle sidebar menu"
          >
            {isSidebarOpen ? <X className="w-5 h-5 text-gray-800" /> : <Menu className="w-5 h-5 text-gray-800" />}
          </button>

          {/* Desktop Search */}
          <div className="hidden lg:flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
                className="pl-9 pr-4 py-2 w-80 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition-all text-sm h-10"
                style={{ borderColor: isSearchFocused ? "#000000" : "#E5E7EB" }}
              />
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Quick Actions */}
          <div className="hidden lg:flex items-center gap-1">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Dashboard"><Home className="w-5 h-5 text-gray-800" /></button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="User Management"><User className="w-5 h-5 text-gray-800" /></button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Security Center"><Shield className="w-5 h-5 text-gray-800" /></button>
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5 text-gray-800" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs font-medium rounded-full flex items-center justify-center animate-pulse" >
                  {unreadCount}
                </span>
              )}
            </button>
            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white border rounded-lg shadow-xl z-50">
                <div className="p-3 border-b"><h3 className="font-medium text-gray-800">Notifications</h3></div>
                <div className="max-h-80 overflow-y-auto p-4 text-gray-500 text-sm">Aucune notification</div>
                <div className="p-2 border-t"><button className="w-full text-center font-medium text-sm text-black hover:text-blue-600">View all</button></div>
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-3 p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white font-medium text-sm">
                {userInfo?.full_name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-800">{userInfo?.full_name || 'User'}</p>
                <p className="text-xs text-gray-500">{userInfo?.email}</p>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${isProfileOpen ? "rotate-180" : ""}`} />
            </button>
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white border rounded-lg shadow-xl z-50">
                <div className="p-4 border-b">
                  <p className="font-medium text-gray-800">{userInfo?.full_name}</p>
                  <p className="text-sm text-gray-500">{userInfo?.email}</p>
                </div>
                <div className="p-2">
                  <button className="w-full flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg text-left"><User className="w-4 h-4 text-gray-600" /><span>Profile</span></button>
                  <button className="w-full flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg text-left"><Settings className="w-4 h-4 text-gray-600" /><span>Settings</span></button>
                </div>
                <div className="p-2 border-t">
                  <button onClick={handleLogout} className="w-full flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg text-left">
                    <LogOut className="w-4 h-4 text-gray-600" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;