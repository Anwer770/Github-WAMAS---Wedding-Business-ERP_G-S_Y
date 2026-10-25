import React, { useState } from 'react';
import { 
  Shirt, Plus, Filter, Search, Sparkles, TrendingUp, 
  CheckCircle2, AlertTriangle, Eye, ShieldCheck, Tag
} from 'lucide-react';
import { AppState } from '../../services/storageService';
import { Product, ProductUnit, ProductUnitStatus } from '../../types';

interface InventoryUnitsProps {
  state: AppState;
  onAddProduct: (product: Product, initialUnit: ProductUnit) => void;
  onUpdateUnitStatus: (unitId: string, newStatus: ProductUnitStatus) => void;
}

export const STATUS_LABELS: Record<ProductUnitStatus, { label: string; badge: string; color: string }> = {
  AVAILABLE: { label: 'متاحة (AVAILABLE)', badge: 'bg-emerald-100 text-emerald-800', color: 'border-emerald-300' },
  BOOKED: { label: 'محجوزة (BOOKED)', badge: 'bg-blue-100 text-blue-800', color: 'border-blue-300' },
  READY_FOR_DELIVERY: { label: 'جاهزة للتسليم (READY)', badge: 'bg-indigo-100 text-indigo-800', color: 'border-indigo-300' },
  DELIVERED: { label: 'مُسلَّمة للعميل (DELIVERED)', badge: 'bg-purple-100 text-purple-800', color: 'border-purple-300' },
  RETURNED: { label: 'مُعادة من العميل (RETURNED)', badge: 'bg-amber-100 text-amber-800', color: 'border-amber-300' },
  CLEANING: { label: 'قيد الغسيل الإجباري (CLEANING)', badge: 'bg-teal-100 text-teal-800', color: 'border-teal-300' },
  REQUIRED_REPAIR: { label: 'مطلوب إصلاح (REQ REPAIR)', badge: 'bg-orange-100 text-orange-800', color: 'border-orange-300' },
  REPAIR: { label: 'قيد الإصلاح (REPAIR)', badge: 'bg-rose-100 text-rose-800', color: 'border-rose-300' },
  ALTERATION: { label: 'قيد التعديل والخياطة', badge: 'bg-pink-100 text-pink-800', color: 'border-pink-300' },
  MAINTENANCE: { label: 'قيد الصيانة الدورية', badge: 'bg-cyan-100 text-cyan-800', color: 'border-cyan-300' },
  PENDING_INSPECTION: { label: 'بانتظار الفحص', badge: 'bg-yellow-100 text-yellow-800', color: 'border-yellow-300' },
  DAMAGED: { label: 'تالفة وغير قابلة للحجز (DAMAGED)', badge: 'bg-red-100 text-red-900', color: 'border-red-400' },
  LOST: { label: 'مفقودة (LOST)', badge: 'bg-zinc-200 text-zinc-800', color: 'border-zinc-400' },
  ON_DISPLAY: { label: 'معروضة بالواجهة (DISPLAY)', badge: 'bg-lime-100 text-lime-800', color: 'border-lime-300' },
  CUSTOMIZED: { label: 'مخصصة كوتور خاص', badge: 'bg-fuchsia-100 text-fuchsia-800', color: 'border-fuchsia-300' }
};

