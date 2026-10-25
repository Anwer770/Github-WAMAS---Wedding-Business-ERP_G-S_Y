import React, { useState } from 'react';
import {
  ShieldCheck, Users, Lock, Key, CheckCircle2, XCircle, Plus,
  AlertTriangle, RefreshCw, Eye, Edit3, Trash2, Check, Download,
  Sliders, UserPlus, Power, KeyRound, ShieldAlert
} from 'lucide-react';
import { User, UserRole, SystemModule, PermissionAction, RolePermissionMatrix } from '../../types';
import { AppState } from '../../services/storageService';
import { ROLE_LABELS } from '../Header';

interface PermissionsMatrixViewProps {
  state: AppState;
  onUpdateState: (newState: AppState) => void;
  currentUserRole: UserRole;
}

const MODULE_LABELS: Record<SystemModule, string> = {
  BOOKINGS: 'محرك الحجوزات والتقويم',
  SALES: 'المبيعات ونقطة البيع (POS)',
  PURCHASING: 'الموردون وأوامر الشراء',
  MANUFACTURING: 'التصنيع وأوامر الشغل (MO & BOM)',
  INVENTORY: 'الأصناف والمخزون والقطع',
  CHART_OF_ACCOUNTS: 'شجرة الحسابات والدفتر اليومي',
  FINANCIAL_REPORTS: 'القوائم والتقارير المالية',
  USER_MANAGEMENT: 'إدارة المستخدمين والحسابات',
  COLLATERAL_VAULT: 'خزينة التأمينات والضمانات',
  TASKS: 'إدارة المهام والأتمتة',
  KOSHA: 'مشاريع الكوش والتركيب',
  SETTINGS: 'الإعدادات الشاملة للنظام'
};

const ACTION_LABELS: Record<PermissionAction, { label: string; icon: any }> = {
  VIEW: { label: 'عرض', icon: Eye },
  CREATE: { label: 'إنشاء', icon: Plus },
  EDIT: { label: 'تعديل', icon: Edit3 },
  DELETE: { label: 'حذف', icon: Trash2 },
  APPROVE: { label: 'اعتماد', icon: Check },
  EXPORT: { label: 'تصدير', icon: Download }
};

