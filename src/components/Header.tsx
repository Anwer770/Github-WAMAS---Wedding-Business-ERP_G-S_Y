import React, { useState } from 'react';
import { 
  Crown, Sparkles, Search, Bell, Plus, ShieldCheck, 
  RefreshCw, UserCheck, AlertTriangle, CheckCircle, ChevronDown
} from 'lucide-react';
import { User, UserRole } from '../types';

interface HeaderProps {
  currentUser: User;
  allUsers: User[];
  onSwitchUser: (user: User) => void;
  onOpenNewBookingModal: () => void;
  onOpenNewTaskModal: () => void;
  onResetData: () => void;
  overdueTasksCount: number;
  lateContractsCount: number;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const ROLE_LABELS: Record<UserRole, { label: string; badgeColor: string }> = {
  OWNER: { label: 'المالك (Owner)', badgeColor: 'bg-purple-900 text-amber-300 border-amber-400' },
  GENERAL_MANAGER: { label: 'المدير العام (GM)', badgeColor: 'bg-purple-800 text-purple-100 border-purple-600' },
  ACCOUNTANT: { label: 'المحاسب المالي', badgeColor: 'bg-emerald-800 text-emerald-100 border-emerald-600' },
  SALES: { label: 'موظف المبيعات والاستقبال', badgeColor: 'bg-blue-800 text-blue-100 border-blue-600' },
  RENTAL_AGENT: { label: 'موظف التأجير والتسليم', badgeColor: 'bg-amber-800 text-amber-100 border-amber-500' },
  CASHIER: { label: 'الكاشير والصندوق', badgeColor: 'bg-teal-800 text-teal-100 border-teal-500' },
  WAREHOUSE: { label: 'مسؤول المخزن والفحص', badgeColor: 'bg-slate-700 text-slate-100 border-slate-500' },
  TAILOR: { label: 'المشغل والخياط', badgeColor: 'bg-pink-800 text-pink-100 border-pink-500' },
  DELIVERY: { label: 'فريق التوصيل والتركيب', badgeColor: 'bg-indigo-800 text-indigo-100 border-indigo-500' }
};

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  allUsers,
  onSwitchUser,
  onOpenNewBookingModal,
  onOpenNewTaskModal,
  onResetData,
  overdueTasksCount,
  lateContractsCount,
  searchQuery,
  onSearchChange
}) => {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="bg-gradient-to-r from-purple-950 via-purple-900 to-indigo-950 text-white shadow-lg sticky top-0 z-40 border-b border-purple-800/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-md shadow-amber-900/30 border border-amber-300/40">
              <Crown className="w-6 h-6 text-purple-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-wider text-amber-300 font-serif">WAMAS</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 font-medium">ERP v1.1</span>
              </div>
              <p className="text-[11px] text-purple-200/80 -mt-0.5 hidden sm:block">نظام تشغيل ومحاسبة مستلزمات الأعراس والتأجير المتكامل</p>
            </div>
          </div>

          {/* Unified Quick Search Bar */}
          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <Search className="w-4 h-4 absolute right-3.5 top-3 text-purple-300/60" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="بحث سريع: رقم العقد، SKU الصنف، اسم العميل، الهاتف..."
                className="w-full bg-purple-900/60 text-white placeholder-purple-300/60 text-sm rounded-xl pl-4 pr-10 py-2 border border-purple-700/60 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition"
              />
            </div>
          </div>

          {/* Actions & Role Switcher */}
          <div className="flex items-center gap-3">
            
            {/* Quick Create Buttons */}
            {(currentUser.role === 'OWNER' || currentUser.role === 'GENERAL_MANAGER' || currentUser.role === 'SALES') && (
              <button
                onClick={onOpenNewBookingModal}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-purple-950 font-bold text-xs shadow-md shadow-amber-950/40 transition active:scale-95 border border-amber-300/40 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                حجز جديد
              </button>
            )}

            <button
              onClick={onOpenNewTaskModal}
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-800/80 hover:bg-purple-700 text-purple-100 font-semibold text-xs border border-purple-600/50 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-amber-300" />
              مهمة جديدة
            </button>

            {/* Smart Alerts & Notification Popover */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-lg bg-purple-800/60 hover:bg-purple-700/80 text-purple-200 hover:text-white transition cursor-pointer"
                title="التنبيهات الذكية"
              >
                <Bell className="w-5 h-5" />
                {(overdueTasksCount > 0 || lateContractsCount > 0) && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-600 text-[11px] font-bold text-white flex items-center justify-center animate-pulse border-2 border-purple-950">
                    {overdueTasksCount + lateContractsCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute left-0 sm:right-0 sm:left-auto mt-2 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 text-slate-800 z-50 p-4 text-right">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <span className="font-bold text-sm text-slate-900">التنبيهات التشغيلية الحية</span>
                    <span className="text-[11px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full font-semibold">
                      {overdueTasksCount + lateContractsCount} تنبيه نشط
                    </span>
                  </div>
                  <div className="py-2 space-y-2 max-h-64 overflow-y-auto">
                    {lateContractsCount > 0 ? (
                      <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2.5">
                        <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold text-rose-900">عقود متأخرة عن الإرجاع ({lateContractsCount})</p>
                          <p className="text-[11px] text-rose-700">تجاوزت الموعد المحدد وبدأت عدادات الغرامات (15% يومياً).</p>
                        </div>
                      </div>
                    ) : null}

                    {overdueTasksCount > 0 ? (
                      <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-2.5">
                        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold text-amber-900">مهام متأخرة مستحقة ({overdueTasksCount})</p>
                          <p className="text-[11px] text-amber-700">تجاوزت المهام الموعد النهائي وتتطلب اتخاذ إجراء فوري.</p>
                        </div>
                      </div>
                    ) : null}

                    {lateContractsCount === 0 && overdueTasksCount === 0 && (
                      <div className="py-6 text-center text-slate-400 text-xs">
                        <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                        كل العمليات التشغيلية منتظمة ولا توجد متأخرات
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Role Switcher (RBAC Live Simulator) */}
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-900/90 hover:bg-purple-800 text-white border border-purple-700/80 transition cursor-pointer text-xs"
              >
                <img
                  src={currentUser.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
                  alt={currentUser.name}
                  className="w-6 h-6 rounded-full object-cover ring-1 ring-amber-400"
                />
                <div className="text-right hidden sm:block">
                  <div className="font-bold text-[12px] truncate max-w-[110px]">{currentUser.name}</div>
                  <div className="text-[10px] text-amber-300 font-medium">{ROLE_LABELS[currentUser.role]?.label.split(' ')[0]}</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-purple-300" />
              </button>

              {showRoleMenu && (
                <div className="absolute left-0 sm:right-0 sm:left-auto mt-2 w-72 bg-white rounded-xl shadow-2xl border border-slate-200 text-slate-800 z-50 p-2 text-right">
                  <div className="p-2 border-b border-slate-100">
                    <span className="font-bold text-xs text-slate-800 block">تبديل دور المستخدم (محاكي الصلاحيات RBAC)</span>
                    <span className="text-[11px] text-slate-500">اختر دوراً لمعاينة قيود الواجهة والـ API الصارمة</span>
                  </div>
                  <div className="py-1 max-h-72 overflow-y-auto space-y-1">
                    {allUsers.map((u) => {
                      const roleConfig = ROLE_LABELS[u.role];
                      const isSelected = u.id === currentUser.id;
                      return (
                        <button
                          key={u.id}
                          onClick={() => {
                            onSwitchUser(u);
                            setShowRoleMenu(false);
                          }}
                          className={`w-full flex items-center justify-between p-2 rounded-lg text-xs transition cursor-pointer text-right ${
                            isSelected ? 'bg-purple-50 text-purple-950 font-bold border border-purple-200' : 'hover:bg-slate-100 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <img src={u.avatar} alt={u.name} className="w-6 h-6 rounded-full object-cover" />
                            <div>
                              <div>{u.name}</div>
                              <div className="text-[10px] text-slate-400">{roleConfig?.label}</div>
                            </div>
                          </div>
                          {isSelected && <CheckCircle className="w-4 h-4 text-purple-700" />}
                        </button>
                      );
                    })}
                  </div>
                  <div className="pt-2 border-t border-slate-100">
                    <button
                      onClick={() => {
                        if (confirm('هل ترغب بإعادة ضبط كامل بيانات التطبيق للبيانات النموذجية؟')) {
                          onResetData();
                          setShowRoleMenu(false);
                        }
                      }}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs text-slate-500 hover:text-rose-600 transition"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      استعادة البيانات التجريبية
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
