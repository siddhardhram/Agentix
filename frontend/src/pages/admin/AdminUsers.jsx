import React, { useState, useEffect } from 'react';
import { Users, Search, ShieldAlert, Check, X, Shield, Mail, Calendar, UserCheck } from 'lucide-react';
import { getAllProfiles, reviewRoleRequest } from '../../services/supabase';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../components/ui/select';
import { useToast } from '../../components/ui/toast';
import { useAuth } from '../../context/AuthContext';

export default function AdminUsers() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const data = await getAllProfiles();
    setProfiles(data || []);
    setLoading(false);
  };

  const handleRoleAction = async (userId, action, requestedRole) => {
    setProcessingId(userId);
    try {
      await reviewRoleRequest({
        userId,
        action,
        requestedRole,
        reviewerId: user?.id
      });
      addToast({ title: `Role request ${action}d successfully.`, type: 'success' });
      fetchUsers();
    } catch (err) {
      addToast({ title: 'Error processing request', description: err.message, type: 'error' });
    } finally {
      setProcessingId(null);
    }
  };

  const filteredProfiles = profiles.filter(p => {
    const matchesSearch = !searchTerm || 
      (p.email && p.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.full_name && p.full_name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRole = roleFilter === 'all' || p.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role) => {
    switch(role) {
      case 'admin': return <Badge className="bg-fuchsia-500/15 text-fuchsia-400 border-fuchsia-500/30">ADMIN</Badge>;
      case 'developer': return <Badge className="bg-blue-500/15 text-blue-400 border-blue-500/30">DEVELOPER</Badge>;
      case 'user':
      default: return <Badge className="bg-slate-800 text-slate-400 border-slate-700">USER</Badge>;
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Users size={24} className="text-purple-400" />
            User Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage system access, roles, and review pending developer requests.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search by email or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-slate-900 border-white/10 text-xs text-white"
          />
        </div>

        <div className="w-full sm:w-56">
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filter role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Admins</SelectItem>
              <SelectItem value="developer">Developers</SelectItem>
              <SelectItem value="user">Users</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Users List */}
      <div className="rounded-xl border border-white/[0.08] bg-slate-900/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-xs uppercase bg-slate-950/50 text-slate-400 border-b border-white/[0.08]">
              <tr>
                <th className="px-6 py-4 font-semibold">User</th>
                <th className="px-6 py-4 font-semibold">Current Role</th>
                <th className="px-6 py-4 font-semibold">Request Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-6 h-6 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                      <p className="text-xs">Loading users...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredProfiles.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <Users size={24} className="text-slate-600 mb-2" />
                      <p className="text-sm font-medium">No users found</p>
                      <p className="text-xs">Try adjusting your filters.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProfiles.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {p.avatar_url ? (
                          <img src={p.avatar_url} alt="" className="w-8 h-8 rounded-full border border-white/10" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400">
                            {p.email.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-slate-200">{p.full_name || 'No Name'}</div>
                          <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <Mail size={10} />
                            {p.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getRoleBadge(p.role)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {p.role_request_status === 'pending' ? (
                        <div className="flex items-center gap-1.5 text-amber-400 bg-amber-500/10 px-2 py-1 rounded-md w-fit border border-amber-500/20 text-xs font-medium">
                          <ShieldAlert size={14} />
                          Requested: {p.requested_role}
                        </div>
                      ) : p.role_request_status === 'approved' ? (
                        <span className="text-emerald-400 text-xs flex items-center gap-1">
                          <UserCheck size={12} /> Approved
                        </span>
                      ) : p.role_request_status === 'rejected' ? (
                        <span className="text-rose-400 text-xs flex items-center gap-1">
                          <X size={12} /> Rejected
                        </span>
                      ) : (
                        <span className="text-slate-500 text-xs">None</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {p.role_request_status === 'pending' && (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleRoleAction(p.id, 'approve', p.requested_role)}
                            disabled={processingId === p.id}
                            className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 transition-colors disabled:opacity-50"
                            title="Approve Request"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={() => handleRoleAction(p.id, 'reject', p.requested_role)}
                            disabled={processingId === p.id}
                            className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 transition-colors disabled:opacity-50"
                            title="Reject Request"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      )}
                      {p.role_request_status !== 'pending' && p.role !== 'admin' && (
                        <button
                          onClick={() => handleRoleAction(p.id, 'approve', 'admin')}
                          className="text-[11px] font-medium text-slate-400 hover:text-purple-400 border border-white/5 hover:border-purple-500/30 bg-white/5 px-2 py-1 rounded transition-colors"
                        >
                          Make Admin
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
