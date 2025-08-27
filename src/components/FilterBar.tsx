'use client'

import React from 'react'
import { Search, Filter, RotateCcw } from 'lucide-react'
import { FilterState } from '@/hooks/useFilters'

interface FilterBarProps {
  filters: FilterState
  onFilterChange: (key: keyof FilterState, value: string) => void
  onSearchChange: (value: string) => void
  onReset?: () => void
  onRefresh?: () => void
  loading?: boolean
  showSearch?: boolean
  showStatusFilter?: boolean
  showTypeFilter?: boolean
  showDateFilter?: boolean
  showKYCFilter?: boolean
  className?: string
}

export default function FilterBar({
  filters,
  onFilterChange,
  onSearchChange,
  onReset,
  onRefresh,
  loading = false,
  showSearch = true,
  showStatusFilter = true,
  showTypeFilter = true,
  showDateFilter = true,
  showKYCFilter = false,
  className = ''
}: FilterBarProps) {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          {/* Search */}
          {showSearch && (
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search..."
                value={filters.searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          {/* Status Filter */}
            {showStatusFilter && (
              <select
                value={filters.statusFilter}
                onChange={(e) => onFilterChange('statusFilter', e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="pending">Pending</option>
              </select>
            )}

          {/* Type Filter (used for KYC) */}
          {showTypeFilter && !showKYCFilter && (
            <select
              value={filters.typeFilter}
              onChange={(e) => onFilterChange('typeFilter', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All KYC</option>
              <option value="unverified">Unverified</option>
              <option value="basic">Basic</option>
              <option value="full">Full</option>
              <option value="business">Business</option>
            </select>
          )}

          {/* KYC Filter */}
          {showKYCFilter && (
            <select
              value={filters.typeFilter}
              onChange={(e) => onFilterChange('typeFilter', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All KYC</option>
              <option value="unverified">Unverified</option>
              <option value="basic">Basic</option>
              <option value="full">Full</option>
              <option value="business">Business</option>
            </select>
          )}

          {/* Date Filter */}
          {showDateFilter && (
            <select
              value={filters.dateFilter}
              onChange={(e) => onFilterChange('dateFilter', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="1day">Last 24 hours</option>
              <option value="7days">Last 7 days</option>
              <option value="30days">Last 30 days</option>
              <option value="90days">Last 90 days</option>
            </select>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RotateCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          )}
          
          {onReset && (
            <button
              onClick={onReset}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <Filter className="w-4 h-4" />
              Reset
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
