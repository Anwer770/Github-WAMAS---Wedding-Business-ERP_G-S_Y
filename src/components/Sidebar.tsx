import React from 'react';
import {
  LayoutDashboard, CalendarRange, FileText, Camera, Shirt,
  ShieldAlert, CheckSquare, ShoppingCart, Scale, Users,
  Sparkles, Database, CheckCircle2
} from 'lucide-react';
import { UserRole } from '../types';

export type NavTab =
  | 'DASHBOARD'
  | 'BOOKINGS_CALENDAR'
  | 'RENTAL_CONTRACTS'
  | 'INSPECTION_SIDE_BY_SIDE'
  | 'INVENTORY_UNITS'
  | 'COLLATERAL_VAULT'
  | 'TASKS_KANBAN'
  | 'POS_CASHBOX'
  | 'ACCOUNTING_COA'
  | 'CRM_CUSTOMERS'
  | 'KOSHA_PROJECTS'
  | 'DB_SCHEMA'
  | 'ACCEPTANCE_TESTS';

interface NavItem {
  id: NavTab;
  label: string;
  subLabel?: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  badgeColor?: string;
  allowedRoles: UserRole[];
}

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  userRole: UserRole;
  pendingInspectionsCount: number;
  activeTasksCount: number;
  heldCollateralCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  userRole,
  pendingInspectionsCount,
  activeTasksCount,
  heldCollateralCount
}) => {
  const navItems: NavItem[] = [
    {
      id: 'DASHBOARD',
      label: 'لوحة المؤشرات والـ KPIs',
      subLabel: 'نظرة شمولية حية',
      icon: LayoutDashboard,
      allowedRoles: ['OWNER', 'GENERAL_MANAGER', 'ACCOUNTANT']
    },
    {
      id: 'BOOKINGS_CALENDAR',
      label: 'محرك الحجوزات والتقويم',
      subLabel: 'منع التعارض وهامش 48 ساعة',
      icon: CalendarRange,
      allowedRoles: ['OWNER', 'GENERAL_MANAGER', 'SALES', 'RENTAL_AGENT', 'CASHIER']
    },
    {
      id: 'RENTAL_CONTRACTS',
      label: 'عقود التأجير (12 مرحلة)',
      subLabel: 'دورة التأجير المتسلسلة',
      icon: FileText,
      allowedRoles: ['OWNER', 'GENERAL_MANAGER', 'SALES', 'RENTAL_AGENT', 'ACCOUNTANT', 'CASHIER']
    },
    {
      id: 'INSPECTION_SIDE_BY_SIDE',
      label: 'توثيق التسليم والإرجاع',
      subLabel: 'مقارنة الصور ورسم التلفيات',
      icon: Camera,
      badge: pendingInspectionsCount > 0 ? pendingInspectionsCount : undefined,
      badgeColor: 'bg-rose-500 text-white',
      allowedRoles: ['OWNER', 'GENERAL_MANAGER', 'RENTAL_AGENT', 'WAREHOUSE']
    },
    {
      id: 'INVENTORY_UNITS',
      label: 'الأصناف والمخزون (14 حالة)',
      subLabel: 'تتبع القطع وحساب الـ ROI',
      icon: Shirt,
      allowedRoles: ['OWNER', 'GENERAL_MANAGER', 'SALES', 'RENTAL_AGENT', 'WAREHOUSE', 'TAILOR']
    },
    {
      id: 'COLLATERAL_VAULT',
      label: 'خزينة التأمينات والضمانات',
      subLabel: 'أمانات الذهب والسلاح والنقد',
      icon: ShieldAlert,
      badge: heldCollateralCount > 0 ? `${heldCollateralCount} أمانة` : undefined,
      badgeColor: 'bg-amber-500 text-purple-950 font-bold',
      allowedRoles: ['OWNER', 'GENERAL_MANAGER', 'ACCOUNTANT', 'RENTAL_AGENT', 'CASHIER']
    },
    {
      id: 'TASKS_KANBAN',
      label: 'إدارة المهام والأتمتة',
      subLabel: 'لوحة كانبان ومهامي',
      icon: CheckSquare,
      badge: activeTasksCount > 0 ? activeTasksCount : undefined,
      badgeColor: 'bg-purple-600 text-white',
      allowedRoles: ['OWNER', 'GENERAL_MANAGER', 'ACCOUNTANT', 'SALES', 'RENTAL_AGENT', 'CASHIER', 'WAREHOUSE', 'TAILOR', 'DELIVERY']
    },
    {
      id: 'POS_CASHBOX',
      label: 'نقطة البيع والصندوق (POS)',
      subLabel: 'مقبوضات وسندات حرارية',
      icon: ShoppingCart,
      allowedRoles: ['OWNER', 'GENERAL_MANAGER', 'ACCOUNTANT', 'CASHIER']
    },
    {
      id: 'ACCOUNTING_COA',
      label: 'النظام المحاسبي والقيود',
      subLabel: 'شجرة الحسابات والقيد المتوازن',
      icon: Scale,
      allowedRoles: ['OWNER', 'GENERAL_MANAGER', 'ACCOUNTANT']
    },
    {
      id: 'CRM_CUSTOMERS',
      label: 'إدارة العملاء والمقاسات',
      subLabel: 'جدول المقاسات الدقيق والـ VIP',
      icon: Users,
      allowedRoles: ['OWNER', 'GENERAL_MANAGER', 'SALES', 'TAILOR']
    },
    {
      id: 'KOSHA_PROJECTS',
      label: 'مشاريع الكوش والتركيب',
      subLabel: 'جدولة القاعات والفك والتركيب',
      icon: Sparkles,
      allowedRoles: ['OWNER', 'GENERAL_MANAGER', 'SALES', 'DELIVERY', 'WAREHOUSE']
    },
    {
      id: 'DB_SCHEMA',
      label: 'مخطط قاعدة البيانات (DDL)',
      subLabel: 'PostgreSQL & Prisma Schemas',
      icon: Database,
      allowedRoles: ['OWNER', 'GENERAL_MANAGER', 'ACCOUNTANT']
    },
    {
      id: 'ACCEPTANCE_TESTS',
      label: 'جناح اختبارات القبول (28)',
      subLabel: 'فحص القواعد الذهبية الصارمة',
      icon: CheckCircle2,
      badge: '28 فحص',
      badgeColor: 'bg-emerald-600 text-white font-bold',
      allowedRoles: ['OWNER', 'GENERAL_MANAGER', 'ACCOUNTANT', 'SALES', 'RENTAL_AGENT', 'CASHIER', 'WAREHOUSE', 'TAILOR', 'DELIVERY']
    }
  ];

  return (
    <aside className="w-72 bg-white border-l border-slate-200 flex flex-col shrink-0 min-h-[calc(100vh-4rem)] shadow-sm">
      <div className="p-4 border-b border-slate-100 bg-slate-50/70">
        <div className="text-[11px] font-bold uppercase tracking-wider text-purple-900/70 mb-1">
          الوحدات التشغيلية للمنظومة
        </div>
        <div className="text-xs text-slate-500">
          توجيه تشغيلي فوري وفق صلاحيات المستخدم
        </div>
      </div>

      <nav className="p-2.5 space-y-1 flex-1 overflow-y-auto">
        {navItems.map((item) => {
          const isAllowed = item.allowedRoles.includes(userRole);
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          if (!isAllowed) {
            return (
              <div
                key={item.id}
                className="opacity-40 cursor-not-allowed px-3 py-2 rounded-xl flex items-center justify-between text-slate-400 text-xs select-none"
                title="غير مسموح بهذا البند وفق صلاحيات دورك الحالي (RBAC Guard)"
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <div>
                    <div className="font-medium">{item.label}</div>
                  </div>
                </div>
                <span className="text-[10px] bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded">محظور</span>
              </div>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full text-right px-3 py-2.5 rounded-xl flex items-center justify-between transition cursor-pointer text-xs ${
                isActive
                  ? 'bg-gradient-to-l from-purple-900 to-purple-800 text-white shadow-md shadow-purple-950/20 font-bold'
                  : 'hover:bg-slate-100 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    isActive ? 'bg-amber-400 text-purple-950' : 'bg-purple-50 text-purple-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <div className="truncate font-semibold">{item.label}</div>
                  {item.subLabel && (
                    <div className={`text-[10px] truncate ${isActive ? 'text-purple-200' : 'text-slate-400'}`}>
                      {item.subLabel}
                    </div>
                  )}
                </div>
              </div>

              {item.badge && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 ${item.badgeColor || 'bg-purple-100 text-purple-800'}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Branding Badge */}
      <div className="p-3 border-t border-slate-100 bg-slate-50 text-center">
        <div className="text-[11px] font-bold text-slate-700">WAMAS Enterprise ERP</div>
        <div className="text-[10px] text-slate-400">نظام موحد للأعراس والتأجير والمحاسبة</div>
      </div>
    </aside>
  );
};
