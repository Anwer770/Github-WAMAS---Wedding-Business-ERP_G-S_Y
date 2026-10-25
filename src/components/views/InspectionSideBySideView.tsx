import React, { useState, useRef } from 'react';
import { 
  Camera, Upload, Eye, CheckCircle, AlertTriangle, 
  MapPin, DollarSign, Share2, Sparkles, Plus, Trash2, ArrowLeftRight
} from 'lucide-react';
import { AppState } from '../../services/storageService';
import { Inspection, DamageMarker, DamageType, RentalContract } from '../../types';

interface InspectionSideBySideProps {
  state: AppState;
  onSaveInspection: (inspection: Inspection, contractUpdate?: Partial<RentalContract>) => void;
}

export const DAMAGE_TYPE_LABELS: Record<DamageType, { label: string; defaultCost: number; color: string }> = {
  SPOT: { label: 'بقعة (Spot / Stain)', defaultCost: 250, color: 'bg-amber-500' },
  TEAR: { label: 'تمزق قماش (Tear)', defaultCost: 400, color: 'bg-rose-500' },
  MISSING_BEADS: { label: 'نقص خرز وزينة (Beads)', defaultCost: 300, color: 'bg-purple-500' },
  BROKEN: { label: 'كسر أو تلف هيكلي', defaultCost: 500, color: 'bg-red-600' },
  LOST_PIECE: { label: 'فقدان ملحق أو طرحة', defaultCost: 800, color: 'bg-slate-700' },
  EMBROIDERY_DAMAGE: { label: 'تلف تطريز يدوي', defaultCost: 350, color: 'bg-indigo-500' },
  BURN: { label: 'حرق أو كي جائر', defaultCost: 1200, color: 'bg-red-800' },
  OTHER: { label: 'تلفيات أخرى', defaultCost: 200, color: 'bg-zinc-600' }
};

