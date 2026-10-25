import React, { useState } from 'react';
import { 
  FileText, CheckCircle2, AlertTriangle, ArrowRight, ArrowLeft, 
  ShieldCheck, Camera, Sparkles, Printer, User, DollarSign, Calendar
} from 'lucide-react';
import { AppState } from '../../services/storageService';
import { ContractLifecycleService, StageTransitionResult } from '../../services/contractLifecycleService';
import { RentalContract, ContractStage, Booking, Collateral, Inspection, ProductUnit } from '../../types';

interface RentalContractsViewProps {
  state: AppState;
  onAdvanceContractStage: (contractId: string, targetStage: ContractStage) => void;
  onNavigateToInspection: () => void;
}

export const STAGES_DEFINITIONS: { stage: ContractStage; title: string; subtitle: string; icon: string }[] = [
  { stage: 1, title: 'تسجيل العميل والمناسبة', subtitle: 'إنشاء ملف CRM وتحديد تاريخ الحفل', icon: '👤' },
  { stage: 2, title: 'اختيار الأصناف وفحص التعارض', subtitle: 'التحقق من توفر القطعة وهامش 48 ساعة', icon: '👗' },
  { stage: 3, title: 'دفع العربون (≥25%)', subtitle: 'تأكيد الحجز وتوليد مهمة التجهيز', icon: '💳' },
  { stage: 4, title: 'توقيع العقد رقمياً', subtitle: 'إصدار العقد الرسمي وتوثيقه إلكترونياً', icon: '✍️' },
  { stage: 5, title: 'تحصيل التأمين (التزام)', subtitle: 'إيداع تأمين نقدي أو عيني (ذهب/سلاح)', icon: '🛡️' },
  { stage: 6, title: 'التجهيز والخياطة', subtitle: 'تعديل المقاسات والكي والبخار', icon: '✂️' },
  { stage: 7, title: 'التسليم بمسح QR + صور', subtitle: 'رفع صور حالة الصنف قبل التسليم', icon: '📸' },
  { stage: 8, title: 'فترة الاستخدام والمناسبة', subtitle: 'متابعة عداد التأخير إن وجد', icon: '🎉' },
  { stage: 9, title: 'الإرجاع بمسح QR + فحص', subtitle: 'استلام الصنف والتوثيق المصور فوراً', icon: '🔄' },
  { stage: 10, title: 'تقييم التلف والتأخير', subtitle: 'حصر التلفيات واحتساب الغرامات', icon: '🔍' },
  { stage: 11, title: 'التسوية وخصم الغرامات', subtitle: 'إقفال التأمين ورد الصافي للعميل', icon: '⚖️' },
  { stage: 12, title: 'إغلاق العقد والغسيل الإجباري', subtitle: 'تحويل الصنف لـ CLEANING لمدة 24h', icon: '🧼' }
];

