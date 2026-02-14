'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/context/AuthContext';
import { useSubscriptions, SubscriptionWithUser } from '@/hooks/useSubscriptions';
import { 
  Users, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  CreditCard,
  User,
  MessageSquare,
  Twitter,
  Instagram,
  Globe,
  Loader2,
  Filter
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import Image from 'next/image';
import Link from 'next/link';

const ITEMS_PER_PAGE = 50;

export default function SubscribersPage() {
  const { user, userProfile } = useAuth();
  const { subscribers, loading } = useSubscriptions(undefined, user?.uid);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredSubscribers = useMemo(() => {
    return subscribers.filter(sub => {
      const matchesSearch = sub.user?.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           sub.user?.username?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [subscribers, searchQuery, statusFilter]);

  const totalPages = Math.ceil(filteredSubscribers.length / ITEMS_PER_PAGE);
  const paginatedSubscribers = filteredSubscribers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (userProfile?.role !== 'creator') {
    return (
      <ProtectedRoute>
        <div className="flex min-h-screen bg-gray-50">
          <Sidebar />
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
              <p className="text-gray-600">This page is only available to creators.</p>
              <Link href="/" className="mt-4 inline-block text-purple-600 font-semibold hover:underline">Go Home</Link>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-[#F9FAFB]">
        <Sidebar />
        <div className="flex-1">
          <div className="p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-[#101828] mb-1">Subscribers</h1>
                <p className="text-[#475467]">Manage and engage with your community</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-white border rounded-xl py-2 px-4 shadow-sm flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  <span className="font-bold text-[#101828]">{subscribers.length}</span>
                  <span className="text-sm text-gray-400">Total</span>
                </div>
              </div>
            </div>

            {/* Filters & Search */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="text"
                  placeholder="Search subscribers by name or username..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all"
                />
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto">
                <Filter className="w-4 h-4 text-gray-400" />
                <select 
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="expiring">Expiring</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* List */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-24">
                  <Loader2 className="w-10 h-10 animate-spin text-purple-600 mb-4" />
                  <p className="text-gray-500 font-medium font-inter">Loading subscribers...</p>
                </div>
              ) : paginatedSubscribers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                    <Users className="w-10 h-10 text-gray-300" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No subscribers found</h3>
                  <p className="text-gray-500 max-w-sm mx-auto">
                    {searchQuery || statusFilter !== 'all' 
                      ? "Try adjusting your filters or search query to find who you're looking for." 
                      : "You don't have any subscribers yet. Keep posting great content to attract fans!"}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50/50 border-b border-gray-100">
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Subscriber</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Tier</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Joined</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Expiry</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {paginatedSubscribers.map((sub) => (
                        <tr key={sub.id} className="hover:bg-gray-50/30 transition-colors group">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gray-200 relative overflow-hidden shrink-0 border border-gray-100">
                                <Image 
                                  src={sub.user?.photoURL || 'https://i.pravatar.cc/150'} 
                                  alt={sub.user?.displayName || 'User'} 
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div className="min-w-0">
                                <div className="font-bold text-gray-900 truncate max-w-[150px]">
                                  {sub.user?.displayName || 'Private User'}
                                </div>
                                <div className="text-xs text-gray-400 truncate max-w-[150px]">
                                  @{sub.user?.username || 'user'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`text-xs font-bold px-2 py-1 rounded-lg uppercase tracking-tight ${
                              sub.tierId.toLowerCase() === 'premium' ? 'bg-purple-50 text-purple-700' : 
                              sub.tierId.toLowerCase() === 'vip' ? 'bg-pink-50 text-pink-700' : 
                              'bg-blue-50 text-blue-700'
                            }`}>
                              {sub.tierId}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                              sub.status === 'active' ? 'text-green-600' : 
                              sub.status === 'expiring' ? 'text-orange-600' : 
                              'text-gray-400'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                sub.status === 'active' ? 'bg-green-600' : 
                                sub.status === 'expiring' ? 'bg-orange-600' : 
                                'bg-gray-400'
                              }`}></span>
                              {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center gap-1.5 font-medium">
                              <Calendar className="w-3.5 h-3.5" />
                              {sub.createdAt ? format((sub.createdAt as any).toDate(), 'MMM dd, yyyy') : 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center gap-1.5 font-medium">
                              <Calendar className="w-3.5 h-3.5" />
                              {sub.expiresAt ? format((sub.expiresAt as any).toDate(), 'MMM dd, yyyy') : 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Link 
                                href={`/messages?chatId=${sub.userId}`}
                                className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all"
                                title="Message subscriber"
                              >
                                <MessageSquare className="w-5 h-5" />
                              </Link>
                              <Link 
                                href={`/profile/${sub.userId}`}
                                className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all"
                                title="View profile"
                              >
                                <User className="w-5 h-5" />
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    Showing <span className="font-bold text-gray-900">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to <span className="font-bold text-gray-900">{Math.min(currentPage * ITEMS_PER_PAGE, filteredSubscribers.length)}</span> of <span className="font-bold text-gray-900">{filteredSubscribers.length}</span> results
                  </p>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="p-2 bg-white border border-gray-200 rounded-xl text-gray-400 hover:text-gray-900 hover:border-gray-300 disabled:opacity-50 transition-all shadow-sm"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                         // Simple pagination logic for 5 pages
                         let pageNum = i + 1;
                         if (totalPages > 5 && currentPage > 3) {
                           pageNum = currentPage - 3 + i + 1;
                           if (pageNum > totalPages) pageNum = totalPages - (4 - i);
                         }
                         return (
                           <button
                             key={pageNum}
                             onClick={() => setCurrentPage(pageNum)}
                             className={`w-10 h-10 rounded-xl text-sm font-bold transition-all shadow-sm ${
                               currentPage === pageNum 
                               ? 'bg-purple-600 text-white border border-purple-600' 
                               : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                             }`}
                           >
                             {pageNum}
                           </button>
                         );
                      })}
                    </div>
                    <button 
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 bg-white border border-gray-200 rounded-xl text-gray-400 hover:text-gray-900 hover:border-gray-300 disabled:opacity-50 transition-all shadow-sm"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Integration Tip */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-6 rounded-3xl text-white shadow-lg shadow-blue-200">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                    <Twitter className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold mb-1">Promote on X</h4>
                  <p className="text-sm text-blue-100 mb-4 opacity-90">Share your profile on X to reach more potential subscribers.</p>
                  <button className="text-sm font-bold bg-white text-blue-600 px-4 py-2 rounded-xl hover:bg-blue-50 transition-colors">Generate Preview</button>
               </div>
               
               <div className="bg-gradient-to-br from-pink-500 to-rose-600 p-6 rounded-3xl text-white shadow-lg shadow-pink-200">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                    <Instagram className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold mb-1">Instagram Bio</h4>
                  <p className="text-sm text-pink-100 mb-4 opacity-90">Add your NuttyFans link to your Instagram bio for 2x growth.</p>
                  <button className="text-sm font-bold bg-white text-pink-600 px-4 py-2 rounded-xl hover:bg-pink-50 transition-colors">Copy Link</button>
               </div>

               <div className="bg-gradient-to-br from-purple-500 to-fuchsia-600 p-6 rounded-3xl text-white shadow-lg shadow-purple-200">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                    <Globe className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold mb-1">Website Widget</h4>
                  <p className="text-sm text-purple-100 mb-4 opacity-90">Embed a subscription widget on your personal blog or site.</p>
                  <button className="text-sm font-bold bg-white text-purple-600 px-4 py-2 rounded-xl hover:bg-purple-50 transition-colors">Get Code</button>
               </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
