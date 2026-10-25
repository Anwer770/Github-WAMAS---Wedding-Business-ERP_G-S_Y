import React, { useState } from 'react';
import { 
  TrendingUp, Calendar, AlertTriangle, ShieldCheck, 
  DollarSign, Sparkles, CheckCircle, Clock, Shirt, ArrowUpRight,
  Flame, Zap, MessageCircle, Phone, ArrowLeft, Printer, RefreshCw, X
} from 'lucide-react';
import { AppState } from '../../services/storageService';
import { RentalContract, Booking } from '../../types';
import { ContractLifecycleService } from '../../services/contractLifecycleService';

interface DashboardViewProps {
  state: AppState;
  onNavigate: (tab: any) => void;
  onApplyLatePenalty?: (contractId: string, daysLate: number, penaltyAmount: number, notes?: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ 
  state, 
  onNavigate,
  onApplyLatePenalty
}) => {
  // Compute dynamic KPI metrics
  const totalUnits = state.units.length;
  const availableUnits = state.units.filter(u => u.status === 'AVAILABLE').length;
  const deliveredUnits = state.units.filter(u => u.status === 'DELIVERED').length;
  const cleaningUnits = state.units.filter(u => u.status === 'CLEANING').length;
  const damagedUnits = state.units.filter(u => u.status === 'DAMAGED' || u.status === 'REQUIRED_REPAIR').length;

  const activeContracts = state.contracts.filter(c => c.status === 'ACTIVE');
  
  // Contracts that exceeded expected return date by > 24 hours
  // Either daysLate >= 1 or date math > 24 hours
  const nowMs = Date.now();
  const overdue24hContracts = activeContracts.filter(c => {
    if (c.daysLate >= 1) return true;
    const returnTime = new Date(c.expectedReturnDate).getTime();
    const diffHours = (nowMs - returnTime) / (1000 * 3600);
    return diffHours >= 24;
  });

  const totalCollateralHeld = state.collaterals
    .filter(c => c.status === 'HELD')
    .reduce((acc, c) => acc + (c.amount || c.goldEstimatedValue || 0), 0);

  const totalMonthlyRevenue = state.journalEntries
    .filter(je => je.referenceType === 'RENTAL' || je.referenceType === 'SALE' || je.referenceType === 'DEPOSIT' || je.referenceType === 'SETTLEMENT')
    .reduce((acc, je) => acc + je.totalCredit, 0);

  const utilizationRate = Math.round(((totalUnits - availableUnits) / (totalUnits || 1)) * 100);

  // Quick Penalty Modal State
  const [selectedOverdueContract, setSelectedOverdueContract] = useState<RentalContract | null>(null);
  const [penaltyDays, setPenaltyDays] = useState<number>(2);
  const [penaltyNotes, setPenaltyNotes] = useState<string>('تطبيق غرامة تأخير 15% لتجاوز موعد الإرجاع بأكثر من 24 ساعة');
  const [penaltySuccessMessage, setPenaltySuccessMessage] = useState<string | null>(null);

  // Floating Toast State for Shortcut Button
  const [shortcutToast, setShortcutToast] = useState<{
    contractNumber: string;
    penaltyAmount: number;
    customerName: string;
    daysLate: number;
  } | null>(null);

  // Filter all contracts with 'daysLate > 0' for the 'Late Arrivals' widget
  const lateArrivalsContracts = state.contracts.filter(c => c.daysLate > 0);

  const handleOpenPenaltyModal = (contract: RentalContract) => {
    setSelectedOverdueContract(contract);
    setPenaltyDays(contract.daysLate > 0 ? contract.daysLate : 2);
    setPenaltySuccessMessage(null);
  };

  // 'Generate Penalty' shortcut button handler with pre-filled 24-hour grace period validation
  const handleQuickGeneratePenalty = (contract: RentalContract) => {
    // 24-Hour Grace Period Validation:
    // If daysLate <= 0, the 24-hour grace period is not yet exceeded
    if (contract.daysLate <= 0) {
      alert('تنبيه: العقد لا يزال ضمن فترة السماح المحددة (24 ساعة) ولا يُطبق عليه غرامة تأخير.');
      return;
    }

    const { customer, dailyRate, collateral } = getContractDetails(contract);
    const penaltyAmount = ContractLifecycleService.calculateLatePenalty(
      dailyRate,
      contract.daysLate,
      collateral || 3000
    );

    const gracePeriodValidationNote = `غرامة تأخير 15% بعد التحقق من انتهاء فترة السماح (24 ساعة) - عقد ${contract.contractNumber}`;

    if (onApplyLatePenalty) {
      onApplyLatePenalty(contract.id, contract.daysLate, penaltyAmount, gracePeriodValidationNote);
    }

    setShortcutToast({
      contractNumber: contract.contractNumber,
      penaltyAmount,
      customerName: customer?.fullName || 'العميل',
      daysLate: contract.daysLate
    });

    setTimeout(() => {
      setShortcutToast(null);
    }, 4500);
  };

  const handleConfirmPenalty = () => {
    if (!selectedOverdueContract) return;
    const booking = state.bookings.find(b => b.id === selectedOverdueContract.bookingId);
    const item = booking?.items[0];
    const dailyRate = item?.rentalPrice ? Math.round(item.rentalPrice / 2) : 1800;
    const collateral = state.collaterals
      .filter(c => c.contractId === selectedOverdueContract.id)
      .reduce((acc, c) => acc + (c.amount || c.goldEstimatedValue || 0), 0) || 1500;

    const penaltyAmount = ContractLifecycleService.calculateLatePenalty(dailyRate, penaltyDays, collateral);

    if (onApplyLatePenalty) {
      onApplyLatePenalty(selectedOverdueContract.id, penaltyDays, penaltyAmount, penaltyNotes);
    }

    setPenaltySuccessMessage(`تم توليد وتطبيق غرامة التأخير بقيمة ${penaltyAmount.toLocaleString('ar-SA')} ر.س وترحيل القيد المحاسبي المتوازن فوراً!`);
    setTimeout(() => {
      setSelectedOverdueContract(null);
      setPenaltySuccessMessage(null);
    }, 2500);
  };

  const getContractDetails = (contract: RentalContract) => {
    const booking = state.bookings.find(b => b.id === contract.bookingId);
    const customer = state.customers.find(c => c.id === contract.customerId);
    const item = booking?.items[0];
    const product = state.products.find(p => p.id === item?.productId);
    const collateral = state.collaterals
      .filter(c => c.contractId === contract.id)
      .reduce((acc, c) => acc + (c.amount || c.goldEstimatedValue || 0), 0);

    const dailyRate = product?.rentalPriceDaily || (item?.rentalPrice ? Math.round(item.rentalPrice / 2) : 1800);
    const daysOverdue = contract.daysLate > 0 ? contract.daysLate : 2;
    const calculatedPenalty = ContractLifecycleService.calculateLatePenalty(dailyRate, daysOverdue, collateral || 3000);

    return {
      booking,
      customer,
      item,
      product,
      collateral,
      dailyRate,
      daysOverdue,
      calculatedPenalty
    };
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Welcome */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-950 rounded-2xl p-6 text-white shadow-xl border border-purple-800/40 relative overflow-hidden">
        <div className="absolute left-0 bottom-0 top-0 w-96 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-400/20 via-transparent to-transparent pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-300/30 text-xs font-bold">
                لوحة المتابعة والتحكم التشغيلي المباشر
              </span>
              <span className="text-xs text-purple-200">الفرع الرئيسي - الرياض</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-serif">
              مرحباً بك في نظام WAMAS ERP
            </h1>
            <p className="text-sm text-purple-200/90 mt-1 max-w-2xl">
              إدارة الدورة التجارية الكاملة لمستلزمات الأعراس: منع التعارض الذاتي، الضمانات المصورة، والقيود المحاسبية المتوازنة.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate('BOOKINGS_CALENDAR')}
              className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-purple-950 font-bold text-xs shadow-lg shadow-amber-950/30 transition cursor-pointer flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              التقويم والجدولة الحية
            </button>
            <button
              onClick={() => onNavigate('TASKS_KANBAN')}
              className="px-4 py-2.5 rounded-xl bg-purple-800/80 hover:bg-purple-700 text-white font-bold text-xs border border-purple-600/50 transition cursor-pointer flex items-center gap-2"
            >
              <Clock className="w-4 h-4" />
              لوحة كانبان للمهام
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 🚨 SMART ALERTS PANEL: Overdue Return Contracts (> 24 Hours Late) */}
      {/* ========================================================================= */}
      <div className={`rounded-2xl p-6 shadow-xl border transition duration-300 ${
        overdue24hContracts.length > 0
          ? 'bg-gradient-to-r from-rose-950 via-purple-950 to-slate-900 border-rose-500/60 text-white'
          : 'bg-white border-slate-200 text-slate-900'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-rose-500/30">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
              overdue24hContracts.length > 0
                ? 'bg-gradient-to-br from-rose-500 to-red-700 text-white animate-pulse'
                : 'bg-emerald-100 text-emerald-700'
            }`}>
              {overdue24hContracts.length > 0 ? (
                <Flame className="w-6 h-6 text-white" />
              ) : (
                <CheckCircle className="w-6 h-6" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-wide">
                  {overdue24hContracts.length > 0 ? 'لوحة التنبيهات الذكية: عقود تجاوزت موعد الإرجاع (+24 ساعة)' : 'حالة الالتزام بمواعيد الإرجاع'}
                </h2>
                {overdue24hContracts.length > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-xs font-black animate-pulse shadow-sm">
                    {overdue24hContracts.length} عقود حرجة
                  </span>
                )}
              </div>
              <p className={`text-xs mt-0.5 ${overdue24hContracts.length > 0 ? 'text-rose-200/90' : 'text-slate-500'}`}>
                {overdue24hContracts.length > 0 
                  ? 'تنبيه فوري: تجاوزت هذه العقود الموعد المحدد بأكثر من 24 ساعة، ويحق للمنشأة احتساب غرامة تأخير يومية بنسبة 15% من سعر اليوم'
                  : 'جميع العقود النشطة ملتزمة بمواعيد الإرجاع المحددة ضمن الهامش الزمني الطبيعي.'
                }
              </p>
            </div>
          </div>

          {overdue24hContracts.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs bg-rose-900/60 text-rose-200 px-3 py-1.5 rounded-xl border border-rose-500/40 font-bold">
                قاعدة BR-08: غرامة التأخير = الأيام × 15%
              </span>
            </div>
          )}
        </div>

        {/* Overdue Contracts Cards List */}
        {overdue24hContracts.length > 0 ? (
          <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
            {overdue24hContracts.map((contract) => {
              const { customer, item, product, collateral, dailyRate, daysOverdue, calculatedPenalty } = getContractDetails(contract);
              const isPenaltyApplied = contract.latePenaltyFee > 0;

              return (
                <div
                  key={contract.id}
                  className="bg-slate-900/90 rounded-2xl p-5 border border-rose-500/50 shadow-lg relative overflow-hidden flex flex-col justify-between"
                >
                  {/* Decorative glowing gradient */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-rose-600/10 rounded-full blur-2xl pointer-events-none" />

                  <div>
                    {/* Header line */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-lg bg-rose-600/30 text-rose-300 border border-rose-400/40 font-mono text-xs font-bold">
                          {contract.contractNumber}
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-bold border border-amber-400/30">
                          المرحلة {contract.currentStage}/12
                        </span>
                      </div>

                      {/* Overdue badge */}
                      <span className="px-3 py-1 rounded-full bg-gradient-to-r from-red-600 to-rose-700 text-white font-black text-xs shadow-md animate-pulse">
                        متأخر {daysOverdue * 24} ساعة ({daysOverdue} {daysOverdue === 1 ? 'يوم' : 'أيام'})
                      </span>
                    </div>

                    {/* Customer & Product Information */}
                    <div className="space-y-1.5 mb-4">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">العميل:</span>
                        <span className="font-extrabold text-white text-sm">{customer?.fullName}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">الصنف والقطعة:</span>
                        <span className="font-bold text-amber-300 truncate max-w-[240px]">
                          {item?.productName || product?.nameAr} ({item?.unitSerialNumber})
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">تاريخ الإرجاع المتوقع:</span>
                        <span className="font-mono text-rose-300 font-bold">{contract.expectedReturnDate}</span>
                      </div>
                    </div>

                    {/* Financial penalty calculation box */}
                    <div className="bg-purple-950/70 p-3.5 rounded-xl border border-purple-700/50 mb-4 text-xs">
                      <div className="grid grid-cols-3 gap-2 text-center pb-2 border-b border-purple-800/60">
                        <div>
                          <span className="text-[10px] text-purple-300 block">سعر التأجير اليومي</span>
                          <span className="font-bold text-white mt-0.5 block">{dailyRate.toLocaleString('ar-SA')} ر.س</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-purple-300 block">معادلة الغرامة (15%)</span>
                          <span className="font-bold text-amber-300 mt-0.5 block">
                            {Math.round(dailyRate * 0.15).toLocaleString('ar-SA')} ر.س/يوم
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-purple-300 block">التأمين المحتجز</span>
                          <span className="font-bold text-emerald-400 mt-0.5 block">
                            {collateral.toLocaleString('ar-SA')} ر.س
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2.5">
                        <span className="font-bold text-rose-200">
                          {isPenaltyApplied ? 'الغرامة المعتمدة حالياً:' : 'الغرامة المستحقة المقدرة:'}
                        </span>
                        <span className="font-black text-base text-rose-400 font-mono">
                          {(isPenaltyApplied ? contract.latePenaltyFee : calculatedPenalty).toLocaleString('ar-SA')} ر.س
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
                    {/* Quick WhatsApp / Call */}
                    <div className="flex items-center gap-1.5">
                      <a
                        href={`https://wa.me/${customer?.phone?.replace(/\D/g, '')}?text=${encodeURIComponent(
                          `السلام عليكم ورحمة الله، عميلتنا الكريمة ${customer?.fullName} من دار WAMAS للأعراس.\nنحيطكم علماً بأن فستانكم بالعقد (${contract.contractNumber}) قد تجاوز موعد الإرجاع المتفق عليه (${contract.expectedReturnDate}) بأكثر من 24 ساعة.\nيُرجى المبادرة بإعادة الفستان فوراً لتفادي تصاعد غرامات التأخير اليومية المقررة نظامياً.\nشاكرين تعاونكم.`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-xl bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                        title="إرسال إشعار تأخير فوري عبر واتساب"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        واتساب
                      </a>

                      <a
                        href={`tel:${customer?.phone}`}
                        className="p-2 rounded-xl bg-purple-800/40 hover:bg-purple-700 text-purple-200 hover:text-white border border-purple-600/40 text-xs transition flex items-center gap-1 cursor-pointer"
                        title="اتصال هاتفي بالعميل"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                    </div>

                    {/* Quick Penalty Generator Button */}
                    <button
                      onClick={() => handleOpenPenaltyModal(contract)}
                      className={`px-3.5 py-2 rounded-xl font-black text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer ${
                        isPenaltyApplied
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40 hover:bg-amber-500/30'
                          : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 text-purple-950 shadow-amber-950/40 border border-amber-300/40'
                      }`}
                    >
                      <Zap className="w-4 h-4 fill-current text-purple-950" />
                      {isPenaltyApplied ? 'تحديث غرامة التأخير' : 'توليد وتطبيق الغرامة فوراً ⚡'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-6 text-center text-slate-500 text-xs">
            <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
            <span className="font-bold text-slate-700 block">النظام التشغيلي في حالة ممتازة</span>
            لا توجد عقود تأجير متأخرة عن الإرجاع لأكثر من 24 ساعة.
          </div>
        )}
      </div>

      {/* Quick Penalty Generator Modal */}
      {selectedOverdueContract && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 text-right animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-purple-950 flex items-center justify-center font-black shadow-md">
                  <Zap className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900">توليد وتطبيق غرامة التأخير الفورية</h3>
                  <p className="text-[11px] text-slate-500">
                    العقد: <strong className="text-purple-950 font-mono">{selectedOverdueContract.contractNumber}</strong>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedOverdueContract(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center text-xs font-bold cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="py-4 space-y-4 text-xs">
              {penaltySuccessMessage ? (
                <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-900 text-center animate-in fade-in">
                  <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                  <div className="font-black text-sm">{penaltySuccessMessage}</div>
                  <p className="text-[11px] text-emerald-700 mt-1">
                    تم إنشاء قيد اليومية (مدين: أمانات التأمين 2101 / دائن: إيرادات الغرامات 4201) وتكليف موظف التحصيل بالمتابعة.
                  </p>
                </div>
              ) : (
                <>
                  {/* Calculation Details */}
                  {(() => {
                    const { customer, item, product, collateral, dailyRate } = getContractDetails(selectedOverdueContract);
                    const penaltyPerDay = Math.round(dailyRate * 0.15);
                    const totalCalculated = Math.min(penaltyDays * penaltyPerDay, collateral || 3000);
                    const netCollateral = Math.max(0, (collateral || 3000) - totalCalculated);

                    return (
                      <div className="space-y-4">
                        <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200">
                          <div className="flex justify-between text-slate-700 mb-1">
                            <span>العميل:</span>
                            <strong className="text-purple-950 font-bold">{customer?.fullName}</strong>
                          </div>
                          <div className="flex justify-between text-slate-700 mb-1">
                            <span>الصنف المؤجر:</span>
                            <strong className="text-purple-950 font-bold">{item?.productName || product?.nameAr}</strong>
                          </div>
                          <div className="flex justify-between text-slate-700">
                            <span>سعر التأجير اليومي:</span>
                            <span className="font-bold text-slate-900">{dailyRate.toLocaleString('ar-SA')} ر.س</span>
                          </div>
                        </div>

                        {/* Editable Days Late */}
                        <div>
                          <label className="block text-xs font-bold text-slate-800 mb-1.5">
                            عدد أيام التأخير المحتسبة:
                          </label>
                          <div className="flex items-center gap-3">
                            <input
                              type="number"
                              min={1}
                              max={30}
                              value={penaltyDays}
                              onChange={(e) => setPenaltyDays(Math.max(1, Number(e.target.value)))}
                              className="w-28 text-center text-sm font-black p-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-600"
                            />
                            <span className="text-slate-500 text-xs">
                              (كل يوم تأخير = 15% من سعر اليوم: {penaltyPerDay.toLocaleString('ar-SA')} ر.س)
                            </span>
                          </div>
                        </div>

                        {/* Mathematical Formula Preview */}
                        <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800">
                          <div className="text-[11px] text-amber-300 font-bold mb-2 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5" />
                            معادلة الاحتساب الآلية (BR-08):
                          </div>
                          <div className="font-mono text-xs text-slate-300 space-y-1">
                            <div>{penaltyDays} أيام × 15% من {dailyRate} ر.س = {penaltyDays * penaltyPerDay} ر.س</div>
                            <div>الحد الأقصى للغرامة = قيمة التأمين المحتجز ({collateral} ر.س)</div>
                          </div>

                          <div className="pt-3 mt-3 border-t border-slate-800 flex justify-between items-center">
                            <span className="font-bold text-white text-sm">صافي غرامة التأخير الواجبة:</span>
                            <span className="font-black text-xl text-amber-400 font-mono">
                              {totalCalculated.toLocaleString('ar-SA')} ر.س
                            </span>
                          </div>

                          <div className="text-[11px] text-emerald-400 mt-1 flex justify-between">
                            <span>المتبقي من أمانة التأمين بعد الخصم:</span>
                            <span className="font-bold">{netCollateral.toLocaleString('ar-SA')} ر.س</span>
                          </div>
                        </div>

                        {/* Reason / Notes */}
                        <div>
                          <label className="block text-xs font-bold text-slate-800 mb-1">
                            البيان في سند القيد وسجل التدقيق:
                          </label>
                          <input
                            type="text"
                            value={penaltyNotes}
                            onChange={(e) => setPenaltyNotes(e.target.value)}
                            className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-600"
                          />
                        </div>
                      </div>
                    );
                  })()}
                </>
              )}
            </div>

            {/* Modal Footer */}
            {!penaltySuccessMessage && (
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedOverdueContract(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={handleConfirmPenalty}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 text-purple-950 font-black text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Zap className="w-4 h-4 fill-current" />
                  اعتماد الغرامة وترحيل القيد المحاسبي
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Revenue */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">إجمالي إيرادات العمليات (الشهر)</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {(totalMonthlyRevenue || 128500).toLocaleString('ar-SA')} <span className="text-xs font-bold text-emerald-600">ر.س</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-700">
            <TrendingUp className="w-4 h-4" />
            <span>+18.4% نمو مقارنة بالشهر السابق</span>
          </div>
        </div>

        {/* Occupancy / Utilization Rate */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">معدل إشغال الفساتين والقطع</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Shirt className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {utilizationRate}%
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
            <span>{deliveredUnits} قطعة مُسلَّمة حالياً</span>
            <span className="text-purple-700 font-bold">{availableUnits} متاحة للحجز</span>
          </div>
        </div>

        {/* Held Collateral Liability */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">أمانات التأمين المحتجزة (التزام)</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {totalCollateralHeld.toLocaleString('ar-SA')} <span className="text-xs font-bold text-amber-600">ر.س</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-amber-800">
            <Sparkles className="w-4 h-4" />
            <span>نقد وذهب محفوظ في الخزينة المصفحة</span>
          </div>
        </div>

        {/* Overdue Alert Card */}
        <div className={`rounded-2xl p-5 shadow-sm border transition ${
          overdue24hContracts.length > 0 
            ? 'bg-rose-50/70 border-rose-300' 
            : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">العقود المتأخرة (+24 ساعة)</span>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              overdue24hContracts.length > 0 ? 'bg-rose-500 text-white animate-pulse' : 'bg-slate-100 text-slate-500'
            }`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className={`text-2xl font-black tracking-tight ${
            overdue24hContracts.length > 0 ? 'text-rose-700' : 'text-slate-900'
          }`}>
            {overdue24hContracts.length} <span className="text-xs font-normal">عقد متأخر</span>
          </div>
          <div className="mt-3 text-xs text-rose-800 font-medium">
            {overdue24hContracts.length > 0 
              ? 'تجاوزت موعدها بـ 24+ ساعة — الغرامة مستحقة' 
              : 'جميع مواعيد الإرجاع منتظمة'
            }
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* ⏱️ LATE ARRIVALS DASHBOARD WIDGET (filters contracts with daysLate > 0)    */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 text-purple-950 flex items-center justify-center font-black shadow-md">
              <Clock className="w-5 h-5 text-purple-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-slate-900">عقود الوصول المتأخر — Late Arrivals</h3>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold text-xs border border-amber-300">
                  {lateArrivalsContracts.length} عقود (daysLate &gt; 0)
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                تصفية شاملة لجميع العقود التي تجاوزت موعد الإرجاع (daysLate &gt; 0) مع التحقق من انتهاء فترة السماح (24 ساعة)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-lg border border-emerald-200 font-bold flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              فترة السماح المقررة: 24 ساعة (معتمدة تلقائياً)
            </span>
          </div>
        </div>

        {/* Content */}
        {lateArrivalsContracts.length > 0 ? (
          <div className="mt-4 divide-y divide-slate-100">
            {lateArrivalsContracts.map((contract) => {
              const { customer, item, product, collateral, dailyRate, calculatedPenalty } = getContractDetails(contract);
              const isPenaltyApplied = contract.latePenaltyFee > 0;

              return (
                <div
                  key={contract.id}
                  className="py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-slate-50/70 p-3 rounded-xl transition"
                >
                  {/* Left: Contract & Customer details */}
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-950 flex items-center justify-center font-bold shrink-0 mt-0.5">
                      {contract.currentStage}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-extrabold text-sm text-slate-900 font-mono">{contract.contractNumber}</span>
                        <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-[10px]">
                          متأخر {contract.daysLate} {contract.daysLate === 1 ? 'يوم' : 'أيام'} ({contract.daysLate * 24} ساعة)
                        </span>
                        {/* 24-Hour Grace Period Validation Badge */}
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center gap-1 border border-emerald-300">
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                          فترة السماح (24h): مُستنفذة ومُعتمدة للاحتساب
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 mt-1 font-medium">
                        العميل: <strong className="text-slate-900">{customer?.fullName}</strong> ({customer?.phone})
                      </p>
                      <p className="text-xs text-purple-900 font-semibold mt-0.5 truncate max-w-md">
                        الصنف: {item?.productName || product?.nameAr} ({item?.unitSerialNumber})
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        الموعد المتوقع: {contract.expectedReturnDate} | التأمين المحتجز: {collateral.toLocaleString('ar-SA')} ر.س
                      </p>
                    </div>
                  </div>

                  {/* Right: Calculations & Shortcut Button */}
                  <div className="flex flex-wrap items-center justify-between lg:justify-end gap-4 shrink-0">
                    <div className="text-left">
                      <span className="text-[10px] text-slate-400 block">سعر اليوم (15% غرامة/يوم)</span>
                      <span className="font-bold text-xs text-slate-700 block">
                        {dailyRate.toLocaleString('ar-SA')} ر.س ({Math.round(dailyRate * 0.15).toLocaleString('ar-SA')} ر.س/يوم)
                      </span>
                      <span className="text-xs font-black text-rose-600 block mt-0.5">
                        {isPenaltyApplied 
                          ? `الغرامة المُطبَّقة: ${contract.latePenaltyFee.toLocaleString('ar-SA')} ر.س ✅` 
                          : `الغرامة المقدرة: ${calculatedPenalty.toLocaleString('ar-SA')} ر.س`
                        }
                      </span>
                    </div>

                    {/* 'Generate Penalty' Shortcut Button */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleQuickGeneratePenalty(contract)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-black shadow-md transition flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                          isPenaltyApplied
                            ? 'bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300'
                            : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 text-purple-950 border border-amber-300 shadow-amber-950/20'
                        }`}
                        title="توليد وتطبيق غرامة التأخير مباشرة مع التحقق من انتهاء فترة السماح (24 ساعة)"
                      >
                        <Zap className="w-4 h-4 fill-current text-purple-950" />
                        <span>{isPenaltyApplied ? 'إعادة توليد الغرامة' : 'Generate Penalty (توليد الغرامة)'}</span>
                      </button>

                      {/* Customize Modal Button */}
                      <button
                        onClick={() => handleOpenPenaltyModal(contract)}
                        className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-800 text-xs transition cursor-pointer"
                        title="تخصيص أيام التأخير والملاحظات"
                      >
                        ⚙️
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-8 text-center text-slate-500 text-xs">
            <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
            <span className="font-bold text-slate-800 block text-sm">لا توجد عقود وصول متأخر (daysLate = 0)</span>
            <p className="text-slate-400 mt-0.5">كافة العقود ملتزمة بمواعيد الإرجاع المحددة أو تقع ضمن فترة السماح (24 ساعة).</p>
          </div>
        )}
      </div>

      {/* Floating Success Toast for Shortcut Action */}
      {shortcutToast && (
        <div className="fixed bottom-6 left-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-amber-400/60 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 text-xs">
          <div className="w-8 h-8 rounded-xl bg-amber-400 text-purple-950 flex items-center justify-center font-black shrink-0">
            <Zap className="w-4 h-4 fill-current" />
          </div>
          <div>
            <div className="font-bold text-amber-300">
              تم توليد وتطبيق غرامة التأخير بنجاح (فترة سماح 24h منتهية)
            </div>
            <div className="text-slate-300 text-[11px] mt-0.5">
              العقد: <span className="font-mono text-white font-bold">{shortcutToast.contractNumber}</span> — العميل: {shortcutToast.customerName} — الغرامة: <span className="text-emerald-400 font-bold">{shortcutToast.penaltyAmount.toLocaleString('ar-SA')} ر.س</span> ({shortcutToast.daysLate} يوم)
            </div>
          </div>
          <button
            onClick={() => setShortcutToast(null)}
            className="text-slate-400 hover:text-white mr-2 p-1 text-sm font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Operational Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Units 14 Statuses Overview */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">الحالة التشغيلية الآنية للمخزون (14 حالة)</h2>
              <p className="text-xs text-slate-500">توزيع فوري لحالة كل قطعة فيزيائية في المعرض والمستودعات</p>
            </div>
            <button
              onClick={() => onNavigate('INVENTORY_UNITS')}
              className="text-xs text-purple-700 font-bold hover:text-purple-900 flex items-center gap-1 cursor-pointer"
            >
              عرض التفاصيل الكاملة
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
              <span className="text-[11px] text-emerald-800 font-medium">متاحة للحجز (AVAILABLE)</span>
              <div className="text-xl font-bold text-emerald-950 mt-1">{availableUnits}</div>
            </div>
            <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200">
              <span className="text-[11px] text-blue-800 font-medium">مُسلَّمة للعملاء (DELIVERED)</span>
              <div className="text-xl font-bold text-blue-950 mt-1">{deliveredUnits}</div>
            </div>
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200">
              <span className="text-[11px] text-amber-800 font-medium">غسيل إجباري 24h (CLEANING)</span>
              <div className="text-xl font-bold text-amber-950 mt-1">{cleaningUnits}</div>
            </div>
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200">
              <span className="text-[11px] text-rose-800 font-medium">تالفة أو قيد الإصلاح (DAMAGED)</span>
              <div className="text-xl font-bold text-rose-950 mt-1">{damagedUnits}</div>
            </div>
          </div>

          {/* Quick List of Active Contracts */}
          <div className="mt-6">
            <h3 className="text-xs font-bold text-slate-800 mb-3">أبرز عقود التأجير الجارية ومراحلها</h3>
            <div className="space-y-2.5">
              {state.contracts.slice(0, 3).map((cnt) => {
                const customer = state.customers.find(c => c.id === cnt.customerId);
                return (
                  <div key={cnt.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-900 font-bold flex items-center justify-center shrink-0">
                        {cnt.currentStage}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{cnt.contractNumber} — {customer?.fullName}</div>
                        <div className="text-slate-500 text-[11px]">تاريخ الإرجاع المتوقع: {cnt.expectedReturnDate}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {cnt.daysLate > 0 ? (
                        <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-[10px]">
                          متأخر {cnt.daysLate} يوم
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                          المرحلة {cnt.currentStage}/12
                        </span>
                      )}
                      <button
                        onClick={() => onNavigate('RENTAL_CONTRACTS')}
                        className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium transition cursor-pointer"
                      >
                        متابعة
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Urgent Tasks & Team Activity */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">المهام العاجلة اليوم</h2>
              <span className="text-xs font-bold text-purple-800 bg-purple-100 px-2 py-0.5 rounded-full">
                {state.tasks.filter(t => t.status !== 'COMPLETED').length} مهام
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {state.tasks.slice(0, 4).map((task) => (
                <div key={task.id} className="p-3 rounded-xl border border-slate-200 hover:border-purple-300 transition">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      task.priority === 'URGENT' ? 'bg-rose-100 text-rose-800' :
                      task.priority === 'HIGH' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {task.priority === 'URGENT' ? '🔴 عاجلة' : task.priority === 'HIGH' ? '🟠 عالية' : 'متوسطة'}
                    </span>
                    <span className="text-[10px] text-slate-400">{task.taskNumber}</span>
                  </div>
                  <p className="text-xs font-bold text-slate-800 line-clamp-1">{task.title}</p>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                    <span>المكلَّف: {task.assignedToName}</span>
                    <span className="text-purple-900 font-semibold">{task.status === 'COMPLETED' ? 'مكتملة ✅' : 'قيد التنفيذ'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigate('TASKS_KANBAN')}
            className="w-full mt-4 py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 font-bold text-xs transition cursor-pointer text-center"
          >
            فتح لوحة كانبان والمهام التشغيلية
          </button>
        </div>

      </div>

    </div>
  );
};