export const RentalContractsView: React.FC<RentalContractsViewProps> = ({
  state,
  onAdvanceContractStage,
  onNavigateToInspection
}) => {
  const [selectedContractId, setSelectedContractId] = useState<string>(state.contracts[0]?.id || '');
  const selectedContract = state.contracts.find(c => c.id === selectedContractId) || state.contracts[0];

  const booking = state.bookings.find(b => b.id === selectedContract?.bookingId);
  const customer = state.customers.find(c => c.id === selectedContract?.customerId);
  const item = booking?.items[0];
  const unit = state.units.find(u => u.id === item?.productUnitId);
  const collaterals = state.collaterals.filter(c => c.contractId === selectedContract?.id);
  const inspections = state.inspections.filter(i => i.contractId === selectedContract?.id);

  const handleNextStage = () => {
    if (!selectedContract || !booking || !unit) return;
    const nextStage = (selectedContract.currentStage + 1) as ContractStage;

    const validation = ContractLifecycleService.canTransitionStage(
      selectedContract,
      nextStage,
      booking,
      collaterals,
      inspections,
      unit
    );

    if (!validation.canTransition) {
      alert(validation.error);
      return;
    }

    onAdvanceContractStage(selectedContract.id, nextStage);
  };

  return (
    <div className="space-y-6">
      
      {/* View Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">عقود التأجير — الدورة التنفيذية الكاملة (12 مرحلة)</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-900 text-xs font-bold border border-purple-200">
              دورة تجارية مترابطة
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            تسلسل عمليات صارم من أول تواصل حتى إغلاق العقد واسترجاع التأمين والغسيل الإجباري
          </p>
        </div>

        {/* Contract Switcher */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-700">اختر العقد النشط:</label>
          <select
            value={selectedContractId}
            onChange={(e) => setSelectedContractId(e.target.value)}
            className="text-xs font-bold p-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-purple-600"
          >
            {state.contracts.map(c => (
              <option key={c.id} value={c.id}>
                {c.contractNumber} (المرحلة {c.currentStage}/12)
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedContract && (
        <>
          {/* Contract Metadata Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-4 border-b border-slate-100 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-900 to-indigo-900 text-amber-300 font-bold flex items-center justify-center text-lg shadow-md">
                  {selectedContract.currentStage}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-base text-slate-900">{selectedContract.contractNumber}</h3>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                      {selectedContract.status === 'ACTIVE' ? 'عقد نشط' : 'مغلق'}
                    </span>
                    {selectedContract.daysLate > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-[10px]">
                        متأخر {selectedContract.daysLate} يوم
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    العميل: <strong className="text-slate-800">{customer?.fullName}</strong> ({customer?.phone}) | مناسبة: {customer?.eventType}
                  </p>
                </div>
              </div>

              {/* Advance Action Buttons */}
              <div className="flex items-center gap-3">
                {selectedContract.currentStage < 12 && (
                  <button
                    onClick={handleNextStage}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-900 to-indigo-900 hover:from-purple-800 text-amber-300 font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer border border-amber-400/40"
                  >
                    <span>الانتقال للمرحلة التالية ({selectedContract.currentStage + 1})</span>
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                )}
                {selectedContract.currentStage === 9 && (
                  <button
                    onClick={onNavigateToInspection}
                    className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-purple-950 font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                    فتح شاشة توثيق الإرجاع والمقارنة
                  </button>
                )}
              </div>
            </div>

            {/* Quick Details Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">الصنف المؤجر:</span>
                <span className="font-bold text-slate-800">{item?.productName}</span>
                <span className="text-[10px] text-purple-700 block">كود القطعة: {item?.unitSerialNumber}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">فترة الحجز:</span>
                <span className="font-bold text-slate-800">{selectedContract.startDate} إلى {selectedContract.expectedReturnDate}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">العربون والمدفوع:</span>
                <span className="font-bold text-emerald-700">{booking?.depositPaid.toLocaleString('ar-SA')} ر.س</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">التأمين المودع:</span>
                <span className="font-bold text-amber-700">
                  {collaterals.reduce((acc, c) => acc + (c.amount || c.goldEstimatedValue || 0), 0).toLocaleString('ar-SA')} ر.س
                </span>
              </div>
            </div>
          </div>

          {/* 12-Stage Visual Stepper */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-6">
              مراحل العقد التنفيذية (المرحلة الحالية: {selectedContract.currentStage} من 12)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {STAGES_DEFINITIONS.map((def) => {
                const isCurrent = def.stage === selectedContract.currentStage;
                const isCompleted = def.stage < selectedContract.currentStage;
                const isFuture = def.stage > selectedContract.currentStage;

                return (
                  <div
                    key={def.stage}
                    className={`rounded-2xl p-4 border transition ${
                      isCurrent
                        ? 'bg-purple-900 text-white border-purple-950 ring-2 ring-amber-400 shadow-lg'
                        : isCompleted
                        ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                        : 'bg-slate-50 border-slate-200 text-slate-500 opacity-70'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{def.icon}</span>
                        <span className={`text-xs font-black ${isCurrent ? 'text-amber-300' : ''}`}>
                          مرحلة {def.stage}
                        </span>
                      </div>
                      {isCompleted && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      )}
                      {isCurrent && (
                        <span className="text-[10px] bg-amber-400 text-purple-950 font-bold px-2 py-0.5 rounded-full">
                          جارية الآن
                        </span>
                      )}
                    </div>

                    <h4 className={`text-xs font-bold leading-snug ${isCurrent ? 'text-white' : 'text-slate-800'}`}>
                      {def.title}
                    </h4>

                    <p className={`text-[11px] mt-1 leading-relaxed ${isCurrent ? 'text-purple-200' : 'text-slate-500'}`}>
                      {def.subtitle}
                    </p>

                    {/* Specific stage checks feedback */}
                    {def.stage === 5 && isCurrent && collaterals.length === 0 && (
                      <div className="mt-2 text-[10px] text-amber-200 bg-amber-950/40 p-1.5 rounded font-bold">
                        ⚠️ يتطلب استلام التأمين قبل التقدم (BR-03)
                      </div>
                    )}
                    {def.stage === 7 && isCurrent && inspections.length === 0 && (
                      <div className="mt-2 text-[10px] text-rose-200 bg-rose-950/40 p-1.5 rounded font-bold">
                        ⚠️ يلزم رفع صورة قبل التسليم (BR-17)
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

    </div>
  );
};
