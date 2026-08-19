import React, { useState } from 'react';
import { User, Shield, UserX, UserCheck, Search } from 'lucide-react';
import Button from '../common/Button';

const UserTable = ({ users, onToggleStatus }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.rollNumber && u.rollNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
    u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Table search filters */}
      <div className="flex justify-between items-center gap-4 flex-wrap">
        <div className="relative w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, roll no..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-800 bg-slate-900/60 focus:outline-none focus:border-brand-500 text-xs text-slate-300 placeholder-slate-500"
          />
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
        </div>
        <p className="text-xs text-slate-400 font-medium">Total: {filteredUsers.length} users</p>
      </div>

      {/* Users table */}
      <div className="glass-panel border-slate-800 rounded-2xl overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/80 border-b border-slate-850 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Roll No</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850/50 text-slate-300 text-sm">
              {filteredUsers.map((item) => {
                const isActive = item.status === 'active';
                return (
                  <tr key={item.id} className="hover:bg-slate-900/20 transition-colors">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <img
                        src={item.avatar}
                        alt={item.name}
                        className="w-8 h-8 rounded-full border border-slate-700 object-cover"
                      />
                      <span className="font-semibold text-white">{item.name}</span>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono font-medium text-brand-400">
                      {item.rollNumber || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-400">{item.email}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider ${
                        item.role === 'admin' 
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/25'
                          : item.role === 'mentor'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/25'
                          : 'bg-brand-500/10 text-brand-400 border border-brand-500/25'
                      }`}>
                        {item.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold ${
                        isActive 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25' 
                          : 'bg-red-500/10 text-red-400 border border-red-500/25'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {item.role === 'admin' ? (
                        <span className="text-[10px] text-slate-500 italic font-semibold">Protected</span>
                      ) : (
                        <Button
                          variant={isActive ? 'outline' : 'glass'}
                          size="sm"
                          onClick={() => onToggleStatus(item.id, isActive ? 'disabled' : 'active')}
                          className="text-xs"
                          icon={isActive ? UserX : UserCheck}
                        >
                          {isActive ? 'Disable' : 'Enable'}
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserTable;
