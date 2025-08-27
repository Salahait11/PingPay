'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { formatNumber, formatCurrency } from '@/lib/utils';
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, DollarSign, TrendingUp, Activity, ArrowUpRight, ArrowDownRight, Eye, MoreHorizontal, CreditCard, Banknote, UserCheck } from "lucide-react";


export default function AdminDashboard() {
  const router = useRouter();
  const [kpis, setKpis] = useState<KpiMetrics>({ total_users: 0, total_revenue: 0, total_transactions: 0, user_growth: 0, revenue_growth: 0, transaction_growth: 0 });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [transactionData, setTransactionData] = useState<ChartData[]>([]);
  const [userGrowthData, setUserGrowthData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/dashboard/admin/analytics');
      if (!response.ok) throw new Error('Failed to fetch dashboard data');
      const { data } = await response.json();
      // Adapter ici selon la structure retournée par get_dashboard_analytics
      setKpis(data.kpis || { total_users: 0, total_revenue: 0, total_transactions: 0, user_growth: 0, revenue_growth: 0, transaction_growth: 0 });
      setRecentActivities(data.recentActivities || []);
      setTransactionData(data.transactionData || []);
      setUserGrowthData(data.userGrowthData || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#10b981' // green
      case 'pending': return '#f59e0b' // amber
      case 'failed': return '#ef4444' // red
      default: return '#6b7280' // gray
    }
  };

  const handleViewReports = () => router.push('/dashboard/admin/financial/reports');
  const handleViewAnalytics = () => router.push('/dashboard/admin/analytics');
  const handleViewAllActivity = () => router.push('/dashboard/admin/users/activity');
  const handleCardClick = (path: string) => router.push(`/dashboard/admin${path}`);
interface KpiMetrics {
  total_users: number;
  total_revenue: number;
  total_transactions: number;
  user_growth: number;
  revenue_growth: number;
  transaction_growth: number;
}
interface RecentActivity {
  id: string;
  user: string;
  action: string;
  amount?: string;
  time: string;
  type: string;
  status: string;
}
interface ChartData {
  month: string;
  amount?: number;
  transactions?: number;
  users?: number;
}
  
  if (loading) {
      return <div className="p-6 text-center">Loading dashboard data...</div>
  }

  return (
    <div className="min-h-screen bg-white p-3 sm:p-6 space-y-4 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6">
        <div>
          <h1 className="text-lg sm:text-2xl font-medium mb-1 sm:mb-2" style={{ color: "#000000" }}>Admin Dashboard</h1>
          <p className="text-xs sm:text-base" style={{ color: "#ABB8DF" }}>Welcome back! Here&apos;s what&apos;s happening with PingPay today.</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <button onClick={handleViewReports} className="flex items-center gap-2 p-2 sm:p-3 border rounded-lg transition-colors" style={{ borderColor: "#000000" }}><Eye className="w-4 h-4" style={{ color: "#000000" }} /><span className="text-sm font-medium" style={{ color: "#000000" }}>View Reports</span></button>
          <button onClick={handleViewAnalytics} className="flex items-center gap-2 p-2 sm:p-3 border rounded-lg transition-colors" style={{ borderColor: "#000000", backgroundColor: "#000000" }}><TrendingUp className="w-4 h-4" style={{ color: "#FFFFFF" }} /><span className="text-sm font-medium" style={{ color: "#FFFFFF" }}>Analytics</span></button>
        </div>
      </div>

      {/* Key Metrics - 3 columns full width */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
        <div onClick={() => handleCardClick('/users')} className="card p-3 sm:p-6 cursor-pointer transition-all duration-200 hover:shadow-lg"><div className="flex items-center justify-between mb-2 sm:mb-4"><div className="p-2 sm:p-3 border rounded-lg" style={{ borderColor: "#000000" }}><Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" /></div><div className={`flex items-center text-xs sm:text-sm font-medium ${(kpis.user_growth || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>{(kpis.user_growth || 0) >= 0 ? <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4 mr-1" /> : <ArrowDownRight className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />}{Math.abs(kpis.user_growth || 0).toFixed(1)}%</div></div><h3 className="text-xl sm:text-2xl font-medium mb-1">{formatNumber(kpis.total_users)}</h3><p style={{ color: "#ABB8DF" }} className="text-xs sm:text-sm">Total Users</p></div>
        <div onClick={() => handleCardClick('/financial')} className="card p-3 sm:p-6 cursor-pointer transition-all duration-200 hover:shadow-lg"><div className="flex items-center justify-between mb-2 sm:mb-4"><div className="p-2 sm:p-3 border rounded-lg" style={{ borderColor: "#000000" }}><DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" /></div><div className={`flex items-center text-xs sm:text-sm font-medium ${(kpis.revenue_growth || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>{(kpis.revenue_growth || 0) >= 0 ? <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4 mr-1" /> : <ArrowDownRight className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />}{Math.abs(kpis.revenue_growth || 0).toFixed(1)}%</div></div><h3 className="text-xl sm:text-2xl font-medium mb-1">{formatCurrency(kpis.total_revenue)}</h3><p style={{ color: "#ABB8DF" }} className="text-xs sm:text-sm">Total Revenue</p></div>
        <div onClick={() => handleCardClick('/transactions')} className="card p-3 sm:p-6 cursor-pointer transition-all duration-200 hover:shadow-lg"><div className="flex items-center justify-between mb-2 sm:mb-4"><div className="p-2 sm:p-3 border rounded-lg" style={{ borderColor: "#000000" }}><TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" /></div><div className={`flex items-center text-xs sm:text-sm font-medium ${(kpis.transaction_growth || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>{(kpis.transaction_growth || 0) >= 0 ? <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4 mr-1" /> : <ArrowDownRight className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />}{Math.abs(kpis.transaction_growth || 0).toFixed(1)}%</div></div><h3 className="text-xl sm:text-2xl font-medium mb-1">{formatNumber(kpis.total_transactions)}</h3><p style={{ color: "#ABB8DF" }} className="text-xs sm:text-sm">Transactions</p></div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
        <div className="card p-3 sm:p-6"><div className="flex items-center justify-between mb-6"><div><h3 className="text-base sm:text-lg font-medium">Transaction Overview</h3><p className="text-xs sm:text-sm mt-1 text-slate-500">Monthly transaction volume and revenue</p></div><button className="p-2 hover:bg-gray-50 rounded-lg"><MoreHorizontal className="w-5 h-5" /></button></div><div className="h-56 sm:h-80"><ResponsiveContainer width="100%" height="100%"><AreaChart data={transactionData}><defs><linearGradient id="transactionGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8884d8" stopOpacity={0.4} /><stop offset="95%" stopColor="#8884d8" stopOpacity={0} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" fontSize={12} /><YAxis fontSize={12} tickFormatter={(v) => `$${(v/1000)}k`} /><Tooltip formatter={(v) => formatCurrency(v as number)} /><Area type="monotone" dataKey="amount" stroke="#8884d8" strokeWidth={2} fill="url(#transactionGradient)" /></AreaChart></ResponsiveContainer></div></div>
        <div className="card p-3 sm:p-6"><div className="flex items-center justify-between mb-6"><div><h3 className="text-base sm:text-lg font-medium">User Growth</h3><p className="text-xs sm:text-sm mt-1 text-slate-500">Monthly user registration trends</p></div><button className="p-2 hover:bg-gray-50 rounded-lg"><MoreHorizontal className="w-5 h-5" /></button></div><div className="h-56 sm:h-80"><ResponsiveContainer width="100%" height="100%"><LineChart data={userGrowthData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" fontSize={12} /><YAxis fontSize={12} /><Tooltip formatter={(v) => [`${v} new users`]} /><Line type="monotone" dataKey="users" stroke="#82ca9d" strokeWidth={2} activeDot={{ r: 8 }} /></LineChart></ResponsiveContainer></div></div>
      </div>

      {/* Recent Activity Only */}
      <div className="card p-3 sm:p-6 mt-4">
        <div className="flex items-center justify-between mb-6"><div><h3 className="text-base sm:text-lg font-medium">Recent Activity</h3><p className="text-xs sm:text-sm mt-1 text-slate-500">Latest user actions</p></div><button onClick={handleViewAllActivity} className="font-medium text-sm text-blue-600 hover:underline">View All</button></div>
        <div className="space-y-3">
          {(recentActivities || []).map((activity) => (
              <div key={activity.id} className="p-3 sm:p-4 border rounded-lg"><div className="flex items-start gap-3"><div className="w-8 h-8 border rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">{activity.type === "payment" ? <CreditCard className="w-4 h-4" /> : activity.type === "signup" ? <UserCheck className="w-4 h-4" /> : activity.type === "withdrawal" ? <Banknote className="w-4 h-4" /> : <Activity className="w-4 h-4" />}</div><div className="flex-1 min-w-0"><div className="flex items-start justify-between gap-2 mb-1"><p className="font-medium text-sm truncate">{activity.user}</p>{activity.amount && <div className="text-right flex-shrink-0"><div className="font-medium text-sm">{activity.amount}</div></div>}</div><div className="flex items-center justify-between gap-2"><p className="text-xs text-slate-500 truncate">{activity.action}</p><div className="flex items-center gap-1 flex-shrink-0"><span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: `${getStatusColor(activity.status)}1A`, color: getStatusColor(activity.status) }}>{activity.status}</span><p className="text-xs text-slate-400 flex-shrink-0">{activity.time}</p></div></div></div></div></div>
          ))}
        </div>
      </div>
    </div>
  )
}