export const InspectionSideBySideView: React.FC<InspectionSideBySideProps> = ({
  state,
  onSaveInspection
}) => {
  const [selectedContractId, setSelectedContractId] = useState<string>(state.contracts[1]?.id || state.contracts[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'SIDE_BY_SIDE' | 'ADD_NEW'>('SIDE_BY_SIDE');

  // Markers state for interactive markup tool
  const selectedContract = state.contracts.find(c => c.id === selectedContractId);
  const preInspection = state.inspections.find(i => i.contractId === selectedContractId && i.type === 'PRE_DELIVERY');
  const postInspection = state.inspections.find(i => i.contractId === selectedContractId && i.type === 'POST_RETURN');

  const [damageMarkers, setDamageMarkers] = useState<DamageMarker[]>(postInspection?.damageMarkers || []);
  const [selectedDamageType, setSelectedDamageType] = useState<DamageType>('SPOT');
  const [damageDescription, setDamageDescription] = useState<string>('بقعة في طرف الفستان السفلي');
  const [estimatedCost, setEstimatedCost] = useState<number>(250);

  const imageContainerRef = useRef<HTMLDivElement>(null);

  // Add marker when clicking on the return photo
  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);

    const newMarker: DamageMarker = {
      id: `dm-${Date.now()}`,
      xPercent: x,
      yPercent: y,
      type: selectedDamageType,
      description: damageDescription,
      estimatedCost: estimatedCost
    };

    setDamageMarkers([...damageMarkers, newMarker]);
  };

  const handleRemoveMarker = (id: string) => {
    setDamageMarkers(damageMarkers.filter(m => m.id !== id));
  };

  // Calculate settlement breakdown
  const totalDamageCost = damageMarkers.reduce((acc, m) => acc + m.estimatedCost, 0);
  const latePenalty = selectedContract?.latePenaltyFee || 0;
  const totalDeductions = totalDamageCost + latePenalty;
  
  const collateralAmount = state.collaterals
    .filter(c => c.contractId === selectedContractId)
    .reduce((acc, c) => acc + (c.amount || c.goldEstimatedValue || 0), 0);

  const refundAmount = Math.max(0, collateralAmount - totalDeductions);
  const additionalDue = Math.max(0, totalDeductions - collateralAmount);

  const handleSaveReport = () => {
    if (!selectedContract) return;

    const newInspection: Inspection = {
      id: `insp-${Date.now()}`,
      contractId: selectedContract.id,
      unitSerialNumber: 'WD-02-A (38/M)',
      type: 'POST_RETURN',
      timestamp: new Date().toISOString(),
      inspectedBy: state.currentUser.id,
      photos: [
        postInspection?.photos[0] || 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=800'
      ],
      damageMarkers,
      generalCondition: damageMarkers.length > 0 ? 'DAMAGED' : 'EXCELLENT',
      notes: `تم اعتماد تقرير الفحص وإثبات التلفيات بمجموع ${totalDamageCost} ريال وغرامة تأخير ${latePenalty} ريال.`
    };

    onSaveInspection(newInspection, {
      damagePenaltyFee: totalDamageCost,
      totalDeductions,
      refundedCollateral: refundAmount,
      additionalDueAmount: additionalDue
    });

    alert('تم حفظ تقرير الفحص المقارن وتحديث تسوية التأمين بنجاح!');
  };

  const prePhoto = preInspection?.photos[0] || 'https://images.unsplash.com/photo-1594552072238-b8a33785b261?w=800';
  const postPhoto = postInspection?.photos[0] || 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=800';

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">توثيق التسليم والإرجاع (Side-by-Side Proof Vault)</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold border border-amber-300">
              دليل قانوني موثق
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            مقارنة بصرية دقيقة جنباً إلى جنب بين صور ما قبل التسليم وما بعد الاستلام مع أداة التأشير وتحديد التلفيات
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-700">اختر العقد للمعاينة:</label>
          <select
            value={selectedContractId}
            onChange={(e) => {
              setSelectedContractId(e.target.value);
              const post = state.inspections.find(i => i.contractId === e.target.value && i.type === 'POST_RETURN');
              setDamageMarkers(post?.damageMarkers || []);
            }}
            className="text-xs font-semibold p-2 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-purple-600"
          >
            {state.contracts.map(c => (
              <option key={c.id} value={c.id}>
                {c.contractNumber} (المرحلة {c.currentStage}/12)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Side-by-Side Comparison Container */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Side: Pre-Delivery Photo (Baseline) */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <h3 className="font-bold text-sm text-slate-900">محطة 1: صورة ما قبل التسليم (Baseline)</h3>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              طابع زمني موثق: {preInspection?.timestamp?.split('T')[0] || '2026-10-14'}
            </span>
          </div>

          <div className="relative rounded-xl overflow-hidden bg-slate-950 aspect-[3/4] flex items-center justify-center group">
            <img
              src={prePhoto}
              alt="Pre delivery"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-3 right-3 left-3 bg-slate-950/80 backdrop-blur-sm p-2.5 rounded-xl text-white text-xs">
              <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" />
                الحالة عند الخروج: ممتازة (100% سليم)
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                موقَّع إلكترونياً من العميل قبل الاستلام
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Post-Return Photo with Interactive Damage Markup */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
              <h3 className="font-bold text-sm text-slate-900">محطة 2: صورة ما بعد الإرجاع (أداة التأشير على التلفيات)</h3>
            </div>
            <span className="text-[11px] text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded-full">
              انقر على الصورة لوضع مؤشر تلف
            </span>
          </div>

          {/* Interactive Canvas/Image */}
          <div 
            ref={imageContainerRef}
            onClick={handleImageClick}
            className="relative rounded-xl overflow-hidden bg-slate-950 aspect-[3/4] flex items-center justify-center cursor-crosshair group select-none"
          >
            <img
              src={postPhoto}
              alt="Post return inspection"
              className="w-full h-full object-cover pointer-events-none"
            />

            {/* Render Damage Markers over image */}
            {damageMarkers.map((marker, idx) => {
              const typeConfig = DAMAGE_TYPE_LABELS[marker.type] || DAMAGE_TYPE_LABELS.OTHER;
              return (
                <div
                  key={marker.id}
                  style={{ left: `${marker.xPercent}%`, top: `${marker.yPercent}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 group/pin z-20"
                >
                  <div className={`w-7 h-7 rounded-full ${typeConfig.color} text-white font-black text-xs flex items-center justify-center shadow-lg border-2 border-white animate-bounce`}>
                    {idx + 1}
                  </div>
                  <div className="hidden group-hover/pin:block absolute bottom-8 right-1/2 translate-x-1/2 w-48 bg-slate-900 text-white text-[11px] p-2 rounded-lg shadow-xl z-30 pointer-events-none text-right">
                    <div className="font-bold text-amber-300">{typeConfig.label}</div>
                    <p className="mt-0.5 text-slate-200">{marker.description}</p>
                    <div className="mt-1 font-bold text-emerald-400">{marker.estimatedCost} ر.س</div>
                  </div>
                </div>
              );
            })}

            <div className="absolute top-3 left-3 bg-purple-950/80 backdrop-blur-sm text-white px-2.5 py-1 rounded-lg text-[10px] font-bold">
              {damageMarkers.length} مواضع تلف محددة
            </div>
          </div>
        </div>

      </div>

      {/* Markup Controls & Settlement Ledger */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <h3 className="font-bold text-base text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          تسجيل وتصنيف التلفيات واحتساب التسوية الفورية
        </h3>

        {/* Input tools to add damage */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">نوع التلف المكتشف:</label>
            <select
              value={selectedDamageType}
              onChange={(e) => {
                const t = e.target.value as DamageType;
                setSelectedDamageType(t);
                setEstimatedCost(DAMAGE_TYPE_LABELS[t]?.defaultCost || 250);
              }}
              className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
            >
              {Object.entries(DAMAGE_TYPE_LABELS).map(([key, val]) => (
                <option key={key} value={key}>{val.label}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">الوصف التفصيلي لموضع التلف:</label>
            <input
              type="text"
              value={damageDescription}
              onChange={(e) => setDamageDescription(e.target.value)}
              placeholder="مثال: بقعة قهوة ملونة على الطرف السفلي، تفكك سحاب..."
              className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">تكلفة الإصلاح المقدرة (ر.س):</label>
            <input
              type="number"
              value={estimatedCost}
              onChange={(e) => setEstimatedCost(Number(e.target.value))}
              className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
            />
          </div>
        </div>

        {/* Markers List */}
        {damageMarkers.length > 0 && (
          <div className="mb-6">
            <h4 className="text-xs font-bold text-slate-700 mb-2">قائمة التلفيات المسجلة بالتقرير:</h4>
            <div className="space-y-2">
              {damageMarkers.map((marker, idx) => {
                const cfg = DAMAGE_TYPE_LABELS[marker.type];
                return (
                  <div key={marker.id} className="p-3 bg-rose-50/60 rounded-xl border border-rose-200 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className={`w-6 h-6 rounded-full ${cfg.color} text-white font-bold flex items-center justify-center text-xs shrink-0`}>
                        {idx + 1}
                      </span>
                      <div>
                        <span className="font-bold text-slate-900">{cfg.label}</span>
                        <p className="text-slate-600 text-[11px]">{marker.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-extrabold text-rose-700">{marker.estimatedCost.toLocaleString('ar-SA')} ر.س</span>
                      <button
                        onClick={() => handleRemoveMarker(marker.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                        title="حذف هذا المؤشر"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Live Settlement Ledger Summary */}
        <div className="bg-gradient-to-l from-purple-900 to-indigo-950 text-white rounded-xl p-5 shadow-lg border border-purple-800">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <span className="text-[11px] text-purple-300 block">إجمالي التأمين المحتجز</span>
              <span className="text-lg font-black text-amber-400 mt-1 block">
                {collateralAmount.toLocaleString('ar-SA')} ر.س
              </span>
            </div>
            <div>
              <span className="text-[11px] text-purple-300 block">غرامة التأخير (15% يومياً)</span>
              <span className="text-lg font-black text-rose-400 mt-1 block">
                {latePenalty.toLocaleString('ar-SA')} ر.س
              </span>
            </div>
            <div>
              <span className="text-[11px] text-purple-300 block">تعويضات التلفيات</span>
              <span className="text-lg font-black text-rose-400 mt-1 block">
                {totalDamageCost.toLocaleString('ar-SA')} ر.س
              </span>
            </div>
            <div className="border-r border-purple-800 pr-4">
              <span className="text-[11px] text-purple-300 block">
                {additionalDue > 0 ? 'مديونية مستحقة على العميل' : 'صافي المبلغ المسترد للعميل'}
              </span>
              <span className={`text-xl font-black mt-1 block ${
                additionalDue > 0 ? 'text-rose-400' : 'text-emerald-400'
              }`}>
                {(additionalDue > 0 ? additionalDue : refundAmount).toLocaleString('ar-SA')} ر.س
              </span>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-purple-800/80 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-purple-200">
              * عند الاعتماد يتم تلقائياً ترحيل قيد التسوية المحاسبي المتوازن وقفل التزام التأمين وإحالة الصنف لمرحلة الغسيل.
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const msg = `مرحباً عميلنا العزيز من دار WAMAS للأعراس.\nتم الانتهاء من فحص الفستان الخاص بعقدكم رقم (${selectedContract?.contractNumber}).\nإجمالي التأمين: ${collateralAmount} ر.س\nالخصومات (تلفيات + تأخير): ${totalDeductions} ر.س\nالمبلغ المردود لكم: ${refundAmount} ر.س.\nشكراً لتعاملكم معنا.`;
                  navigator.clipboard.writeText(msg);
                  alert('تم نسخ رسالة التسوية لإرسالها للعميل عبر واتساب!');
                }}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
              >
                <Share2 className="w-3.5 h-3.5" />
                مشاركة تقرير التسوية للعميل (واتساب)
              </button>
              <button
                onClick={handleSaveReport}
                className="px-4 py-2 rounded-lg bg-amber-400 hover:bg-amber-500 text-purple-950 text-xs font-extrabold shadow-md transition cursor-pointer"
              >
                اعتماد التقرير وترحيل التسوية
              </button>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
