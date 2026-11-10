import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Shield, ShieldOff, ShieldCheck, User, RotateCcw, Eye } from 'lucide-react';
import { getStoredUser } from '../../utils/storage';

export const UserTable = ({ 
  users = [], 
  onDeleteUser, 
  onRestoreUser, 
  onChangeRole,
  isDeletedView = false 
}) => {
  const me = getStoredUser();
  const myId = me?._id || me?.id;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden p-4">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 uppercase font-bold tracking-wider border-b border-slate-200">
            <tr>
              <th className="p-3">User</th>
              <th className="p-3">Role</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Address</th>
              <th className="p-3">Joined Date</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.length > 0 ? (
              users.map((usr) => {
                const userId = usr._id || usr.id;
                const isMe = String(userId) === String(myId);
                const isMain = !!usr.isPrimaryAdmin;

                return (
                  <tr key={userId} className="hover:bg-slate-50 transition-colors">
                    {/* User Info */}
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                          {usr.name ? usr.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block">{usr.name || 'N/A'}</span>
                          <span className="text-[10px] text-slate-400">{usr.email}</span>
                        </div>
                      </div>
                    </td>

                    {/* Role Badge */}
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                        usr.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {usr.role === 'admin' ? <Shield size={10} /> : <User size={10} />}
                        {usr.role || 'user'}
                      </span>
                      {isMain && (
                        <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 bg-amber-100 text-amber-800" title="Main admin: cannot be changed or deleted">
                          <ShieldCheck size={10} /> Main
                        </span>
                      )}
                      {isMe && <span className="ml-1 text-[10px] text-slate-400 font-semibold">(you)</span>}
                    </td>

                    {/* Details */}
                    <td className="p-3 text-slate-600">{usr.phone || 'N/A'}</td>
                    <td className="p-3 text-slate-600 max-w-[200px] truncate">{usr.address || 'N/A'}</td>
                    <td className="p-3 text-slate-500">
                      {usr.createdAt ? new Date(usr.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                    </td>

                    {/* Status */}
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isDeletedView 
                          ? 'bg-rose-100 text-rose-800' 
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {isDeletedView ? 'Deleted' : (usr.status || 'Active')}
                      </span>
                    </td>

                    {/* Actions Column */}
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* View Details Link */}
                        <Link
                          to={`/admin/users/${userId}`}
                          className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </Link>

                        {/* Make / remove admin (not for the main admin, not for yourself, not for deleted users) */}
                        {!isDeletedView && onChangeRole && !isMain && !isMe && (
                          usr.role === 'admin' ? (
                            <button
                              onClick={() => onChangeRole(usr, 'user')}
                              className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-lg text-[11px] font-bold transition-all cursor-pointer"
                              title="Remove admin rights"
                            >
                              <ShieldOff size={12} /> Remove Admin
                            </button>
                          ) : (
                            <button
                              onClick={() => onChangeRole(usr, 'admin')}
                              className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 rounded-lg text-[11px] font-bold transition-all cursor-pointer"
                              title="Give admin rights"
                            >
                              <Shield size={12} /> Make Admin
                            </button>
                          )
                        )}

                        {isDeletedView ? (
                          <button
                            onClick={() => onRestoreUser && onRestoreUser(userId)}
                            className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-[11px] font-bold transition-all cursor-pointer"
                            title="Activate User"
                          >
                            <RotateCcw size={12} /> Activate
                          </button>
                        ) : (!isMain && !isMe) && (
                          <button
                            onClick={() => onDeleteUser && onDeleteUser(userId)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete User"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" className="p-6 text-center text-slate-400 font-medium">
                  {isDeletedView ? 'No deleted users found.' : 'No registered users found.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserTable;