import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '../services/api.ts';
import { Users, LayoutDashboard, Settings as SettingsIcon, Search, Shield, ShieldOff, Trash2, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { AnimatedPage } from '../components/layout/AnimatedPage.tsx';

export const AdminDashboard: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = React.useState('');

  const { data: statsData, isLoading: isLoadingStats } = useQuery({
    queryKey: ['adminStats'],
    queryFn: adminAPI.getStats,
  });

  const { data: usersData, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: adminAPI.getUsers,
  });

  const toggleStatusMutation = useMutation({
    mutationFn: (id: string) => adminAPI.toggleUserStatus(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      if (data.success) toast.success(data.message || 'Status updated');
      else toast.error(data.message || 'Error updating status');
    }
  });

  const changeRoleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) => adminAPI.updateUserRole(id, role),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      if (data.success) toast.success(data.message || 'Role updated');
      else toast.error(data.message || 'Error updating role');
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id: string) => adminAPI.deleteUser(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      if (data.success) toast.success(data.message || 'User deleted');
      else toast.error(data.message || 'Error deleting user');
    }
  });

  const stats = statsData?.data || { totalUsers: 0, activeUsers: 0, inactiveUsers: 0, totalApplications: 0, totalReminders: 0, totalInterviews: 0 };
  const users = usersData?.data || [];

  const filteredUsers = users.filter((u: any) => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AnimatedPage className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <LayoutDashboard className="w-8 h-8 text-brand-500" />
            Admin Dashboard
          </h1>
          <p className="text-slate-400 mt-1 text-sm font-medium">Manage users and system statistics.</p>
        </div>
      </div>

      {/* Stats Cards */}
      {isLoadingStats ? (
        <div className="flex justify-center p-8"><span className="loading loading-spinner text-brand-500"></span></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-neutral-900/50 border border-white/5 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Total Users</p>
              <h3 className="text-2xl font-bold text-white">{stats.totalUsers}</h3>
            </div>
          </div>
          <div className="bg-neutral-900/50 border border-white/5 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Active Users</p>
              <h3 className="text-2xl font-bold text-white">{stats.activeUsers}</h3>
            </div>
          </div>
          <div className="bg-neutral-900/50 border border-white/5 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-brand-500/10 flex items-center justify-center">
              <LayoutDashboard className="w-6 h-6 text-brand-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Total Applications</p>
              <h3 className="text-2xl font-bold text-white">{stats.totalApplications}</h3>
            </div>
          </div>
          <div className="bg-neutral-900/50 border border-white/5 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <SettingsIcon className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Interviews</p>
              <h3 className="text-2xl font-bold text-white">{stats.totalInterviews}</h3>
            </div>
          </div>
        </div>
      )}

      {/* Users Section */}
      <div className="bg-neutral-900/50 border border-white/5 rounded-3xl overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-white/5 flex flex-col sm:flex-row justify-between gap-4 items-center">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-brand-400" /> User Management
          </h2>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-neutral-950 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-brand-500 transition-colors text-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoadingUsers ? (
            <div className="flex justify-center p-8"><span className="loading loading-spinner text-brand-500"></span></div>
          ) : (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-neutral-950/50 text-slate-400 uppercase text-xs font-semibold tracking-wider">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Joined</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user: any) => (
                    <tr key={user._id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center font-bold">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-white">{user.name}</p>
                            <p className="text-xs text-slate-400">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          user.role === 'ADMIN' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          user.isActive ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-400 text-xs">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => changeRoleMutation.mutate({ id: user._id, role: user.role === 'ADMIN' ? 'USER' : 'ADMIN' })}
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
                          title={`Make ${user.role === 'ADMIN' ? 'User' : 'Admin'}`}
                        >
                          {user.role === 'ADMIN' ? <ShieldOff className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => toggleStatusMutation.mutate(user._id)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            user.isActive ? 'text-slate-400 hover:text-yellow-400 hover:bg-neutral-800' : 'text-slate-400 hover:text-green-400 hover:bg-neutral-800'
                          }`}
                          title={user.isActive ? 'Deactivate User' : 'Activate User'}
                        >
                          {user.isActive ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this user? This cannot be undone.')) {
                              deleteUserMutation.mutate(user._id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-neutral-800 rounded-lg transition-colors"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AnimatedPage>
  );
};

export default AdminDashboard;
