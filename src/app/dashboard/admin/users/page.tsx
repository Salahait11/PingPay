// Emplacement : src/app/admin/users/page.tsx

'use client'

import React, { useState, useEffect, useCallback } from 'react'
import FilterBar from '@/components/FilterBar'
import { useFilters } from '../../../../hooks/useFilters'
import { useRouter } from 'next/navigation'
import { formatNumber } from "@/lib/utils"
import { Users, MoreHorizontal, UserCheck, UserX, Trash2, Shield, CheckCircle, XCircle, Clock, Download, AlertTriangle, LogOut } from "lucide-react"

// Interface User
interface User { 
  id: string; 
  full_name: string; 
  email: string; 
  phone_number: string; 
  kyc_level: "unverified" | "basic" | "full" | "business"; 
  status: "active" | "suspended" | "pending"; 
  created_at: string; 
  last_login: string; 
  country: string; 
  phone: string; 
  total_transactions: number; 
  total_volume: number; 
}

// Confirmation modal model
interface ModalState { 
  isOpen: boolean; 
  title: string; 
  message: string; 
  onConfirm: () => void; 
  actionLabel?: string; 
}

// Confirmation modal component
const ConfirmationModal = ({ isOpen, title, message, onConfirm, onCancel, actionLabel = "Confirmer" }: ModalState & { onCancel: () => void }) => { 
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center" style={{ pointerEvents: 'auto' }}>
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50" style={{ zIndex: 0 }} />
      {/* Modal content */}
      <div className="relative bg-white rounded-lg p-6 shadow-xl w-full max-w-md z-10 flex flex-col items-center">
        <div className="sm:flex sm:items-start w-full">
          <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
            <AlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
          </div>
          <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
            <h3 className="text-lg leading-6 font-medium text-gray-900">{title}</h3>
            <div className="mt-2">
              <p className="text-sm text-gray-500">{message}</p>
            </div>
          </div>
        </div>
        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse w-full">
          <button type="button" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm" onClick={onConfirm}>
            {actionLabel}
          </button>
          <button type="button" className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default function UsersPage() {
  // TODO: Add authentication logic here if needed
  const currentUser = true;
  const authLoading = false;
  // TODO: Replace with your own logout logic
  const logout = () => { window.location.href = '/login'; };
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(20);
  const [modalState, setModalState] = useState<ModalState>({ isOpen: false, title: '', message: '', onConfirm: () => {} });
  const [loading, setLoading] = useState(true);

  // Simple local state for filters (replace with your own logic/UI)
  const {
    filters,
    updateFilters,
    updateSearch,
    applyFilter,
    resetFilters
  } = useFilters();

  // Strictly typed API user and response
  interface ApiUser {
    id: string;
    full_name: string;
    email: string;
    phone_number: string;
    kyc_level: "unverified" | "basic" | "full" | "business";
    status: "active" | "suspended" | "pending";
    created_at: string;
    last_login: string;
    country: string;
    total_transactions?: number;
    total_volume?: number;
  }

  interface UsersApiResponse {
    data: ApiUser[];
    count: number;
  }

  // Fonction optimisée pour récupérer les utilisateurs avec filtres côté serveur
  const fetchUsers = useCallback(async (filterState: typeof filters, page: number) => {
    if (!currentUser || authLoading) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        filter_kyc: filters.typeFilter || 'all',
        filter_status: filters.statusFilter || 'all',
        page_limit: String(usersPerPage),
        page_offset: String((page - 1) * usersPerPage),
        search_term: filters.searchTerm || ''
      });
      const response = await fetch(`/api/dashboard/admin/users?${params.toString()}`);
      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401) router.push('/login');
        throw new Error(errorData.error || 'Erreur lors de la récupération des utilisateurs');
      }
      const apiResp = await response.json();
      const usersData = Array.isArray(apiResp.data) ? apiResp.data : [];
      setUsers(usersData.map((u: ApiUser) => ({
        ...u,
        phone: u.phone_number,
        total_transactions: u.total_transactions ?? 0,
        total_volume: u.total_volume ?? 0
      })));
      setTotalUsers(usersData.length);
    } catch (error) {
      console.error("❌ Erreur dans fetchUsers:", error);
    } finally {
      setLoading(false);
    }
  }, [usersPerPage, router, currentUser, authLoading, filters]);

  // Effet unique pour charger les données
  useEffect(() => {
    console.log('🔄 useEffect triggered:', { 
      authLoading, 
      hasUser: !!currentUser, 
      currentPage,
      filters
    });
    
    if (!authLoading && currentUser) {
      fetchUsers(filters, currentPage);
    } else if (!authLoading && !currentUser) {
      console.log('🔄 Setting loading to false - no access');
      setLoading(false);
    }
  }, [fetchUsers, authLoading, currentUser, currentPage, filters]);

  // Effet pour forcer le rechargement quand l'utilisateur change
  useEffect(() => {
    if (currentUser && !authLoading) {
      console.log('🔄 User changed, refetching data...');
      fetchUsers(filters, currentPage);
    }
  }, [currentUser, authLoading, fetchUsers, currentPage, filters]);

  // Fonction pour changer de page
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    fetchUsers(filters, page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [filters, fetchUsers]);

  // Fonction pour rafraîchir les données

  // Fonction pour réinitialiser les filtres

  const executeAction = useCallback(async (action: "activate" | "suspend" | "delete", userIds: string[]) => {
    try {
      const response = await fetch('/api/dashboard/admin/users/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, user_ids: userIds })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Action failed`);
      }
      await fetchUsers(filters, currentPage);
      setSelectedUsers([]);
    } catch (error) {
      if (error instanceof Error) {
        alert(`Error: ${error.message}`);
      } else {
        alert('Unknown error');
      }
    } finally {
      setModalState({ isOpen: false, title: '', message: '', onConfirm: () => {} });
    }
  }, [fetchUsers, filters, currentPage]);

  const handleBulkAction = (action: "activate" | "suspend" | "delete") => {
    if (selectedUsers.length === 0) return;
    const userCount = selectedUsers.length;
    setModalState({
      isOpen: true,
      title: `Confirm action: ${action}`,
      message: `Are you sure you want to ${action} ${userCount} user(s)?`,
      actionLabel: action.charAt(0).toUpperCase() + action.slice(1),
      onConfirm: () => executeAction(action, selectedUsers)
    });
  };

  const handleUserAction = (userId: string, action: "activate" | "suspend" | "delete") => {
    setModalState({
      isOpen: true,
      title: `Confirm action: ${action}`,
      message: `Are you sure you want to ${action} this user?`,
      actionLabel: action.charAt(0).toUpperCase() + action.slice(1),
      onConfirm: () => executeAction(action, [userId])
    });
  };

  const getStatusIcon = (status: string) => { 
    switch (status) { 
      case "active": return <CheckCircle className="w-4 h-4 text-green-600" />; 
      case "suspended": return <XCircle className="w-4 h-4 text-red-600" />; 
      case "pending": return <Clock className="w-4 h-4 text-yellow-600" />; 
      default: return <XCircle className="w-4 h-4 text-slate-400" />; 
    }
  };
  
  const getKYCIcon = (kyc: string) => { 
    switch (kyc) { 
      case "business": return <Shield className="w-4 h-4 text-blue-600" />; 
      case "full": return <UserCheck className="w-4 h-4 text-green-600" />; 
      case "basic": return <Users className="w-4 h-4 text-yellow-600" />; 
      case "unverified": return <UserX className="w-4 h-4 text-red-600" />; 
      default: return <UserX className="w-4 h-4 text-slate-400" />; 
    }
  };
  
  const getStatusColor = (status: string) => { 
    switch (status) { 
      case "active": return { backgroundColor: "#D1FAE5", color: "#059669" }; 
      case "suspended": return { backgroundColor: "#FEE2E2", color: "#DC2626" }; 
      case "pending": return { backgroundColor: "#FEF3C7", color: "#D97706" }; 
      default: return { backgroundColor: "#F3F4F6", color: "#6B7280" }; 
    }
  };
  
  const getKYCColor = (kyc: string) => { 
    switch (kyc) { 
      case "business": return { backgroundColor: "#E0E7FF", color: "#3730A3" }; 
      case "full": return { backgroundColor: "#D1FAE5", color: "#059669" }; 
      case "basic": return { backgroundColor: "#FEF3C7", color: "#D97706" }; 
      case "unverified": return { backgroundColor: "#FEE2E2", color: "#DC2626" }; 
      default: return { backgroundColor: "#F3F4F6", color: "#6B7280" }; 
    }
  };
  
  const stats = { 
    total: totalUsers, 
    active: users.filter(u => u.status === "active").length, 
    pending: users.filter(u => u.status === "pending").length, 
    suspended: users.filter(u => u.status === "suspended").length, 
  };
  
  const handleExport = useCallback(() => { 
    alert('Export functionality would be implemented here'); 
  }, []);
  
  const totalPages = Math.ceil(totalUsers / usersPerPage);

  // Afficher le loading pendant l'authentification
  if (authLoading) {
    return (
      <div className="min-h-screen bg-white p-3 sm:p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p style={{ color: "#000000", fontFamily: "Inter, sans-serif" }}>Loading authentication...</p>
        </div>
      </div>
    );
  }

  // Removed legacy permission check UI (handled by layout or API)

  return (
    <>
      <ConfirmationModal {...modalState} onCancel={() => setModalState({ ...modalState, isOpen: false })}/>
      <div className="min-h-screen bg-white p-3 sm:p-6 space-y-4 sm:space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6">
          <div>
            <h1 className="text-lg sm:text-2xl font-medium mb-1 sm:mb-2" style={{ color: "#000000" }}>User Management</h1>
            <p className="text-xs sm:text-base" style={{ color: "#000000", fontFamily: "Inter, sans-serif" }}>Manage all registered users and their accounts</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button onClick={handleExport} className="flex items-center gap-2 p-2 sm:p-3 border rounded-lg transition-colors" style={{ borderColor: "#000000" }}>
              <Download className="w-4 h-4" style={{ color: "#000000" }} />
              <span className="text-sm font-medium" style={{ color: "#000000" }}>Export</span>
            </button>
            <button 
              onClick={async () => {
                if (window.confirm('Emergency logout? This will immediately sign you out.')) {
                  await logout()
                }
              }}
              className="flex items-center gap-2 p-2 sm:p-3 border rounded-lg transition-colors hover:bg-red-50" 
              style={{ borderColor: "#000000" }}
            >
              <LogOut className="w-4 h-4" style={{ color: "#000000" }} />
              <span className="text-sm font-medium" style={{ color: "#000000" }}>Emergency Logout</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          <div className="card p-3 sm:p-6">
            <div className="flex items-center justify-between mb-2 sm:mb-4">
              <div className="p-2 sm:p-3 border rounded-lg" style={{ borderColor: "#000000" }}>
                <Users className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: "#3B82F6", fill: "none", strokeWidth: "1.5" }} />
              </div>
            </div>
            <h3 className="text-xl sm:text-2xl font-medium mb-1" style={{ color: "#000000" }}>{formatNumber(stats.total)}</h3>
            <p style={{ color: "#000000", fontFamily: "Inter, sans-serif" }} className="text-xs sm:text-sm">Total Users</p>
          </div>
          <div className="card p-3 sm:p-6">
            <div className="flex items-center justify-between mb-2 sm:mb-4">
              <div className="p-2 sm:p-3 border rounded-lg" style={{ borderColor: "#000000" }}>
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: "#10B981", fill: "none", strokeWidth: "1.5" }} />
              </div>
              <div className="text-xs sm:text-sm font-medium" style={{ color: "#000000", fontFamily: "Inter, sans-serif" }}>Active</div>
            </div>
            <h3 className="text-xl sm:text-2xl font-medium mb-1" style={{ color: "#000000" }}>{formatNumber(stats.active)}</h3>
            <p style={{ color: "#000000", fontFamily: "Inter, sans-serif" }} className="text-xs sm:text-sm">Active Users</p>
          </div>
          <div className="card p-3 sm:p-6">
            <div className="flex items-center justify-between mb-2 sm:mb-4">
              <div className="p-2 sm:p-3 border rounded-lg" style={{ borderColor: "#000000" }}>
                <Clock className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: "#F59E0B", fill: "none", strokeWidth: "1.5" }} />
              </div>
              <div className="text-xs sm:text-sm font-medium" style={{ color: "#000000", fontFamily: "Inter, sans-serif" }}>Review</div>
            </div>
            <h3 className="text-xl sm:text-2xl font-medium mb-1" style={{ color: "#000000" }}>{formatNumber(stats.pending)}</h3>
            <p style={{ color: "#000000", fontFamily: "Inter, sans-serif" }} className="text-xs sm:text-sm">Pending KYC</p>
          </div>
          <div className="card p-3 sm:p-6">
            <div className="flex items-center justify-between mb-2 sm:mb-4">
              <div className="p-2 sm:p-3 border rounded-lg" style={{ borderColor: "#000000" }}>
                <XCircle className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: "#EF4444", fill: "none", strokeWidth: "1.5" }} />
              </div>
              <div className="text-xs sm:text-sm font-medium" style={{ color: "#000000", fontFamily: "Inter, sans-serif" }}>Suspended</div>
            </div>
            <h3 className="text-xl sm:text-2xl font-medium mb-1" style={{ color: "#000000" }}>{formatNumber(stats.suspended)}</h3>
            <p style={{ color: "#000000", fontFamily: "Inter, sans-serif" }} className="text-xs sm:text-sm">Suspended Users</p>
          </div>
        </div>

        {/* FilterBar component using useFilters */}
        <FilterBar
          filters={filters}
          onFilterChange={applyFilter}
          onSearchChange={updateSearch}
          onReset={resetFilters}
          onRefresh={() => fetchUsers(filters, currentPage)}
          loading={loading}
          showSearch={true}
          showStatusFilter={true}
          showTypeFilter={true}
          showDateFilter={false}
          showKYCFilter={true}
          className="mb-6"
        />

        {/* Bulk Actions */}
        {selectedUsers.length > 0 && (
          <div className="card p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium" style={{ color: "#000000" }}>
                {selectedUsers.length} user{selectedUsers.length > 1 ? "s" : ""} selected
              </span>
              <div className="flex items-center gap-2">
                <button onClick={() => handleBulkAction("activate")} className="px-3 py-2 text-white text-sm font-medium rounded-lg hover:opacity-90 transition-colors" style={{ backgroundColor: "#000000" }}>
                  Activate
                </button>
                <button onClick={() => handleBulkAction("suspend")} className="px-3 py-2 text-white text-sm font-medium rounded-lg hover:opacity-90 transition-colors" style={{ backgroundColor: "#000000" }}>
                  Suspend
                </button>
                <button onClick={() => handleBulkAction("delete")} className="px-3 py-2 text-white text-sm font-medium rounded-lg hover:opacity-90 transition-colors" style={{ backgroundColor: "#000000" }}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Users Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b" style={{ borderColor: "#000000" }}>
                <tr>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left">
                    <input 
                      type="checkbox" 
                      checked={users.length > 0 && selectedUsers.length === users.length} 
                      onChange={(e) => { 
                        setSelectedUsers(e.target.checked ? users.map((u) => u.id) : []) 
                      }} 
                      className="rounded border-slate-300 focus:ring-0" 
                      style={{ accentColor: "#000000" }} 
                    />
                  </th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-sm font-medium" style={{ color: "#000000" }}>User</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-sm font-medium" style={{ color: "#000000" }}>Status</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-sm font-medium" style={{ color: "#000000" }}>KYC Level</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-sm font-medium" style={{ color: "#000000" }}>Activity</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-sm font-medium" style={{ color: "#000000" }}>Country</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-sm font-medium" style={{ color: "#000000" }}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "#000000" }}>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-sm text-gray-500 mt-2">Loading users...</p>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8">
                      <p className="text-sm text-gray-500">No users found.</p>
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <input 
                          type="checkbox" 
                          checked={selectedUsers.includes(user.id)} 
                          onChange={(e) => { 
                            setSelectedUsers(e.target.checked ? [...selectedUsers, user.id] : selectedUsers.filter((id) => id !== user.id)) 
                          }} 
                          className="rounded border-slate-300 focus:ring-0" 
                          style={{ accentColor: "#000000" }} 
                        />
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white font-medium text-sm" style={{ backgroundColor: "#000000" }}>
                            {user.full_name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <div className="font-medium text-sm" style={{ color: "#000000" }}>{user.full_name}</div>
                            <div className="text-xs sm:text-sm" style={{ color: "#000000", fontFamily: "Inter, sans-serif" }}>{user.email}</div>
                            <div className="text-xs" style={{ color: "#000000", fontFamily: "Inter, sans-serif" }}>{user.phone}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(user.status)}
                          <span className="px-2 py-1 text-xs font-medium rounded-full border" style={getStatusColor(user.status)}>
                            {user.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <div className="flex items-center gap-2">
                          {getKYCIcon(user.kyc_level)}
                          <span className="px-2 py-1 text-xs font-medium rounded-full border" style={getKYCColor(user.kyc_level)}>
                            {user.kyc_level}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <div className="text-sm" style={{ color: "#000000" }}>{formatNumber(user.total_transactions)} txns</div>
                        <div className="text-xs sm:text-sm" style={{ color: "#000000", fontFamily: "Inter, sans-serif" }}>${formatNumber(user.total_volume)} volume</div>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <span className="text-sm" style={{ color: "#000000" }}>{user.country}</span>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <div className="flex items-center gap-2">
                          {/* Removed currentUser?.id comparison as currentUser is not defined */}
                          {user.status === "suspended" && (
                            <button onClick={() => handleUserAction(user.id, "activate")} className="p-2 hover:bg-green-50 rounded-lg transition-colors" title="Activate User">
                              <UserCheck className="w-4 h-4" style={{ color: "#000000" }} />
                            </button>
                          )}
                          {user.status === "active" && (
                            <button onClick={() => handleUserAction(user.id, "suspend")} className="p-2 hover:bg-yellow-50 rounded-lg transition-colors" title="Suspend User">
                              <UserX className="w-4 h-4" style={{ color: "#000000" }} />
                            </button>
                          )}
                          <button onClick={() => handleUserAction(user.id, "delete")} className="p-2 hover:bg-red-50 rounded-lg transition-colors" title="Delete User">
                            <Trash2 className="w-4 h-4" style={{ color: "#000000" }} />
                          </button>
                          {/* Icône MoreHorizontal supprimée */}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm" style={{ color: "#000000", fontFamily: "Inter, sans-serif" }}>
              Showing {(currentPage - 1) * usersPerPage + 1} to {Math.min(currentPage * usersPerPage, totalUsers)} of {totalUsers} users
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))} 
                disabled={currentPage === 1} 
                className="px-3 py-2 text-sm font-medium bg-white border rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors" 
                style={{ color: "#000000", fontFamily: "Inter, sans-serif", borderColor: "#000000" }}
              >
                Previous
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button 
                      key={page} 
                      onClick={() => handlePageChange(page)} 
                      className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${currentPage === page ? "text-white" : "bg-white border hover:bg-slate-50"}`} 
                      style={currentPage === page ? { backgroundColor: "#000000" } : { color: "#000000", borderColor: "#000000" }}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>
              <button 
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))} 
                disabled={currentPage === totalPages} 
                className="px-3 py-2 text-sm font-medium bg-white border rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors" 
                style={{ color: "#000000", fontFamily: "Inter, sans-serif", borderColor: "#000000" }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
  </>
  )
}



