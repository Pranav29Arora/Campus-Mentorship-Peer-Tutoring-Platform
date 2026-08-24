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
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-xs text-slate-800 placeholder-slate-400 shadow-xs"
          />
          <Search className="absolute left-3.5 top-3 w-3.5 h-3.5 text-slate-400" />
        </div>
        <p className="text-xs text-slate-500 font-semibold">Total: {filteredUsers.length} users</p>
      </div>

      {/* Users table */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Roll No</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 text-sm">
              {filteredUsers.map((item) => {
                const isActive = item.status === 'active';
                return (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <img
                        src={item.avatar}
                        alt={item.name}
                        className="w-8 h-8 rounded-full border border-brand-200 object-cover"
                      />
                      <span className="font-bold text-slate-900">{item.name}</span>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono font-bold text-brand-600">
                      {item.rollNumber || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-600">{item.email}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-md font-bold uppercase tracking-wider ${
                        item.role === 'admin' 
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : item.role === 'mentor'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-brand-50 text-brand-700 border border-brand-200'
                      }`}>
                        {item.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                        isActive 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 font-medium">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {item.role === 'admin' ? (
                        <span className="text-[10px] text-slate-400 italic font-semibold">Protected</span>
                      ) : (
                        <Button
                          variant={isActive ? 'outline' : 'primary'}
                          size="sm"
                          onClick={() => onToggleStatus(item.id, isActive ? 'disabled' : 'active')}
                          className="text-xs font-bold"
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
