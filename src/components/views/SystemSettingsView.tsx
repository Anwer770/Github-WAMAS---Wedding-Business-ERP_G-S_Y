import React, { useState } from 'react';
import {
  Settings, Building2, Landmark, Clock, RefreshCw, Printer,
  ShieldAlert, CheckCircle2, Lock, Unlock, Wifi, WifiOff,
  DollarSign, FileText, Save, Sparkles, Layers
} from 'lucide-react';
import { SystemSettings, UserRole, SyncStatus } from '../../types';
import { AppState } from '../../services/storageService';

interface SystemSettingsViewProps {
  state: AppState;
  onUpdateState: (newState: AppState) => void;
  currentUserRole: UserRole;
}

export const SystemSettingsView: React.FC<SystemSettingsViewProps> = ({
  state,
  onUpdateState,
  currentUserRole
}) => {
  const [activeTab, setActiveTab] = useState<'COMPANY' | 'FINANCIAL' | 'RENTAL' | 'SYNC' | 'PRINT'>('FINANCIAL');
  const [settings, setSettings] = useState<SystemSettings>(state.settings);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const isOwnerOrGm = currentUserRole === 'OWNER' || currentUserRole === 'GENERAL_MANAGER';

  // Handle Save
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOwnerOrGm) {
      alert('تعديل الإعدادات الشاملة محصور بالمالك والمدير العام.');
      return;
    }

    const newState: AppState = {
      ...state,
      settings: settings,
      auditLogs: [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          userId: state.currentUser.id,
          userName: state.currentUser.name,
          action: 'تحديث إعدادات النظام',
          details: `تم تحديث الإعدادات الشاملة وقفل الفترة المالية: ${settings.isFiscalPeriodLocked ? 'مقفلة 🔒' : 'مفتوحة 🔓'}`
        },
        ...state.auditLogs
      ]
    };
    onUpdateState(newState);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Toggle Fiscal Period Lock (BR-27)
  const handleToggleFiscalLock = () => {
    if (!isOwnerOrGm) {
      alert('قفل الفترة المالية محصور بالمالك والمدير العام.');
      return;
    }
    const nextLocked = !settings.isFiscalPeriodLocked;
    const updated = { ...settings, isFiscalPeriodLocked: nextLocked };
    setSettings(updated);
  };

  // Trigger Manual Sync Flush
  const handleFlushSync = () => {
    onUpdateState({
      ...state,
      syncStatus: 'SYNCING'
    });

    setTimeout(() => {
      onUpdateState({
        ...state,
        syncStatus: 'ONLINE',
        lastSyncTime: 'الآن (متزامن 100%)',
        outbox: [] // Cleared outbox queue
      });
      alert('تم إرسال كافة المعاملات المعلقة في الـ Outbox Queue للخادم بنجاح وحل أي تعارضات.');
    }, 1200);
  };

  // Toggle Offline Simulation
  const handleToggleOfflineSim = () => {
    const nextStatus: SyncStatus = state.syncStatus === 'OFFLINE' ? 'ONLINE' : 'OFFLINE';
    onUpdateState({
      ...state,
      syncStatus: nextStatus
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-950 via-purple-900 to-indigo-950 text-white rounded-2xl p-6 shadow-xl border border-purple-800/80">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-purple-950 font-bold shadow-lg shadow-amber-950/40">
              <Settings className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-amber-300">الإعدادات الشاملة للنظام (System Settings)</h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 font-semibold">
                  Unit 5 — WAMAS v2.0
                </span>
              </div>
              <p className="text-xs text-purple-200/80 mt-1">
                ضبط السنة والفترة المالية، سياسات التأجير والغسيل، قفل الفترات المحاسبية، ومحرك التزامن Offline
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {saveSuccess && (
              <span className="px-3 py-1.5 bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                تم الحفظ وتطبيق الإعدادات
              </span>
            )}
            <button
              onClick={handleSaveSettings}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-purple-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-amber-950/30 transition cursor-pointer"
            >
              <Save className="w-4 h-4" />
              حفظ التعديلات
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap border-b border-slate-200 bg-white rounded-xl p-1.5 shadow-sm gap-1">
        <button
          onClick={() => setActiveTab('FINANCIAL')}
          className={`flex-1 py-2.5 px-4 rounded-lg font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'FINANCIAL'
              ? 'bg-purple-900 text-amber-300 shadow-sm'
              : 'text-slate-600 hover:text-purple-900 hover:bg-slate-50'
          }`}
        >
          <Landmark className="w-4 h-4" />
          الإعدادات المالية وقفل الفترة (BR-27)
        </button>
        <button
          onClick={() => setActiveTab('RENTAL')}
          className={`flex-1 py-2.5 px-4 rounded-lg font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'RENTAL'
              ? 'bg-purple-900 text-amber-300 shadow-sm'
              : 'text-slate-600 hover:text-purple-900 hover:bg-slate-50'
          }`}
        >
          <Clock className="w-4 h-4" />
          سياسات التأجير والـ Buffer
        </button>
        <button
          onClick={() => setActiveTab('SYNC')}
          className={`flex-1 py-2.5 px-4 rounded-lg font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'SYNC'
              ? 'bg-purple-900 text-amber-300 shadow-sm'
              : 'text-slate-600 hover:text-purple-900 hover:bg-slate-50'
          }`}
        >
          <RefreshCw className="w-4 h-4" />
          محرك التزامن والـ Offline (BR-29)
        </button>
        <button
          onClick={() => setActiveTab('COMPANY')}
          className={`flex-1 py-2.5 px-4 rounded-lg font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'COMPANY'
              ? 'bg-purple-900 text-amber-300 shadow-sm'
              : 'text-slate-600 hover:text-purple-900 hover:bg-slate-50'
          }`}
        >
          <Building2 className="w-4 h-4" />
          بيانات المنشأة والفروع
        </button>
        <button
          onClick={() => setActiveTab('PRINT')}
          className={`flex-1 py-2.5 px-4 rounded-lg font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'PRINT'
              ? 'bg-purple-900 text-amber-300 shadow-sm'
              : 'text-slate-600 hover:text-purple-900 hover:bg-slate-50'
          }`}
        >
          <Printer className="w-4 h-4" />
          الطباعة والإيصالات الحرارية
        </button>
      </div>

      {/* Tab 1: Financial & Fiscal Period Lock */}
      {activeTab === 'FINANCIAL' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">السنة المالية وقفل الفترة المحاسبية (Fiscal Period Lock)</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                قاعدة BR-27: إغلاق الفترة المالية يمنع قطعياً إدخال أو تعديل أي قيود يومية في تلك الفترة
              </p>
            </div>

            {/* Lock Period Toggle Button */}
            <button
              type="button"
              onClick={handleToggleFiscalLock}
              className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition cursor-pointer border shadow-sm ${
                settings.isFiscalPeriodLocked
                  ? 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
              }`}
            >
              {settings.isFiscalPeriodLocked ? (
                <>
                  <Lock className="w-4 h-4 text-rose-600" />
                  الفترة المالية مقفلة حالياً (ممنوع التعديل)
                </>
              ) : (
                <>
                  <Unlock className="w-4 h-4 text-emerald-600" />
                  الفترة المالية مفتوحة (مسموح بالقيود)
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">بداية السنة المالية</label>
              <input
                type="date"
                value={settings.fiscalYearStart}
                onChange={(e) => setSettings({ ...settings, fiscalYearStart: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">نهاية السنة المالية</label>
              <input
                type="date"
                value={settings.fiscalYearEnd}
                onChange={(e) => setSettings({ ...settings, fiscalYearEnd: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">نسبة ضريبة القيمة المضافة (VAT %)</label>
              <input
                type="number"
                value={settings.vatRatePercent}
                onChange={(e) => setSettings({ ...settings, vatRatePercent: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">سقف اعتماد أوامر الشراء (ريال) - BR-25</label>
              <input
                type="number"
                value={settings.poApprovalThreshold}
                onChange={(e) => setSettings({ ...settings, poApprovalThreshold: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 font-mono"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">أي أمر شراء يتجاوز هذا الحد يتطلب موافقة المدير العام</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Rental Policies */}
      {activeTab === 'RENTAL' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-6">
          <h3 className="font-bold text-slate-900 text-base pb-3 border-b border-slate-200">
            سياسات التأجير الإلزامية وهوامش الأمان (Buffer Guidelines)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">الحد الأدنى للعربون (% من قيمة الإيجار) - BR-02</label>
              <input
                type="number"
                value={settings.minRentalDepositPercent}
                onChange={(e) => setSettings({ ...settings, minRentalDepositPercent: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 font-mono"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">افتراضي: 25% لتأكيد الحجز وقفل القطعة</span>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">الحد الأدنى للتأمين والضمان (% من قيمة الإيجار) - BR-03</label>
              <input
                type="number"
                value={settings.minRentalCollateralPercent}
                onChange={(e) => setSettings({ ...settings, minRentalCollateralPercent: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 font-mono"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">افتراضي: 30% يُحجز كالتزام قبل التسليم</span>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">هامش الأمان بين الحجوزات (ساعات Buffer) - BR-01</label>
              <input
                type="number"
                value={settings.bookingBufferHours}
                onChange={(e) => setSettings({ ...settings, bookingBufferHours: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 font-mono"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">إجباري 48 ساعة قبل وبعد كل حجز لمنع التداخل والغسيل</span>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">غرامة التأخير اليومية (% من سعر الإيجار اليومي)</label>
              <input
                type="number"
                value={settings.dailyLatePenaltyPercent}
                onChange={(e) => setSettings({ ...settings, dailyLatePenaltyPercent: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 font-mono"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">افتراضي: 15% لكل يوم تأخير بعد انتهاء العقد</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Offline & Sync Engine */}
      {activeTab === 'SYNC' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">محرك التزامن والتشغيل بلا اتصال (Outbox Sync Engine)</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                معمارية Outbox Pattern + Idempotency Keys لضمان عمل أجهزة الكاشير والمخزن أثناء انقطاع الإنترنت
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleToggleOfflineSim}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 border transition cursor-pointer ${
                  state.syncStatus === 'OFFLINE'
                    ? 'bg-rose-50 text-rose-700 border-rose-300'
                    : 'bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                {state.syncStatus === 'OFFLINE' ? <WifiOff className="w-4 h-4" /> : <Wifi className="w-4 h-4 text-emerald-600" />}
                {state.syncStatus === 'OFFLINE' ? 'محاكاة وضع Offline (مفعل)' : 'تبديل وضع الاتصال'}
              </button>
              <button
                type="button"
                onClick={handleFlushSync}
                className="px-4 py-1.5 bg-purple-900 hover:bg-purple-800 text-amber-300 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                تزامن فوري الآن
              </button>
            </div>
          </div>

          {/* Sync Status Banner */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-3.5 h-3.5 rounded-full animate-pulse ${
                state.syncStatus === 'ONLINE' ? 'bg-emerald-500' : state.syncStatus === 'SYNCING' ? 'bg-amber-500' : 'bg-slate-400'
              }`} />
              <div>
                <div className="font-bold text-sm text-slate-900">
                  الحالة الحالية: {state.syncStatus === 'ONLINE' ? 'متصل بالخادم المركزي' : state.syncStatus === 'SYNCING' ? 'جاري التزامن...' : 'غير متصل (Offline Mode)'}
                </div>
                <div className="text-xs text-slate-500">آخر تزامن ناجح: {state.lastSyncTime}</div>
              </div>
            </div>

            <div className="text-left font-mono text-xs">
              <span className="text-slate-500">العمليات المعلقة في الـ Outbox:</span>{' '}
              <strong className="text-purple-900">{state.outbox.length} عملية</strong>
            </div>
          </div>

          {/* Outbox Queue Table */}
          <div>
            <h4 className="font-bold text-slate-800 text-xs mb-2">طابور التزامن المحلي (Outbox Queue):</h4>
            {state.outbox.length > 0 ? (
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-xs text-right">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">Idempotency Key</th>
                      <th className="p-2.5">الكيان</th>
                      <th className="p-2.5">الإجراء</th>
                      <th className="p-2.5">توقيت التسجيل المحلي</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {state.outbox.map(item => (
                      <tr key={item.id}>
                        <td className="p-2.5 font-bold text-purple-900">{item.idempotencyKey}</td>
                        <td className="p-2.5 text-slate-700">{item.entityType}</td>
                        <td className="p-2.5 text-slate-700">{item.action}</td>
                        <td className="p-2.5 text-slate-500">{item.createdAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-xs text-center font-bold">
                ✓ جميع المعاملات المحلية متزامنة ومطابقة تماماً مع الخادم السحابي
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Company Profile */}
      {activeTab === 'COMPANY' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
          <h3 className="font-bold text-slate-900 text-base pb-3 border-b border-slate-200">
            بيانات المنشأة والسجل التجاري
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">اسم المؤسسة (بالعربي)</label>
              <input
                type="text"
                value={settings.companyNameAr}
                onChange={(e) => setSettings({ ...settings, companyNameAr: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 font-bold"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">الاسم بالإنجليزي</label>
              <input
                type="text"
                value={settings.companyNameEn}
                onChange={(e) => setSettings({ ...settings, companyNameEn: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">رقم السجل التجاري (CR)</label>
              <input
                type="text"
                value={settings.crNumber}
                onChange={(e) => setSettings({ ...settings, crNumber: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">الرقم الضريبي (VAT ID)</label>
              <input
                type="text"
                value={settings.taxNumber}
                onChange={(e) => setSettings({ ...settings, taxNumber: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 font-mono"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Print Settings */}
      {activeTab === 'PRINT' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
          <h3 className="font-bold text-slate-900 text-base pb-3 border-b border-slate-200">
            إعدادات قوالب الطباعة والفواتير الحرارية
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">حجم الورق الافتراضي</label>
              <select
                value={settings.paperSize}
                onChange={(e) => setSettings({ ...settings, paperSize: e.target.value as any })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800"
              >
                <option value="THERMAL_80MM">طابعة فواتير كاشير حرارية (Thermal 80mm)</option>
                <option value="A4">طابعة مكتبية رسمية (Standard A4)</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">رمز الاستجابة السريعة (QR Code)</label>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-slate-700 font-semibold">
                ✓ متوافق مع هيئة الزكاة والضريبة والجمارك (ZATCA Stage 2)
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