export const InventoryUnitsView: React.FC<InventoryUnitsProps> = ({
  state,
  onAddProduct,
  onUpdateUnitStatus
}) => {
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Product Form State
  const [sku, setSku] = useState<string>('WD-NEW-2026');
  const [nameAr, setNameAr] = useState<string>('فستان زفاف دانتيل مطرز ملكي');
  const [rentalDaily, setRentalDaily] = useState<number>(3800);
  const [purchaseCost, setPurchaseCost] = useState<number>(12000);
  const [coverImage, setCoverImage] = useState<string>('https://images.unsplash.com/photo-1594552072238-b8a33785b261?w=800');
  const [unitSize, setUnitSize] = useState<string>('38 (M)');
  const [unitColor, setUnitColor] = useState<string>('أوف وايت عاجي');

  const filteredUnits = state.units.filter(u => {
    if (selectedStatusFilter === 'ALL') return true;
    return u.status === selectedStatusFilter;
  });

  const handleSaveProduct = () => {
    // BR-16: Mandatory photo
    if (!coverImage || coverImage.trim() === '') {
      alert('قاعدة BR-16: صورة الغلاف إلزامية للصنف الجديد! لا يمكن حفظ الصنف بدون صورة واحدة على الأقل.');
      return;
    }

    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      sku,
      nameAr,
      nameEn: 'Royal Embroidered Gown',
      category: 'DRESSES_WEDDING',
      type: 'RENT',
      rentalPriceDaily: rentalDaily,
      purchaseCost,
      requiredCollateral: Math.round(rentalDaily * 0.35),
      description: 'فستان جديد مضاف للمجموعة الملكية.',
      coverImage,
      images: [coverImage],
      totalRentalsCount: 0,
      totalRevenue: 0,
      totalMaintenanceCost: 0
    };

    const newUnit: ProductUnit = {
      id: `unit-${Date.now()}`,
      productId: newProduct.id,
      serialNumber: `${sku}-01-A`,
      size: unitSize,
      color: unitColor,
      status: 'AVAILABLE',
      warehouseLocation: 'المعرض الرئيسي - قسم الكوتور'
    };

    onAddProduct(newProduct, newUnit);
    setShowAddModal(false);
    alert(`تم حفظ الصنف (${newProduct.nameAr}) وتوليد القطعة الفيزيائية (${newUnit.serialNumber}) بنجاح!`);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">إدارة الأصناف والمخزون والقطع (14 حالة تشغيلية)</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-900 text-xs font-bold border border-purple-200">
              تتبع الـ ROI الفردي
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            بطاقة تفصيلية لكل قطعة، منع تأجير التالف، احتساب العائد الاستثماري التلقائي وتتبع الغسيل والصيانة
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-purple-900 hover:bg-purple-800 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-amber-400" />
          إضافة صنف وقطعة جديدة (BR-16)
        </button>
      </div>

      {/* 14 Status Filter Pills */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
        <div className="flex items-center gap-2 mb-2 text-xs font-bold text-slate-700">
          <Filter className="w-3.5 h-3.5 text-purple-700" />
          <span>تصفية القطع الفيزيائية حسب الحالة التشغيلية الـ 14:</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setSelectedStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              selectedStatusFilter === 'ALL'
                ? 'bg-purple-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            الكل ({state.units.length})
          </button>
          {Object.entries(STATUS_LABELS).map(([key, val]) => {
            const count = state.units.filter(u => u.status === key).length;
            if (count === 0 && selectedStatusFilter !== key) return null;
            return (
              <button
                key={key}
                onClick={() => setSelectedStatusFilter(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  selectedStatusFilter === key
                    ? 'bg-purple-900 text-white shadow-sm font-bold'
                    : `${val.badge} hover:opacity-80`
                }`}
              >
                <span>{val.label}</span>
                <span className="font-mono text-[10px] opacity-80 font-bold">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Units Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredUnits.map((unit) => {
          const product = state.products.find(p => p.id === unit.productId);
          const statusConfig = STATUS_LABELS[unit.status] || STATUS_LABELS.AVAILABLE;
          
          // Calculate individual ROI: ((Revenue - Maintenance) / PurchaseCost) * 100
          const revenue = (product?.totalRevenue || 0) / (state.units.filter(u => u.productId === product?.id).length || 1);
          const maintenance = (product?.totalMaintenanceCost || 0) / (state.units.filter(u => u.productId === product?.id).length || 1);
          const cost = product?.purchaseCost || 10000;
          const roiPercent = Math.round(((revenue - maintenance) / cost) * 100);

          return (
            <div
              key={unit.id}
              className={`bg-white rounded-2xl p-5 shadow-sm border transition hover:shadow-md flex flex-col justify-between ${statusConfig.color}`}
            >
              <div>
                {/* Image and Status */}
                <div className="relative rounded-xl overflow-hidden aspect-[4/3] bg-slate-950 mb-3">
                  <img
                    src={product?.coverImage || "https://images.unsplash.com/photo-1594552072238-b8a33785b261?w=800"}
                    alt={product?.nameAr}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2.5 right-2.5">
                    <span className={`text-[11px] px-2.5 py-1 rounded-full font-bold shadow-md ${statusConfig.badge}`}>
                      {statusConfig.label}
                    </span>
                  </div>
                  <div className="absolute bottom-2.5 left-2.5 bg-slate-900/80 backdrop-blur-sm text-white px-2 py-0.5 rounded text-[10px] font-mono">
                    {unit.serialNumber}
                  </div>
                </div>

                {/* Product Name & SKU */}
                <h3 className="font-bold text-sm text-slate-900 line-clamp-1">
                  {product?.nameAr}
                </h3>
                <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                  <span>المقاس: <strong>{unit.size}</strong></span>
                  <span>•</span>
                  <span>اللون: <strong>{unit.color}</strong></span>
                </div>

                {/* Location & Operational Notes */}
                <div className="mt-2 text-[11px] bg-slate-50 p-2 rounded-lg border border-slate-200 text-slate-600">
                  <div>الموقع: {unit.warehouseLocation}</div>
                  {unit.conditionNotes && (
                    <div className="text-rose-700 mt-0.5 font-medium">ملاحظة: {unit.conditionNotes}</div>
                  )}
                  {unit.cleaningDueUntil && (
                    <div className="text-teal-700 mt-0.5 font-bold">
                      غسيل إجباري ينتهي: {unit.cleaningDueUntil.split('T')[0]}
                    </div>
                  )}
                </div>

                {/* Pricing & ROI */}
                <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">سعر التأجير اليومي:</span>
                    <span className="font-bold text-purple-950">{product?.rentalPriceDaily?.toLocaleString('ar-SA')} ر.س</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">العائد الاستثماري (ROI):</span>
                    <span className="font-extrabold text-emerald-700 flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5" />
                      {roiPercent}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Status change actions */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[10px] text-slate-400">تغيير الحالة:</span>
                <select
                  value={unit.status}
                  onChange={(e) => onUpdateUnitStatus(unit.id, e.target.value as ProductUnitStatus)}
                  className="text-xs p-1 rounded-lg border border-slate-200 bg-slate-50 text-slate-800"
                >
                  <option value="AVAILABLE">متاحة (AVAILABLE)</option>
                  <option value="CLEANING">قيد الغسيل (CLEANING)</option>
                  <option value="REPAIR">قيد الإصلاح (REPAIR)</option>
                  <option value="ALTERATION">قيد التعديل والخياطة</option>
                  <option value="DAMAGED">تالفة (DAMAGED)</option>
                  <option value="ON_DISPLAY">معروضة (ON_DISPLAY)</option>
                </select>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Product Modal (BR-16) */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 text-right animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">إضافة صنف وموديل جديد (BR-16)</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="py-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">اسم الصنف باللغة العربية:</label>
                <input
                  type="text"
                  value={nameAr}
                  onChange={(e) => setNameAr(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">كود الصنف (SKU):</label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">سعر التأجير اليومي (ر.س):</label>
                  <input
                    type="number"
                    value={rentalDaily}
                    onChange={(e) => setRentalDaily(Number(e.target.value))}
                    className="w-full text-xs p-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">تكلفة الشراء الأصلية (ر.س):</label>
                  <input
                    type="number"
                    value={purchaseCost}
                    onChange={(e) => setPurchaseCost(Number(e.target.value))}
                    className="w-full text-xs p-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">مقاس القطعة الأولى:</label>
                  <input
                    type="text"
                    value={unitSize}
                    onChange={(e) => setUnitSize(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              {/* Cover Image URL Input (BR-16 Enforced) */}
              <div>
                <label className="block text-xs font-bold text-purple-900 mb-1">
                  صورة الغلاف الرسمية (إلزامية وفق BR-16):
                </label>
                <input
                  type="text"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  placeholder="https://..."
                  className="w-full text-xs p-2 rounded-lg border border-purple-300"
                />
                <span className="text-[10px] text-purple-700 mt-0.5 block">
                  لا يُحفظ أي صنف دون صورة فوتوغرافية معتمدة تمثل الدليل البصري
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-600"
              >
                إلغاء
              </button>
              <button
                onClick={handleSaveProduct}
                className="px-5 py-2 rounded-xl bg-purple-900 hover:bg-purple-800 text-white font-bold text-xs"
              >
                حفظ الصنف وتوليد القطعة
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