export const PermissionsMatrixView: React.FC<PermissionsMatrixViewProps> = ({
  state,
  onUpdateState,
  currentUserRole
}) => {
  const [activeTab, setActiveTab] = useState<'MATRIX' | 'USERS' | 'SESSIONS'>('MATRIX');
  const [selectedRole, setSelectedRole] = useState<UserRole>('SALES');
  const [showAddUserModal, setShowAddUserModal] = useState(false);

  // New User Form State
  const [newUserName, setNewUserName] = useState('');
  const [newUserUsername, setNewUserUsername] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('SALES');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');

  const isOwnerOrGm = currentUserRole === 'OWNER' || currentUserRole === 'GENERAL_MANAGER';

  // Toggle Matrix Permission
  const handleTogglePermission = (mod: SystemModule, act: PermissionAction) => {
    if (!isOwnerOrGm) {
      alert('عذراً: تعديل مصفوفة الصلاحيات محصور فقط بالمالك والمدير العام.');
      return;
    }

    if (selectedRole === 'OWNER') {
      alert('قاعدة أمنية إلزامية: لا يمكن تقييد أو تعديل صلاحيات المالك (Owner Full Access).');
      return;
    }

    const currentVal = state.permissionMatrix[selectedRole]?.[mod]?.[act] ?? false;
    const updatedMatrix: RolePermissionMatrix = {
      ...state.permissionMatrix,
      [selectedRole]: {
        ...state.permissionMatrix[selectedRole],
        [mod]: {
          ...state.permissionMatrix[selectedRole]?.[mod],
          [act]: !currentVal
        }
      }
    };

    const newState: AppState = {
      ...state,
      permissionMatrix: updatedMatrix,
      auditLogs: [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          userId: state.currentUser.id,
          userName: state.currentUser.name,
          action: 'تعديل صلاحيات دور',
          details: `تم ${!currentVal ? 'منح' : 'سحب'} صلاحية ${ACTION_LABELS[act].label} لوحدة ${MODULE_LABELS[mod]} للدور ${ROLE_LABELS[selectedRole]?.label}`
        },
        ...state.auditLogs
      ]
    };
    onUpdateState(newState);
  };

  // Toggle User Active / Suspended
  const handleToggleUserStatus = (userId: string) => {
    if (!isOwnerOrGm) {
      alert('عذراً: تعديل حالة حسابات المستخدمين محصور بالمالك والمدير العام.');
      return;
    }

    const targetUser = state.users.find(u => u.id === userId);
    if (!targetUser) return;
    if (targetUser.role === 'OWNER') {
      alert('لا يمكن إيقاف حساب المالك الرئيسي للنظام.');
      return;
    }

    const nextStatus: 'ACTIVE' | 'SUSPENDED' = targetUser.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    const updatedUsers: User[] = state.users.map(u => {
      if (u.id === userId) {
        return { ...u, status: nextStatus };
      }
      return u;
    });

    const newState: AppState = {
      ...state,
      users: updatedUsers,
      auditLogs: [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          userId: state.currentUser.id,
          userName: state.currentUser.name,
          action: nextStatus === 'ACTIVE' ? 'تفعيل حساب مستخدم' : 'إيقاف حساب مستخدم فورياً (Session Revoked)',
          details: `تم ${nextStatus === 'ACTIVE' ? 'تفعيل' : 'إيقاف وقطع جلسات'} المستخدم ${targetUser.name} (${targetUser.username})`
        },
        ...state.auditLogs
      ]
    };
    onUpdateState(newState);
  };

  // Add User
  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserUsername) return;

    // Check username uniqueness
    if (state.users.some(u => u.username.toLowerCase() === newUserUsername.toLowerCase())) {
      alert('اسم المستخدم هذا مستخدم مسبقاً، يرجى اختيار اسم مستخدم فريد.');
      return;
    }

    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: newUserName,
      username: newUserUsername.toLowerCase(),
      role: newUserRole,
      phone: newUserPhone || '0500000000',
      email: newUserEmail || `${newUserUsername}@wamas-app.com`,
      branchId: 'br-1',
      status: 'ACTIVE',
      lastLogin: 'لم يدخل بعد',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
    };

    const newState: AppState = {
      ...state,
      users: [...state.users, newUser],
      auditLogs: [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          userId: state.currentUser.id,
          userName: state.currentUser.name,
          action: 'إنشاء حساب مستخدم جديد',
          details: `تم إنشاء حساب ${newUser.name} بالدور ${ROLE_LABELS[newUser.role]?.label}`
        },
        ...state.auditLogs
      ]
    };
    onUpdateState(newState);
    setShowAddUserModal(false);
    setNewUserName('');
    setNewUserUsername('');
    setNewUserPassword('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-purple-900 to-indigo-950 text-white rounded-2xl p-6 shadow-xl border border-purple-800/80">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-purple-950 font-bold shadow-lg shadow-amber-950/40">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-amber-300">مصفوفة الصلاحيات المرنة وإدارة المستخدمين (RBAC)</h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 font-semibold">
                  Part 2 — WAMAS v2.0
                </span>
              </div>
              <p className="text-xs text-purple-200/80 mt-1">
                تخصيص كامل لصلاحيات كل دور بنظام المصفوفة (عرض، إنشاء، تعديل، حذف، اعتماد، تصدير) بدون أي كود
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddUserModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-purple-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md transition cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              مستخدم جديد
            </button>
          </div>
        </div>

        {/* Security Rule Badge */}
        <div className="mt-4 p-3 bg-purple-900/60 rounded-xl border border-purple-700/60 text-xs text-purple-100 flex items-center gap-2">
          <Lock className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>قاعدة أمنية صارمة:</strong> تُفرض الصلاحيات على مستوى واجهة المستخدم (UI) وقواعد العمل وقيد قواعد البيانات. إيقاف حساب أي موظف يقطع جلسته فوراً.
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-xl p-1.5 shadow-sm">
        <button
          onClick={() => setActiveTab('MATRIX')}
          className={`flex-1 py-2.5 px-4 rounded-lg font-bold text-sm transition flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'MATRIX'
              ? 'bg-purple-900 text-amber-300 shadow-sm'
              : 'text-slate-600 hover:text-purple-900 hover:bg-slate-50'
          }`}
        >
          <Sliders className="w-4 h-4" />
          مصفوفة الصلاحيات (Permission Matrix Grid)
        </button>
        <button
          onClick={() => setActiveTab('USERS')}
          className={`flex-1 py-2.5 px-4 rounded-lg font-bold text-sm transition flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'USERS'
              ? 'bg-purple-900 text-amber-300 shadow-sm'
              : 'text-slate-600 hover:text-purple-900 hover:bg-slate-50'
          }`}
        >
          <Users className="w-4 h-4" />
          حسابات المستخدمين وتتبع الجلسات
          <span className="text-xs px-2 py-0.5 rounded-full bg-purple-950/40 text-amber-300 border border-amber-400/30">
            {state.users.length}
          </span>
        </button>
      </div>

      {/* TAB 1: Permission Matrix */}
      {activeTab === 'MATRIX' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-6">
          {/* Role Selector Buttons */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">اختر الدور لتعديل صلاحياته في النظام:</label>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(ROLE_LABELS) as UserRole[]).map((r) => {
                const isSelected = selectedRole === r;
                return (
                  <button
                    key={r}
                    onClick={() => setSelectedRole(r)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-1.5 border ${
                      isSelected
                        ? 'bg-purple-900 text-amber-300 border-amber-400 shadow-sm ring-2 ring-purple-600/30'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {r === 'OWNER' && <Key className="w-3.5 h-3.5 text-amber-400" />}
                    {ROLE_LABELS[r]?.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Matrix Grid */}
          <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
            <table className="w-full text-xs text-right">
              <thead className="bg-gradient-to-r from-purple-950 to-indigo-950 text-white">
                <tr>
                  <th className="p-3.5 font-bold">الوحدة البرمجية</th>
                  {(Object.keys(ACTION_LABELS) as PermissionAction[]).map(act => (
                    <th key={act} className="p-3.5 text-center font-bold">
                      {ACTION_LABELS[act].label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(Object.keys(MODULE_LABELS) as SystemModule[]).map(mod => (
                  <tr key={mod} className="hover:bg-purple-50/30 transition">
                    <td className="p-3.5 font-bold text-slate-900 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-purple-600" />
                      {MODULE_LABELS[mod]}
                    </td>

                    {(Object.keys(ACTION_LABELS) as PermissionAction[]).map(act => {
                      const isAllowed = selectedRole === 'OWNER' 
                        ? true 
                        : (state.permissionMatrix[selectedRole]?.[mod]?.[act] ?? false);

                      return (
                        <td key={act} className="p-3.5 text-center">
                          <button
                            type="button"
                            disabled={selectedRole === 'OWNER'}
                            onClick={() => handleTogglePermission(mod, act)}
                            className={`w-8 h-8 rounded-lg inline-flex items-center justify-center transition cursor-pointer ${
                              isAllowed
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200'
                                : 'bg-slate-100 text-slate-400 border border-slate-200 hover:bg-slate-200'
                            } ${selectedRole === 'OWNER' ? 'cursor-not-allowed opacity-90' : ''}`}
                            title={isAllowed ? 'مفعل (انقر للتعطيل)' : 'معطل (انقر للتفعيل)'}
                          >
                            {isAllowed ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <XCircle className="w-4 h-4 text-slate-400" />
                            )}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Users Management */}
      {activeTab === 'USERS' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">دليل الموظفين والحسابات النشطة</h3>
            <button
              onClick={() => setShowAddUserModal(true)}
              className="px-3.5 py-1.5 bg-purple-900 hover:bg-purple-800 text-amber-300 font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              إضافة موظف
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-xs text-right">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="p-3">الموظف</th>
                  <th className="p-3">اسم المستخدم (Username)</th>
                  <th className="p-3">الدور الوظيفي</th>
                  <th className="p-3">رقم الهاتف</th>
                  <th className="p-3">آخر دخول</th>
                  <th className="p-3 text-center">الحالة</th>
                  <th className="p-3 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {state.users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                          alt={u.name}
                          className="w-8 h-8 rounded-full object-cover border border-purple-200"
                        />
                        <span className="font-bold text-slate-900">{u.name}</span>
                      </div>
                    </td>
                    <td className="p-3 font-mono text-purple-900 font-semibold">{u.username}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${ROLE_LABELS[u.role]?.badgeColor}`}>
                        {ROLE_LABELS[u.role]?.label}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-slate-600">{u.phone}</td>
                    <td className="p-3 font-mono text-slate-500">{u.lastLogin || 'الآن'}</td>
                    <td className="p-3 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        u.status === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-rose-100 text-rose-800 border border-rose-300'
                      }`}>
                        {u.status === 'ACTIVE' ? 'نشط' : 'موقوف'}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      {u.role !== 'OWNER' && (
                        <button
                          type="button"
                          onClick={() => handleToggleUserStatus(u.id)}
                          className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition cursor-pointer flex items-center gap-1 mx-auto ${
                            u.status === 'ACTIVE'
                              ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          <Power className="w-3 h-3" />
                          {u.status === 'ACTIVE' ? 'إيقاف الحساب' : 'تفعيل'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: New User */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-purple-800" />
                إضافة مستخدم جديد
              </h3>
              <button
                onClick={() => setShowAddUserModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">الاسم الكامل</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: ريم العسيري"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">اسم المستخدم الفريد (Username)</label>
                <input
                  type="text"
                  required
                  placeholder="reem_sales"
                  value={newUserUsername}
                  onChange={(e) => setNewUserUsername(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">الدور الوظيفي</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800"
                  >
                    {(Object.keys(ROLE_LABELS) as UserRole[]).filter(r => r !== 'OWNER').map(r => (
                      <option key={r} value={r}>{ROLE_LABELS[r]?.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">رقم الجوال</label>
                  <input
                    type="text"
                    placeholder="05xxxxxxxx"
                    value={newUserPhone}
                    onChange={(e) => setNewUserPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">كلمة المرور المشفرة (BR-24)</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-900 hover:bg-purple-800 text-amber-300 rounded-xl font-bold shadow-md cursor-pointer"
                >
                  إنشاء الحساب
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
