'use client';

import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  onSnapshot, 
  doc, 
  deleteDoc, 
  updateDoc, 
  Timestamp,
  orderBy
} from 'firebase/firestore';
import { db, storage } from '@/lib/firebase';
import { ref as storageRef, listAll, deleteObject as storageDeleteObject } from 'firebase/storage';
import { UserProfile, UserRole, VerificationStatus } from '@/lib/db';
import { 
  Search,
  Filter,
  UserCircle,
  MoreVertical,
  ShieldCheck,
  Trash2,
  ArrowUpDown,
  Mail,
  Calendar,
  Loader2,
  CheckCircle2,
  Clock,
  Ban,
  Unlock
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import AlertModal from '@/components/modals/AlertModal';


export default function UserManagement() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [activeUserId, setActiveUserId] = useState<string | null>(null);
  const [alertConfig, setAlertConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    onConfirm?: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  });


  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('createdAt', sortOrder));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile));
      setUsers(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [sortOrder]);

  // Click outside to close menu
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (activeUserId && !(e.target as Element).closest('.user-actions-container')) {
        setActiveUserId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeUserId]);

  const handleDelete = async (user: UserProfile) => {
    setAlertConfig({
      isOpen: true,
      title: 'Delete User',
      message: `Are you sure you want to delete ${user.displayName || user.email}? This action is permanent and cannot be undone. All their media, posts, and account data will be removed.`,
      type: 'error',
      onConfirm: async () => {
        try {
          // 1. Storage Cleanup (Delete all user media)
          const cleanupStorageFolder = async (folderPath: string) => {
            try {
              const folderRef = storageRef(storage, folderPath);
              const result = await listAll(folderRef);
              await Promise.all(result.items.map(item => storageDeleteObject(item)));
              // Recursively handle subfolders if any (though here we mostly have flat)
              await Promise.all(result.prefixes.map(prefix => cleanupStorageFolder(prefix.fullPath)));
            } catch (err) {
              console.error(`Error cleaning up folder ${folderPath}:`, err);
            }
          };

          // Clean up profile images and post media
          await Promise.all([
            cleanupStorageFolder(`users/${user.uid}`),
            cleanupStorageFolder(`posts/${user.uid}`),
            cleanupStorageFolder(`messages/${user.uid}`) // Also try to clean up their message folder if it exists
          ]);

          // 2. Delete from users collection
          await deleteDoc(doc(db, 'users', user.uid));
          
          // 3. If creator, delete from creators collection too
          if (user.role === 'creator') {
            await deleteDoc(doc(db, 'creators', user.uid));
          }
          
          toast.success('User and all related data removed permanently');
        } catch (error) {
          console.error("Complete deletion error:", error);
          toast.error('Failed to perform complete deletion');
        }
      }
    });
  };


  const handleStatusChange = async (uid: string, newStatus: VerificationStatus) => {
    try {
      await updateDoc(doc(db, 'users', uid), { 
        verificationStatus: newStatus,
        updatedAt: Timestamp.now()
      });
      toast.success(`User status updated to ${newStatus}`);
    } catch {
      toast.error('Failed to update status');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = (user.displayName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.uid.includes(searchTerm);
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-gray-400 gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
        <p className="font-medium animate-pulse">Loading user directory...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-500">Oversee all platform participants, roles, and account statuses.</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-sm font-bold border border-indigo-100">
              Total: {users.length}
           </div>
           <div className="px-4 py-2 bg-green-50 text-green-700 rounded-xl text-sm font-bold border border-green-100">
              Creators: {users.filter(u => u.role === 'creator').length}
           </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by name, email or UID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>
        
        <div className="flex flex-wrap gap-3">
           <div className="flex items-center gap-2 bg-gray-50 px-3 rounded-xl border border-gray-100">
              <Filter className="w-4 h-4 text-gray-400" />
              <select 
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as UserRole | 'all')}
                className="bg-transparent border-none text-sm font-medium py-2 focus:ring-0 cursor-pointer text-gray-700"
              >
                <option value="all">All Roles</option>
                <option value="user">Fans Only</option>
                <option value="creator">Creators Only</option>
                <option value="admin">Administrators</option>
              </select>
           </div>

           <button 
             onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
             className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100 active:scale-95 transition-all"
           >
              <ArrowUpDown className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Sort: {sortOrder === 'asc' ? 'Oldest' : 'Newest'}</span>
           </button>
        </div>
      </div>

      {/* Users Table container - removed overflow-hidden to prevent clipping dropdowns */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm relative z-10">
        <div className="overflow-visible">
          <table className="w-full text-left min-w-[800px]">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-400">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Joined At</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Verification</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map((user) => (
                <tr key={user.uid} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl relative overflow-hidden bg-gray-100 shrink-0">
                        {user.photoURL ? (
                          <Image src={user.photoURL} alt={user.displayName || 'User'} fill sizes="40px" className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <UserCircle className="w-6 h-6" />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-bold text-gray-900 truncate">{user.displayName || 'Unnamed User'}</span>
                        <span className="text-xs text-gray-500 truncate flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {user.email}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                      user.role === 'admin' ? 'bg-purple-50 text-purple-600 border border-purple-100' :
                      user.role === 'creator' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' :
                      'bg-gray-50 text-gray-500 border border-gray-200'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                      <Calendar className="w-4 h-4 text-gray-300" />
                      {user.createdAt instanceof Timestamp ? user.createdAt.toDate().toLocaleDateString() : 'Unknown'}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    {user.role === 'creator' ? (
                      user.verificationStatus === 'approved' ? (
                          <div className="flex items-center gap-1.5 text-green-600 font-bold text-xs uppercase">
                              <CheckCircle2 className="w-4 h-4" />
                              Verified
                          </div>
                      ) : user.verificationStatus === 'suspended' ? (
                          <div className="flex items-center gap-1.5 text-red-600 font-bold text-xs uppercase">
                              <Ban className="w-4 h-4 bg-red-50 rounded p-0.5" />
                              Suspended
                          </div>
                      ) : (
                          <div className="flex items-center gap-1.5 text-orange-500 font-bold text-xs uppercase">
                              <Clock className="w-4 h-4 bg-orange-50 rounded p-0.5" />
                              {user.verificationStatus || 'Pending'}
                          </div>
                      )
                    ) : (
                        <span className="text-gray-300 text-[10px] font-bold uppercase">N/A</span>
                    )}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex justify-end items-center gap-2">
                      <div className="relative user-actions-container">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveUserId(activeUserId === user.uid ? null : user.uid);
                          }}
                          className={`p-2 rounded-lg transition-all border shadow-sm ${
                            activeUserId === user.uid 
                              ? 'bg-indigo-50 border-indigo-200 text-indigo-600' 
                              : 'bg-white border-gray-200 text-gray-400 hover:text-gray-600 hover:border-gray-300'
                          }`}
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>
                        
                        {/* Dropdown Menu - using absolute with high z-index and clear positioning */}
                        {activeUserId === user.uid && (
                          <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] border border-gray-100 p-2 z-[9999] min-w-[200px] flex flex-col gap-1 animate-in fade-in zoom-in duration-150 origin-top-right">
                             <div className="px-3 py-2 border-b border-gray-50 mb-1">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Manage: {user.displayName || 'Account'}</p>
                             </div>
                             {user.role !== 'creator' && (
                               <button 
                                onClick={() => {
                                  // Simple role toggle logic
                                  const roles: UserRole[] = ['user', 'creator', 'admin'];
                                  const currentIndex = roles.indexOf(user.role);
                                  const nextRole = roles[(currentIndex + 1) % roles.length];
                                  updateDoc(doc(db, 'users', user.uid), { role: nextRole });
                                  setActiveUserId(null);
                                  toast.success(`Changed role to ${nextRole}`);
                                }}
                                className="flex items-center gap-2 w-full text-left px-3 py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                               >
                                  <ShieldCheck className="w-4 h-4 text-indigo-500" />
                                  Change Role ({user.role})
                               </button>
                             )}

                             <button 
                              onClick={() => {
                                handleStatusChange(user.uid, user.verificationStatus === 'suspended' ? 'approved' : 'suspended');
                                setActiveUserId(null);
                              }}
                              className={`flex items-center gap-2 w-full text-left px-3 py-2.5 text-xs font-semibold rounded-lg transition-colors ${
                                user.verificationStatus === 'suspended' 
                                  ? 'text-green-600 hover:bg-green-50' 
                                  : 'text-orange-600 hover:bg-orange-50'
                              }`}
                             >
                                {user.verificationStatus === 'suspended' ? (
                                  <>
                                    <Unlock className="w-4 h-4" />
                                    Restore Account
                                  </>
                                ) : (
                                  <>
                                    <Ban className="w-4 h-4" />
                                    Suspend Creator
                                  </>
                                )}
                             </button>

                             {user.role !== 'creator' && (
                               <>
                                 <div className="h-px bg-gray-50 my-1"></div>
                                 <button 
                                   onClick={() => {
                                     handleDelete(user);
                                     setActiveUserId(null);
                                   }}
                                   className="flex items-center gap-2 w-full text-left px-3 py-2.5 text-xs font-semibold text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                 >
                                    <Trash2 className="w-4 h-4" />
                                    Delete Permanently
                                 </button>
                               </>
                             )}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                   <td colSpan={5} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-400 gap-2">
                        <Search className="w-10 h-10 opacity-20" />
                        <p className="font-medium italic">No users found matching your filters.</p>
                      </div>
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AlertModal 
        isOpen={alertConfig.isOpen}
        onClose={() => setAlertConfig(prev => ({ ...prev, isOpen: false }))}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onConfirm={alertConfig.onConfirm}
        confirmLabel="Delete"
        cancelLabel="Cancel"
      />
    </div>
  );
}

